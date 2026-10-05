const CACHE_PREFIX="DAYFLOW_REMINDERS:";
export const reminderStates=["open","completed","snoozed"];
export const reminderRepeats=["none","daily","weekly","monthly"];

function key(uid){return CACHE_PREFIX+uid;}
function normalize(item){
  if(!item||typeof item!=="object"||!String(item.title??"").trim())return null;
  return {id:String(item.id),title:String(item.title).trim(),date:String(item.date??""),time:String(item.time??"18:00"),repeat:item.repeat??"none",status:item.status??"open",completed:Boolean(item.completed),completedDates:Array.isArray(item.completedDates)?item.completedDates.map(String):[],snoozedUntil:item.snoozedUntil??"",createdAt:String(item.createdAt??new Date().toISOString()),updatedAt:String(item.updatedAt??new Date().toISOString())};
}
export function loadCachedReminders(uid){if(!uid)return[];try{const v=JSON.parse(localStorage.getItem(key(uid))??"[]");return Array.isArray(v)?v.map(normalize).filter(Boolean):[]}catch{return[]}}
export function createReminder(title,details={}){const now=new Date().toISOString();return {id:typeof crypto?.randomUUID==="function"?crypto.randomUUID():"reminder-"+Date.now(),title:title.trim(),date:details.date??new Date().toLocaleDateString("en-CA"),time:details.time??"18:00",repeat:details.repeat??"none",status:"open",completed:false,completedDates:[],snoozedUntil:"",createdAt:now,updatedAt:now};}
export function updateReminder(reminder,patch={}){return normalize({...reminder,...patch,updatedAt:new Date().toISOString()});}
export function isReminderCompletedForDate(item,date){return item.completedDates?.includes(date)||((item.repeat==="none"&&item.completed&&item.date===date));}
export function remindersForDate(reminders,date){
 const target=new Date(date+"T12:00:00");
 return reminders.filter(item=>{const start=new Date(item.date+"T12:00:00");if(item.date===date)return true;if(start>target)return false;if(item.repeat==="daily")return true;if(item.repeat==="weekly")return start.getDay()===target.getDay();if(item.repeat==="monthly")return start.getDate()===target.getDate();return false;})
 .map(item=>({...item,occurrenceDate:date,occurrenceCompleted:isReminderCompletedForDate(item,date),overdue:item.time && date===new Date().toLocaleDateString("en-CA") && item.time<new Date().toTimeString().slice(0,5) && !isReminderCompletedForDate(item,date)}));
}
export function sortReminders(items){return [...items].sort((a,b)=>String(a.time).localeCompare(String(b.time)));}
export function saveCachedReminders(uid,items){if(!uid)return;localStorage.setItem(key(uid),JSON.stringify(items));window.dispatchEvent(new CustomEvent("dayflow:reminders-change"));}