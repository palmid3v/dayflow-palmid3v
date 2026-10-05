import { useState } from "react";
import { CalendarDays, Link2, Unlink } from "lucide-react";
import { connectGoogleCalendar, disconnectGoogleCalendar } from "./googleCalendarService";

export default function GoogleCalendarModule() {
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function connect() {
    try {
      const result = await connectGoogleCalendar();
      setConnected(true);
      setEmail(result.email);
      setError("");
    } catch (connectionError) {
      setError(connectionError?.message || "Unable to connect Google Calendar.");
    }
  }

  async function disconnect() {
    try {
      await disconnectGoogleCalendar();
      setConnected(false);
      setEmail("");
      setError("");
    } catch (connectionError) {
      setError(connectionError?.message || "Unable to disconnect Google Calendar.");
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)]"><CalendarDays size={18} /></div>
        <div className="min-w-0 flex-1">
          <p className="label">INTEGRATION</p>
          <h3 className="mt-1 text-sm font-semibold">Google Calendar</h3>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Read Google Calendar events in DayFlow without copying them into DayFlow's database.</p>
          {connected && <p className="mt-2 text-xs text-[var(--text-muted)]">Connected: {email}</p>}
        </div>
      </div>
      {error && <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {!connected
          ? <button onClick={connect} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-contrast)]"><Link2 size={15} /> Connect Google Calendar</button>
          : <button onClick={disconnect} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold"><Unlink size={15} /> Disconnect</button>}
      </div>
    </section>
  );
}
