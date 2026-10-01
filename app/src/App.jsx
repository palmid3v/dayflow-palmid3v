import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  ChevronRight,
  Clock3,
  Home,
  Plus,
  Bell,
  Target
} from "lucide-react";
import { getDayFlowState, saveDayFlowState } from "./lib/dayflowStore";
import { getTodoTasksFromStorage } from "./lib/todoAdapter";

const todayKey = new Date().toISOString().slice(0, 10);

const initialBlocks = [
  { id: "b1", time: "08:00", emoji: "🏋️", title: "Morning training", meta: "45 min · Planned", state: "completed" },
  { id: "b2", time: "10:00", emoji: "💻", title: "Deep work", meta: "Project time · 2h", state: "completed" },
  { id: "b3", time: "13:00", emoji: "🍽️", title: "Lunch", meta: "Break · 1h", state: "planned" },
  { id: "b4", time: "16:00", emoji: "🚀", title: "DayFlow build", meta: "Product work · 90 min", state: "planned" },
  { id: "b5", time: "20:00", emoji: "📝", title: "Daily review", meta: "Memory · 15 min", state: "planned" }
];

const navItems = [
  [Home, "today", "Today"],
  [CalendarDays, "calendar", "Calendar"],
  [CheckCircle2, "tasks", "Tasks"],
  [BookOpen, "memory", "Memory"]
];

