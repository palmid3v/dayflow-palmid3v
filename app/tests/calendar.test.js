import test from "node:test";
import assert from "node:assert/strict";
import {
  calendarEventsToDailyBlocks,
  parseIcsCalendar
} from "../src/features/calendar/icsParser.js";

test("parseIcsCalendar handles folded and escaped event text", () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:event-1",
    "DTSTART:20261005T090000",
    "DTEND:20261005T100000",
    "SUMMARY:Deep work\\, planning",
    "DESCRIPTION:First line\\nSecond line",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  const [event] = parseIcsCalendar(ics);
  assert.equal(event.id, "event-1");
  assert.equal(event.title, "Deep work, planning");
  assert.equal(event.description, "First line\nSecond line");
  assert.equal(event.durationMs, 60 * 60 * 1000);
});

test("daily recurrence honors COUNT", () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:daily-count",
    "DTSTART:20261001T090000",
    "RRULE:FREQ=DAILY;COUNT=2",
    "SUMMARY:Daily",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\n");
  const [event] = parseIcsCalendar(ics);
  assert.equal(calendarEventsToDailyBlocks([event], new Date(2026, 9, 1)).length, 1);
  assert.equal(calendarEventsToDailyBlocks([event], new Date(2026, 9, 2)).length, 1);
  assert.equal(calendarEventsToDailyBlocks([event], new Date(2026, 9, 3)).length, 0);
});

test("EXDATE removes a recurrence occurrence", () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:excluded",
    "DTSTART:20261001T090000",
    "RRULE:FREQ=DAILY",
    "EXDATE:20261002T090000",
    "SUMMARY:Recurring",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\n");
  const [event] = parseIcsCalendar(ics);
  assert.equal(calendarEventsToDailyBlocks([event], new Date(2026, 9, 1)).length, 1);
  assert.equal(calendarEventsToDailyBlocks([event], new Date(2026, 9, 2)).length, 0);
});

test("all-day events are projected with an explicit all-day label", () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:all-day",
    "DTSTART;VALUE=DATE:20261005",
    "SUMMARY:Birthday",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\n");
  const [event] = parseIcsCalendar(ics);
  const [block] = calendarEventsToDailyBlocks([event], new Date(2026, 9, 5));
  assert.equal(block.time, "All day");
  assert.equal(block.meta, "Imported calendar · All day");
});
