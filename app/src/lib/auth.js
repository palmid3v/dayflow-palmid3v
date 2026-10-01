import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth } from "./firebase";

function requireAuth() {
  if (!auth) {
    throw new Error("Firebase Authentication is not configured.");
  }

  return auth;
}

export function subscribeAuth(callback) {
  const instance = requireAuth();
  return onAuthStateChanged(instance, callback);
}

export async function signIn(email, password) {
  const instance = requireAuth();
  await setPersistence(instance, browserLocalPersistence);
  return signInWithEmailAndPassword(instance, email.trim(), password);
}

export async function signUp(email, password) {
  const instance = requireAuth();
  await setPersistence(instance, browserLocalPersistence);
  return createUserWithEmailAndPassword(instance, email.trim(), password);
}

export function signOut() {
  return firebaseSignOut(requireAuth());
}

export function getAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-credential":
      return "The email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "The password does not meet Firebase's configured password policy.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return error?.message || "Authentication failed. Please try again.";
  }
}
