const CACHE_PREFIX="DAYFLOW_REMINDERS:";
export const reminderStates=["open","completed","snoozed"];
export const reminderRepeats=["none","daily","weekly","monthly"];

function key(uid){return CACHE_PREFIX+uid;}
function normalize(item){
  if(!item||typeof item!=="object"||!String(item.title??"").trim())return null;
  return {id:String(item.id),title:String(item.title).trim(),date:String(item.date??""),time:String(item.time??"18:00"),repeat:item.repeat??"none",status:item.status??(item.completed?"completed":"open"),completed:Boolean(item.completed),snoozedUntil:item.snoozedUntil??"",createdAt:String(item.createdAt??new Date().toISOString()),updatedAt:String(item.updatedAt??new Date().toISOString())};
}
export function loadCachedReminders(uid){if(!uid)return[];try{const v=JSON.parse(localStorage.getItem(key(uid))??"[]");return Array.isArray(v)?v.map(normalize).filter(Boolean):[]}catch{return[]}}
export function createReminder(title,details={}){const now=new Date().toISOString();return {id:typeof crypto?.randomUUID==="function"?crypto.randomUUID():"reminder-"+Date.now(),title:title.trim(),date:details.date??new Date().toLocaleDateString("en-CA"),time:details.time??"18:00",repeat:details.repeat??"none",status:"open",completed:false,snoozedUntil:"",createdAt:now,updatedAt:now};}
export function updateReminder(reminder,patch={}){const next={...reminder,...patch,updatedAt:new Date().toISOString()};if(next.completed)next.status="completed";else if(next.status==="completed")next.status="open";return normalize(next);}
export function remindersForDate(reminders,date){const target=new Date(date+"T12:00:00");return reminders.filter(item=>{if(item.date===date)return true;if(item.repeat==="daily")return new Date(item.date+"T12:00:00")<=target;if(item.repeat==="weekly"){const start=new Date(item.date+"T12:00:00");return start<=target&&start.getDay()===target.getDay();}if(item.repeat==="monthly"){const start=new Date(item.date+"T12:00:00");return start<=target&&start.getDate()===target.getDate();}return false;}).map(item=>({...item,occurrenceDate:date}));}
export function sortReminders(items){return [...items].sort((a,b)=>String(a.time).localeCompare(String(b.time)));}
export function saveCachedReminders(uid,items){if(!uid)return;localStorage.setItem(key(uid),JSON.stringify(items));window.dispatchEvent(new CustomEvent("dayflow:reminders-change"));}