import test from "node:test";
import assert from "node:assert/strict";
import { findOverlappingSchedules } from "../src/features/schedule/scheduleModel.js";

const existing = [
  { id: "morning", subject: "Morning focus", weekday: 1, start: "09:00", end: "10:00" },
  { id: "next", subject: "Next block", weekday: 1, start: "10:00", end: "11:00" },
  { id: "tuesday", subject: "Tuesday focus", weekday: 2, start: "09:30", end: "10:30" }
];

test("detects overlapping blocks only on the same weekday", () => {
  const conflicts = findOverlappingSchedules(existing, {
    id: "candidate", subject: "Review", weekday: 1, start: "09:30", end: "10:15"
  });
  assert.deepEqual(conflicts.map((item) => item.id), ["morning", "next"]);
});

test("allows adjacent time blocks and ignores the edited record", () => {
  const adjacent = findOverlappingSchedules(existing, {
    id: "candidate", subject: "After focus", weekday: 1, start: "11:00", end: "12:00"
  });
  assert.deepEqual(adjacent, []);

  const edited = findOverlappingSchedules(existing, {
    id: "morning", subject: "Morning focus changed", weekday: 1, start: "09:00", end: "10:00"
  }, "morning");
  assert.deepEqual(edited, []);
});

test("invalid schedules do not create overlap warnings", () => {
  assert.deepEqual(findOverlappingSchedules(existing, {
    id: "bad", subject: "", weekday: 1, start: "09:30", end: "10:15"
  }), []);
});
