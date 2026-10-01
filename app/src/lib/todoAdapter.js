/**
 * DayFlow never owns tasks.
 *
 * Integration order:
 * 1. A future To-Do provider can register through registerTodoProvider().
 * 2. Same-origin consumers can expose window.__PALMI_D3V_TODO_PROVIDER__.
 * 3. Until a provider exists, DayFlow reads the legacy TODO localStorage snapshot.
 *
 * DayFlow may schedule/reference a task, but task lifecycle and persistence
 * remain owned by To-Do.
 */

const TODO_STORAGE_KEY = "TODO";
const PROVIDER_KEY = "__PALMI_D3V_TODO_PROVIDER__";

function normalizeTask(task) {
  return {
    id: String(task.id ?? crypto.randomUUID()),
    title: String(task.title ?? task.name ?? ""),
    completed: Boolean(task.completed ?? task.done),
    createdAt: task.createdAt ?? null,
    updatedAt: task.updatedAt ?? null
  };
}

export function registerTodoProvider(provider) {
  if (!provider || typeof provider.getTasks !== "function") {
    throw new TypeError("To-Do provider must expose getTasks().");
  }

  globalThis[PROVIDER_KEY] = provider;
  window.dispatchEvent(new CustomEvent("dayflow:todo-provider", { detail: provider }));

  return () => {
    if (globalThis[PROVIDER_KEY] === provider) {
      delete globalThis[PROVIDER_KEY];
    }
  };
}

export function getTodoTasksFromStorage(storage = globalThis.localStorage) {
  const provider = globalThis[PROVIDER_KEY];

  try {
    if (provider?.getTasks) {
      const tasks = provider.getTasks();
      return Array.isArray(tasks) ? tasks.map(normalizeTask).filter((task) => task.title) : [];
    }

    const raw = storage?.getItem(TODO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((task) => !task.trash).map(normalizeTask).filter((task) => task.title)
      : [];
  } catch {
    return [];
  }
}

export const todoContract = {
  version: "1.0.0",
  source: "palmi-d3v/to-do",
  storageKey: TODO_STORAGE_KEY,
  providerKey: PROVIDER_KEY,
  direction: "read-only",
  ownership: {
    taskCreation: "todo",
    taskState: "todo",
    completion: "todo",
    persistence: "todo",
    scheduling: "dayflow",
    reminders: "dayflow",
    planning: "dayflow",
    tracking: "dayflow",
    memory: "dayflow"
  }
};
