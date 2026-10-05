import { BarChart3, CheckCircle2, Flame, Target, TrendingUp } from "lucide-react";
import { getDayFlowState } from "../../lib/dayflowStore";

function dateKey(date) { return date.toLocaleDateString("en-CA"); }

function daysBack(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - index);
    return dateKey(date);
  });
}

function summarize(state, keys) {
  return keys.reduce((summary, key) => {
    const plan = state.dailyPlans?.[key];
    const result = state.dailyResults?.[key];
    const blocks = result?.blocks ?? plan?.blocks ?? [];
    const total = result?.total ?? blocks.length;
    const completed = result?.completed ?? blocks.filter((item) => item.state === "completed").length;
    const skipped = result?.skipped ?? blocks.filter((item) => item.state === "skipped").length;
    const changed = result?.changed ?? blocks.filter((item) => item.state === "changed").length;
    if (total > 0) summary.plannedDays += 1;
    summary.total += total;
    summary.completed += completed;
    summary.skipped += skipped;
    summary.changed += changed;
    if (total > 0 && completed === total) summary.daysCompleted += 1;
    if (total > 0 && completed + changed > 0) summary.activeDays += 1;
    return summary;
  }, { total: 0, completed: 0, skipped: 0, changed: 0, daysCompleted: 0, activeDays: 0, plannedDays: 0 });
}

function calculateStreak(state) {
  let streak = 0;
  for (const key of daysBack(90)) {
    const result = state.dailyResults?.[key];
    const plan = state.dailyPlans?.[key];
    const total = result?.total ?? plan?.blocks?.length ?? 0;
    const completed = result?.completed ?? plan?.blocks?.filter((item) => item.state === "completed").length ?? 0;
    if (total > 0 && completed === total) streak += 1;
    else break;
  }
  return streak;
}

function Metric({ icon, label, value, detail }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-[var(--surface-muted)]">{icon}</span>
        <strong className="text-2xl tracking-tight">{value}</strong>
      </div>
      <p className="label mt-3">{label}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{detail}</p>
    </article>
  );
}

export default function DashboardModule() {
  const state = getDayFlowState();
  const keys = daysBack(7).reverse();
  const summary = summarize(state, keys);
  const streak = calculateStreak(state);
  const completionRate = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0;
  const consistency = Math.round((summary.activeDays / 7) * 100);
  const adherence = summary.total ? Math.round(((summary.completed + summary.changed) / summary.total) * 100) : 0;

  return (
    <section>
      <header className="mb-5">
        <p className="label">DAYFLOW · DASHBOARD</p>
        <h2 className="mt-1 text-2xl font-bold">Your operating week</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">A compact view of execution, consistency, and how closely the week followed the plan.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric icon={<Target size={18} />} label="COMPLETION RATE" value={completionRate + "%"} detail={summary.completed + " completed of " + summary.total + " planned blocks"} />
        <Metric icon={<TrendingUp size={18} />} label="PLAN ADHERENCE" value={adherence + "%"} detail={summary.skipped + " skipped · " + summary.changed + " changed"} />
        <Metric icon={<CheckCircle2 size={18} />} label="DAYS COMPLETED" value={summary.daysCompleted} detail="Fully completed days in the last 7" />
        <Metric icon={<Flame size={18} />} label="CURRENT STREAK" value={streak + "d"} detail="Consecutive fully completed days" />
      </div>
      <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between">
          <div><p className="label">WEEKLY CONSISTENCY</p><p className="mt-1 text-sm text-[var(--text-muted)]">Days with meaningful execution</p></div>
          <strong className="text-xl">{consistency}%</strong>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {keys.map((key) => {
            const day = summarize(state, [key]);
            const active = day.activeDays > 0;
            return (
              <div key={key} className="text-center">
                <div className={"mx-auto grid size-9 place-items-center rounded-xl border " + (active ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]" : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-faint)]")} title={key + ": " + day.completed + "/" + day.total + " completed"}>
                  <BarChart3 size={15} />
                </div>
                <span className="mt-1 block text-[9px] text-[var(--text-faint)]">{new Date(key + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}
