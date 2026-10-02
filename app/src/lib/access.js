import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { db } from "./firebase";

export const APP_IDS = Object.freeze({
  timetable: "timetable",
  todo: "todo",
  dayflow: "dayflow"
});

const DEFAULT_APPS = Object.freeze({
  timetable: false,
  todo: false,
  dayflow: false
});

function requireDb() {
  if (!db) throw new Error("Firebase Firestore is not configured.");
  return db;
}

function normalizeAccess(data, uid) {
  return {
    uid,
    email: String(data?.email ?? ""),
    role: data?.role === "admin" ? "admin" : "user",
    apps: {
      timetable: data?.apps?.timetable === true,
      todo: data?.apps?.todo === true,
      dayflow: data?.apps?.dayflow === true
    }
  };
}

export async function getAppAccess(uid) {
  if (!uid) return null;
  const snapshot = await getDoc(doc(requireDb(), "appAccess", uid));
  return snapshot.exists() ? normalizeAccess(snapshot.data(), uid) : null;
}

export async function ensureAppAccess(user) {
  if (!user?.uid) return null;
  const database = requireDb();
  const reference = doc(database, "appAccess", user.uid);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    await setDoc(reference, {
      uid: user.uid,
      email: user.email ?? "",
      role: "user",
      apps: { ...DEFAULT_APPS },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return normalizeAccess(
      { uid: user.uid, email: user.email, role: "user", apps: DEFAULT_APPS },
      user.uid
    );
  }

  return normalizeAccess(snapshot.data(), user.uid);
}

export async function isPlatformAdmin(uid) {
  if (!uid) return false;
  const snapshot = await getDoc(doc(requireDb(), "platformAdmins", uid));
  return snapshot.exists();
}

export async function listAppAccess() {
  const snapshot = await getDocs(collection(requireDb(), "appAccess"));
  return snapshot.docs
    .map((item) => normalizeAccess(item.data(), item.id))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function updateAppAccess(uid, apps) {
  if (!uid) throw new Error("A user ID is required.");
  await setDoc(
    doc(requireDb(), "appAccess", uid),
    {
      apps: {
        timetable: apps.timetable === true,
        todo: apps.todo === true,
        dayflow: apps.dayflow === true
      },
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export function hasAppAccess(access, appId) {
  return Boolean(access?.apps?.[appId]);
}
