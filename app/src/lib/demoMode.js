// Explicit, opt-in preview mode. It must never be enabled in Production.
export const DEMO_MODE = import.meta.env.VITE_DAYFLOW_DEMO_MODE === "true" &&
  (import.meta.env.DEV || import.meta.env.VITE_VERCEL_ENV === "preview");
export const DEMO_UID = "dayflow-demo-local";
export const isDemoUser = (uid) => DEMO_MODE && uid === DEMO_UID;
