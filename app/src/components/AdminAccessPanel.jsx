import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  Clock3,
  Search,
  Shield,
  Users,
  X
} from "lucide-react";
import {
  DEFAULT_FEATURES,
  listAccessAudit,
  listAppAccess,
  updateAccess
} from "../lib/access";

const FEATURES = [
  ["tasks", "Tasks"],
  ["schedule", "Schedule"],
  ["calendar", "Calendar"],
  ["reminders", "Reminders"],
  ["memory", "Memory"]
];

const STATUS = ["pending", "active", "suspended"];

function formatAuditDate(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function AnalyticsCard({ label, value, detail }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <p className="label">{label}</p>
      <strong className="mt-1 block text-2xl tracking-tight">{value}</strong>
      <p className="mt-1 text-[11px] text-[var(--text-muted)]">{detail}</p>
    </article>
  );
}

export default function AdminAccessPanel({ open, onClose }) {
  const [accounts, setAccounts] = useState([]);
  const [audit, setAudit] = useState([]);
  const [tab, setTab] = useState("overview");
  const [queryText, setQueryText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [savingUid, setSavingUid] = useState("");

  async function load() {
    try {
      const [nextAccounts, nextAudit] = await Promise.all([
        listAppAccess(),
        listAccessAudit(8).catch(() => [])
      ]);
      setAccounts(nextAccounts);
      setAudit(nextAudit);
      setError("");
    } catch (e) {
      setError(e?.message || "Unable to load admin data.");
    }
  }

  useEffect(() => {
    if (open) void load();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function save(account, patch) {
    const next = {
      ...account,
      ...patch,
      features: { ...account.features, ...(patch.features ?? {}) }
    };
    setAccounts((current) => current.map((item) => item.uid === account.uid ? next : item));
    setSavingUid(account.uid);

    try {
      await updateAccess(account.uid, {
        status: next.status,
        features: next.features
      });
      setAudit(await listAccessAudit(8).catch(() => audit));
      setError("");
    } catch (e) {
      setError(e?.message || "Unable to update account access.");
      await load();
    } finally {
      setSavingUid("");
    }
  }

  const filtered = useMemo(() => {
    const normalized = queryText.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesQuery =
        !normalized ||
        account.email.toLowerCase().includes(normalized) ||
        account.uid.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "all" || account.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [accounts, queryText, statusFilter]);

  const counts = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter((item) => item.status === "active").length,
    pending: accounts.filter((item) => item.status === "pending").length,
    suspended: accounts.filter((item) => item.status === "suspended").length
  }), [accounts]);

  const featureStats = useMemo(() => FEATURES.map(([id, label]) => {
    const enabled = accounts.filter((item) => item.status === "active" && item.features?.[id]).length;
    return {
      id,
      label,
      enabled,
      percentage: counts.active ? Math.round((enabled / counts.active) * 100) : 0
    };
  }), [accounts, counts.active]);

  const coverage = useMemo(() => {
    if (!counts.active) return 0;
    const fullyConfigured = accounts.filter((account) =>
      account.status === "active" &&
      Object.keys(DEFAULT_FEATURES).some((feature) => account.features?.[feature])
    ).length;
    return Math.round((fullyConfigured / counts.active) * 100);
  }, [accounts, counts.active]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close access manager"
      />

      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-[var(--border)] bg-[var(--bg)] text-[var(--text)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-manager-title"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)]">
              <Shield size={18} />
            </div>
            <div className="min-w-0">
              <p className="label">DAYFLOW · ADMIN</p>
              <h2 id="access-manager-title" className="mt-1 truncate text-lg font-bold">Access Manager</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]" aria-label="Close access manager">
            <X size={18} />
          </button>
        </header>

        <div className="flex shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-5">
          {[
            ["overview", "Overview", Activity],
            ["accounts", "Accounts", Users]
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={"border-b-2 px-3 py-3 text-xs font-semibold " + (
                tab === key
                  ? "border-[var(--text)] text-[var(--text)]"
                  : "border-transparent text-[var(--text-muted)]"
              )}
            >
              <span className="inline-flex items-center gap-2"><Icon size={14} />{label}</span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200" role="alert">
              {error}
            </div>
          )}

          {tab === "overview" && (
            <div className="grid gap-5">
              <section>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="label">ACCESS HEALTH</p>
                    <h3 className="mt-1 text-base font-semibold">Account overview</h3>
                  </div>
                  <button type="button" onClick={load} className="min-h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-xs font-semibold">Refresh</button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AnalyticsCard label="ACCOUNTS" value={counts.total} detail={counts.active + " active"} />
                  <AnalyticsCard label="ACTIVE COVERAGE" value={coverage + "%"} detail="Active users with at least one feature" />
                  <AnalyticsCard label="PENDING" value={counts.pending} detail="Waiting for activation" />
                  <AnalyticsCard label="SUSPENDED" value={counts.suspended} detail="Access currently blocked" />
                </div>
              </section>

              <section>
                <div className="mb-3">
                  <p className="label">FEATURE ADOPTION</p>
                  <h3 className="mt-1 text-base font-semibold">Enabled features</h3>
                </div>
                <div className="grid gap-2">
                  {featureStats.map((feature) => (
                    <div key={feature.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{feature.label}</span>
                        <span className="text-xs text-[var(--text-muted)]">{feature.enabled}/{counts.active} · {feature.percentage}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: feature.percentage + "%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3">
                  <p className="label">RECENT ADMIN ACTIVITY</p>
                  <h3 className="mt-1 text-base font-semibold">Access changes</h3>
                </div>
                <div className="grid gap-2">
                  {audit.map((entry) => (
                    <article key={entry.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold">{entry.action === "access.update" ? "Access updated" : entry.action}</p>
                          <p className="mt-1 truncate font-mono text-[10px] text-[var(--text-faint)]">Target: {entry.targetUid}</p>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-[var(--text-muted)]"><Clock3 size={12} />{formatAuditDate(entry.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                        {(entry.before?.status ?? "—")} → {(entry.after?.status ?? "—")}
                      </p>
                    </article>
                  ))}
                  {!audit.length && <p className="rounded-xl border border-dashed border-[var(--border)] px-3 py-4 text-xs text-[var(--text-muted)]">No access changes recorded yet.</p>}
                </div>
              </section>
            </div>
          )}

          {tab === "accounts" && (
            <div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3">
                  <Search size={16} className="text-[var(--text-muted)]" />
                  <input value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="Search email or account ID…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                </label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs">
                  <option value="all">All statuses</option>
                  {STATUS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <button type="button" onClick={load} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-xs font-semibold">
                  <Users size={15} /> Refresh
                </button>
              </div>

              <div className="grid gap-3">
                {filtered.map((account) => (
                  <article key={account.uid} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{account.email || account.uid}</p>
                        <p className="mt-1 break-all font-mono text-[10px] text-[var(--text-faint)]">{account.uid}</p>
                      </div>
                      <select value={account.status} disabled={savingUid === account.uid} onChange={(event) => save(account, { status: event.target.value })} className="min-h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2 text-xs">
                        {STATUS.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {FEATURES.map(([featureId, label]) => (
                        <button
                          key={featureId}
                          type="button"
                          disabled={savingUid === account.uid || account.status !== "active"}
                          onClick={() => save(account, { features: { [featureId]: !account.features[featureId] } })}
                          className={account.features[featureId] && account.status === "active"
                            ? "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-2 text-left text-[11px] text-emerald-300 disabled:opacity-50"
                            : "rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-2 text-left text-[11px] text-[var(--text-muted)] disabled:opacity-50"}
                        >
                          <span className="flex items-center gap-1">
                            {account.features[featureId] && account.status === "active" && <Check size={11} />}
                            {label}
                          </span>
                          <span className="mt-1 block text-[9px] opacity-70">{account.features[featureId] ? "Enabled" : "Disabled"}</span>
                        </button>
                      ))}
                    </div>
                  </article>
                ))}

                {!filtered.length && <p className="rounded-xl border border-dashed border-[var(--border)] px-3 py-5 text-center text-xs text-[var(--text-muted)]">No accounts match this view.</p>}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
