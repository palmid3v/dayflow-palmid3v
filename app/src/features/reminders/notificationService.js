const NOTIFIED_PREFIX = "DAYFLOW_REMINDER_NOTIFIED:";

function key(reminder, date = new Date().toLocaleDateString("en-CA")) {
  return `${NOTIFIED_PREFIX}${reminder.id}:${date}`;
}

export function getNotificationSupport() {
  if (typeof window === "undefined") return { supported: false, permission: "default" };
  const supported = "Notification" in window;
  return {
    supported,
    permission: supported ? Notification.permission : "unsupported"
  };
}

export async function requestReminderNotificationPermission() {
  const { supported, permission } = getNotificationSupport();
  if (!supported) return "unsupported";
  if (permission === "granted" || permission === "denied") return permission;

  return Notification.requestPermission();
}

export async function showReminderNotification(reminder) {
  const { supported, permission } = getNotificationSupport();
  if (!supported || permission !== "granted" || !reminder?.id) return false;

  const options = {
    body: `${reminder.time} · DayFlow reminder`,
    tag: `dayflow-reminder-${reminder.id}`,
    renotify: false
  };

  try {
    const registration = navigator.serviceWorker?.controller
      ? await navigator.serviceWorker.getRegistration()
      : null;

    if (registration?.showNotification) {
      await registration.showNotification(reminder.title, options);
    } else {
      new Notification(reminder.title, options);
    }

    localStorage.setItem(key(reminder), "1");
    return true;
  } catch (error) {
    console.warn("Unable to show reminder notification:", error);
    return false;
  }
}

export function wasReminderNotified(reminder, date = new Date().toLocaleDateString("en-CA")) {
  if (!reminder?.id) return false;
  return localStorage.getItem(key(reminder, date)) === "1";
}

export async function notifyDueReminders(reminders, date = new Date()) {
  const dateKey = date.toLocaleDateString("en-CA");
  const currentTime = date.toTimeString().slice(0, 5);
  const due = reminders.filter((item) =>
    item &&
    item.occurrenceDate === dateKey &&
    !item.occurrenceCompleted &&
    item.time &&
    item.time <= currentTime &&
    !wasReminderNotified(item, dateKey)
  );

  for (const reminder of due) {
    await showReminderNotification(reminder);
  }

  return due.length;
}

export function clearReminderNotificationState(reminder, date = new Date().toLocaleDateString("en-CA")) {
  if (!reminder?.id) return;
  localStorage.removeItem(key(reminder, date));
}
