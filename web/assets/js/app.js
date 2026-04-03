import { getHealth, getVoices, synthesize, cloneVoice } from "./api.js";
import { getState, setState, updateNestedState, subscribe } from "./state.js";
import { clearAudioSource, downloadBlob, playAudio, setAudioSource, stopAudio } from "./audio.js";

const ui = {
  apiBaseUrl: document.getElementById("api-base-url"),
  refreshStatusBtn: document.getElementById("refresh-status-btn"),
  backendStatusCard: document.getElementById("backend-status-card"),
  backendStatusText: document.getElementById("backend-status-text"),
  backendStatusDetail: document.getElementById("backend-status-detail"),
  globalBanner: document.getElementById("global-banner"),
  voiceSelect: document.getElementById("voice-select"),
  speedInput: document.getElementById("speed-input"),
  synthesizeFormatSelect: document.getElementById("synthesize-format-select"),
  synthesizeForm: document.getElementById("synthesize-form"),
  synthesizeText: document.getElementById("synthesize-text"),
  synthesizeBtn: document.getElementById("synthesize-btn"),
  cloneForm: document.getElementById("clone-form"),
  cloneText: document.getElementById("clone-text"),
  refText: document.getElementById("ref-text"),
  refAudioInput: document.getElementById("ref-audio-input"),
  cloneSpeedInput: document.getElementById("clone-speed-input"),
  cloneFormatSelect: document.getElementById("clone-format-select"),
  cloneBtn: document.getElementById("clone-btn"),
  resultKind: document.getElementById("result-kind"),
  resultMessage: document.getElementById("result-message"),
  audioPlayer: document.getElementById("audio-player"),
  playBtn: document.getElementById("play-btn"),
  stopBtn: document.getElementById("stop-btn"),
  downloadBtn: document.getElementById("download-btn")
};

ui.apiBaseUrl.textContent = window.APP_CONFIG.API_BASE_URL;

function render(state) {
  ui.backendStatusText.textContent = backendHeadline(state.backend.status);
  ui.backendStatusDetail.textContent = state.backend.detail;
  ui.backendStatusCard.className = `status-card status-${state.backend.status}`;

  ui.globalBanner.hidden = !state.error;
  ui.globalBanner.textContent = state.error;

  ui.synthesizeBtn.disabled = state.busy;
  ui.cloneBtn.disabled = state.busy;
  ui.refreshStatusBtn.disabled = state.busy;
  ui.synthesizeBtn.textContent = state.pendingAction === "synthesize" ? "Đang synthesize..." : "Synthesize";
  ui.cloneBtn.textContent = state.pendingAction === "clone" ? "Đang clone..." : "Clone";
  ui.refreshStatusBtn.textContent = state.pendingAction === "refresh" ? "Đang refresh..." : "Refresh";

  if (!state.voices.length) {
    ui.voiceSelect.innerHTML = `<option value="">Chưa có voice</option>`;
  } else {
    const selectedVoice = state.selectedVoice || state.voices[0]?.id || "";
    ui.voiceSelect.innerHTML = state.voices
      .map((voice) => {
        const selected = voice.id === selectedVoice ? " selected" : "";
        return `<option value="${voice.id}"${selected}>${voice.name || voice.id}</option>`;
      })
      .join("");
  }

  if (state.result.blob) {
    ui.resultKind.textContent = state.result.kind === "clone" ? "Audio clone" : "Audio synthesize";
    ui.resultMessage.textContent = `Đã tạo ${state.result.filename} (${formatBytes(state.result.sizeBytes)}).`;
    ui.playBtn.disabled = false;
    ui.stopBtn.disabled = false;
    ui.downloadBtn.disabled = false;
    ui.downloadBtn.textContent = `Download ${state.result.format.toUpperCase()}`;
  } else {
    ui.resultKind.textContent = "Chưa có audio";
    ui.resultMessage.textContent = "Kết quả audio sẽ xuất hiện ở đây sau khi synthesize hoặc clone thành công.";
    ui.playBtn.disabled = true;
    ui.stopBtn.disabled = true;
    ui.downloadBtn.disabled = true;
    ui.downloadBtn.textContent = "Download Audio";
  }
}

function backendHeadline(status) {
  switch (status) {
    case "ok":
      return "Backend sẵn sàng";
    case "error":
      return "Backend lỗi";
    case "loading":
      return "Đang kiểm tra backend";
    default:
      return "Chưa kiểm tra backend";
  }
}

function setBusy(nextBusy) {
  setState({ busy: nextBusy, pendingAction: nextBusy ? getState().pendingAction : "" });
}

function beginAction(action) {
  setState({
    busy: true,
    pendingAction: action
  });
}

