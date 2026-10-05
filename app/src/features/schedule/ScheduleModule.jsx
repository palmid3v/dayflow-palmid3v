import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";
import { auth } from "../../lib/firebase";
import { loadSchedules, removeSchedule, saveSchedule } from "./scheduleService";
import CalendarImportModule from "../calendar/CalendarImportModule";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ScheduleModule() {
  const uid = auth?.currentUser?.uid;
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState({ subject: "", weekday: new Date().getDay(), start: "09:00", end: "10:00" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) return undefined;
    loadSchedules(uid).then(setItems).catch(() => setError("Unable to load your schedule."));
  }, [uid]);

  const grouped = useMemo(() => DAYS.map((day, weekday) => ({
    day,
    weekday,
    items: items.filter((item) => item.weekday === weekday).sort((a, b) => a.start.localeCompare(b.start))
  })), [items]);

  async function submit(event) {
    event.preventDefault();
    if (!draft.subject.trim()) return;
    const item = {
      ...draft,
      id: editing ?? (typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `schedule-${Date.now()}`),
      subject: draft.subject.trim()
    };

    try {
      await saveSchedule(uid, item);
      const next = editing ? items.map((current) => current.id === editing ? item : current) : [...items, item];
      setItems(next);
      window.dispatchEvent(new CustomEvent("dayflow:schedule-change"));
      setDraft({ subject: "", weekday: new Date().getDay(), start: "09:00", end: "10:00" });
      setEditing(null);
      setError("");
    } catch {
      setError("Unable to save this schedule block.");
    }
  }

  async function remove(id) {
    try {
      await removeSchedule(uid, id);
      setItems(items.filter((item) => item.id !== id));
      window.dispatchEvent(new CustomEvent("dayflow:schedule-change"));
    } catch {
      setError("Unable to remove this schedule block.");
    }
  }

  function edit(item) {
    setEditing(item.id);
    setDraft({ subject: item.subject, weekday: item.weekday, start: item.start, end: item.end });
  }

  return (
    <section>
      <header className="mb-5">
        <p className="label">DAYFLOW · SCHEDULE</p>
        <h2 className="mt-1 text-2xl font-bold">Schedule</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Recurring timetable is now part of DayFlow.</p>
      </header>

      {error && <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">{error}</p>}

      <form onSubmit={submit} className="mb-5 grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[1fr_auto_auto_auto_auto]">
        <input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} placeholder="Schedule block" className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm outline-none" />
        <select value={draft.weekday} onChange={(event) => setDraft({ ...draft, weekday: Number(event.target.value) })} className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 text-sm">
          {DAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}
        </select>
        <input type="time" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-2 text-sm" />
        <input type="time" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-2 text-sm" />
        <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)]">{editing ? <Pencil size={15} /> : <Plus size={15} />}{editing ? "Save" : "Add"}</button>
      </form>

      {editing && <button onClick={() => { setEditing(null); setDraft({ subject: "", weekday: new Date().getDay(), start: "09:00", end: "10:00" }); }} className="mb-4 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]"><X size={14} /> Cancel edit</button>}

      <div className="grid gap-3">
        {grouped.map((group) => (
          <div key={group.day} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-2 flex items-center gap-2"><CalendarDays size={16} /><h3 className="text-sm font-semibold">{group.day}</h3></div>
            {group.items.length ? group.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 border-t border-[var(--border)] py-2 text-sm">
                <time className="w-24 text-xs text-[var(--text-muted)]">{item.start}–{item.end}</time>
                <span className="flex-1">{item.subject}</span>
                <button onClick={() => edit(item)} aria-label="Edit schedule"><Pencil size={15} /></button>
                <button onClick={() => remove(item.id)} aria-label="Delete schedule"><Trash2 size={15} /></button>
              </div>
            )) : <p className="text-xs text-[var(--text-faint)]">No blocks.</p>}
          </div>
        ))}
      </div>
      <CalendarImportModule />
    </section>
  );
}
