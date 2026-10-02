import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Home,
  Moon,
  Plus,
  Settings,
  Sun,
  Target,
  Trash2
} from "lucide-react";
import {
  getDailyPlan,
  getDailyResult,
  getDayFlowState,
  saveDailyPlan,
  saveDailyResult,
  saveDayFlowState,
  saveMemory
} from "./lib/dayflowStore";
import { connectToDoProvider, getTodoTasksFromStorage } from "./lib/todoAdapter";
import { createDailyMemory, createDailyResult } from "./domain/models";
import { auth } from "./lib/firebase";
import {
  saveDailyPlanCloud,
  saveDailyResultCloud,
  saveMemoryCloud,
  saveRemindersCloud,
  synchronizeDayFlow
} from "./lib/dayflowCloudStore";

const navItems = [
  [Home, "today", "Today"],
  [CalendarDays, "calendar", "Calendar"],
  [CheckCircle2, "tasks", "Tasks"],
  [BookOpen, "memory", "Memory"]
];

function dateKey(date = new Date()) {
  return date.toLocaleDateString("en-CA");
}

function formatDate(key) {
  return new Date(`${key}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function getInitialPlan(key) {
  return getDailyPlan(key);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function App() {
  const today = dateKey();
  const [tab, setTab] = useState("today");
  const [plan, setPlan] = useState(() => getInitialPlan(today));
  const [note, setNote] = useState(() => getDayFlowState().notes?.[today] ?? "");
  const [reminders, setReminders] = useState(() => getDayFlowState().reminders ?? []);
  const [tasks, setTasks] = useState(() => getTodoTasksFromStorage());
  const [theme, setTheme] = useState(() => getDayFlowState().settings?.theme ?? "system");
  const [showSettings, setShowSettings] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(Boolean(getDailyResult(today)));
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState("");
  const [todoConnected, setTodoConnected] = useState(false);
  const [todoError, setTodoError] = useState("");
  const todoConnectionRef = useRef(null);

  const completed = plan.blocks.filter((block) => block.state === "completed").length;
  const progress = plan.blocks.length ? Math.round((completed / plan.blocks.length) * 100) : 0;
  const openReminders = reminders.filter((reminder) => !reminder.completed);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      setCloudReady(true);
      return undefined;
    }

    let cancelled = false;

    synchronizeDayFlow(uid, getDayFlowState())
      .then((state) => {
        if (cancelled) return;
        saveDayFlowState(state);
        setPlan(state.dailyPlans?.[today] ?? { date: today, blocks: [] });
        setNote(state.notes?.[today] ?? "");
        setReminders(state.reminders ?? []);
        setReviewSaved(Boolean(state.dailyResults?.[today]));
        setCloudError("");
        setCloudReady(true);
      })
      .catch((error) => {
        console.error("Unable to synchronize DayFlow with Firebase:", error);
        if (!cancelled) {
          setCloudError("Cloud sync is unavailable. Your local DayFlow data remains available.");
          setCloudReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [today]);

  useEffect(() => {
    const refresh = () => setTasks(getTodoTasksFromStorage());
    window.addEventListener("storage", refresh);
    window.addEventListener("dayflow:todo-provider", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("dayflow:todo-provider", refresh);
    };
  }, []);

  function updatePlan(nextBlocks) {
    const nextPlan = { ...plan, blocks: nextBlocks, updatedAt: new Date().toISOString() };
    setPlan(nextPlan);
    saveDailyPlan(today, nextPlan);
    void saveDailyPlanCloud(auth?.currentUser?.uid, today, nextPlan).catch((error) => {
      console.error("Unable to save DayFlow plan to Firebase:", error);
    });
    setReviewSaved(false);
  }

  function updateBlock(id, state) {
    updatePlan(plan.blocks.map((block) => block.id === id ? { ...block, state } : block));
  }

  function addBlock(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const time = String(form.get("time") ?? "18:00");
    if (!title) return;
    updatePlan([...plan.blocks, {
      id: `block-${Date.now()}`,
      time,
      emoji: String(form.get("emoji") || "📌"),
      title,
      meta: String(form.get("meta") || "Planned"),
      state: "planned"
    }].sort((a, b) => a.time.localeCompare(b.time)));
    event.currentTarget.reset();
  }

  function deleteBlock(id) {
    updatePlan(plan.blocks.filter((block) => block.id !== id));
  }

  function saveNote(value) {
    setNote(value);
    const state = getDayFlowState();
    saveDayFlowState({ notes: { ...state.notes, [today]: value } });
  }

  function toggleReminder(id) {
    const next = reminders.map((item) => item.id === id ? { ...item, completed: !item.completed } : item);
    setReminders(next);
    saveDayFlowState({ reminders: next });
    void saveRemindersCloud(auth?.currentUser?.uid, next).catch((error) => {
      console.error("Unable to save DayFlow reminders to Firebase:", error);
    });
  }

  function addReminder(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) return;
    const next = [...reminders, {
      id: `reminder-${Date.now()}`,
      title,
      time: String(form.get("time") || "18:00"),
      date: today,
      completed: false
    }].sort((a, b) => a.time.localeCompare(b.time));
    setReminders(next);
    saveDayFlowState({ reminders: next });
    void saveRemindersCloud(auth?.currentUser?.uid, next).catch((error) => {
      console.error("Unable to save DayFlow reminders to Firebase:", error);
    });
    event.currentTarget.reset();
  }

  function deleteReminder(id) {
    const next = reminders.filter((item) => item.id !== id);
    setReminders(next);
    saveDayFlowState({ reminders: next });
    void saveRemindersCloud(auth?.currentUser?.uid, next).catch((error) => {
      console.error("Unable to save DayFlow reminders to Firebase:", error);
    });
  }

  function saveReview() {
    const result = createDailyResult(plan, today);
    const memory = createDailyMemory(plan, result, note);
    saveDailyResult(today, result);
    saveMemory(today, memory);
    void saveDailyResultCloud(auth?.currentUser?.uid, today, result).catch((error) => {
      console.error("Unable to save DayFlow daily result to Firebase:", error);
    });
    void saveMemoryCloud(auth?.currentUser?.uid, today, memory).catch((error) => {
      console.error("Unable to save DayFlow memory to Firebase:", error);
    });
    setReviewSaved(true);
  }

  useEffect(() => () => todoConnectionRef.current?.disconnect(), []);

  function connectTodo() {
    try {
      todoConnectionRef.current?.disconnect();
      setTodoError("");
      const connection = connectToDoProvider();
      todoConnectionRef.current = connection;
      setTodoConnected(true);
      window.setTimeout(() => setTasks(getTodoTasksFromStorage()), 1000);
    } catch (error) {
      setTodoConnected(false);
      setTodoError(error instanceof Error ? error.message : "Unable to connect To-Do.");
      return null;
    }
  }

  function changeTheme(value) {
    setTheme(value);
    saveDayFlowState({ settings: { theme: value } });
  }

  if (!cloudReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 text-center shadow-xl">
          <p className="font-semibold">Syncing DayFlow…</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Restoring your cloud data before the day starts.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6 sm:px-6">
        {cloudError && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200" role="status">
            {cloudError}
          </div>
        )}

        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="label">{formatDate(today).toUpperCase()}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{getGreeting()}, Palmi 👋</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Your day, in one flow.</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)]"
            aria-label="Open settings"
          >
            <Settings size={18} />
          </button>
        </header>

        {tab === "today" && (
          <>
            <section className="mb-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="label">TODAY'S FLOW</p>
                  <strong className="mt-1 block text-5xl tracking-tighter">{progress}%</strong>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {completed} of {plan.blocks.length} planned blocks completed
                  </p>
                </div>
                <ProgressRing value={progress} />
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </section>

            <section className="mb-7">
              <SectionHeader title="Today" action="View calendar" onClick={() => setTab("calendar")} />
              <div className="relative ml-9 border-l border-[var(--border)]">
                {plan.blocks.map((block) => (
                  <BlockRow key={block.id} block={block} onToggle={updateBlock} onDelete={deleteBlock} />
                ))}
                {!plan.blocks.length && <Empty title="Nothing planned" text="Add your first block from Calendar." />}
              </div>
            </section>

            <section className="mb-7">
              <SectionHeader title="Reminders" action={`${openReminders.length} open`} />
              <ReminderPanel reminders={reminders.filter((item) => item.date === today)} onToggle={toggleReminder} onDelete={deleteReminder} onAdd={addReminder} />
            </section>

            <section className="mb-7">
              <SectionHeader title="To-Do" action="Open tasks" onClick={() => setTab("tasks")} />
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                {tasks.length === 0 ? (
                  <div className="flex items-center gap-3 px-2 py-3">
                    <Target size={19} className="text-[var(--text-muted)]" />
                    <div>
                      <b className="text-sm">No connected tasks yet</b>
                      <p className="text-xs text-[var(--text-muted)]">DayFlow reads tasks from PALMI-D3V To-Do and never owns them.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
                        {task.completed ? <CheckCircle2 size={17} /> : <Circle size={17} className="text-[var(--text-muted)]" />}
                        <span className={task.completed ? "text-[var(--text-muted)] line-through" : ""}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <MemoryCard note={note} saved={reviewSaved} onChange={saveNote} onSave={saveReview} />
          </>
        )}

        {tab === "calendar" && <CalendarView plan={plan} onToggle={updateBlock} onDelete={deleteBlock} onAdd={addBlock} />}
        {tab === "tasks" && (
          <TasksView
            tasks={tasks}
            connected={todoConnected}
            error={todoError}
            onConnect={connectTodo}
          />
        )}
        {tab === "memory" && <MemoryView plan={plan} note={note} onChange={saveNote} onSave={saveReview} />}

        {showSettings && (
          <SettingsDialog theme={theme} onThemeChange={changeTheme} onClose={() => setShowSettings(false)} />
        )}
      </div>

      <nav className="fixed bottom-3 left-1/2 z-10 grid w-[calc(100%-24px)] max-w-[720px] -translate-x-1/2 grid-cols-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl backdrop-blur-xl" aria-label="Primary navigation">
        {navItems.map(([Icon, key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`grid min-h-12 justify-items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition ${tab === key ? "bg-[var(--surface-muted)] text-[var(--text)]" : "text-[var(--text-muted)]"}`}
            aria-current={tab === key ? "page" : undefined}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function applyTheme(theme) {
  const resolved = theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;
  document.documentElement.dataset.theme = resolved;
}

function ProgressRing({ value }) {
  return (
    <div className="grid size-20 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--accent) 0 ${value}%, var(--surface-muted) ${value}% 100%)` }}>
      <div className="grid size-[62px] place-items-center rounded-full bg-[var(--surface)] text-sm font-bold">{value}</div>
    </div>
  );
}