function finishAction() {
  setState({
    busy: false,
    pendingAction: ""
  });
}

function setError(message = "") {
  setState({ error: message });
}

function formatBytes(sizeBytes) {
  if (!sizeBytes) {
    return "0 B";
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  return `${(sizeBytes / 1024).toFixed(1)} KB`;
}

function normalizeFormat() {
  return "wav";
}

function setResult(blob, kind, format) {
  const normalizedFormat = normalizeFormat(format);
  const filename = `${kind}-${Date.now()}.${normalizedFormat}`;
  const objectUrl = setAudioSource(ui.audioPlayer, blob);
  setState({
    result: {
      kind,
      filename,
      format: normalizedFormat,
      sizeBytes: blob.size,
      blob,
      objectUrl
    }
  });
}

async function loadBackendStatus() {
  updateNestedState("backend", {
    status: "loading",
    detail: "Đang gọi /health..."
  });
  setError("");

  try {
    const payload = await getHealth();
    updateNestedState("backend", {
      status: payload?.status === "ok" ? "ok" : "error",
      detail: `mode=${payload.engine_mode || "unknown"}, backend=${payload.active_backend || "unknown"}, model_loaded=${String(payload.model_loaded)}`
    });
  } catch (error) {
    updateNestedState("backend", {
      status: "error",
      detail: error.message || "Không gọi được /health"
    });
    setError(error.message || "Không gọi được backend.");
  }
}

async function loadVoices() {
  try {
    const payload = await getVoices();
    const voices = payload?.voices || [];
    const currentState = getState();
    const hasSelectedVoice = voices.some((voice) => voice.id === currentState.selectedVoice);
    setState({
      voices,
      selectedVoice: hasSelectedVoice ? currentState.selectedVoice : (voices[0]?.id || "")
    });
  } catch (error) {
    setError(error.message || "Không tải được danh sách voices.");
  }
}

function validateText(value, label) {
  if (!value.trim()) {
    throw new Error(`${label} không được để trống.`);
  }
}

async function handleSynthesize(event) {
  event.preventDefault();
  setError("");

  try {
    validateText(ui.synthesizeText.value, "Text");
    beginAction("synthesize");
    const format = normalizeFormat(ui.synthesizeFormatSelect.value);

    const blob = await synthesize({
      text: ui.synthesizeText.value.trim(),
      voice_id: getState().selectedVoice || ui.voiceSelect.value,
      speed: Number(ui.speedInput.value || 1),
      format
    });

    setResult(blob, "synthesize", format);
    await playAudio().catch(() => undefined);
  } catch (error) {
    setError(error.message || "Synthesize thất bại.");
  } finally {
    finishAction();
  }
}

async function handleClone(event) {
  event.preventDefault();
  setError("");

  try {
    validateText(ui.cloneText.value, "Text output");
    validateText(ui.refText.value, "Reference text");

    const refAudioFile = ui.refAudioInput.files?.[0];
    if (!refAudioFile) {
      throw new Error("Cần chọn audio mẫu trước khi clone.");
    }

    beginAction("clone");
    const format = normalizeFormat(ui.cloneFormatSelect.value);
    const blob = await cloneVoice({
      text: ui.cloneText.value.trim(),
      refText: ui.refText.value.trim(),
      refAudioFile,
      speed: Number(ui.cloneSpeedInput.value || 1),
      format
    });

    setResult(blob, "clone", format);
    await playAudio().catch(() => undefined);
  } catch (error) {
    setError(error.message || "Clone thất bại.");
  } finally {
    finishAction();
  }
}

function boot() {
  subscribe(render);

  ui.refreshStatusBtn.addEventListener("click", async () => {
    beginAction("refresh");
    try {
      await Promise.all([loadBackendStatus(), loadVoices()]);
    } finally {
      finishAction();
    }
  });
  ui.voiceSelect.addEventListener("change", (event) => {
    setState({
      selectedVoice: event.target.value
    });
  });
  ui.synthesizeForm.addEventListener("submit", handleSynthesize);
  ui.cloneForm.addEventListener("submit", handleClone);
  ui.playBtn.addEventListener("click", () => playAudio());
  ui.stopBtn.addEventListener("click", () => stopAudio());
  ui.downloadBtn.addEventListener("click", () => {
    const { result } = getState();
    if (result.blob) {
      downloadBlob(result.blob, result.filename);
    }
  });

  window.addEventListener("beforeunload", () => {
    clearAudioSource(ui.audioPlayer);
  });

  beginAction("refresh");
  Promise.all([loadBackendStatus(), loadVoices()])
    .finally(() => {
      finishAction();
    });
}

boot();
