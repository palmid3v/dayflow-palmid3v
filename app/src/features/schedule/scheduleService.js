import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { isValidSchedule, normalizeSchedule } from "./scheduleModel.js";

const COLLECTION = "timetableTemplates";

function ref(uid) {
  if (!db || !uid) throw new Error("Firebase Firestore requires an authenticated user.");
  return collection(db, "users", uid, COLLECTION);
}

export async function loadSchedules(uid) {
  const snapshot = await getDocs(ref(uid));
  return snapshot.docs
    .map((entry) => normalizeSchedule({ ...entry.data(), id: entry.id }))
    .filter((item) => item?.subject && isValidSchedule(item));
}

export async function saveSchedule(uid, schedule) {
  const item = normalizeSchedule(schedule);
  if (!isValidSchedule(item)) {
    throw new Error("A schedule requires a title, valid weekday, and end time after start time.");
  }

  const saved = { ...item, updatedAt: new Date().toISOString() };
  await setDoc(doc(ref(uid), saved.id), saved, { merge: true });
  return saved;
}

export async function removeSchedule(uid, id) {
  await deleteDoc(doc(ref(uid), id));
}

export function getSchedulesForDate(schedules, date = new Date()) {
  const weekday = date.getDay();
  return schedules
    .filter((item) => item.weekday === weekday)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function scheduleToDailyBlocks(schedules, date = new Date()) {
  const dateKey = date instanceof Date ? date.toLocaleDateString("en-CA") : String(date);
  const targetDate = date instanceof Date ? date : new Date(dateKey + "T12:00:00");
  return getSchedulesForDate(schedules, targetDate).map((item) => ({
    id: "schedule-" + item.id + "-" + dateKey,
    source: "schedule",
    sourceId: item.id,
    time: item.start,
    emoji: "🗓️",
    title: item.subject,
    meta: item.start + "–" + item.end + " · Schedule",
    state: "planned"
  }));
}
