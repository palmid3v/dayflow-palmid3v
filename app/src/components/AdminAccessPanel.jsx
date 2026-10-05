import { useEffect, useMemo, useState } from "react";
import { Check, Search, Shield, Users } from "lucide-react";
import { listAppAccess, updateAccess } from "../lib/access";

const FEATURES = [
  ["tasks", "Tasks"],
  ["schedule", "Schedule"],
  ["calendar", "Calendar"],
  ["reminders", "Reminders"],
  ["memory", "Memory"]
];

const STATUS = ["pending", "active", "suspended"];

export default function AdminAccessPanel() {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [savingUid, setSavingUid] = useState("");

  async function load() {
    try {
      setAccounts(await listAppAccess());
      setError("");
    } catch (e) {
      setError(e?.message || "Unable to load account access.");
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  async function save(account, patch) {
    const next = { ...account, ...patch, features: { ...account.features, ...(patch.features ?? {}) } };
    setAccounts((current) => current.map((item) => item.uid === account.uid ? next : item));
    setSavingUid(account.uid);
    try {
      await updateAccess(account.uid, { status: next.status, features: next.features });
      setError("");
    } catch (e) {
      setError(e?.message || "Unable to update account access.");
      await load();
    } finally {
      setSavingUid("");
    }
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesQuery = !normalized || account.email.toLowerCase().includes(normalized) || account.uid.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "all" || account.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [accounts, query, statusFilter]);

  const counts = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter((item) => item.status === "active").length,
    pending: accounts.filter((item) => item.status === "pending").length,
    suspended: accounts.filter((item) => item.status === "suspended").length
  }), [accounts]);

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-bold">
          <Shield size={14} />
          {open ? "Hide access manager" : "Open access manager"}
        </button>

        {open && (
          <div className="mt-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["Accounts", counts.total],
                ["Active", counts.active],
                ["Pending", counts.pending],
                ["Suspended", counts.suspended]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <p className="label">{label}</p>
                  <strong className="mt-1 block text-xl">{value}</strong>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3">
                <Search size={16} className="text-[var(--text-muted)]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search email or account ID…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs">
                <option value="all">All statuses</option>
                {STATUS.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <button type="button" onClick={load} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-xs font-semibold">
                <Users size={15} /> Refresh
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-[var(--surface-muted)] text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                  <tr>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Status</th>
                    {FEATURES.map(([, label]) => <th key={label} className="px-4 py-3">{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((account) => (
                    <tr key={account.uid} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3">
                        <p>{account.email || account.uid}</p>
                        <p className="mt-1 font-mono text-[10px] text-[var(--text-faint)]">{account.uid}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select value={account.status} disabled={savingUid === account.uid} onChange={(event) => save(account, { status: event.target.value })} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs">
                          {STATUS.map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                      </td>
                      {FEATURES.map(([featureId]) => (
                        <td key={featureId} className="px-4 py-3">
                          <button
                            type="button"
                            disabled={savingUid === account.uid || account.status !== "active"}
                            onClick={() => save(account, { features: { [featureId]: !account.features[featureId] } })}
                            className={account.features[featureId] && account.status === "active" ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300 disabled:opacity-50" : "rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[var(--text-muted)] disabled:opacity-50"}
                          >
                            {account.features[featureId] && account.status === "active" && <Check size={12} />}
                            {account.features[featureId] ? "Enabled" : "Disabled"}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && !error && <p className="border-t border-[var(--border)] px-4 py-4 text-sm text-[var(--text-muted)]">No accounts match this view.</p>}
              {error && <p className="border-t border-rose-500/20 px-4 py-3 text-sm text-rose-300" role="alert">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
