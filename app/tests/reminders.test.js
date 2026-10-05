import test from "node:test";
import assert from "node:assert/strict";
import {
  createReminder,
  isReminderCompletedForDate,
  remindersForDate,
  sortReminders,
  updateReminder
} from "../src/features/reminders/reminderService.js";

test("createReminder produces a normalized open reminder", () => {
  const reminder = createReminder("  Review DayFlow  ", { date: "2026-10-05", time: "09:30", repeat: "daily" });
  assert.equal(reminder.title, "Review DayFlow");
  assert.equal(reminder.date, "2026-10-05");
  assert.equal(reminder.time, "09:30");
  assert.equal(reminder.repeat, "daily");
  assert.equal(reminder.status, "open");
  assert.equal(reminder.completed, false);
  assert.ok(reminder.id);
  assert.ok(reminder.createdAt);
});

test("updateReminder keeps normalized fields and updates metadata", () => {
  const reminder = createReminder("Original", { date: "2026-10-05" });
  const updated = updateReminder(reminder, { title: "Updated", time: "14:00" });
  assert.equal(updated.title, "Updated");
  assert.equal(updated.time, "14:00");
  assert.ok(updated.updatedAt);
});

test("daily reminders project to later dates", () => {
  const reminder = createReminder("Daily check", { date: "2026-10-01", time: "08:00", repeat: "daily" });
  const projected = remindersForDate([reminder], "2026-10-05");
  assert.equal(projected.length, 1);
  assert.equal(projected[0].occurrenceDate, "2026-10-05");
  assert.equal(projected[0].occurrenceCompleted, false);
});

test("completed occurrences are recognized by date", () => {
  const reminder = createReminder("Weekly review", { date: "2026-10-01", repeat: "weekly" });
  const completed = updateReminder(reminder, { completedDates: ["2026-10-08"] });
  assert.equal(isReminderCompletedForDate(completed, "2026-10-08"), true);
  assert.equal(isReminderCompletedForDate(completed, "2026-10-15"), false);
});

test("sortReminders returns a new time-ordered array", () => {
  const items = [
    createReminder("Late", { time: "18:00" }),
    createReminder("Early", { time: "08:00" })
  ];
  const sorted = sortReminders(items);
  assert.equal(sorted[0].title, "Early");
  assert.notEqual(sorted, items);
});
