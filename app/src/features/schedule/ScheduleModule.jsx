import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Copy, Download, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { auth } from "../../lib/firebase";
import { DEMO_MODE, DEMO_UID } from "../../lib/demoMode";
import { loadSchedules, removeSchedule, saveSchedule } from "./scheduleService";
import { findOverlappingSchedules } from "./scheduleModel.js";
import CalendarImportModule from "../calendar/CalendarImportModule";
import { downloadScheduleCalendar } from "./scheduleCalendarExport.js";
import { calendarEventsToDailyBlocks, loadImportedCalendarEvents } from "../calendar/calendarService";
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const emptyDraft=()=>({subject:"",weekday:new Date().getDay(),start:"09:00",end:"10:00"});
export default function ScheduleModule({ canUseCalendar = true }){
 const uid=auth?.currentUser?.uid ?? (DEMO_MODE ? DEMO_UID : null); const [items,setItems]=useState([]); const [draft,setDraft]=useState(emptyDraft); const [editing,setEditing]=useState(null); const [view,setView]=useState("week"); const [selectedDay,setSelectedDay]=useState(new Date().getDay()); const [error,setError]=useState(""); const [pendingConflict,setPendingConflict]=useState(null);
 useEffect(()=>{if(!uid)return undefined;loadSchedules(uid).then(setItems).catch(()=>setError("Unable to load your schedule."));return undefined;},[uid]);
 const grouped=useMemo(()=>DAYS.map((day,weekday)=>({day,weekday,items:items.filter(item=>item.weekday===weekday).sort((a,b)=>a.start.localeCompare(b.start))})),[items]);
 const visible=view==="week"?grouped:grouped.filter(group=>group.weekday===selectedDay);
 async function persist(item){try{const saved=await saveSchedule(uid,item);setItems(current=>current.some(x=>x.id===saved.id)?current.map(x=>x.id===saved.id?saved:x):[...current,saved]);window.dispatchEvent(new CustomEvent("dayflow:schedule-change"));setDraft(emptyDraft());setEditing(null);setPendingConflict(null);setError("");}catch(saveError){setError(saveError?.message||"Unable to save this schedule block.");}}
 function submit(event){event.preventDefault();if(!draft.subject.trim())return;const item={...draft,id:editing??(typeof crypto?.randomUUID==="function"?crypto.randomUUID():"schedule-"+Date.now()),subject:draft.subject.trim()};const conflicts=findOverlappingSchedules(items,item,editing);if(conflicts.length){setPendingConflict({item,conflicts});setError("");return;}void persist(item);}
 async function remove(id){try{await removeSchedule(uid,id);setItems(items.filter(x=>x.id!==id));window.dispatchEvent(new CustomEvent("dayflow:schedule-change"));}catch{setError("Unable to remove this schedule block.");}}
 function edit(item){setPendingConflict(null);setEditing(item.id);setDraft({subject:item.subject,weekday:item.weekday,start:item.start,end:item.end});}
 function duplicate(item){const copy={...item,id:typeof crypto?.randomUUID==="function"?crypto.randomUUID():"schedule-"+Date.now()};setDraft({subject:copy.subject,weekday:copy.weekday,start:copy.start,end:copy.end});setEditing(null);const conflicts=findOverlappingSchedules(items,copy);if(conflicts.length){setPendingConflict({item:copy,conflicts});setError("");return;}void persist(copy);}
 return <section><header className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="label">DAYFLOW · SCHEDULE</p><h2 className="mt-1 text-2xl font-bold">Schedule</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Build recurring time blocks that shape the Today view.</p></div><button type="button" onClick={() => { const done = downloadScheduleCalendar(items); if (!done) setError("Add a valid recurring block before exporting."); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold hover:border-[var(--accent)]"><Download size={15}/> Export .ics</button></header>
 {error&&<p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200" role="alert">{error}</p>}
 {canUseCalendar ? <CalendarImportModule/> : <section className="mt-4 mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-sm font-semibold">Calendar import is not enabled</p><p className="mt-1 text-xs text-[var(--text-muted)]">An administrator must enable the Calendar feature for this account before importing .ics data.</p></section>}
 {canUseCalendar && <ImportedCalendarView />}
 {pendingConflict&&<section className="mb-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4" role="alert" aria-labelledby="schedule-conflict-title"><p id="schedule-conflict-title" className="text-sm font-semibold text-amber-100">This block overlaps another recurring block.</p><p className="mt-1 text-xs text-[var(--text-muted)]">Review the conflicts before saving. You can still keep this schedule intentionally.</p><ul className="mt-3 grid gap-2">{pendingConflict.conflicts.map(item=><li key={item.id} className="text-xs"><span className="font-semibold">{item.subject}</span><span className="ml-2 text-[var(--text-muted)]">{item.start}–{item.end}</span></li>)}</ul><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>void persist(pendingConflict.item)} className="min-h-10 rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-contrast)]">Save anyway</button><button type="button" onClick={()=>setPendingConflict(null)} className="min-h-10 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold">Cancel</button></div></section>}
 <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1"><button onClick={()=>setView("week")} className={"rounded-lg py-2 text-xs font-semibold "+(view==="week"?"bg-[var(--surface-muted)]":"text-[var(--text-muted)]")}>Week</button><button onClick={()=>setView("day")} className={"rounded-lg py-2 text-xs font-semibold "+(view==="day"?"bg-[var(--surface-muted)]":"text-[var(--text-muted)]")}>Day</button></div>
 {view==="day"&&<div className="mb-4 flex gap-1 overflow-x-auto">{DAYS.map((day,i)=><button key={day} onClick={()=>setSelectedDay(i)} className={"shrink-0 rounded-xl px-3 py-2 text-xs "+(selectedDay===i?"bg-[var(--accent)] text-[var(--accent-contrast)]":"border border-[var(--border)] text-[var(--text-muted)]")}>{day.slice(0,3)}</button>)}</div>}
 <form onSubmit={submit} className="mb-5 grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[1fr_auto_auto_auto_auto]"><input value={draft.subject} onChange={e=>{setPendingConflict(null);setDraft({...draft,subject:e.target.value});}} placeholder="Schedule block" className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm outline-none"/><select value={draft.weekday} onChange={e=>{setPendingConflict(null);setDraft({...draft,weekday:Number(e.target.value)});}} className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 text-sm">{DAYS.map((day,i)=><option key={day} value={i}>{day}</option>)}</select><input type="time" value={draft.start} onChange={e=>{setPendingConflict(null);setDraft({...draft,start:e.target.value});}} className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-2 text-sm"/><input type="time" value={draft.end} onChange={e=>{setPendingConflict(null);setDraft({...draft,end:e.target.value});}} className="min-h-10 rounded-xl border border-[var(--border)] bg-transparent px-2 text-sm"/><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)]">{editing?<Pencil size={15}/>:<Plus size={15}/>} {editing?"Save":"Add"}</button></form>
 {editing&&<button onClick={()=>{setEditing(null);setDraft(emptyDraft());}} className="mb-4 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]"><X size={14}/> Cancel edit</button>}
 <div className="grid gap-3">{visible.map(group=><div key={group.day} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><div className="mb-2 flex items-center gap-2"><CalendarDays size={16}/><h3 className="text-sm font-semibold">{group.day}</h3></div>{group.items.length?group.items.map(item=><div key={item.id} className="flex items-center gap-2 border-t border-[var(--border)] py-2 text-sm"><time className="w-24 text-xs text-[var(--text-muted)]">{item.start}–{item.end}</time><span className="flex-1">{item.subject}</span><button onClick={()=>duplicate(item)} aria-label="Duplicate schedule"><Copy size={15}/></button><button onClick={()=>edit(item)} aria-label="Edit schedule"><Pencil size={15}/></button><button onClick={()=>remove(item.id)} aria-label="Delete schedule"><Trash2 size={15}/></button></div>):<p className="text-xs text-[var(--text-faint)]">No blocks.</p>}</div>)}</div>
</section>;
}

const CALENDAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EVENT_TYPES = { birthday: "Birthday", appointment: "Appointment", meeting: "Meeting", holiday: "Holiday", travel: "Travel", reminder: "Reminder", event: "Event" };
const EVENT_STYLES = {
 birthday: "border-violet-400/30 bg-violet-400/10 text-violet-200",
 appointment: "border-sky-400/30 bg-sky-400/10 text-sky-200",
 meeting: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
 holiday: "border-amber-400/30 bg-amber-400/10 text-amber-200",
 travel: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
 reminder: "border-pink-400/30 bg-pink-400/10 text-pink-200",
 event: "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
};
function calendarDateKey(date) {
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
}
function calendarDayStart(date) { return new Date(date.getFullYear(),date.getMonth(),date.getDate()); }
function sameCalendarDay(a,b) { return calendarDateKey(a)===calendarDateKey(b); }
function blocksForCalendarDay(events,date) {
 return calendarEventsToDailyBlocks(events,date).map((event)=>({...event,category:event.category||"event"}));
}
function ImportedCalendarView() {
 const uid=auth?.currentUser?.uid;
 const [events,setEvents]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [selected,setSelected]=useState(()=>calendarDayStart(new Date()));
 const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
 const refresh=useCallback(async()=>{
  if(!uid){setEvents([]);setLoading(false);return;}
  setLoading(true);
  try{setEvents(await loadImportedCalendarEvents(uid));setError("");}
  catch(loadError){setError(loadError?.message||"Unable to load imported events.");}
  finally{setLoading(false);}
 },[uid]);
 useEffect(()=>{void refresh();const listener=()=>void refresh();window.addEventListener("dayflow:calendar-change",listener);return()=>window.removeEventListener("dayflow:calendar-change",listener);},[refresh]);
 const dates=useMemo(()=>{
  const first=new Date(month.getFullYear(),month.getMonth(),1);
  const total=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const cells=Array(first.getDay()).fill(null);
  for(let d=1;d<=total;d+=1)cells.push(new Date(month.getFullYear(),month.getMonth(),d));
  while(cells.length%7)cells.push(null);
  return cells;
 },[month]);
 const byDate=useMemo(()=>{
  const map=new Map();
  dates.filter(Boolean).forEach((date)=>map.set(calendarDateKey(date),blocksForCalendarDay(events,date)));
  return map;
 },[events,dates]);
 const selectedEvents=useMemo(()=>blocksForCalendarDay(events,selected),[events,selected]);
 const monthLabel=month.toLocaleDateString(undefined,{month:"long",year:"numeric"});
 return <section className="mt-5 min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4" aria-labelledby="imported-calendar-title">
  <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
   <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)]"><CalendarDays size={18}/></span><div><p className="label">IMPORTED EVENTS</p><h3 id="imported-calendar-title" className="mt-1 text-base font-semibold">Calendar</h3><p className="mt-1 text-xs text-[var(--text-muted)]">Birthdays, appointments and other events by date.</p></div></div>
   <div className="flex shrink-0 items-center gap-1"><button type="button" onClick={()=>setMonth(m=>new Date(m.getFullYear(),m.getMonth()-1,1))} className="grid size-9 place-items-center rounded-xl border border-[var(--border)]" aria-label="Previous month"><ChevronLeft size={16}/></button><button type="button" onClick={()=>{const now=new Date();setMonth(new Date(now.getFullYear(),now.getMonth(),1));setSelected(calendarDayStart(now));}} className="min-h-9 rounded-xl border border-[var(--border)] px-3 text-xs font-semibold">Today</button><button type="button" onClick={()=>setMonth(m=>new Date(m.getFullYear(),m.getMonth()+1,1))} className="grid size-9 place-items-center rounded-xl border border-[var(--border)]" aria-label="Next month"><ChevronRight size={16}/></button></div>
  </header>
  {error&&<p role="alert" className="mb-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">{error}</p>}
  {loading?<p role="status" className="py-8 text-sm text-[var(--text-muted)]">Loading imported events…</p>:<>
   <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="text-lg font-bold capitalize">{monthLabel}</h4><span className="text-xs text-[var(--text-muted)]">{events.length} imported events</span></div>
   <div className="grid grid-cols-7 gap-1" aria-label={"Calendar for "+monthLabel}>
    {CALENDAR_WEEKDAYS.map(day=><div key={day} className="py-2 text-center text-[10px] font-semibold uppercase text-[var(--text-faint)] sm:text-xs">{day}</div>)}
    {dates.map((date,index)=>{
     if(!date)return <div key={"empty-"+index} className="min-h-14 rounded-lg sm:min-h-24" aria-hidden="true"/>;
     const items=byDate.get(calendarDateKey(date))||[];
     const active=sameCalendarDay(date,selected);
     const today=sameCalendarDay(date,new Date());
     return <button key={calendarDateKey(date)} type="button" aria-pressed={active} aria-label={date.toLocaleDateString(undefined,{dateStyle:"full"})+", "+items.length+" events"} onClick={()=>setSelected(calendarDayStart(date))} className={"min-w-0 min-h-14 rounded-lg border p-1 text-left sm:min-h-24 sm:p-2 "+(active?"border-[var(--accent)] bg-[var(--accent)]/10":"border-[var(--border)] bg-[var(--bg-soft)]")}>
      <span className={"grid size-6 place-items-center rounded-full text-[11px] "+(today?"bg-[var(--accent)] text-[var(--accent-contrast)]":"text-[var(--text-muted)]")}>{date.getDate()}</span>
      <span className="mt-1 flex gap-1 sm:hidden">{items.slice(0,3).map(event=><span key={event.id} className={"size-1.5 rounded-full "+(event.category==="birthday"?"bg-violet-300":event.category==="appointment"?"bg-sky-300":"bg-[var(--text-muted)]")}/>)}</span>
      <span className="mt-1 hidden min-w-0 flex-col gap-1 sm:flex">{items.slice(0,2).map(event=><span key={event.id} className={"block truncate rounded border px-1 py-0.5 text-[10px] "+(EVENT_STYLES[event.category]||EVENT_STYLES.event)}>{event.title}</span>)}{items.length>2&&<span className="text-[10px] text-[var(--text-muted)]">+{items.length-2} more</span>}</span>
     </button>;
    })}
   </div>
   <div className="mt-4 grid gap-3 lg:grid-cols-2">
    <section className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-3 sm:p-4"><p className="label">SELECTED DAY</p><h4 className="mt-1 text-sm font-semibold">{selected.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</h4>
     {selectedEvents.length?<ul className="mt-3 grid gap-2">{selectedEvents.map(event=><li key={event.id} className={"min-w-0 rounded-xl border p-3 "+(EVENT_STYLES[event.category]||EVENT_STYLES.event)}><div className="flex flex-wrap items-start justify-between gap-2"><p className="break-words text-sm font-semibold">{event.title}</p><span className="shrink-0 rounded-full border border-current/20 px-2 py-1 text-[10px]">{EVENT_TYPES[event.category]||"Event"}</span></div><p className="mt-1 text-xs opacity-80">{event.time==="All day"?"All day":event.time}</p>{event.location&&<p className="mt-2 flex gap-1 text-xs opacity-80"><MapPin size={13}/><span className="break-words">{event.location}</span></p>}{event.description&&<p className="mt-2 whitespace-pre-wrap break-words text-xs opacity-80">{event.description}</p>}</li>)}</ul>:<p className="mt-3 text-xs text-[var(--text-muted)]">No imported events on this date.</p>}
    </section>
    <section className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-3 sm:p-4"><p className="label">EVENT TYPES</p><div className="mt-3 flex flex-wrap gap-2">{Object.entries(EVENT_TYPES).map(([type,label])=><span key={type} className={"rounded-full border px-2.5 py-1 text-[10px] font-semibold "+EVENT_STYLES[type]}>{label}</span>)}</div><p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">DayFlow infers a type from event titles and descriptions. Unclassified events remain visible as general events.</p></section>
   </div>
  </>}
 </section>;
}
