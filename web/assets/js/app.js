import { getHealth, getVoices, synthesize, cloneVoice, cancelCurrent } from "./api.js";
import { getState, setState, updateNestedState, subscribe } from "./state.js";
import { clearAudioSource, downloadBlob, playAudio, setAudioSource, stopAudio } from "./audio.js";

const ui = {
  apiBaseUrl: document.getElementById("api-base-url"),
  refreshStatusBtn: document.getElementById("refresh-status-btn"),
  cancelRequestBtn: document.getElementById("cancel-request-btn"),
  backendStatusCard: document.getElementById("backend-status-card"),
  backendStatusText: document.getElementById("backend-status-text"),
  backendStatusDetail: document.getElementById("backend-status-detail"),
  backendStatusProgress: document.getElementById("backend-status-progress"),
  backendStatusProgressLabel: document.getElementById("backend-status-progress-label"),
  backendStatusProgressPercent: document.getElementById("backend-status-progress-percent"),
  backendStatusProgressFill: document.getElementById("backend-status-progress-fill"),
  backendStatusElapsed: document.getElementById("backend-status-elapsed"),
  backendStatusEta: document.getElementById("backend-status-eta"),
  backendStatusTimeout: document.getElementById("backend-status-timeout"),
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

let backendProgressTimerId = 0;
let activeRequestId = "";
let activeRequestController = null;

ui.apiBaseUrl.textContent = window.APP_CONFIG.API_BASE_URL;

function render(state) {
  ui.backendStatusText.textContent = backendHeadline(state.backend.status);
  ui.backendStatusDetail.textContent = state.backend.detail;
  ui.backendStatusCard.className = `status-card status-${state.backend.status}`;
  if (state.backend.progressText) {
    ui.backendStatusProgress.hidden = false;
    const progressRatio = getProgressRatio(state.backend.progressElapsedMs, state.backend.progressEstimatedMs);
    const remainingMs = Math.max((state.backend.progressEstimatedMs || 0) - state.backend.progressElapsedMs, 0);
    ui.backendStatusProgressLabel.textContent = state.backend.progressText;
    ui.backendStatusProgressPercent.textContent = `Ước lượng ${Math.round(progressRatio * 100)}%`;
    ui.backendStatusProgressFill.style.width = `${Math.max(progressRatio * 100, 6)}%`;
    ui.backendStatusElapsed.textContent = `Đã chạy ${formatElapsed(state.backend.progressElapsedMs)}`;
    ui.backendStatusEta.textContent = state.backend.progressEstimatedMs > 0
      ? `Còn khoảng ${formatElapsed(remainingMs)}`
      : "Đang ước lượng";
    ui.backendStatusTimeout.textContent = state.backend.progressTimeoutMs > 0
      ? `Timeout ${formatElapsed(state.backend.progressTimeoutMs)}`
      : "";
  } else {
    ui.backendStatusProgress.hidden = true;
    ui.backendStatusProgressLabel.textContent = "";
    ui.backendStatusProgressPercent.textContent = "";
    ui.backendStatusProgressFill.style.width = "0%";
    ui.backendStatusElapsed.textContent = "";
    ui.backendStatusEta.textContent = "";
    ui.backendStatusTimeout.textContent = "";
  }

  ui.globalBanner.hidden = !state.error;
  ui.globalBanner.textContent = state.error;

  ui.synthesizeBtn.disabled = state.busy;
  ui.cloneBtn.disabled = state.busy;
  ui.refreshStatusBtn.disabled = state.busy;
  ui.cancelRequestBtn.hidden = !(state.pendingAction === "synthesize" || state.pendingAction === "clone");
  ui.cancelRequestBtn.disabled = !state.busy || state.cancelRequested;
  ui.cancelRequestBtn.textContent = state.cancelRequested ? "Đang hủy..." : "Cancel";
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

function formatElapsed(elapsedMs) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getProgressRatio(elapsedMs, estimatedMs) {
  if (!estimatedMs || estimatedMs <= 0) {
    return 0.08;
  }

  const rawRatio = elapsedMs / estimatedMs;
  return Math.min(Math.max(rawRatio, 0.08), 0.96);
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
    cancelRequested: false,
    pendingAction: ""
  });
}

function setError(message = "") {
  setState({ error: message });
}

function estimateSynthesizeMs(text, speed) {
  const normalizedSpeed = Math.max(Number(speed) || 1, 0.5);
  const normalizedText = (text || "").trim();
  const baseMs = 12000;
  const perCharMs = 95;
  return Math.max(20000, Math.round((baseMs + normalizedText.length * perCharMs) / normalizedSpeed));
}

function estimateCloneMs(text, speed, refAudioFile) {
  const synthMs = estimateSynthesizeMs(text, speed);
  const fileSizeBytes = refAudioFile?.size || 0;
  const refAudioPenaltyMs = Math.round(fileSizeBytes / (1024 * 1024) * 10000);
  return Math.max(35000, synthMs + 15000 + refAudioPenaltyMs);
}

