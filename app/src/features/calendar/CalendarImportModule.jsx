import { useEffect, useRef, useState } from "react";
import { CalendarDays, FileUp, RefreshCw, Trash2 } from "lucide-react";
import { auth } from "../../lib/firebase";
import {
  clearImportedCalendar,
  getCalendarImport,
  importIcsCalendar
} from "./calendarService";

export default function CalendarImportModule() {
  const uid = auth?.currentUser?.uid;
  const inputRef = useRef(null);
  const [currentImport, setCurrentImport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!uid) return;
    getCalendarImport(uid)
      .then(setCurrentImport)
      .catch(() => setCurrentImport(null));
  }, [uid]);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".ics")) {
      setError("Choose an .ics calendar file. If Google gave you a .zip, extract the .ics file first.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const text = await file.text();
      const result = await importIcsCalendar(uid, text, file.name);
      setCurrentImport({
        fileName: result.fileName,
        eventCount: result.eventCount,
        files: result.files,
        importedAt: new Date().toISOString(),
        source: "ics"
      });
      window.dispatchEvent(new CustomEvent("dayflow:calendar-change"));
      setMessage(`${result.importedCount} events imported from ${file.name}. ${result.eventCount} events are now available across ${result.files.length} calendar file(s).`);
    } catch (importError) {
      setError(importError?.message || "Unable to import this calendar.");
    } finally {
      setBusy(false);
    }
  }

  async function clearCalendar() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await clearImportedCalendar(uid);
      setCurrentImport(null);
      window.dispatchEvent(new CustomEvent("dayflow:calendar-change"));
      setMessage("Imported calendar cleared.");
    } catch (clearError) {
      setError(clearError?.message || "Unable to clear the imported calendar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)]"><CalendarDays size={18} /></div>
        <div className="min-w-0 flex-1">
          <p className="label">CALENDAR IMPORT</p>
          <h3 className="mt-1 text-sm font-semibold">Bring your calendar into DayFlow</h3>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            Export calendars as .ics and import each file here. You can import multiple calendars; re-importing a file updates that file without removing your other imported calendars. If Google gives you a .zip, extract it first. No Google login or Calendar API is required.
          </p>
        </div>
      </div>

      {currentImport && (
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs">
          <p className="font-semibold">{currentImport.fileName}</p>
          <p className="mt-1 text-[var(--text-muted)]">{currentImport.eventCount} events across {currentImport.files?.length || 1} calendar file(s) · last imported {new Date(currentImport.importedAt).toLocaleString()}</p>
        </div>
      )}

      {message && <p className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">{message}</p>}
      {error && <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200" role="alert">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <input ref={inputRef} type="file" accept=".ics,text/calendar" onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-contrast)] disabled:opacity-50"
        >
          {busy ? <RefreshCw size={15} className="animate-spin" /> : <FileUp size={15} />}
          {busy ? "Importing…" : "Import .ics"}
        </button>
        {currentImport && (
          <button
            type="button"
            onClick={clearCalendar}
            disabled={busy}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold disabled:opacity-50"
          >
            <Trash2 size={15} /> Clear imported calendars
          </button>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-5 text-[var(--text-faint)]">
        Recurring events stay recurring. DayFlow categorizes recognizable birthdays, appointments, meetings, holidays, travel and reminders, and shows all imported events in the monthly calendar below.
      </p>
    </section>
  );
}
