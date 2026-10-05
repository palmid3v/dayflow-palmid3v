import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const COLLECTION = "timetableTemplates";

function ref(uid) {
  if (!db || !uid) throw new Error("Firebase Firestore requires an authenticated user.");
  return collection(db, "users", uid, COLLECTION);
}

function normalize(item) {
  return {
    id: String(item.id),
    subject: String(item.subject ?? item.title ?? ""),
    weekday: Number(item.weekday ?? 0),
    start: String(item.start ?? "09:00"),
    end: String(item.end ?? "10:00"),
    color: String(item.color ?? "default"),
    updatedAt: String(item.updatedAt ?? new Date().toISOString())
  };
}

export async function loadSchedules(uid) {
  const snapshot = await getDocs(ref(uid));
  return snapshot.docs.map((item) => normalize(item.data())).filter((item) => item.subject);
}

export async function saveSchedule(uid, schedule) {
  const item = normalize(schedule);
  await setDoc(doc(ref(uid), item.id), { ...item, updatedAt: new Date().toISOString() }, { merge: true });
  return item;
}

export async function removeSchedule(uid, id) {
  await deleteDoc(doc(ref(uid), id));
}
