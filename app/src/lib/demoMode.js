// Explicit, opt-in preview mode. It must never be enabled in Production.
export const DEMO_MODE = import.meta.env.VITE_DAYFLOW_DEMO_MODE === "true";
export const DEMO_UID = "dayflow-demo-local";
export const isDemoUser = (uid) => DEMO_MODE && uid === DEMO_UID;
