import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { db } from "./firebase";

export const APP_IDS = Object.freeze({ dayflow: "dayflow" });

export const DAYFLOW_FEATURES = Object.freeze({
  tasks: "tasks",
  schedule: "schedule",
  calendar: "calendar",
  reminders: "reminders",
  memory: "memory"
});

const DEFAULT_FEATURES = Object.freeze({
  tasks: false,
  schedule: false,
  calendar: false,
  reminders: false,
  memory: false
});

function requireDb() {
  if (!db) throw new Error("Firebase Firestore is not configured.");
  return db;
}

function normalizeAccess(data, uid) {
  const legacyDayFlowEnabled = data?.apps?.dayflow === true;
  const storedFeatures = data?.features;
  const features = storedFeatures
    ? Object.fromEntries(Object.keys(DEFAULT_FEATURES).map((key) => [key, storedFeatures[key] === true]))
    : Object.fromEntries(Object.keys(DEFAULT_FEATURES).map((key) => [key, legacyDayFlowEnabled]));

  return {
    uid,
    email: String(data?.email ?? ""),
    role: data?.role === "admin" ? "admin" : "user",
    status: data?.status === "suspended" ? "suspended" : data?.status === "pending" ? "pending" : "active",
    apps: { dayflow: legacyDayFlowEnabled },
    features,
    createdAt: data?.createdAt ?? null,
    updatedAt: data?.updatedAt ?? null
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
      status: "pending",
      apps: { dayflow: false },
      features: { ...DEFAULT_FEATURES },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return normalizeAccess({ uid: user.uid, email: user.email, role: "user", status: "pending", apps: { dayflow: false }, features: DEFAULT_FEATURES }, user.uid);
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

export async function updateAccess(uid, { status, features }) {
  if (!uid) throw new Error("A user ID is required.");
  await setDoc(
    doc(requireDb(), "appAccess", uid),
    {
      status: ["pending", "active", "suspended"].includes(status) ? status : "pending",
      apps: { dayflow: status === "active" },
      features: Object.fromEntries(Object.keys(DEFAULT_FEATURES).map((key) => [key, features?.[key] === true])),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export function hasAppAccess(access, appId) {
  return appId === APP_IDS.dayflow &&
    access?.status === "active" &&
    access?.apps?.dayflow === true;
}

export function hasFeatureAccess(access, featureId) {
  return hasAppAccess(access, APP_IDS.dayflow) && access?.features?.[featureId] === true;
}
