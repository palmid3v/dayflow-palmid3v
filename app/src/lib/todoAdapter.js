/**
 * DayFlow does not own tasks.
 *
 * This adapter is deliberately read-oriented until the cross-app integration
 * contract is finalized. The To-Do repository remains the authoritative
 * source for task lifecycle and persistence.
 */

const TODO_STORAGE_KEY = "TODO";

function normalizeTask(task) {
  return {
    id: String(task.id ?? crypto.randomUUID()),
    title: String(task.title ?? task.name ?? ""),
    completed: Boolean(task.completed ?? task.done),
    createdAt: task.createdAt ?? null,
    updatedAt: task.updatedAt ?? null
  };
}

export function getTodoTasksFromStorage(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(TODO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((task) => !task.trash).map(normalizeTask)
      : [];
  } catch {
    return [];
  }
}

export const todoContract = {
  source: "palmi-d3v/to-do",
  storageKey: TODO_STORAGE_KEY,
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