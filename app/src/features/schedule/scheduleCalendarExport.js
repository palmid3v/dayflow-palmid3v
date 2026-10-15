import { isValidSchedule, normalizeSchedule } from "./scheduleModel.js";

const ICS_WEEKDAYS = Object.freeze(["SU", "MO", "TU", "WE", "TH", "FR", "SA"]);
const CRLF = "\r\n";

function escapeIcsText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatLocalDateTime(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("") + "T" + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    "00"
  ].join("");
}

function formatUtcStamp(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function nextStartDate(schedule, reference) {
  const date = new Date(reference);
  const daysUntil = (schedule.weekday - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + daysUntil);

  const [hours, minutes] = schedule.start.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);

  // A schedule already passed today should start on its next weekly occurrence.
  if (daysUntil === 0 && date.getTime() <= reference.getTime()) {
    date.setDate(date.getDate() + 7);
  }

  return date;
}

function scheduleToEvent(schedule, reference, stamp) {
  const startDate = nextStartDate(schedule, reference);
  const endDate = new Date(startDate);
  const [endHours, endMinutes] = schedule.end.split(":").map(Number);
  endDate.setHours(endHours, endMinutes, 0, 0);

  const uid = escapeIcsText(String(schedule.id) + "@dayflow-palmid3v");
  return [
    "BEGIN:VEVENT",
    "UID:" + uid,
    "DTSTAMP:" + stamp,
    "DTSTART:" + formatLocalDateTime(startDate),
    "DTEND:" + formatLocalDateTime(endDate),
    "RRULE:FREQ=WEEKLY;BYDAY=" + ICS_WEEKDAYS[schedule.weekday],
    "SUMMARY:" + escapeIcsText(schedule.subject),
    "END:VEVENT"
  ].join(CRLF);
}

/** Build an RFC 5545-style calendar containing the user's recurring schedule templates. */
export function buildScheduleCalendar(schedules, reference = new Date()) {
  const valid = (Array.isArray(schedules) ? schedules : [])
    .map(normalizeSchedule)
    .filter(isValidSchedule);
  const stamp = formatUtcStamp(new Date());
  const events = valid.map((item) => scheduleToEvent(item, reference, stamp));

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PALMI-D3V//DayFlow Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
    ""
  ].join(CRLF);
}

export function downloadScheduleCalendar(schedules) {
  const valid = (Array.isArray(schedules) ? schedules : [])
    .map(normalizeSchedule)
    .filter(isValidSchedule);

  if (!valid.length || typeof document === "undefined" || typeof URL?.createObjectURL !== "function") {
    return false;
  }

  const blob = new Blob([buildScheduleCalendar(valid)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "palmi-dayflow-schedule.ics";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
