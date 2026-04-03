const config = window.APP_CONFIG;

async function request(path, options = {}, timeoutMs = config.REQUEST_TIMEOUT_MS) {
  const { signal: externalSignal, headers: externalHeaders, ...fetchOptions } = options;
  const controller = new AbortController();
  const signal = externalSignal ? AbortSignal.any([controller.signal, externalSignal]) : controller.signal;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${config.API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers: externalHeaders,
      signal
    });

    if (!response.ok) {
      throw await normalizeError(response);
    }

    return response;
  } catch (error) {
    if (externalSignal?.aborted) {
      throw {
        code: "CANCELLED",
        message: "Đã hủy yêu cầu hiện tại."
      };
    }

    if (error.name === "AbortError" || controller.signal.aborted) {
      throw {
        code: "TIMEOUT",
        message: "Request timeout khi gọi desktop local API. Backend có thể vẫn đang xử lý WAV, hãy tăng timeout nếu model chạy lâu."
      };
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function normalizeError(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const payload = await response.json();
    if (payload?.error) {
      return payload.error;
    }
  }

  return {
    code: "HTTP_ERROR",
    message: `Request failed với status ${response.status}`
  };
}

export async function getHealth() {
  const response = await request("/health");
  return response.json();
}

export async function getVoices() {
  const response = await request("/v1/voices");
  return response.json();
}

export async function synthesize(payload, requestOptions = {}) {
  const response = await request("/v1/synthesize", {
    method: "POST",
    headers: {
      "X-Request-Id": requestOptions.requestId || "",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    signal: requestOptions.signal
  }, requestOptions.timeoutMs);

  return response.blob();
}

export async function cloneVoice({ text, refText, refAudioFile, speed, format }, requestOptions = {}) {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("ref_text", refText);
  formData.append("ref_audio", refAudioFile);
  formData.append("speed", String(speed));
  formData.append("format", format || config.DEFAULT_AUDIO_FORMAT);

  const response = await request("/v1/clone", {
    method: "POST",
    headers: {
      "X-Request-Id": requestOptions.requestId || ""
    },
    body: formData,
    signal: requestOptions.signal
  }, requestOptions.timeoutMs);

  return response.blob();
}

export async function cancelCurrent(requestId) {
  const response = await request("/v1/cancel-current", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ request_id: requestId || "" })
  }, 10000);

  return response.json();
}
