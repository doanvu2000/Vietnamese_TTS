const config = window.APP_CONFIG;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), config.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal
    });

    if (!response.ok) {
      throw await normalizeError(response);
    }

    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      throw {
        code: "TIMEOUT",
        message: "Request timeout khi gọi desktop local API."
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

export async function synthesize(payload) {
  const response = await request("/v1/synthesize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response.blob();
}

export async function cloneVoice({ text, refText, refAudioFile, speed, format }) {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("ref_text", refText);
  formData.append("ref_audio", refAudioFile);
  formData.append("speed", String(speed));
  formData.append("format", format || config.DEFAULT_AUDIO_FORMAT);

  const response = await request("/v1/clone", {
    method: "POST",
    body: formData
  });

  return response.blob();
}
