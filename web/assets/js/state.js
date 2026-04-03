const state = {
  backend: {
    status: "idle",
    detail: "Chưa kiểm tra backend",
    progressText: "",
    progressElapsedMs: 0,
    progressEstimatedMs: 0,
    progressTimeoutMs: 0
  },
  voices: [],
  selectedVoice: "",
  busy: false,
  cancelRequested: false,
  pendingAction: "",
  result: {
    kind: "none",
    filename: "",
    format: "wav",
    sizeBytes: 0,
    blob: null,
    objectUrl: ""
  },
  error: ""
};

const subscribers = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  subscribers.forEach((listener) => listener(state));
}

export function updateNestedState(key, patch) {
  state[key] = {
    ...state[key],
    ...patch
  };
  subscribers.forEach((listener) => listener(state));
}

export function subscribe(listener) {
  subscribers.add(listener);
  listener(state);

  return () => subscribers.delete(listener);
}
