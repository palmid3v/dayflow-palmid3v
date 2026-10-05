import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const EVENTS_COLLECTION = "dayflowImportedCalendarEvents";
const IMPORT_COLLECTION = "dayflowCalendarImports";
const IMPORT_DOC = "current";
const MAX_BATCH_WRITES = 450;

import { parseIcsCalendar, safeId } from "./icsParser.js";

function requireDb() {
  if (!db) throw new Error("Firebase Firestore is not configured.");
  return db;
}

function eventsRef(uid) {
  return collection(requireDb(), "users", uid, EVENTS_COLLECTION);
}

function eventRef(uid, id) {
  return doc(requireDb(), "users", uid, EVENTS_COLLECTION, id);
}

function importRef(uid) {
  return doc(requireDb(), "users", uid, IMPORT_COLLECTION, IMPORT_DOC);
}

function safeId(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 120);
}



export async function loadImportedCalendarEvents(uid) {
  const snapshot = await getDocs(eventsRef(uid));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getCalendarImport(uid) {
  if (!uid) return null;
  const snapshot = await getDoc(importRef(uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function importIcsCalendar(uid, text, fileName) {
  if (!uid) throw new Error("You must be signed in to import a calendar.");
  const events = parseIcsCalendar(text);
  const database = requireDb();

  const existing = await getDocs(eventsRef(uid));
  for (let index = 0; index < existing.docs.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(database);
    existing.docs.slice(index, index + MAX_BATCH_WRITES).forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }

  for (let index = 0; index < events.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(database);
    events.slice(index, index + MAX_BATCH_WRITES).forEach((event) => {
      const id = safeId(`${event.id}-${event.start}`);
      batch.set(eventRef(uid, id), {
        ...event,
        id,
        source: "ics",
        sourceFile: fileName || "calendar.ics"
      });
    });
    await batch.commit();
  }

  await setDoc(importRef(uid), {
    fileName: fileName || "calendar.ics",
    eventCount: events.length,
    importedAt: new Date().toISOString(),
    source: "ics"
  }, { merge: true });

  return { events, eventCount: events.length, fileName: fileName || "calendar.ics" };
}

export async function clearImportedCalendar(uid) {
  if (!uid) return;
  const snapshot = await getDocs(eventsRef(uid));
  for (let index = 0; index < snapshot.docs.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(requireDb());
    snapshot.docs.slice(index, index + MAX_BATCH_WRITES).forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
  await deleteDoc(importRef(uid)).catch(() => undefined);
}