function buildRequestTiming(action, payload) {
  const estimatedMs = action === "clone"
    ? estimateCloneMs(payload.text, payload.speed, payload.refAudioFile)
    : estimateSynthesizeMs(payload.text, payload.speed);
  return {
    estimatedMs,
    timeoutMs: estimatedMs + 60000
  };
}

function setBackendProgress(progressText = "", progressElapsedMs = 0, progressEstimatedMs = 0, progressTimeoutMs = 0) {
  updateNestedState("backend", {
    progressText,
    progressElapsedMs,
    progressEstimatedMs,
    progressTimeoutMs
  });
}

function startBackendProgress(action, timing) {
  const startedAt = Date.now();
  const progressText =
    action === "synthesize"
      ? "Đang synthesize audio"
      : action === "clone"
        ? "Đang clone và xuất WAV"
        : "Đang xử lý";

  if (backendProgressTimerId) {
    window.clearInterval(backendProgressTimerId);
  }

  setBackendProgress(progressText, 0, timing.estimatedMs, timing.timeoutMs);
  backendProgressTimerId = window.setInterval(() => {
    setBackendProgress(progressText, Date.now() - startedAt, timing.estimatedMs, timing.timeoutMs);
  }, 1000);
}

function stopBackendProgress() {
  if (backendProgressTimerId) {
    window.clearInterval(backendProgressTimerId);
    backendProgressTimerId = 0;
  }
  setBackendProgress("", 0);
}

function createRequestContext() {
  activeRequestId = `req-web-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  activeRequestController = new AbortController();
  return {
    requestId: activeRequestId,
    controller: activeRequestController
  };
}

function clearRequestContext() {
  activeRequestId = "";
  activeRequestController = null;
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
    const timing = buildRequestTiming("synthesize", {
      text: ui.synthesizeText.value.trim(),
      speed: Number(ui.speedInput.value || 1)
    });
    const requestContext = createRequestContext();
    startBackendProgress("synthesize", timing);

    const blob = await synthesize({
      text: ui.synthesizeText.value.trim(),
      voice_id: getState().selectedVoice || ui.voiceSelect.value,
      speed: Number(ui.speedInput.value || 1),
      format
    }, {
      timeoutMs: timing.timeoutMs,
      requestId: requestContext.requestId,
      signal: requestContext.controller.signal
    });

    setResult(blob, "synthesize", format);
    await playAudio().catch(() => undefined);
  } catch (error) {
    setError(error.code === "CANCELLED" ? "Đã hủy yêu cầu synthesize." : (error.message || "Synthesize thất bại."));
  } finally {
    clearRequestContext();
    stopBackendProgress();
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
    const timing = buildRequestTiming("clone", {
      text: ui.cloneText.value.trim(),
      speed: Number(ui.cloneSpeedInput.value || 1),
      refAudioFile
    });
    const requestContext = createRequestContext();
    startBackendProgress("clone", timing);
    const blob = await cloneVoice({
      text: ui.cloneText.value.trim(),
      refText: ui.refText.value.trim(),
      refAudioFile,
      speed: Number(ui.cloneSpeedInput.value || 1),
      format
    }, {
      timeoutMs: timing.timeoutMs,
      requestId: requestContext.requestId,
      signal: requestContext.controller.signal
    });

    setResult(blob, "clone", format);
    await playAudio().catch(() => undefined);
  } catch (error) {
    setError(error.code === "CANCELLED" ? "Đã hủy yêu cầu clone." : (error.message || "Clone thất bại."));
  } finally {
    clearRequestContext();
    stopBackendProgress();
    finishAction();
  }
}

async function handleCancelCurrentRequest() {
  if (!activeRequestId || !activeRequestController || getState().cancelRequested) {
    return;
  }

  setState({ cancelRequested: true });

  try {
    const payload = await cancelCurrent(activeRequestId);
    if (!payload?.cancelled) {
      throw new Error(payload?.message || "Backend không nhận lệnh hủy.");
    }
    activeRequestController.abort("cancelled");
  } catch (error) {
    setState({ cancelRequested: false });
    setError(error.message || "Không hủy được request hiện tại.");
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
  ui.cancelRequestBtn.addEventListener("click", handleCancelCurrentRequest);
  ui.playBtn.addEventListener("click", () => playAudio());
  ui.stopBtn.addEventListener("click", () => stopAudio());
  ui.downloadBtn.addEventListener("click", () => {
    const { result } = getState();
    if (result.blob) {
      downloadBlob(result.blob, result.filename);
    }
  });

  window.addEventListener("beforeunload", () => {
    stopBackendProgress();
    clearAudioSource(ui.audioPlayer);
  });

  beginAction("refresh");
  Promise.all([loadBackendStatus(), loadVoices()])
    .finally(() => {
      finishAction();
    });
}

boot();
