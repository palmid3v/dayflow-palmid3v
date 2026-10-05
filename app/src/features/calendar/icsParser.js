const WEEKDAY_INDEX = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6
};

function requireDb() {
  if (!db) throw new Error("Firebase Firestore is not configured.");
  return db;
}

function eventsRef(uid) {
  return collection(requireDb(), "users", uid, EVENTS_COLLECTION);
}

function eventRef(uid, id) {
  return doc(requireDb(), "users", uid, EVENTS_COLLECTION, id);
}

function importRef(uid) {
  return doc(requireDb(), "users", uid, IMPORT_COLLECTION, IMPORT_DOC);
}

function unfoldLines(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .reduce((lines, line) => {
      if (/^[ \t]/.test(line) && lines.length) {
        lines[lines.length - 1] += line.slice(1);
      } else {
        lines.push(line);
      }
      return lines;
    }, []);
}

function unescapeText(value) {
  return String(value ?? "")
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function splitValues(value) {
  const result = [];
  let current = "";
  let escaped = false;
  for (const char of String(value ?? "")) {
    if (escaped) {
      current += char;
      escaped = false;
    } else if (char === "\\") {
      current += char;
      escaped = true;
    } else if (char === ",") {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.filter(Boolean);
}

function parseProperty(line) {
  const separator = line.indexOf(":");
  if (separator < 0) return null;
  const left = line.slice(0, separator);
  const value = line.slice(separator + 1);
  const [name, ...rawParams] = left.split(";");
  const params = Object.fromEntries(
    rawParams.map((item) => {
      const index = item.indexOf("=");
      return index < 0
        ? [item.toUpperCase(), true]
        : [item.slice(0, index).toUpperCase(), item.slice(index + 1)];
    })
  );
  return { name: name.toUpperCase(), params, value };
}

function parseDateTime(value, params = {}) {
  const raw = String(value ?? "").trim();
  const allDay = params.VALUE === "DATE" || /^\d{8}$/.test(raw);
  if (allDay) {
    const year = Number(raw.slice(0, 4));
    const month = Number(raw.slice(4, 6)) - 1;
    const day = Number(raw.slice(6, 8));
    return {
      date: new Date(year, month, day),
      allDay: true,
      dateKey: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      raw,
      timeZone: params.TZID || ""
    };
  }

  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!match) return null;

  const [, year, month, day, hour, minute, second, utc] = match;
  const date = utc
    ? new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)))
    : new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));

  return {
    date,
    allDay: false,
    dateKey: `${year}-${month}-${day}`,
    raw,
    timeZone: params.TZID || ""
  };
}

function parseRule(value) {
  return Object.fromEntries(
    String(value ?? "")
      .replace(/^RRULE:/i, "")
      .split(";")
      .filter(Boolean)
      .map((part) => {
        const [key, ...rest] = part.split("=");
        return [key.toUpperCase(), rest.join("=")];
      })
  );
}

function parseEventBlock(lines) {
  const fields = {};
  const rrules = [];
  const rdates = [];
  const exdates = [];

  for (const line of lines) {
    const property = parseProperty(line);
    if (!property) continue;

    if (property.name === "RRULE") {
      rrules.push(parseRule(property.value));
      continue;
    }

    if (property.name === "RDATE") {
      for (const value of splitValues(property.value)) {
        const parsed = parseDateTime(value, property.params);
        if (parsed) rdates.push(parsed);
      }
      continue;
    }

    if (property.name === "EXDATE") {
      for (const value of splitValues(property.value)) {
        const parsed = parseDateTime(value, property.params);
        if (parsed) exdates.push(parsed);
      }
      continue;
    }

    fields[property.name] = property;
  }

  const start = fields.DTSTART ? parseDateTime(fields.DTSTART.value, fields.DTSTART.params) : null;
  if (!start) return null;

  const end = fields.DTEND ? parseDateTime(fields.DTEND.value, fields.DTEND.params) : null;
  const durationMs = end && start.date ? Math.max(0, end.date.getTime() - start.date.getTime()) : 60 * 60 * 1000;

  return {
    id: unescapeText(fields.UID?.value || `dayflow-${start.raw}-${fields.SUMMARY?.value || "event"}`),
    title: unescapeText(fields.SUMMARY?.value || "Untitled event"),
    description: unescapeText(fields.DESCRIPTION?.value || ""),
    location: unescapeText(fields.LOCATION?.value || ""),
    start: start.date.toISOString(),
    startDateKey: start.dateKey,
    end: end?.date?.toISOString() || new Date(start.date.getTime() + durationMs).toISOString(),
    durationMs,
    allDay: start.allDay,
    timeZone: start.timeZone,
    recurrenceId: fields["RECURRENCE-ID"] ? parseDateTime(fields["RECURRENCE-ID"].value, fields["RECURRENCE-ID"].params)?.date.toISOString() : "",
    rules: rrules,
    rdates: rdates.map((item) => item.date.toISOString()),
    exdates: exdates.map((item) => item.date.toISOString()),
    importedAt: new Date().toISOString()
  };
}

