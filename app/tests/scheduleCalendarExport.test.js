import test from "node:test";
import assert from "node:assert/strict";
import { buildScheduleCalendar } from "../src/features/schedule/scheduleCalendarExport.js";

test("exports recurring schedules using valid RFC weekday codes", () => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const schedules = days.map((day) => ({
    id: "schedule-" + day,
    subject: "Block " + day,
    day,
    start: "09:00",
    end: "10:30",
    color: "default"
  }));

  const calendar = buildScheduleCalendar(schedules, new Date(2026, 9, 15, 8, 0, 0));

  for (const code of ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]) {
    assert.match(calendar, new RegExp("RRULE:FREQ=WEEKLY;BYDAY=" + code));
  }
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 7);
  assert.match(calendar, /DTSTAMP:\d{8}T\d{6}Z/);
  assert.match(calendar, /PRODID:-\/\/PALMI-D3V\/\/DayFlow Schedule\/\/EN/);
});

test("escapes calendar text and puts today's passed slot in next week", () => {
  const calendar = buildScheduleCalendar([{
    id: "focus-1",
    subject: "Deep work, review; notes\nsecond line",
    weekday: 4,
    start: "09:00",
    end: "10:00"
  }], new Date(2026, 9, 15, 12, 0, 0));

  assert.match(calendar, /SUMMARY:Deep work\\, review\\; notes\\nsecond line/);
  assert.match(calendar, /DTSTART:20261022T090000/);
  assert.match(calendar, /DTEND:20261022T100000/);
});

test("ignores malformed recurring schedule records", () => {
  const calendar = buildScheduleCalendar([
    { id: "ok", subject: "Valid", weekday: 1, start: "09:00", end: "10:00" },
    { id: "bad", subject: "Invalid", day: "eventually", start: "27:00", end: "28:00" },
    { id: "empty", subject: "", weekday: 2, start: "09:00", end: "10:00" }
  ], new Date(2026, 9, 15, 8, 0, 0));

  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 1);
  assert.match(calendar, /RRULE:FREQ=WEEKLY;BYDAY=MO/);
});
