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
  synthesizeForm: document.getElementById("synthesize-form"),
  synthesizeText: document.getElementById("synthesize-text"),
  synthesizeBtn: document.getElementById("synthesize-btn"),
  cloneForm: document.getElementById("clone-form"),
  cloneText: document.getElementById("clone-text"),
  refText: document.getElementById("ref-text"),
  refAudioInput: document.getElementById("ref-audio-input"),
  cloneSpeedInput: document.getElementById("clone-speed-input"),
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

  if (!state.voices.length) {
    ui.voiceSelect.innerHTML = `<option value="">Chưa có voice</option>`;
  } else {
    ui.voiceSelect.innerHTML = state.voices
      .map((voice) => `<option value="${voice.id}">${voice.name || voice.id}</option>`)
      .join("");
  }

  if (state.result.blob) {
    ui.resultKind.textContent = state.result.kind === "clone" ? "Audio clone" : "Audio synthesize";
    ui.resultMessage.textContent = `Sẵn sàng phát hoặc tải ${state.result.filename}.`;
    ui.playBtn.disabled = false;
    ui.stopBtn.disabled = false;
    ui.downloadBtn.disabled = false;
  } else {
    ui.resultKind.textContent = "Chưa có audio";
    ui.resultMessage.textContent = "Kết quả audio sẽ xuất hiện ở đây sau khi synthesize hoặc clone thành công.";
    ui.playBtn.disabled = true;
    ui.stopBtn.disabled = true;
    ui.downloadBtn.disabled = true;
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
  setState({ busy: nextBusy });
}

function setError(message = "") {
  setState({ error: message });
}

function setResult(blob, kind) {
  const filename = `${kind}-${Date.now()}.wav`;
  const objectUrl = setAudioSource(ui.audioPlayer, blob);
  setState({
    result: {
      kind,
      filename,
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
      detail: `mode=${payload.engine_mode || "unknown"}, model_loaded=${String(payload.model_loaded)}`
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
    setState({
      voices: payload?.voices || []
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
    setBusy(true);

    const blob = await synthesize({
      text: ui.synthesizeText.value.trim(),
      voice_id: ui.voiceSelect.value,
      speed: Number(ui.speedInput.value || 1),
      format: window.APP_CONFIG.DEFAULT_AUDIO_FORMAT
    });

    setResult(blob, "synthesize");
  } catch (error) {
    setError(error.message || "Synthesize thất bại.");
  } finally {
    setBusy(false);
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

    setBusy(true);
    const blob = await cloneVoice({
      text: ui.cloneText.value.trim(),
      refText: ui.refText.value.trim(),
      refAudioFile,
      speed: Number(ui.cloneSpeedInput.value || 1)
    });

    setResult(blob, "clone");
  } catch (error) {
    setError(error.message || "Clone thất bại.");
  } finally {
    setBusy(false);
  }
}

function boot() {
  subscribe(render);

  ui.refreshStatusBtn.addEventListener("click", async () => {
    await Promise.all([loadBackendStatus(), loadVoices()]);
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

  Promise.all([loadBackendStatus(), loadVoices()]);
}

boot();