function SectionHeader({ title, action, onClick }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      <button onClick={onClick} className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-muted)]" disabled={!onClick}>
        {action}{onClick && <ChevronRight size={15} />}
      </button>
    </div>
  );
}

function BlockRow({ block, onToggle, onDelete }) {
  const nextState = block.state === "completed" ? "planned" : "completed";
  return (
    <div className="group relative flex w-full gap-3 pb-3 pl-5 text-left">
      <time className="absolute -left-10 top-3 text-[10px] text-[var(--text-faint)]">{block.time}</time>
      <button
        onClick={() => onToggle(block.id, nextState)}
        className="flex min-h-[62px] flex-1 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--text-muted)]"
        aria-label={`${block.title}, currently ${block.state}. Change to ${nextState}`}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)] text-lg">{block.emoji}</span>
        <span className="min-w-0 flex-1">
          <b className={`block text-sm ${block.state === "completed" ? "text-[var(--text-muted)] line-through" : ""}`}>{block.title}</b>
          <small className="mt-1 block text-[11px] text-[var(--text-muted)]">{block.meta} · {block.state}</small>
        </span>
        {block.state === "completed" ? <CheckCircle2 size={19} /> : <Circle size={19} className="text-[var(--text-muted)]" />}
      </button>
      <button onClick={() => onDelete(block.id)} className="grid size-9 shrink-0 place-items-center self-center rounded-xl text-[var(--text-faint)] hover:bg-[var(--surface-muted)]" aria-label={`Delete ${block.title}`}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function ReminderPanel({ reminders, onToggle, onDelete, onAdd }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="mb-3 grid gap-2">
        {reminders.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
            <button onClick={() => onToggle(item.id)} aria-label={`${item.completed ? "Reopen" : "Complete"} reminder: ${item.title}`}>
              {item.completed ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-[var(--text-muted)]" />}
            </button>
            <span className={`flex-1 text-sm ${item.completed ? "text-[var(--text-muted)] line-through" : ""}`}>{item.title}</span>
            <time className="text-xs text-[var(--text-muted)]">{item.time}</time>
            <button onClick={() => onDelete(item.id)} className="text-[var(--text-faint)]" aria-label={`Delete reminder: ${item.title}`}><Trash2 size={15} /></button>
          </div>
        ))}
        {!reminders.length && <p className="px-2 py-2 text-xs text-[var(--text-muted)]">Nothing waiting. Add a reminder below.</p>}
      </div>
      <form onSubmit={onAdd} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input name="title" required placeholder="Remember to…" aria-label="Reminder title" className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm outline-none" />
        <input name="time" type="time" defaultValue="18:00" aria-label="Reminder time" className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-2 text-sm" />
        <button className="grid min-h-10 place-items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)]" aria-label="Add reminder"><Plus size={17} /></button>
      </form>
    </div>
  );
}

