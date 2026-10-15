import test from "node:test";
import assert from "node:assert/strict";
import { isValidSchedule, normalizeSchedule } from "../src/features/schedule/scheduleModel.js";

test("maps legacy Timetable day IDs to JavaScript weekday numbers", () => {
  const cases = [
    ["sun", 0], ["mon", 1], ["tue", 2], ["wed", 3],
    ["thu", 4], ["fri", 5], ["sat", 6]
  ];

  for (const [day, weekday] of cases) {
    const schedule = normalizeSchedule({
      id: day,
      subject: "Focus block",
      day,
      start: "09:00",
      end: "10:00"
    });

    assert.equal(schedule.weekday, weekday, "legacy day " + day + " should map correctly");
    assert.equal(schedule.day, day);
    assert.equal(isValidSchedule(schedule), true);
  }
});

test("preserves the canonical numeric weekday for unified DayFlow records", () => {
  const schedule = normalizeSchedule({
    id: "sunday-block",
    subject: "Sunday review",
    weekday: 0,
    day: "mon",
    start: "09:00",
    end: "10:00"
  });

  assert.equal(schedule.weekday, 0);
  assert.equal(schedule.day, "sun");
  assert.equal(isValidSchedule(schedule), true);
});

test("rejects missing weekdays and invalid time ranges", () => {
  assert.equal(isValidSchedule(normalizeSchedule({
    id: "unknown-day",
    subject: "Unknown",
    day: "not-a-day",
    start: "09:00",
    end: "10:00"
  })), false);

  assert.equal(isValidSchedule(normalizeSchedule({
    id: "invalid-range",
    subject: "Invalid",
    weekday: 1,
    start: "11:00",
    end: "10:00"
  })), false);
});
