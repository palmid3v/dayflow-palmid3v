import { parseIcsCalendar, safeId } from "../calendar/icsParser.js";
import { isValidSchedule, normalizeSchedule } from "./scheduleModel.js";

const WEEKDAYS = Object.freeze({ SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 });

function timeOf(date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function signature(item) {
  return [item.subject.trim().toLowerCase(), item.weekday, item.start, item.end].join("|");
}

function weekdaysFor(event) {
  const start = new Date(event.start);
  const rule = event.rules?.[0];
  if (!rule) return { weekdays: [start.getDay()], supported: true };

  if (event.rules.length !== 1 || rule.COUNT || rule.UNTIL || event.exdates?.length || event.recurrenceId) {
    return { weekdays: [], supported: false };
  }

  if (rule.FREQ === "DAILY") {
    return { weekdays: [0, 1, 2, 3, 4, 5, 6], supported: true };
  }

  if (rule.FREQ === "WEEKLY") {
    const values = rule.BYDAY
      ? rule.BYDAY.split(",").map((value) => WEEKDAYS[value.replace(/^[+-]?\\d+/, "")])
      : [start.getDay()];
    if (!values.length || values.some((value) => value === undefined)) {
      return { weekdays: [], supported: false };
    }
    return { weekdays: [...new Set(values)], supported: true };
  }

  // Monthly/yearly patterns cannot be represented faithfully by a weekly template.
  return { weekdays: [], supported: false };
}

/**
 * Convert compatible .ics VEVENT records into DayFlow's weekly schedule templates.
 * One-off events map to their weekday; daily rules map to all seven days; weekly
 * rules map to BYDAY. Finite and monthly/yearly rules are skipped rather than
 * silently changing their meaning.
 */
export function parseIcsScheduleTemplates(text, existingSchedules = []) {
  const events = parseIcsCalendar(text);
  const seen = new Set((Array.isArray(existingSchedules) ? existingSchedules : [])
    .map(normalizeSchedule)
    .filter(isValidSchedule)
    .map(signature));
  const schedules = [];
  let skipped = 0;
  let duplicates = 0;

  for (const event of events) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startTime = timeOf(start);
    const endTime = timeOf(end);
    const { weekdays, supported } = weekdaysFor(event);

    if (!supported || event.allDay || !event.title.trim() || startTime >= endTime) {
      skipped += 1;
      continue;
    }

    let importedForEvent = false;
    for (const weekday of weekdays) {
      const candidate = normalizeSchedule({
        id: safeId(`ics-${event.id}-${weekday}`),
        subject: event.title,
        weekday,
        start: startTime,
        end: endTime,
        day: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][weekday]
      });
      if (!isValidSchedule(candidate)) continue;
      const key = signature(candidate);
      if (seen.has(key)) {
        duplicates += 1;
        continue;
      }
      seen.add(key);
      schedules.push(candidate);
      importedForEvent = true;
    }

    if (!importedForEvent && weekdays.length === 0) skipped += 1;
  }

  return { schedules, skipped, duplicates, eventCount: events.length };
}
