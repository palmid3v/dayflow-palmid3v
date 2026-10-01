import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirebaseConfig, isFirebaseConfigured } from "./backendConfig";

const firebaseApp = isFirebaseConfigured()
  ? initializeApp(getFirebaseConfig())
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export { firebaseApp };
