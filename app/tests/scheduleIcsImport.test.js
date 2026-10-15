import test from "node:test";
import assert from "node:assert/strict";
import { parseIcsScheduleTemplates } from "../src/features/schedule/scheduleIcsImport.js";

function calendar(events) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    ...events.flatMap((event) => [
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTART${event.dateOnly ? ";VALUE=DATE" : ""}:${event.start}`,
      ...(event.end ? [`DTEND${event.dateOnly ? ";VALUE=DATE" : ""}:${event.end}`] : []),
      `SUMMARY:${event.title}`,
      ...(event.rule ? [`RRULE:${event.rule}`] : []),
      "END:VEVENT"
    ]),
    "END:VCALENDAR"
  ].join("\r\n");
}

test("imports weekly BYDAY events as one template per weekday", () => {
  const result = parseIcsScheduleTemplates(calendar([{
    uid: "team-sync",
    start: "20261012T093000",
    end: "20261012T103000",
    title: "Team sync",
    rule: "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  }]));
  assert.deepEqual(result.schedules.map((item) => item.weekday).sort(), [1, 3, 5]);
  assert.ok(result.schedules.every((item) => item.subject === "Team sync" && item.start === "09:30" && item.end === "10:30"));
  assert.equal(result.skipped, 0);
});

test("maps daily recurring events to all seven weekdays", () => {
  const result = parseIcsScheduleTemplates(calendar([{
    uid: "daily-focus",
    start: "20261012T080000",
    end: "20261012T083000",
    title: "Focus time",
    rule: "FREQ=DAILY"
  }]));
  assert.equal(result.schedules.length, 7);
});

test("one-off events map to their start weekday and duplicate templates are not re-imported", () => {
  const source = calendar([{
    uid: "single-event",
    start: "20261013T140000",
    end: "20261013T150000",
    title: "Appointment"
  }]);
  const first = parseIcsScheduleTemplates(source);
  assert.equal(first.schedules.length, 1);
  const second = parseIcsScheduleTemplates(source, first.schedules);
  assert.equal(second.schedules.length, 0);
  assert.equal(second.duplicates, 1);
});

test("skips finite, monthly, yearly and all-day events that weekly templates cannot represent", () => {
  const result = parseIcsScheduleTemplates(calendar([
    { uid: "finite", start: "20261012T090000", end: "20261012T100000", title: "Finite", rule: "FREQ=WEEKLY;BYDAY=MO;COUNT=4" },
    { uid: "monthly", start: "20261012T110000", end: "20261012T120000", title: "Monthly", rule: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=2" },
    { uid: "yearly", start: "20261012T130000", end: "20261012T140000", title: "Yearly", rule: "FREQ=YEARLY" },
    { uid: "all-day", start: "20261012", end: "20261013", title: "Holiday", dateOnly: true }
  ]));
  assert.equal(result.schedules.length, 0);
  assert.equal(result.skipped, 4);
});
