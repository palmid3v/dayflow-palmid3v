const STORAGE_KEY = "DAYFLOW";

const defaultState = {
  dailyPlans: {},
  reminders: [],
  dailyResults: {},
  memories: {},
  notes: {}
};

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export function getDayFlowState() {
  return read();
}

export function saveDayFlowState(patch) {
  const next = { ...read(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export { STORAGE_KEY };