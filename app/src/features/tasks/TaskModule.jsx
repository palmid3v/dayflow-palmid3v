import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Circle, Pencil, Plus, Trash2, X } from "lucide-react";
import { auth } from "../../lib/firebase";
import {
  createTask,
  deleteTask,
  loadCachedTasks,
  loadTasks,
  migrateLegacyTasks,
  saveTasks
} from "./taskService";

const filters = [
  ["all", "All"],
  ["active", "Active"],
  ["completed", "Completed"]
];

export default function TaskModule({ onTasksChange }) {
  const uid = auth?.currentUser?.uid;
  const [tasks, setTasks] = useState(() => loadCachedTasks(uid));
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) return undefined;
    let active = true;

    (async () => {
      try {
        const cloud = await loadTasks(uid);
        if (active) {
          setTasks(cloud);
          onTasksChange?.(cloud);
        }
      } catch {
        try {
          const migrated = await migrateLegacyTasks(uid);
          if (active && migrated.length) {
            setTasks(migrated);
            onTasksChange?.(migrated);
          }
        } catch {
          if (active) setError("Cloud tasks are unavailable. Cached tasks remain available.");
        }
      }
    })();

    return () => { active = false; };
  }, [uid, onTasksChange]);

  const visible = useMemo(() => {
    if (filter === "active") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [filter, tasks]);

  async function commit(next) {
    const previous = tasks;
    setTasks(next);
    onTasksChange?.(next);
    setError("");

    try {
      await saveTasks(uid, next, previous);
    } catch {
      setTasks(previous);
      onTasksChange?.(previous);
      setError("Unable to save this task. The previous state was restored.");
    }
  }

  function add(event) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    void commit([createTask(title), ...tasks]);
    setDraft("");
  }

  function toggle(task) {
    void commit(tasks.map((item) =>
      item.id === task.id
        ? { ...item, completed: !item.completed, updatedAt: new Date().toISOString() }
        : item
    ));
  }

  function saveEdit(id) {
    const title = editDraft.trim();
    if (!title) return;
    void commit(tasks.map((task) =>
      task.id === id
        ? { ...task, title, updatedAt: new Date().toISOString() }
        : task
    ));
    setEditing(null);
    setEditDraft("");
  }

  async function remove(id) {
    const previous = tasks;
    setTasks(tasks.filter((task) => task.id !== id));
    onTasksChange?.(tasks.filter((task) => task.id !== id));
    try {
      await deleteTask(uid, id);
    } catch {
      setTasks(previous);
      onTasksChange?.(previous);
      setError("Unable to delete this task.");
    }
  }

  return (
    <PageShell title="Tasks" subtitle="Tasks are now a native DayFlow domain.">
      {error && <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">{error}</p>}

      <div className="mb-4 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
        {filters.map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${filter === id ? "bg-[var(--surface-muted)]" : "text-[var(--text-muted)]"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
        {visible.map((task) => (
          <div key={task.id} className="flex items-center gap-2 border-b border-[var(--border)] py-2 last:border-0">
            <button onClick={() => toggle(task)} aria-label={task.completed ? "Reopen task" : "Complete task"}>
              {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-[var(--text-muted)]" />}
            </button>

            {editing === task.id ? (
              <>
                <input autoFocus value={editDraft} onChange={(event) => setEditDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveEdit(task.id)} className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm outline-none" />
                <button onClick={() => saveEdit(task.id)} aria-label="Save task"><Check size={16} /></button>
                <button onClick={() => setEditing(null)} aria-label="Cancel edit"><X size={16} /></button>
              </>
            ) : (
              <>
                <span className={`min-w-0 flex-1 text-sm ${task.completed ? "text-[var(--text-muted)] line-through" : ""}`}>{task.title}</span>
                <button onClick={() => { setEditing(task.id); setEditDraft(task.title); }} aria-label="Edit task"><Pencil size={15} /></button>
                <button onClick={() => remove(task.id)} aria-label="Delete task"><Trash2 size={15} /></button>
              </>
            )}
          </div>
        ))}
        {!visible.length && <p className="px-2 py-6 text-center text-xs text-[var(--text-muted)]">No tasks in this view.</p>}
      </div>

      <form onSubmit={add} className="flex gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a task…" className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm outline-none" />
        <button className="grid size-10 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]" aria-label="Add task"><Plus size={17} /></button>
      </form>
    </PageShell>
  );
}

function PageShell({ title, subtitle, children }) {
  return (
    <section>
      <header className="mb-5">
        <p className="label">DAYFLOW · TASKS</p>
        <h2 className="mt-1 text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
