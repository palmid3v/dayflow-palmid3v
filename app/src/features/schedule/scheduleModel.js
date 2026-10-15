const LEGACY_DAY_TO_WEEKDAY = Object.freeze({
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6
});

const WEEKDAY_TO_LEGACY_DAY = Object.freeze([
  "sun", "mon", "tue", "wed", "thu", "fri", "sat"
]);
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function parseWeekday(value) {
  if (Number.isInteger(value) && value >= 0 && value <= 6) return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (/^[0-6]$/.test(normalized)) return Number(normalized);
    return LEGACY_DAY_TO_WEEKDAY[normalized] ?? null;
  }

  return null;
}

export function normalizeSchedule(item) {
  if (!item || typeof item !== "object") return null;

  // The numeric weekday is canonical when present. Legacy records only have day IDs
  // such as "mon"; new writes retain both representations during backend migration.
  const weekday = parseWeekday(item.weekday) ?? parseWeekday(item.day ?? item.dayId);

  return {
    id: String(item.id ?? ""),
    subject: String(item.subject ?? item.title ?? "").trim(),
    weekday,
    day: weekday === null ? String(item.day ?? "") : WEEKDAY_TO_LEGACY_DAY[weekday],
    start: String(item.start ?? "09:00"),
    end: String(item.end ?? "10:00"),
    color: String(item.color ?? "default"),
    updatedAt: String(item.updatedAt ?? new Date().toISOString())
  };
}

export function isValidSchedule(item) {
  const schedule = item?.weekday !== undefined && item?.day !== undefined
    ? item
    : normalizeSchedule(item);

  return Boolean(
    schedule &&
    schedule.id.trim() &&
    schedule.subject.trim() &&
    Number.isInteger(schedule.weekday) &&
    schedule.weekday >= 0 &&
    schedule.weekday <= 6 &&
    TIME_PATTERN.test(schedule.start) &&
    TIME_PATTERN.test(schedule.end) &&
    schedule.start < schedule.end
  );
}


export function findOverlappingSchedules(schedules, candidate, excludeId = null) {
  const next = normalizeSchedule(candidate);
  if (!isValidSchedule(next)) return [];

  const ignoredId = excludeId ?? next.id;
  return (Array.isArray(schedules) ? schedules : [])
    .map(normalizeSchedule)
    .filter((item) =>
      isValidSchedule(item) &&
      item.id !== ignoredId &&
      item.weekday === next.weekday &&
      item.start < next.end &&
      next.start < item.end
    );
}
