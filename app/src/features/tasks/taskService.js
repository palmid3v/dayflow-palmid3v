import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  writeBatch
} from "firebase/firestore";
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
  return `${CACHE_PREFIX}${uid}`;
}

function normalize(task) {
  if (!task || typeof task !== "object") return null;
  const title = String(task.title ?? task.name ?? "").trim();
  if (!title) return null;

  return {
    id: String(task.id),
    title,
    completed: Boolean(task.completed ?? task.done),
    createdAt: String(task.createdAt ?? new Date().toISOString()),
    updatedAt: String(task.updatedAt ?? task.createdAt ?? new Date().toISOString())
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

export function createTask(title) {
  const now = new Date().toISOString();
  return {
    id: typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `task-${Date.now()}`,
    title: title.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now
  };
}

export async function loadTasks(uid) {
  const snapshot = await getDocs(collectionRef(uid));
  const tasks = snapshot.docs.map((item) => normalize(item.data())).filter(Boolean);
  writeCache(uid, tasks);
  return tasks;
}

export async function saveTasks(uid, nextTasks, previousTasks = []) {
  const userId = requireUser(uid);
  const previous = new Map(previousTasks.map((task) => [task.id, task]));
  const next = new Map(nextTasks.map((task) => [task.id, task]));
  const batch = writeBatch(db);

  nextTasks.forEach((task) => {
    const old = previous.get(task.id);
    if (!old || JSON.stringify(old) !== JSON.stringify(task)) {
      batch.set(doc(collectionRef(userId), encodeURIComponent(task.id)), task);
    }
  });

  previousTasks.forEach((task) => {
    if (!next.has(task.id)) {
      batch.delete(doc(collectionRef(userId), encodeURIComponent(task.id)));
    }
  });

  await batch.commit();
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
  const legacy = JSON.parse(localStorage.getItem("TODO") ?? "[]");
  const tasks = Array.isArray(legacy) ? legacy.map(normalize).filter(Boolean) : [];
  if (tasks.length) {
    await saveTasks(uid, tasks, []);
    localStorage.removeItem("TODO");
  }
  return tasks;
}

export { CACHE_PREFIX };
