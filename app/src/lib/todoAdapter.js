const TODO_STORAGE_KEY = "TODO";
const PROVIDER_KEY = "__PALMI_D3V_TODO_PROVIDER__";
const CHANNEL = "PALMI_D3V_TODO";
const VERSION = "1.0.0";
const REQUEST = "GET_TASKS";
const RESPONSE = "TASKS";
const UPDATE = "TASKS_UPDATED";

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

export function connectToDoProvider() {
  const todoUrl = import.meta.env.VITE_TODO_URL ?? "";
  const todoOrigin = import.meta.env.VITE_TODO_ORIGIN ?? "";

  if (!todoUrl || !todoOrigin) {
    throw new Error("Configure VITE_TODO_URL and VITE_TODO_ORIGIN before connecting To-Do.");
  }

  const popup = window.open(todoUrl, "palmi-d3v-todo");
  if (!popup) {
    throw new Error("The To-Do window was blocked. Allow popups and try again.");
  }

  let currentTasks = [];
  let cleanupProvider = null;

  const provider = {
    getTasks: () => currentTasks
  };

  const onMessage = (event) => {
    if (event.origin !== todoOrigin || event.source !== popup) return;
    if (event.data?.channel !== CHANNEL || event.data?.version !== VERSION) return;

    if (event.data.type === RESPONSE || event.data.type === UPDATE) {
      currentTasks = Array.isArray(event.data.tasks)
        ? event.data.tasks.map(normalizeTask).filter((task) => task.title)
        : [];
      cleanupProvider?.();
      cleanupProvider = registerTodoProvider(provider);
    }
  };

  window.addEventListener("message", onMessage);

  const requestTasks = () => {
    if (popup.closed) return;
    popup.postMessage(
      { channel: CHANNEL, version: VERSION, type: REQUEST },
      todoOrigin
    );
  };

  popup.addEventListener?.("load", requestTasks);
  window.setTimeout(requestTasks, 800);

  return {
    popup,
    disconnect() {
      window.removeEventListener("message", onMessage);
      cleanupProvider?.();
    }
  };
}

export const todoContract = {
  version: VERSION,
  source: "palmi-d3v/to-do",
  storageKey: TODO_STORAGE_KEY,
  providerKey: PROVIDER_KEY,
  channel: CHANNEL,
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