function MemoryCard({ note, saved, onChange, onSave }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)]"><BookOpen size={19} /></div>
        <div className="flex-1">
          <p className="label">DAILY MEMORY</p>
          <h2 className="mt-1 text-sm font-semibold">Turn today's activity into a written memory.</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">DayFlow captures the difference between the plan and the day you actually lived.</p>
          <textarea value={note} onChange={(event) => onChange(event.target.value)} placeholder="Add a note about today…" className="mt-3 min-h-20 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-3 text-xs outline-none placeholder:text-[var(--text-faint)]" />
          <button onClick={onSave} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-contrast)]">
            {saved ? <Check size={15} /> : <BookOpen size={15} />} {saved ? "Review saved" : "Save daily review"}
          </button>
        </div>
      </div>
    </section>
  );
}

function CalendarView({ plan, onToggle, onDelete, onAdd }) {
  return (
    <Page title="Calendar" icon={<CalendarDays />} subtitle="Scheduled blocks are owned by DayFlow.">
      <form onSubmit={onAdd} className="mb-4 grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[auto_auto_1fr_auto_auto]">
        <input name="time" type="time" defaultValue="18:00" aria-label="Block time" className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-2 text-sm" />
        <input name="emoji" defaultValue="📌" maxLength="2" aria-label="Block emoji" className="min-h-10 w-16 rounded-xl border border-[var(--border)] bg-transparent text-center text-lg" />
        <input name="title" required placeholder="New calendar block" aria-label="Block title" className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm" />
        <input name="meta" placeholder="Duration / context" aria-label="Block metadata" className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm" />
        <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)]"><Plus size={16} /> Add</button>
      </form>
      <div className="grid gap-2">{plan.blocks.map((block) => <BlockRow key={block.id} block={block} onToggle={onToggle} onDelete={onDelete} />)}</div>
    </Page>
  );
}

