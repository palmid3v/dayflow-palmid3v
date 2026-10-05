import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Home,
  Moon,
  Plus,
  Settings,
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
import { createDailyMemory, createDailyResult } from "./domain/models";
import TaskModule from "./features/tasks/TaskModule";
import ScheduleModule from "./features/schedule/ScheduleModule";
import { loadCachedTasks, loadTasks } from "./features/tasks/taskService";
import { createReminder, isReminderCompletedForDate, loadCachedReminders, remindersForDate, saveCachedReminders, sortReminders, updateReminder } from "./features/reminders/reminderService";
import MemoryModule from "./features/memory/MemoryModule";
import DashboardModule from "./features/dashboard/DashboardModule";
import { loadSchedules, scheduleToDailyBlocks } from "./features/schedule/scheduleService";
import { getNotificationSupport, notifyDueReminders, requestReminderNotificationPermission, showReminderNotification } from "./features/reminders/notificationService";
import { calendarEventsToDailyBlocks, loadImportedCalendarEvents } from "./features/calendar/calendarService";
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
  [BarChart3, "dashboard", "Dashboard"],
  [CalendarDays, "calendar", "Schedule"],
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

function App({ access, admin = false }) {
  const today = dateKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const [quickBlockTitle, setQuickBlockTitle] = useState("");
  const [tab, setTab] = useState("today");
  const [plan, setPlan] = useState(() => getInitialPlan(today));
  const [note, setNote] = useState(() => getDayFlowState().notes?.[today] ?? "");
  const [reminders, setReminders] = useState(() => loadCachedReminders(auth?.currentUser?.uid).length ? loadCachedReminders(auth?.currentUser?.uid) : (getDayFlowState().reminders ?? []));
  const [tasks, setTasks] = useState(() => loadCachedTasks(auth?.currentUser?.uid));
  const theme = "dark";
  const canUse = (feature) => admin || access?.features?.[feature] === true;
  const [scheduleBlocks, setScheduleBlocks] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(Boolean(getDailyResult(today)));
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState("");
  const [notificationPermission, setNotificationPermission] = useState(() => getNotificationSupport().permission);

  const visibleBlocks = [...scheduleBlocks, ...plan.blocks.filter((block) => block.source !== "schedule")].sort((a, b) => a.time.localeCompare(b.time));
  const completed = plan.blocks.filter((block) => block.state === "completed").length;
  const progressTotal = plan.blocks.length;
  const skipped = plan.blocks.filter((block) => block.state === "skipped").length;
  const changed = plan.blocks.filter((block) => block.state === "changed").length;
  const progress = progressTotal ? Math.round((completed / progressTotal) * 100) : 0;
  const todayReminders = remindersForDate(reminders, selectedDate);
  const openReminders = todayReminders.filter((reminder) => !reminder.occurrenceCompleted);

  useEffect(() => {
    applyTheme();
  }, [theme]);

  useEffect(() => {
    setPlan(getDailyPlan(selectedDate));
    setNote(getDayFlowState().notes?.[selectedDate] ?? "");
    setReviewSaved(Boolean(getDailyResult(selectedDate)));
    return undefined;
  }, [selectedDate, today]);

  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      setCloudReady(true);
      return undefined;
    }

    let cancelled = false;

    synchronizeDayFlow(uid, getDayFlowState(), {
      memory: canUse("memory"),
      reminders: canUse("reminders")
    })
      .then((state) => {
        if (cancelled) return;
        saveDayFlowState(state);
        setPlan(state.dailyPlans?.[today] ?? { date: today, blocks: [] });
        setNote(state.notes?.[today] ?? "");
        setReminders(sortReminders(state.reminders ?? []));
        saveCachedReminders(uid, state.reminders ?? []);
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
    if (!canUse("reminders")) return undefined;

    const checkDueReminders = () => {
      void notifyDueReminders(remindersForDate(reminders, dateKey()), new Date());
    };

    checkDueReminders();
    const interval = window.setInterval(checkDueReminders, 15000);
    return () => window.clearInterval(interval);
  }, [reminders, admin, access]);

  async function enableReminderNotifications() {
    const permission = await requestReminderNotificationPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      void notifyDueReminders(remindersForDate(reminders, dateKey()), new Date());
    }
  }

  async function testReminderNotification() {
    const permission = getNotificationSupport().permission;
    if (permission !== "granted") {
      await enableReminderNotifications();
      return;
    }

    await showReminderNotification({
      id: "dayflow-test",
      title: "DayFlow notifications are working",
      time: new Date().toTimeString().slice(0, 5)
    });
  }

  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid || (!canUse("schedule") && !canUse("calendar"))) return undefined;
    let active = true;

    async function loadCalendarBlocks() {
      try {
        const [schedules, importedEvents] = await Promise.all([
          canUse("schedule") ? loadSchedules(uid) : Promise.resolve([]),
          canUse("calendar") ? loadImportedCalendarEvents(uid) : Promise.resolve([])
        ]);
        if (!active) return;
        const currentDate = new Date(`${selectedDate}T12:00:00`);
        setScheduleBlocks([
          ...scheduleToDailyBlocks(schedules, currentDate),
          ...calendarEventsToDailyBlocks(importedEvents, currentDate)
        ]);
      } catch (error) {
        console.error("Unable to load DayFlow calendar:", error);
      }
    }

    loadCalendarBlocks();

    const refresh = () => loadCalendarBlocks();
    window.addEventListener("dayflow:calendar-change", refresh);
    window.addEventListener("dayflow:schedule-change", refresh);

    return () => {
      active = false;
      window.removeEventListener("dayflow:calendar-change", refresh);
      window.removeEventListener("dayflow:schedule-change", refresh);
    };
  }, [selectedDate]);

  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid || !canUse("tasks")) return undefined;
    let active = true;
    loadTasks(uid)
      .then((next) => active && setTasks(next))
      .catch((error) => console.error("Unable to load DayFlow tasks:", error));
    const refresh = () => setTasks(loadCachedTasks(uid));
    window.addEventListener("dayflow:tasks-change", refresh);
    return () => {
      active = false;
      window.removeEventListener("dayflow:tasks-change", refresh);
    };
  }, []);

  function updatePlan(nextBlocks) {
    const nextPlan = { ...plan, blocks: nextBlocks, updatedAt: new Date().toISOString() };
    setPlan(nextPlan);
    saveDailyPlan(selectedDate, nextPlan);
    void saveDailyPlanCloud(auth?.currentUser?.uid, selectedDate, nextPlan).catch((error) => {
      console.error("Unable to save DayFlow plan to Firebase:", error);
    });
    setReviewSaved(false);
  }

  function updateBlock(id, state) {
    updatePlan(plan.blocks.map((block) => block.id === id ? { ...block, state } : block));
  }

  function deleteBlock(id) {
    updatePlan(plan.blocks.filter((block) => block.id !== id));
  }

  function saveNote(value) {
    setNote(value);
    const state = getDayFlowState();
    saveDayFlowState({ notes: { ...state.notes, [selectedDate]: value } });
  }

  function toggleReminder(id) {
    const occurrenceDate = selectedDate;
    const next = reminders.map((item) => {
      if (item.id !== id) return item;
      const completed = isReminderCompletedForDate(item, occurrenceDate);
      const completedDates = completed
        ? (item.completedDates ?? []).filter((date) => date !== occurrenceDate)
        : [...new Set([...(item.completedDates ?? []), occurrenceDate])];
      return updateReminder(item, { completedDates, completed: item.repeat === "none" ? !completed : false, status: completed ? "open" : "completed" });
    });
    setReminders(sortReminders(next));
    saveDayFlowState({ reminders: sortReminders(next) });
    saveCachedReminders(auth?.currentUser?.uid, sortReminders(next));
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
      ...createReminder(title, { time: String(form.get("time") || "18:00"), date: selectedDate, repeat: String(form.get("repeat") || "none") })
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
    const result = createDailyResult(plan, selectedDate);
    const memory = createDailyMemory(plan, result, note);
    saveDailyResult(selectedDate, result);
    saveMemory(selectedDate, memory);
    void saveDailyResultCloud(auth?.currentUser?.uid, selectedDate, result).catch((error) => {
      console.error("Unable to save DayFlow daily result to Firebase:", error);
    });
    void saveMemoryCloud(auth?.currentUser?.uid, selectedDate, memory).catch((error) => {
      console.error("Unable to save DayFlow memory to Firebase:", error);
    });
    setReviewSaved(true);
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
      <div className="app-shell min-h-screen text-[var(--text)]">
        {cloudError && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200" role="status">
            {cloudError}
          </div>
        )}

        <header className="relative mb-6 flex items-start justify-between gap-4 pt-10 sm:pt-2">
          <div className="absolute left-0 top-0 flex items-center gap-1 sm:relative sm:left-auto sm:top-auto">
            <button onClick={() => setSelectedDate(dateKey(new Date(new Date(selectedDate + "T12:00:00").getTime() - 86400000)))} className="grid size-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)]" aria-label="Previous day"><ChevronLeft size={16}/></button>
            <button onClick={() => setSelectedDate(today)} className="min-h-9 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold">Today</button>
            <button onClick={() => setSelectedDate(dateKey(new Date(new Date(selectedDate + "T12:00:00").getTime() + 86400000)))} className="grid size-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)]" aria-label="Next day"><ChevronRight size={16}/></button>
          </div>
          <div>
            <p className="label">{formatDate(selectedDate).toUpperCase()}</p>
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
                    {completed} of {progressTotal} planned blocks completed
                  </p>
                </div>
                <ProgressRing value={progress} />
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </section>

            <section className="mb-7">
              <SectionHeader title={selectedDate === today ? "Today" : formatDate(selectedDate)} action="View calendar" onClick={() => setTab("calendar")} />
              <div className="relative ml-9 border-l border-[var(--border)]">
                {visibleBlocks.map((block) => (
                  <BlockRow key={block.id} block={block} onToggle={updateBlock} onDelete={deleteBlock} />
                ))}
                {!visibleBlocks.length && <Empty title="Nothing planned" text="Add a block below or bring context from Schedule/Calendar." />}
              </div>
            </section>

            <section className="mb-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <form onSubmit={(event) => {
                event.preventDefault();
                const title = quickBlockTitle.trim();
                if (!title) return;
                updatePlan([...plan.blocks, { id: `block-${Date.now()}`, source: "plan", time: "18:00", emoji: "○", title, meta: "Added to Today", state: "planned" }]);
                setQuickBlockTitle("");
              }} className="flex gap-2">
                <input value={quickBlockTitle} onChange={(event)=>setQuickBlockTitle(event.target.value)} placeholder="Add a block to Today…" className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm outline-none" aria-label="Add a block to today"/>
                <button className="grid size-10 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]" aria-label="Add block"><Plus size={17}/></button>
              </form>
            </section>

            {canUse("reminders") && <section id="dayflow-reminders" className="mb-7">
              <SectionHeader title="Reminders" action={`${openReminders.length} open`} onClick={() => document.getElementById("dayflow-reminders")?.scrollIntoView({ behavior: "smooth", block: "start" })} />
              <ReminderPanel
                reminders={todayReminders}
                onToggle={toggleReminder}
                onDelete={deleteReminder}
                onAdd={addReminder}
                notificationPermission={notificationPermission}
                onEnableNotifications={enableReminderNotifications}
                onTestNotification={testReminderNotification}
              />
            </section>}

            <section className="mb-7">
              <SectionHeader title="To-Do" action="Open tasks" onClick={() => setTab("tasks")} />
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                {tasks.length === 0 ? (
                  <div className="flex items-center gap-3 px-2 py-3">
                    <Target size={19} className="text-[var(--text-muted)]" />
                    <div>
                      <b className="text-sm">No tasks yet</b><p className="text-xs text-[var(--text-muted)]">Tasks now live directly inside DayFlow and sync to the shared Firestore account.</p>
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

            {canUse("memory") && <MemoryCard note={note} saved={reviewSaved} summary={{completed, skipped, changed, progressTotal}} onChange={saveNote} onSave={saveReview} />}
          </>
        )}

        {tab === "dashboard" && <DashboardModule />}
        {tab === "calendar" && canUse("schedule") && <ScheduleModule canUseCalendar={canUse("calendar")} />}
        {tab === "tasks" && canUse("tasks") && <TaskModule onTasksChange={setTasks} />}
        {tab === "memory" && canUse("memory") && <MemoryModule />}

        {showSettings && (
          <SettingsDialog onClose={() => setShowSettings(false)} />
        )}
      </div>

      <nav className="mobile-nav fixed bottom-2 left-1/2 z-40 grid w-[calc(100%-16px)] max-w-[720px] -translate-x-1/2 grid-cols-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2 shadow-2xl backdrop-blur-xl" aria-label="Primary navigation">
        {navItems.filter(([, key]) => admin || key === "today" || key === "dashboard" || (key === "calendar" && canUse("schedule")) || (key === "tasks" && canUse("tasks")) || (key === "memory" && canUse("memory"))).map(([Icon, key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`mobile-nav-button grid min-h-12 justify-items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition ${tab === key ? "bg-[var(--surface-muted)] text-[var(--text)]" : "text-[var(--text-muted)]"}`}
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

function applyTheme() {
  const resolved = "dark";
  document.documentElement.dataset.theme = resolved;
}

function Empty({ title, text }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-5 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{text}</p>
    </div>
  );
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
  const external = block.source === "schedule" || block.source === "imported-calendar";
  return (
    <div className="group relative flex w-full gap-3 pb-3 pl-5 text-left">
      <time className="absolute -left-10 top-3 text-[10px] text-[var(--text-faint)]">{block.time}</time>
      <button
        onClick={() => external ? undefined : onToggle(block.id, nextState)}
        className={`flex min-h-[62px] flex-1 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition ${external ? "cursor-default" : "hover:border-[var(--text-muted)]"}`}
        aria-label={external ? `${block.title}, imported calendar event` : `${block.title}, currently ${block.state}. Change to ${nextState}`}
        type="button"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)] text-lg">{block.emoji}</span>
        <span className="min-w-0 flex-1">
          <b className={`block text-sm ${block.state === "completed" ? "text-[var(--text-muted)] line-through" : ""}`}>{block.title}</b>
          <small className="mt-1 block text-[11px] text-[var(--text-muted)]">{block.meta}{external ? " · read-only" : ` · ${block.state}`}</small>
        </span>
        {external ? <CalendarDays size={19} className="text-[var(--text-muted)]" /> : block.state === "completed" ? <CheckCircle2 size={19} /> : <Circle size={19} className="text-[var(--text-muted)]" />}
      </button>
      {!external && (
        <div className="flex shrink-0 items-center gap-1 self-center">
          <button onClick={() => onToggle(block.id, "skipped")} className="grid size-8 place-items-center rounded-lg text-[var(--text-faint)] hover:bg-[var(--surface-muted)] text-[10px]" aria-label={`Skip ${block.title}`}>SKIP</button>
          <button onClick={() => onToggle(block.id, "changed")} className="grid size-8 place-items-center rounded-lg text-[var(--text-faint)] hover:bg-[var(--surface-muted)] text-[10px]" aria-label={`Mark ${block.title} as changed`}>↻</button>
          <button onClick={() => onDelete(block.id)} className="grid size-9 shrink-0 place-items-center self-center rounded-xl text-[var(--text-faint)] hover:bg-[var(--surface-muted)]" aria-label={`Delete ${block.title}`} type="button">
          <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function ReminderPanel({ reminders, onToggle, onDelete, onAdd, notificationPermission, onEnableNotifications, onTestNotification }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="mb-3 grid gap-2">
        {reminders.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
            <button onClick={() => onToggle(item.id)} aria-label={`${item.occurrenceCompleted ? "Reopen" : "Complete"} reminder: ${item.title}`}>
              {item.occurrenceCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-[var(--text-muted)]" />}
            </button>
            <span className={`flex-1 text-sm ${item.occurrenceCompleted ? "text-[var(--text-muted)] line-through" : ""}`}>{item.title}</span>
            <time className={`text-xs ${item.overdue ? "text-amber-300" : "text-[var(--text-muted)]"}`}>{item.overdue ? "Overdue · " : ""}{item.time}</time>
            <button onClick={() => onDelete(item.id)} className="text-[var(--text-faint)]" aria-label={`Delete reminder: ${item.title}`}><Trash2 size={15} /></button>
          </div>
        ))}
        {!reminders.length && <p className="px-2 py-2 text-xs text-[var(--text-muted)]">Nothing waiting. Add a reminder below.</p>}
      </div>
      <form onSubmit={onAdd} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input name="title" required placeholder="Remember to…" aria-label="Reminder title" className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm outline-none" />
        <input name="time" type="time" defaultValue="18:00" aria-label="Reminder time" className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-2 text-sm" />
        <select name="repeat" aria-label="Reminder repeat" className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 text-xs"><option value="none">Once</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select><button className="grid min-h-10 place-items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)]" aria-label="Add reminder"><Plus size={17} /></button>
      </form>
      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold">Notifications</p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            {notificationPermission === "granted" ? "Enabled for this browser." : notificationPermission === "denied" ? "Blocked by the browser. Change site permissions to enable them." : notificationPermission === "unsupported" ? "This browser does not support web notifications." : "Enable notifications to get a browser alert when a reminder is due while DayFlow is open."}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {notificationPermission !== "granted" && notificationPermission !== "unsupported" && (
            <button type="button" onClick={onEnableNotifications} className="min-h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold">Enable</button>
          )}
          {notificationPermission === "granted" && (
            <button type="button" onClick={onTestNotification} className="min-h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold">Test</button>
          )}
        </div>
      </div>
    </div>
  );
}

function MemoryCard({ note, saved, onChange, onSave, summary }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)]"><BookOpen size={19} /></div>
        <div className="flex-1">
          <p className="label">DAILY MEMORY</p>
          <h2 className="mt-1 text-sm font-semibold">Review the day before you close it.</h2><p className="mt-1 text-xs text-[var(--text-muted)]">{summary.completed} completed · {summary.changed} changed · {summary.skipped} skipped · {summary.progressTotal} planned</p>
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

function SettingsDialog({ onClose }) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-end bg-black/50 p-3 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="label">DAYFLOW</p><h2 id="settings-title" className="mt-1 text-xl font-bold">Settings</h2></div>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-xl bg-[var(--surface-muted)]" aria-label="Close settings">×</button>
        </div>
        <p className="mb-3 text-sm font-semibold">Appearance</p>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <div className="flex items-center gap-3"><Moon size={19} /><div><p className="text-sm font-semibold">Dark theme</p><p className="text-xs text-[var(--text-muted)]">DayFlow uses one consistent dark theme.</p></div></div>
        </div>
        <button onClick={onClose} className="mt-5 min-h-11 w-full rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--accent-contrast)]">Done</button>
      </div>
    </div>
  );
}

export default App;
