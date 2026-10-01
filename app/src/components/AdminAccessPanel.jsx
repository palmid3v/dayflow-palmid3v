import { useEffect, useState } from "react";
import { listAppAccess, updateAppAccess } from "../lib/access";

const APPS = [
  ["timetable", "TimeTable"],
  ["todo", "To-Do"],
  ["dayflow", "DayFlow"]
];

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

  async function toggle(account, appId) {
    const apps = { ...account.apps, [appId]: !account.apps[appId] };
    setAccounts((current) =>
      current.map((item) => (item.uid === account.uid ? { ...item, apps } : item))
    );
    setSavingUid(account.uid);
    try {
      await updateAppAccess(account.uid, apps);
      setError("");
    } catch (e) {
      setError(e?.message || "Unable to update account access.");
      await load();
    } finally {
      setSavingUid("");
    }
  }

  return (
    <section className="border-b border-indigo-950 bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg border border-indigo-400/30 px-3 py-2 text-xs font-bold text-indigo-300"
        >
          {open ? "Hide app access manager" : "Open app access manager"}
        </button>

        {open && (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Account</th>
                  {APPS.map(([, label]) => (
                    <th key={label} className="px-4 py-3">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.uid} className="border-t border-slate-800">
                    <td className="px-4 py-3">{account.email || account.uid}</td>
                    {APPS.map(([appId, label]) => {
                      const enabled = account.apps[appId];
                      return (
                        <td key={appId} className="px-4 py-3">
                          <button
                            type="button"
                            disabled={savingUid === account.uid}
                            onClick={() => toggle(account, appId)}
                            aria-label={`${label} access for ${account.email || account.uid}`}
                            className={
                              enabled
                                ? "rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300 disabled:opacity-50"
                                : "rounded-full bg-slate-800 px-3 py-1 text-slate-400 disabled:opacity-50"
                            }
                          >
                            {enabled ? "Enabled" : "Disabled"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {accounts.length === 0 && !error && (
              <p className="border-t border-slate-800 px-4 py-4 text-sm text-slate-500">
                No application access records found.
              </p>
            )}

            {error && (
              <p className="border-t border-rose-900/40 px-4 py-3 text-sm text-rose-300" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
