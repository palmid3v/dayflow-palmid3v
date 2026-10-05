import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

export const APP_IDS = Object.freeze({ dayflow: "dayflow" });

export const DAYFLOW_FEATURES = Object.freeze({
  tasks: "tasks",
  schedule: "schedule",
  calendar: "calendar",
  reminders: "reminders",
  memory: "memory"
});

export const DEFAULT_FEATURES = Object.freeze({
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

function normalizeFeatures(storedFeatures, legacyDayFlowEnabled) {
  return Object.fromEntries(
    Object.keys(DEFAULT_FEATURES).map((key) => [
      key,
      storedFeatures ? storedFeatures[key] === true : legacyDayFlowEnabled
    ])
  );
}

function normalizeAccess(data, uid) {
  const legacyDayFlowEnabled = data?.apps?.dayflow === true;
  return {
    uid,
    email: String(data?.email ?? ""),
    role: data?.role === "admin" ? "admin" : "user",
    status: data?.status === "suspended" ? "suspended" : data?.status === "pending" ? "pending" : "active",
    apps: { dayflow: legacyDayFlowEnabled },
    features: normalizeFeatures(data?.features, legacyDayFlowEnabled),
    createdAt: data?.createdAt ?? null,
    updatedAt: data?.updatedAt ?? null
  };
}

function serializeAuditDate(value) {
  if (value?.toDate instanceof Function) return value.toDate().toISOString();
  return value ?? null;
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
    return normalizeAccess(
      {
        uid: user.uid,
        email: user.email,
        role: "user",
        status: "pending",
        apps: { dayflow: false },
        features: DEFAULT_FEATURES
      },
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

export async function updateAccess(uid, { status, features }) {
  if (!uid) throw new Error("A user ID is required.");

  const before = await getAppAccess(uid);
  const nextStatus = ["pending", "active", "suspended"].includes(status) ? status : "pending";
  const nextFeatures = Object.fromEntries(
    Object.keys(DEFAULT_FEATURES).map((key) => [key, features?.[key] === true])
  );

  await setDoc(
    doc(requireDb(), "appAccess", uid),
    {
      status: nextStatus,
      apps: { dayflow: nextStatus === "active" },
      features: nextFeatures,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  try {
    await recordAccessAudit({
      targetUid: uid,
      action: "access.update",
      before: {
        status: before?.status ?? null,
        features: before?.features ?? DEFAULT_FEATURES
      },
      after: {
        status: nextStatus,
        features: nextFeatures
      }
    });
  } catch (error) {
    console.warn("Unable to record access audit event:", error);
  }
}

export async function recordAccessAudit({ targetUid, action, before, after }) {
  const actorUid = auth?.currentUser?.uid;
  if (!actorUid || !targetUid) return;

  await addDoc(collection(requireDb(), "accessAudit"), {
    actorUid,
    targetUid,
    action: String(action || "access.update"),
    before: before ?? {},
    after: after ?? {},
    createdAt: serverTimestamp()
  });
}

export async function listAccessAudit(maxItems = 8) {
  const snapshot = await getDocs(
    query(
      collection(requireDb(), "accessAudit"),
      orderBy("createdAt", "desc"),
      limit(Math.min(Math.max(Number(maxItems) || 8, 1), 25))
    )
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
    createdAt: serializeAuditDate(item.data()?.createdAt)
  }));
}

export function hasAppAccess(access, appId) {
  return appId === APP_IDS.dayflow &&
    access?.status === "active" &&
    access?.apps?.dayflow === true;
}

export function hasFeatureAccess(access, featureId) {
  return hasAppAccess(access, APP_IDS.dayflow) && access?.features?.[featureId] === true;
}