function TasksView({ tasks, connected, error, onConnect }) {
  return (
    <Page title="Tasks" icon={<CheckCircle2 />} subtitle="Tasks remain authoritative in PALMI-D3V To-Do.">
      <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
          <Target size={17} className="mt-0.5 shrink-0" />
          <span>Read-only integration surface — DayFlow references tasks but never duplicates or mutates them.</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={onConnect} className="min-h-10 rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-contrast)]">
            {connected ? "Reconnect To-Do" : "Connect To-Do"}
          </button>
          <span className="text-xs text-[var(--text-muted)]">{connected ? "Connected" : "Not connected"}</span>
        </div>
        {error && <p className="mt-3 text-xs text-[var(--text-muted)]">{error}</p>}
        <p className="mt-3 text-[11px] leading-5 text-[var(--text-muted)]">
          The connection opens the PALMI-D3V To-Do app and exchanges read-only task snapshots through a browser message bridge.
        </p>
      </div>
      {tasks.length
        ? tasks.map((task) => <div key={task.id} className="mb-2 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">{task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-[var(--text-muted)]" />}<span className={task.completed ? "text-[var(--text-muted)] line-through" : ""}>{task.title}</span></div>)
        : <Empty title="No connected tasks" text="Connect To-Do to expose its current tasks here." />}
    </Page>
  );
}

function MemoryView({ plan, note, onChange, onSave }) {
  const state = getDayFlowState();
  const memories = Object.values(state.memories ?? {}).sort((a, b) => b.date.localeCompare(a.date));
  const result = createDailyResult(plan, dateKey());
  return (
    <Page title="Memory" icon={<BookOpen />} subtitle="A record of what the day became.">
      <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="label">TODAY · {formatDate(dateKey()).toUpperCase()}</p>
        <h2 className="mt-2 text-lg font-semibold">The day in progress</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{result.completed} completed · {result.skipped} skipped · {result.changed} changed · {result.planned} still planned.</p>
        <textarea value={note} onChange={(event) => onChange(event.target.value)} placeholder="Write what mattered today…" className="mt-4 min-h-36 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-3 text-sm outline-none placeholder:text-[var(--text-faint)]" />
        <button onClick={onSave} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-contrast)]"><BookOpen size={15} /> Save memory</button>
      </div>
      <h3 className="mb-3 text-sm font-semibold">History</h3>
      <div className="grid gap-2">
        {memories.map((memory) => (
          <article key={memory.date} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="label">{formatDate(memory.date).toUpperCase()}</p>
            <p className="mt-2 text-sm">{memory.summary}</p>
            {memory.note && <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{memory.note}</p>}
          </article>
        ))}
        {!memories.length && <Empty title="No memories yet" text="Save today's review and DayFlow will start your history." />}
      </div>
    </Page>
  );
}

