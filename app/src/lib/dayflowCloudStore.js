import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const PLANS = "dayflowPlans";
const RESULTS = "dayflowResults";
const MEMORIES = "dayflowMemories";
const REMINDERS = "dayflowReminders";
const REMINDER_DOC = "current";

function requireDb() {
  if (!db) throw new Error("Firebase Firestore is not configured.");
  return db;
}

function dayflowCollection(uid, name) {
  return collection(requireDb(), "users", uid, name);
}

function dayflowDoc(uid, name, id) {
  return doc(requireDb(), "users", uid, name, id);
}

function toPlain(data) {
  if (!data || typeof data !== "object") return data;
  const plain = { ...data };
  for (const key of ["updatedAt", "cloudSyncedAt"]) {
    if (plain[key]?.toDate instanceof Function) {
      plain[key] = plain[key].toDate().toISOString();
    }
  }
  return plain;
}

function toRecordMap(snapshot) {
  return Object.fromEntries(
    snapshot.docs
      .map((item) => [item.id, toPlain(item.data())])
      .filter(([, value]) => value)
  );
}

export async function loadDayFlowCloud(uid) {
  if (!uid) throw new Error("A Firebase user ID is required.");

  const [plansSnapshot, resultsSnapshot, memoriesSnapshot, remindersSnapshot] = await Promise.all([
    getDocs(dayflowCollection(uid, PLANS)),
    getDocs(dayflowCollection(uid, RESULTS)),
    getDocs(dayflowCollection(uid, MEMORIES)),
    getDoc(dayflowDoc(uid, REMINDERS, REMINDER_DOC))
  ]);

  const reminders = remindersSnapshot.exists()
    ? (Array.isArray(remindersSnapshot.data()?.items) ? remindersSnapshot.data().items : [])
    : [];

  return {
    dailyPlans: toRecordMap(plansSnapshot),
    dailyResults: toRecordMap(resultsSnapshot),
    memories: toRecordMap(memoriesSnapshot),
    reminders
  };
}

export async function saveDailyPlanCloud(uid, dateKey, plan) {
  if (!uid || !dateKey) return;
  await setDoc(dayflowDoc(uid, PLANS, dateKey), {
    ...plan,
    date: dateKey,
    updatedAt: String(plan?.updatedAt ?? new Date().toISOString()),
    cloudSyncedAt: serverTimestamp()
  }, { merge: true });
}

export async function saveDailyResultCloud(uid, dateKey, result) {
  if (!uid || !dateKey) return;
  await setDoc(dayflowDoc(uid, RESULTS, dateKey), {
    ...result,
    date: dateKey,
    updatedAt: String(result?.updatedAt ?? result?.recordedAt ?? new Date().toISOString()),
    cloudSyncedAt: serverTimestamp()
  }, { merge: true });
}

export async function saveMemoryCloud(uid, dateKey, memory) {
  if (!uid || !dateKey) return;
  await setDoc(dayflowDoc(uid, MEMORIES, dateKey), {
    ...memory,
    date: dateKey,
    updatedAt: String(memory?.updatedAt ?? memory?.generatedAt ?? new Date().toISOString()),
    cloudSyncedAt: serverTimestamp()
  }, { merge: true });
}

export async function saveRemindersCloud(uid, reminders) {
  if (!uid) return;
  await setDoc(dayflowDoc(uid, REMINDERS, REMINDER_DOC), {
    items: Array.isArray(reminders) ? reminders : [],
    updatedAt: new Date().toISOString(),
    cloudSyncedAt: serverTimestamp()
  }, { merge: true });
}

function recordTimestamp(record) {
  return String(
    record?.updatedAt ??
    record?.recordedAt ??
    record?.generatedAt ??
    record?.createdAt ??
    ""
  );
}

function mergeRecordMaps(localMap = {}, cloudMap = {}) {
  const merged = { ...localMap };

  for (const [key, cloudValue] of Object.entries(cloudMap)) {
    const localValue = localMap[key];
    if (!localValue || recordTimestamp(cloudValue) >= recordTimestamp(localValue)) {
      merged[key] = cloudValue;
    }
  }

  return merged;
}

async function uploadMissingOrNewerRecords(uid, localMap, cloudMap, saveRecord) {
  await Promise.all(
    Object.entries(localMap)
      .filter(([key, value]) => {
        const cloudValue = cloudMap[key];
        return !cloudValue || recordTimestamp(value) > recordTimestamp(cloudValue);
      })
      .map(([key, value]) => saveRecord(uid, key, value))
  );
}

export async function synchronizeDayFlow(uid, localState) {
  if (!uid) return localState;

  const cloudState = await loadDayFlowCloud(uid);
  const dailyPlans = mergeRecordMaps(localState.dailyPlans, cloudState.dailyPlans);
  const dailyResults = mergeRecordMaps(localState.dailyResults, cloudState.dailyResults);
  const memories = mergeRecordMaps(localState.memories, cloudState.memories);

  await Promise.all([
    uploadMissingOrNewerRecords(uid, localState.dailyPlans, cloudState.dailyPlans, saveDailyPlanCloud),
    uploadMissingOrNewerRecords(uid, localState.dailyResults, cloudState.dailyResults, saveDailyResultCloud),
    uploadMissingOrNewerRecords(uid, localState.memories, cloudState.memories, saveMemoryCloud)
  ]);

  const localReminders = Array.isArray(localState.reminders) ? localState.reminders : [];
  const cloudReminders = Array.isArray(cloudState.reminders) ? cloudState.reminders : [];
  const remindersById = new Map(cloudReminders.map((item) => [String(item.id), item]));
  localReminders.forEach((item) => remindersById.set(String(item.id), item));
  const reminders = [...remindersById.values()].sort((a, b) => String(a.time ?? "").localeCompare(String(b.time ?? "")));

  if (JSON.stringify(reminders) !== JSON.stringify(cloudReminders)) {
    await saveRemindersCloud(uid, reminders);
  }

  return {
    ...localState,
    dailyPlans,
    dailyResults,
    memories,
    reminders
  };
}