function App() {
  const [tab, setTab] = useState("today");
  const [blocks, setBlocks] = useState(initialBlocks);
  const [note, setNote] = useState(getDayFlowState().notes?.[todayKey] ?? "");
  const todoTasks = useMemo(() => getTodoTasksFromStorage(), []);

  const completedBlocks = blocks.filter((block) => block.state === "completed").length;
  const progress = Math.round((completedBlocks / blocks.length) * 100);

  function toggleBlock(id) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id
          ? { ...block, state: block.state === "completed" ? "planned" : "completed" }
          : block
      )
    );
  }

  function saveNote(value) {
    setNote(value);
    saveDayFlowState({ notes: { ...getDayFlowState().notes, [todayKey]: value } });
  }

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100">
      <div className="mx-auto min-h-screen max-w-xl px-4 pb-28 pt-7 sm:px-6">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <p className="label">WEDNESDAY · SEP 30</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Good evening, Palmi 👋</h1>
            <p className="mt-1 text-sm text-zinc-500">Your day, in one flow.</p>
          </div>
          <div className="grid size-10 place-items-center rounded-full border border-zinc-800 bg-zinc-900 font-bold">P</div>
        </header>

        {tab === "today" && (
          <>
            <section className="mb-7 flex items-center justify-between rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-[#111217] p-5">
              <div>
                <p className="label">TODAY'S FLOW</p>
                <strong className="mt-1 block text-5xl tracking-tighter">{progress}%</strong>
                <p className="mt-1 text-sm text-zinc-500">{completedBlocks} of {blocks.length} planned blocks completed</p>
              </div>
              <ProgressRing value={progress} />
            </section>

            <section className="mb-7">
              <SectionHeader title="Today" action="View calendar" onClick={() => setTab("calendar")} />
              <div className="relative ml-9 border-l border-zinc-800">
                {blocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => toggleBlock(block.id)}
                    className="group relative flex w-full gap-3 pb-3 pl-5 text-left"
                    aria-label={`${block.title}, ${block.state}`}
                  >
                    <time className="absolute -left-10 top-3 text-[10px] text-zinc-600">{block.time}</time>
                    <div className="flex min-h-[62px] flex-1 items-center gap-3 rounded-2xl border border-zinc-800 bg-[#121419] p-3 transition group-hover:border-zinc-700">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-800/80 text-lg">{block.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <b className={`block text-sm ${block.state === "completed" ? "text-zinc-500 line-through" : ""}`}>{block.title}</b>
                        <small className="mt-1 block text-[11px] text-zinc-600">{block.meta}</small>
                      </span>
                      {block.state === "completed" ? <CheckCircle2 size={19} className="text-zinc-400" /> : <Circle size={19} className="text-zinc-700" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-7">
              <SectionHeader title="To-Do" action="Open tasks" onClick={() => setTab("tasks")} />
              <div className="rounded-2xl border border-zinc-800 bg-[#121419] p-3">
                {todoTasks.length === 0 ? (
                  <div className="flex items-center gap-3 px-2 py-3">
                    <Target size={19} className="text-zinc-500" />
                    <div>
                      <b className="text-sm">No connected tasks yet</b>
                      <p className="text-xs text-zinc-600">DayFlow will consume tasks from PALMI-D3V To-Do.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {todoTasks.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-sm">
                        {task.completed ? <CheckCircle2 size={17} /> : <Circle size={17} className="text-zinc-600" />}
                        <span className={task.completed ? "text-zinc-600 line-through" : ""}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <MemoryCard note={note} onChange={saveNote} />
          </>
        )}

        {tab === "calendar" && <CalendarView blocks={blocks} onToggle={toggleBlock} />}
        {tab === "tasks" && <TasksView tasks={todoTasks} />}
        {tab === "memory" && <MemoryView blocks={blocks} note={note} onChange={saveNote} />}
      </div>

      <nav className="fixed bottom-3 left-1/2 z-10 grid w-[calc(100%-24px)] max-w-[520px] -translate-x-1/2 grid-cols-4 rounded-2xl border border-zinc-800 bg-[#14161be8] p-2 shadow-2xl backdrop-blur-xl">
        {navItems.map(([Icon, key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`grid justify-items-center gap-1 rounded-xl px-2 py-2 text-[10px] ${tab === key ? "bg-zinc-800 text-zinc-100" : "text-zinc-600"}`}>
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ProgressRing({ value }) {
  return (
    <div className="grid size-20 place-items-center rounded-full" style={{ background: `conic-gradient(#f4f4f5 0 ${value}%, #343740 ${value}% 100%)` }}>
      <div className="grid size-[62px] place-items-center rounded-full bg-[#15171c] text-sm font-bold">{value}</div>
    </div>
  );
}

function SectionHeader({ title, action, onClick }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      <button onClick={onClick} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300">
        {action}<ChevronRight size={15} />
      </button>
    </div>
  );
}

function MemoryCard({ note, onChange }) {
  return (
    <section className="rounded-2xl border border-zinc-700 bg-gradient-to-br from-zinc-900 to-[#121419] p-4">
      <div className="flex gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-800"><BookOpen size={19} /></div>
        <div className="flex-1">
          <p className="label">DAILY MEMORY</p>
          <h2 className="mt-1 text-sm font-semibold">Turn today's activity into a written memory.</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">DayFlow captures the difference between the plan and the day you actually lived.</p>
          <textarea value={note} onChange={(event) => onChange(event.target.value)} placeholder="Add a note about today…" className="mt-3 min-h-20 w-full resize-none rounded-xl border border-zinc-800 bg-black/20 p-3 text-xs outline-none placeholder:text-zinc-700 focus:border-zinc-600" />
        </div>
      </div>
    </section>
  );
}

function CalendarView({ blocks, onToggle }) {
  return <Page title="Calendar" icon={<CalendarDays />} subtitle="Scheduled blocks are owned by DayFlow.">
    <div className="grid gap-2">{blocks.map((block) => <BlockRow key={block.id} block={block} onToggle={onToggle} />)}</div>
  </Page>;
}

function BlockRow({ block, onToggle }) {
  return <button onClick={() => onToggle(block.id)} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#121419] p-3 text-left">
    <Clock3 size={17} className="text-zinc-600" />
    <time className="w-11 text-xs text-zinc-500">{block.time}</time>
    <span className="flex-1"><b className="block text-sm">{block.emoji} {block.title}</b><small className="text-xs text-zinc-600">{block.meta}</small></span>
    {block.state === "completed" ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-zinc-700" />}
  </button>;
}

function TasksView({ tasks }) {
  return <Page title="Tasks" icon={<CheckCircle2 />} subtitle="Tasks remain authoritative in PALMI-D3V To-Do.">
    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-zinc-800 bg-[#121419] p-4 text-xs text-zinc-500"><Target size={17} /> Read-only integration surface — no duplicate task database.</div>
    {tasks.length ? tasks.map((task) => <div key={task.id} className="mb-2 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#121419] p-4">{task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-zinc-700" />}<span className={task.completed ? "text-zinc-600 line-through" : ""}>{task.title}</span></div>) : <Empty title="No connected tasks" text="Open To-Do to create tasks, then connect its task provider to DayFlow." /> }
  </Page>;
}

function MemoryView({ blocks, note, onChange }) {
  const completed = blocks.filter((block) => block.state === "completed");
  const skipped = blocks.filter((block) => block.state === "skipped");
  return <Page title="Memory" icon={<BookOpen />} subtitle="A record of what the day became.">
    <div className="rounded-2xl border border-zinc-800 bg-[#121419] p-4">
      <p className="label">TODAY · SEP 30</p>
      <h2 className="mt-2 text-lg font-semibold">The day in progress</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{completed.length} planned blocks completed. {skipped.length} skipped. Remaining activity is still open.</p>
      <textarea value={note} onChange={(event) => onChange(event.target.value)} placeholder="Write what mattered today…" className="mt-4 min-h-36 w-full resize-none rounded-xl border border-zinc-800 bg-black/20 p-3 text-sm outline-none placeholder:text-zinc-700 focus:border-zinc-600" />
    </div>
  </Page>;
}

function Page({ title, icon, subtitle, children }) {
  return <main className="pt-4"><div className="mb-6 flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-zinc-900">{icon}</div><div><h2 className="text-2xl font-bold tracking-tight">{title}</h2><p className="mt-1 text-xs text-zinc-600">{subtitle}</p></div></div>{children}</main>;
}

function Empty({ title, text }) {
  return <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-zinc-800 p-8 text-center"><div><Plus className="mx-auto mb-3 text-zinc-700" size={22} /><h3 className="font-semibold">{title}</h3><p className="mt-1 max-w-xs text-xs leading-5 text-zinc-600">{text}</p></div></div>;
}

export default App;