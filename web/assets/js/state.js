const state = {
  backend: {
    status: "idle",
    detail: "Chưa kiểm tra backend"
  },
  voices: [],
  busy: false,
  result: {
    kind: "none",
    filename: "",
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
