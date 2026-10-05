import { GoogleAuthProvider, linkWithPopup, unlink } from "firebase/auth";
import { auth } from "../../lib/firebase";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const CALENDAR_ENDPOINT = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

function createProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope(CALENDAR_SCOPE);
  provider.setCustomParameters({ prompt: "consent" });
  return provider;
}

export async function connectGoogleCalendar() {
  if (!auth?.currentUser) throw new Error("You must be signed in to connect Google Calendar.");
  const result = await linkWithPopup(auth.currentUser, createProvider());
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) throw new Error("Google did not return a Calendar access token.");
  return { accessToken: credential.accessToken, email: result.user.email ?? "" };
}

export async function loadGoogleCalendarEvents(accessToken, { timeMin, timeMax } = {}) {
  if (!accessToken) throw new Error("Google Calendar is not connected.");
  const params = new URLSearchParams({ singleEvents: "true", orderBy: "startTime", maxResults: "50" });
  if (timeMin) params.set("timeMin", new Date(timeMin).toISOString());
  if (timeMax) params.set("timeMax", new Date(timeMax).toISOString());

  const response = await fetch(CALENDAR_ENDPOINT + "?" + params.toString(), {
    headers: { Authorization: "Bearer " + accessToken }
  });
  if (!response.ok) throw new Error("Google Calendar request failed (" + response.status + ").");
  const data = await response.json();

  return (data.items ?? []).map((event) => ({
    id: event.id,
    source: "google-calendar",
    title: event.summary || "Untitled event",
    time: event.start?.dateTime
      ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "All day",
    start: event.start?.dateTime ?? event.start?.date ?? null,
    end: event.end?.dateTime ?? event.end?.date ?? null,
    location: event.location ?? "",
    htmlLink: event.htmlLink ?? ""
  }));
}

export async function disconnectGoogleCalendar() {
  if (auth?.currentUser?.providerData.some((item) => item.providerId === "google.com")) {
    await unlink(auth.currentUser, "google.com");
  }
}
