import { collection, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase";

const COLLECTION = "tasks";
const CACHE_PREFIX = "DAYFLOW_TASKS:";

function requireUser(uid) {
  if (!db || !uid) throw new Error("Firebase Firestore requires an authenticated user.");
  return uid;
}

function collectionRef(uid) {
  return collection(db, "users", requireUser(uid), COLLECTION);
}

function cacheKey(uid) {
  return CACHE_PREFIX + uid;
}

function normalize(task) {
  if (!task || typeof task !== "object") return null;
  const title = String(task.title ?? task.name ?? "").trim();
  if (!title) return null;
  const createdAt = String(task.createdAt ?? new Date().toISOString());
  const completed = Boolean(task.completed ?? task.done);

  return {
    id: String(task.id),
    title,
    description: String(task.description ?? ""),
    completed,
    status: task.status ?? (completed ? "completed" : "active"),
    priority: task.priority ?? "normal",
    dueDate: task.dueDate ? String(task.dueDate) : "",
    scheduledTime: task.scheduledTime ? String(task.scheduledTime) : "",
    category: String(task.category ?? ""),
    tags: Array.isArray(task.tags) ? task.tags.map(String) : [],
    createdAt,
    updatedAt: String(task.updatedAt ?? createdAt)
  };
}

function readCache(uid) {
  try {
    const value = JSON.parse(localStorage.getItem(cacheKey(uid)) ?? "[]");
    return Array.isArray(value) ? value.map(normalize).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeCache(uid, tasks) {
  localStorage.setItem(cacheKey(uid), JSON.stringify(tasks));
  window.dispatchEvent(new CustomEvent("dayflow:tasks-change"));
}

export function loadCachedTasks(uid) {
  return uid ? readCache(uid) : [];
}

export function createTask(title, details = {}) {
  const now = new Date().toISOString();
  return {
    id: typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : "task-" + Date.now(),
    title: title.trim(),
    description: String(details.description ?? ""),
    completed: false,
    status: "active",
    priority: details.priority ?? "normal",
    dueDate: details.dueDate ?? "",
    scheduledTime: details.scheduledTime ?? "",
    category: details.category ?? "",
    tags: Array.isArray(details.tags) ? details.tags : [],
    createdAt: now,
    updatedAt: now
  };
}

export async function loadTasks(uid) {
  const snapshot = await getDocs(collectionRef(uid));
  const tasks = snapshot.docs
    .map((item) => normalize({ ...item.data(), id: item.id }))
    .filter(Boolean);
  writeCache(uid, tasks);
  return tasks;
}

export async function saveTasks(uid, nextTasks, previousTasks = []) {
  const userId = requireUser(uid);
  const previous = new Map(previousTasks.map((task) => [task.id, task]));
  const next = new Map(nextTasks.map((task) => [task.id, task]));
  const operations = [];

  nextTasks.forEach((task) => {
    const old = previous.get(task.id);
    if (!old || JSON.stringify(old) !== JSON.stringify(task)) {
      operations.push({
        type: "set",
        ref: doc(collectionRef(userId), encodeURIComponent(task.id)),
        data: task
      });
    }
  });

  previousTasks.forEach((task) => {
    if (!next.has(task.id)) {
      operations.push({
        type: "delete",
        ref: doc(collectionRef(userId), encodeURIComponent(task.id))
      });
    }
  });

  // Firestore batches have a 500-operation cap. Chunking keeps large imports valid.
  for (let index = 0; index < operations.length; index += 450) {
    const batch = writeBatch(db);
    operations.slice(index, index + 450).forEach((operation) => {
      if (operation.type === "delete") batch.delete(operation.ref);
      else batch.set(operation.ref, operation.data);
    });
    await batch.commit();
  }

  writeCache(userId, nextTasks);
  return nextTasks;
}

export async function deleteTask(uid, taskId) {
  await deleteDoc(doc(collectionRef(uid), encodeURIComponent(taskId)));
  const next = readCache(uid).filter((task) => task.id !== taskId);
  writeCache(uid, next);
  return next;
}

export async function migrateLegacyTasks(uid) {
  let legacy;
  try {
    const raw = localStorage.getItem("TODO") ?? "[]";
    const parsed = JSON.parse(raw);
    legacy = Array.isArray(parsed) ? parsed.map(normalize).filter(Boolean) : [];
  } catch {
    throw new Error("Legacy task data could not be parsed; it was left untouched.");
  }

  if (legacy.length) {
    await saveTasks(uid, legacy, []);
    localStorage.removeItem("TODO");
  }
  return legacy;
}

export { CACHE_PREFIX };