function SettingsDialog({ theme, onThemeChange, onClose }) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-end bg-black/50 p-3 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="label">DAYFLOW</p>
            <h2 id="settings-title" className="mt-1 text-xl font-bold">Settings</h2>
          </div>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-xl bg-[var(--surface-muted)]" aria-label="Close settings">×</button>
        </div>
        <p className="mb-3 text-sm font-semibold">Appearance</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["system", Settings, "System"],
            ["light", Sun, "Light"],
            ["dark", Moon, "Dark"]
          ].map(([value, Icon, label]) => (
            <button key={value} onClick={() => onThemeChange(value)} className={`grid min-h-20 place-items-center gap-2 rounded-2xl border p-3 text-xs ${theme === value ? "border-[var(--text)] bg-[var(--surface-muted)]" : "border-[var(--border)]"}`} aria-pressed={theme === value}>
              <Icon size={19} />{label}
            </button>
          ))}
        </div>
        <p className="mt-5 text-xs leading-5 text-[var(--text-muted)]">Theme preference is stored locally and applies across DayFlow without changing task ownership.</p>
        <button onClick={onClose} className="mt-5 min-h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--accent-contrast)]">Done</button>
      </div>
    </div>
  );
}

function Page({ title, icon, subtitle, children }) {
  return (
    <main className="pt-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-[var(--surface-muted)]">{icon}</div>
        <div><h2 className="text-2xl font-bold tracking-tight">{title}</h2><p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p></div>
      </div>
      {children}
    </main>
  );
}

function Empty({ title, text }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
      <div><Plus className="mx-auto mb-3 text-[var(--text-faint)]" size={22} /><h3 className="font-semibold">{title}</h3><p className="mt-1 max-w-xs text-xs leading-5 text-[var(--text-muted)]">{text}</p></div>
    </div>
  );
}

export default App;
