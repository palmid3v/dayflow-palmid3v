import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

const PROJECT_ID = "dayflow-rules-tests";
let testEnv;

const accessRecord = (overrides = {}) => ({
  uid: "user-a",
  email: "user-a@example.test",
  role: "user",
  status: "active",
  apps: { dayflow: true },
  features: {
    tasks: true,
    schedule: true,
    calendar: true,
    reminders: true,
    memory: true
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides
});

before(async () => {
  const rules = await readFile(new URL("../../firestore.rules", import.meta.url), "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules }
  });

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "appAccess/user-a"), accessRecord());
    await setDoc(doc(db, "appAccess/user-b"), accessRecord({
      uid: "user-b",
      email: "user-b@example.test"
    }));
    await setDoc(doc(db, "platformAdmins/admin-a"), { role: "admin" });
  });
});

after(async () => {
  await testEnv?.cleanup();
});

function userDb(uid, claims = { email_verified: true }) {
  return testEnv.authenticatedContext(uid, claims).firestore();
}

test("active user can read and write their own tasks when Tasks is enabled", async () => {
  const db = userDb("user-a");
  const task = doc(db, "users/user-a/tasks/task-1");

  await assertSucceeds(setDoc(task, { title: "Test task" }));
  await assertSucceeds(getDoc(task));
});

test("user cannot read or write another user's task documents", async () => {
  const db = userDb("user-a");

  await assertFails(getDoc(doc(db, "users/user-b/tasks/private-task")));
  await assertFails(setDoc(doc(db, "users/user-b/tasks/attack"), { title: "No" }));
});

test("unverified users cannot use ordinary DayFlow collections", async () => {
  const db = userDb("user-a", { email_verified: false });

  await assertFails(getDoc(doc(db, "users/user-a/dayflowPlans/2026-10-18")));
  await assertFails(setDoc(doc(db, "users/user-a/tasks/unverified"), { title: "No" }));
});

test("disabled feature blocks its collection even when app access is active", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "appAccess/user-a"), accessRecord({
      features: {
        tasks: false,
        schedule: true,
        calendar: true,
        reminders: true,
        memory: true
      }
    }));
  });

  const db = userDb("user-a");
  await assertFails(getDoc(doc(db, "users/user-a/tasks/task-1")));
  await assertSucceeds(getDoc(doc(db, "users/user-a/timetableTemplates/template-1")));
});

test("platform admin can access protected user data", async () => {
  const db = userDb("admin-a");

  await assertSucceeds(setDoc(doc(db, "users/user-a/tasks/admin-reviewed"), {
    title: "Admin-reviewed task"
  }));
});

test("access records cannot be self-promoted to active", async () => {
  const db = userDb("user-c");

  await assertFails(setDoc(doc(db, "appAccess/user-c"), accessRecord({
    uid: "user-c",
    email: "user-c@example.test"
  })));
});
