import { useEffect, useState } from "react";
import { listAppAccess, updateAccess } from "../lib/access";

const FEATURES = [
  ["tasks", "Tasks"],
  ["schedule", "Schedule"],
  ["calendar", "Imported Calendar"],
  ["reminders", "Reminders"],
  ["memory", "Memory"]
];

const STATUS = ["pending", "active", "suspended"];

export default function AdminAccessPanel() {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
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

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-bold">
          {open ? "Hide access manager" : "Open access manager"}
        </button>

        {open && (
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
                {accounts.map((account) => (
                  <tr key={account.uid} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">{account.email || account.uid}</td>
                    <td className="px-4 py-3">
                      <select
                        value={account.status}
                        disabled={savingUid === account.uid}
                        onChange={(event) => save(account, { status: event.target.value })}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
                      >
                        {STATUS.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </td>
                    {FEATURES.map(([featureId]) => (
                      <td key={featureId} className="px-4 py-3">
                        <button
                          type="button"
                          disabled={savingUid === account.uid || account.status !== "active"}
                          onClick={() => save(account, { features: { [featureId]: !account.features[featureId] } })}
                          className={account.features[featureId] && account.status === "active"
                            ? "rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300 disabled:opacity-50"
                            : "rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[var(--text-muted)] disabled:opacity-50"}
                        >
                          {account.features[featureId] ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {accounts.length === 0 && !error && <p className="border-t border-[var(--border)] px-4 py-4 text-sm text-[var(--text-muted)]">No accounts found.</p>}
            {error && <p className="border-t border-rose-500/20 px-4 py-3 text-sm text-rose-300" role="alert">{error}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
