import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const PLANS = "plans";
const RESULTS = "results";
const MEMORIES = "memories";
const REMINDERS = "reminders";
const REMINDER_DOC = "current";

function requireDb() {
  if (!db) throw new Error("Firebase Firestore is not configured.");
  return db;
}

function dayflowCollection(uid, name) {
  return collection(requireDb(), "users", uid, "dayflow", name);
}

function dayflowDoc(uid, name, id) {
  return doc(requireDb(), "users", uid, "dayflow", name, id);
}

function toPlain(data) {
  if (!data || typeof data !== "object") return data;
  const { updatedAt, ...rest } = data;
  return rest;
}

function toRecordMap(snapshot) {
  return Object.fromEntries(
    snapshot.docs
      .map((item) => [item.id, toPlain(item.data())])
      .filter(([, value]) => value)
  );
}

async function loadCollectionMap(uid, name) {
  const snapshot = await getDocs(dayflowCollection(uid, name));
  return toRecordMap(snapshot);
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
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function saveDailyResultCloud(uid, dateKey, result) {
  if (!uid || !dateKey) return;
  await setDoc(dayflowDoc(uid, RESULTS, dateKey), {
    ...result,
    date: dateKey,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function saveMemoryCloud(uid, dateKey, memory) {
  if (!uid || !dateKey) return;
  await setDoc(dayflowDoc(uid, MEMORIES, dateKey), {
    ...memory,
    date: dateKey,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function saveRemindersCloud(uid, reminders) {
  if (!uid) return;
  await setDoc(dayflowDoc(uid, REMINDERS, REMINDER_DOC), {
    items: Array.isArray(reminders) ? reminders : [],
    updatedAt: serverTimestamp()
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

async function uploadMissingRecords(uid, localMap, cloudMap, saveRecord) {
  await Promise.all(
    Object.entries(localMap)
      .filter(([key]) => !cloudMap[key])
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
    uploadMissingRecords(uid, localState.dailyPlans, cloudState.dailyPlans, saveDailyPlanCloud),
    uploadMissingRecords(uid, localState.dailyResults, cloudState.dailyResults, saveDailyResultCloud),
    uploadMissingRecords(uid, localState.memories, cloudState.memories, saveMemoryCloud)
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
