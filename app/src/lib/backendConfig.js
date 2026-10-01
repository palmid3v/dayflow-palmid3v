const firebaseKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID"
];

export function getFirebaseConfig() {
  return Object.fromEntries(
    firebaseKeys.map((key) => [key, import.meta.env[key] ?? ""])
  );
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Object.values(config).every(Boolean);
}

export const BACKEND_MODEL = {
  auth: "firebase-auth",
  database: "firestore",
  deployment: "vercel",
  currentPersistence: "local-first",
  targetPersistence: "firestore-user-scoped"
};