export function parseIcsCalendar(text) {
  const lines = unfoldLines(text);
  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = [];
      continue;
    }
    if (line === "END:VEVENT") {
      const event = parseEventBlock(current || []);
      if (event) events.push(event);
      current = null;
      continue;
    }
    if (current) current.push(line);
  }

  if (!events.length) {
    throw new Error("No calendar events were found in this .ics file.");
  }

  return events;
}

function safeId(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 120);
}

function dateKey(date) {
  return date.toLocaleDateString("en-CA");
}

function sameDay(a, b) {
  return dateKey(a) === dateKey(b);
}

function dayDifference(start, target) {
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((targetMidnight - startMidnight) / 86400000);
}

function startOfWeek(date, weekStart) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const delta = (result.getDay() - weekStart + 7) % 7;
  result.setDate(result.getDate() - delta);
  return result;
}

function parseRuleDate(value) {
  const parsed = parseDateTime(value, {});
  return parsed?.date || null;
}

function ruleMatchesDate(event, target) {
  if (!event.rules?.length) return sameDay(new Date(event.start), target);

  const start = new Date(event.start);
  if (target < new Date(start.getFullYear(), start.getMonth(), start.getDate())) return false;

  const excluded = new Set((event.exdates || []).map((value) => dateKey(new Date(value))));
  if (excluded.has(dateKey(target))) return false;

  if ((event.rdates || []).some((value) => sameDay(new Date(value), target))) return true;

  return event.rules.some((rule) => {
    const freq = rule.FREQ;
    const interval = Math.max(1, Number(rule.INTERVAL || 1));
    const until = rule.UNTIL ? parseRuleDate(rule.UNTIL) : null;
    if (until && target > until) return false;

    const byMonth = rule.BYMONTH ? rule.BYMONTH.split(",").map(Number) : null;
    const byMonthDay = rule.BYMONTHDAY ? rule.BYMONTHDAY.split(",").map(Number) : null;
    const byDay = rule.BYDAY ? rule.BYDAY.split(",") : null;

    if (byMonth && !byMonth.includes(target.getMonth() + 1)) return false;

    let matches = false;

    if (freq === "DAILY") {
      const diff = dayDifference(start, target);
      matches = diff >= 0 && diff % interval === 0;
    } else if (freq === "WEEKLY") {
      const weekStart = rule.WKST ? WEEKDAY_INDEX[rule.WKST] ?? 1 : 1;
      const startWeek = startOfWeek(start, weekStart);
      const targetWeek = startOfWeek(target, weekStart);
      const weeks = Math.round((targetWeek - startWeek) / (7 * 86400000));
      const weekdays = byDay?.map((value) => WEEKDAY_INDEX[value.replace(/^[+-]?\d+/, "")]).filter((value) => value !== undefined)
        ?? [start.getDay()];
      matches = weeks >= 0 && weeks % interval === 0 && weekdays.includes(target.getDay());
    } else if (freq === "MONTHLY") {
      const months = (target.getFullYear() - start.getFullYear()) * 12 + target.getMonth() - start.getMonth();
      if (months >= 0 && months % interval === 0) {
        if (byMonthDay) {
          matches = byMonthDay.some((day) => day > 0
            ? target.getDate() === day
            : target.getDate() === new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate() + day + 1);
        } else if (byDay) {
          matches = byDay.some((value) => {
            const match = value.match(/^([+-]?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/);
            if (!match) return false;
            const weekday = WEEKDAY_INDEX[match[2]];
            if (match[1]) {
              const ordinal = Number(match[1]);
              if (target.getDay() !== weekday) return false;
              const occurrence = Math.floor((target.getDate() - 1) / 7) + 1;
              if (ordinal > 0) return occurrence === ordinal;
              const last = new Date(target.getFullYear(), target.getMonth() + 1, 0);
              const fromEnd = Math.floor((last.getDate() - target.getDate()) / 7) + 1;
              return fromEnd === Math.abs(ordinal);
            }
            return target.getDay() === weekday;
          });
        } else {
          matches = target.getDate() === start.getDate();
        }
      }
    } else if (freq === "YEARLY") {
      const years = target.getFullYear() - start.getFullYear();
      if (years >= 0 && years % interval === 0) {
        const months = byMonth || [start.getMonth() + 1];
        if (months.includes(target.getMonth() + 1)) {
          if (byMonthDay) {
            matches = byMonthDay.includes(target.getDate());
          } else if (byDay) {
            matches = byDay.some((value) => target.getDay() === WEEKDAY_INDEX[value.replace(/^[+-]?\d+/, "")]);
          } else {
            matches = target.getMonth() === start.getMonth() && target.getDate() === start.getDate();
          }
        }
      }
    }

    if (!matches || !rule.COUNT) return matches;

    const end = startOfDay(target);
    const cursor = startOfDay(start);
    let count = 0;
    while (cursor <= end) {
      if (ruleMatchesWithoutCount(event, rule, cursor)) count += 1;
      if (count > Number(rule.COUNT)) return false;
      cursor.setDate(cursor.getDate() + 1);
    }
    return count > 0 && count <= Number(rule.COUNT);
  });
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}


function ruleMatchesWithoutCount(event, rule, target) {
  const start = new Date(event.start);
  if (target < startOfDay(start)) return false;
  const freq = rule.FREQ;
  const interval = Math.max(1, Number(rule.INTERVAL || 1));
  const byDay = rule.BYDAY ? rule.BYDAY.split(",") : null;
  const byMonthDay = rule.BYMONTHDAY ? rule.BYMONTHDAY.split(",").map(Number) : null;
  const byMonth = rule.BYMONTH ? rule.BYMONTH.split(",").map(Number) : null;
  if (byMonth && !byMonth.includes(target.getMonth() + 1)) return false;
  if (freq === "DAILY") return dayDifference(start, target) % interval === 0;
  if (freq === "WEEKLY") {
    const weekStart = rule.WKST ? WEEKDAY_INDEX[rule.WKST] ?? 1 : 1;
    const weeks = Math.round((startOfWeek(target, weekStart) - startOfWeek(start, weekStart)) / (7 * 86400000));
    const weekdays = byDay?.map((value) => WEEKDAY_INDEX[value.replace(/^[+-]?\d+/, "")]).filter((value) => value !== undefined) ?? [start.getDay()];
    return weeks >= 0 && weeks % interval === 0 && weekdays.includes(target.getDay());
  }
  if (freq === "MONTHLY") {
    const months = (target.getFullYear() - start.getFullYear()) * 12 + target.getMonth() - start.getMonth();
    if (months < 0 || months % interval !== 0) return false;
    if (byMonthDay) return byMonthDay.includes(target.getDate());
    return byDay ? byDay.some((value) => target.getDay() === WEEKDAY_INDEX[value.replace(/^[+-]?\d+/, "")]) : target.getDate() === start.getDate();
  }
  if (freq === "YEARLY") {
    const years = target.getFullYear() - start.getFullYear();
    if (years < 0 || years % interval !== 0) return false;
    return target.getMonth() === start.getMonth() && target.getDate() === start.getDate();
  }
  return false;
}

export function calendarEventsToDailyBlocks(events, date = new Date()) {
  return events
    .flatMap((event) => {
      const start = new Date(event.start);
      const occurs = event.recurrenceId
        ? sameDay(new Date(event.recurrenceId), date)
        : ruleMatchesDate(event, date);

      if (!occurs) return [];

      const occurrenceStart = event.recurrenceId ? new Date(event.recurrenceId) : new Date(start);
      return [{
        id: `imported-calendar-${safeId(event.id)}-${dateKey(date)}`,
        source: "imported-calendar",
        sourceId: event.id,
        time: event.allDay
          ? "All day"
          : occurrenceStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        emoji: "📅",
        title: event.title,
        meta: event.allDay ? "Imported calendar · All day" : "Imported calendar",
        state: "planned",
        location: event.location || "",
        description: event.description || ""
      }];
    })
    .sort((a, b) => a.time.localeCompare(b.time));
}
