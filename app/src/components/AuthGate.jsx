import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "../lib/backendConfig";
import { getAuthErrorMessage, signOut, subscribeAuth } from "../lib/auth";
import { APP_IDS, ensureAppAccess, hasAppAccess } from "../lib/access";
import AuthScreen from "./AuthScreen";
import VerificationScreen from "./VerificationScreen";
import AccessDenied from "./AccessDenied";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) { setLoading(false); return undefined; }
    let unsubscribe;
    try {
      unsubscribe = subscribeAuth((nextUser) => {
        setUser(nextUser); setAccess(null); setError("");
        if (!nextUser || !nextUser.emailVerified) { setLoading(false); return; }
        setLoading(true);
        ensureAppAccess(nextUser).then(setAccess).catch((e) => setError(getAuthErrorMessage(e))).finally(() => setLoading(false));
      });
    } catch (e) { setError(getAuthErrorMessage(e)); setLoading(false); }
    return () => unsubscribe?.();
  }, []);

  if (!isFirebaseConfigured()) return <AuthScreen productName="DayFlow" configurationRequired />;
  if (loading) return <main className="grid min-h-screen place-items-center bg-[var(--bg,#0b0d10)] px-4 text-[var(--text,#f5f7fa)]"><p className="text-sm opacity-70">Checking your PALMI-D3V account…</p></main>;
  if (!user) return <AuthScreen productName="DayFlow" />;
  if (!user.emailVerified) return <VerificationScreen productName="DayFlow" user={user} />;
  if (!hasAppAccess(access, APP_IDS.dayflow)) return <AccessDenied productName="DayFlow" />;

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-[var(--border,#272b33)] bg-[var(--surface,#11151b)]/95 px-4 py-2 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 text-xs">
          <span className="truncate opacity-80">{user.email}</span>
          <button type="button" onClick={() => signOut()} className="rounded-lg px-2.5 py-1.5 opacity-60 hover:bg-[var(--surface-muted,#1b2028)] hover:opacity-100">Sign out</button>
        </div>
      </div>
      {error && <p className="mx-auto max-w-5xl px-4 py-2 text-xs text-red-400">{error}</p>}
      {children}
    </>
  );
}
