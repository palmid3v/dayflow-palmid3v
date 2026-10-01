const STORAGE_KEY = "DAYFLOW";

const defaultState = {
  dailyPlans: {},
  reminders: [],
  dailyResults: {},
  memories: {},
  notes: {},
  settings: { theme: "system" }
};

function cloneDefault() {
  return JSON.parse(JSON.stringify(defaultState));
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw);
    return {
      ...cloneDefault(),
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings ?? {}) }
    };
  } catch {
    return cloneDefault();
  }
}

export function getDayFlowState() {
  return read();
}

export function saveDayFlowState(patch) {
  const next = {
    ...read(),
    ...patch,
    settings: { ...read().settings, ...(patch.settings ?? {}) }
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("dayflow:state-change", { detail: next }));
  return next;
}

export function getDailyPlan(dateKey) {
  return read().dailyPlans?.[dateKey] ?? { date: dateKey, blocks: [] };
}

export function saveDailyPlan(dateKey, plan) {
  const state = read();
  return saveDayFlowState({
    dailyPlans: {
      ...state.dailyPlans,
      [dateKey]: { date: dateKey, ...plan }
    }
  });
}

export function getDailyResult(dateKey) {
  return read().dailyResults?.[dateKey] ?? null;
}

export function saveDailyResult(dateKey, result) {
  const state = read();
  return saveDayFlowState({
    dailyResults: {
      ...state.dailyResults,
      [dateKey]: { date: dateKey, ...result }
    }
  });
}

export function saveMemory(dateKey, memory) {
  const state = read();
  return saveDayFlowState({
    memories: {
      ...state.memories,
      [dateKey]: { date: dateKey, ...memory }
    }
  });
}

export { STORAGE_KEY };
