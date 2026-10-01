import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "../lib/backendConfig";
import { getAuthErrorMessage, signOut, subscribeAuth } from "../lib/auth";
import { APP_IDS, ensureAppAccess, hasAppAccess, isPlatformAdmin } from "../lib/access";
import AuthScreen from "./AuthScreen";
import VerificationScreen from "./VerificationScreen";
import AccessDenied from "./AccessDenied";
import AdminAccessPanel from "./AdminAccessPanel";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(isFirebaseConfigured());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) { setLoading(false); return undefined; }
    let unsubscribe;
    try {
      unsubscribe = subscribeAuth((nextUser) => {
        setUser(nextUser);
        setAccess(null);
        setAdmin(false);
        setError("");
        if (!nextUser) { setLoading(false); return; }
        if (!nextUser.emailVerified) { setLoading(false); return; }

        setLoading(true);

        async function resolveAccess() {
          try {
            const nextAdmin = await isPlatformAdmin(nextUser.uid);

            // Platform admins are authorized by platformAdmins/{uid}.
            // They do not need an appAccess document.
            if (nextAdmin) {
              setAdmin(true);
              setAccess(null);
              return;
            }

            // Only non-admin verified users need an appAccess record.
            // The first app they open creates the shared record automatically.
            const nextAccess = await ensureAppAccess(nextUser);
            setAdmin(false);
            setAccess(nextAccess);
          } catch (authError) {
            setError(getAuthErrorMessage(authError));
          } finally {
            setLoading(false);
          }
        }

        resolveAccess();
      });
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setLoading(false);
    }
    return () => unsubscribe?.();
  }, []);

  if (!isFirebaseConfigured()) return <AuthScreen productName="DayFlow" configurationRequired />;
  if (loading) return <main className="grid min-h-screen place-items-center bg-[var(--bg,#0b0d10)] px-4 text-[var(--text,#f5f7fa)]"><p className="text-sm opacity-70">Checking your PALMI-D3V account…</p></main>;
  if (!user) return <AuthScreen productName="DayFlow" />;
  if (!user.emailVerified) return <VerificationScreen productName="DayFlow" user={user} />;
  if (!hasAppAccess(access, APP_IDS.dayflow) && !admin) return <AccessDenied productName="DayFlow" />;

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-[var(--border,#272b33)] bg-[var(--surface,#11151b)]/95 px-4 py-2 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 text-xs">
          <span className="truncate opacity-80">{user.email}{admin ? " · Admin" : ""}</span>
          <button type="button" onClick={() => signOut()} className="rounded-lg px-2.5 py-1.5 opacity-60 hover:bg-[var(--surface-muted,#1b2028)] hover:opacity-100">Sign out</button>
        </div>
      </div>
      {error && <p className="mx-auto max-w-5xl px-4 py-2 text-xs text-red-400" role="alert">{error}</p>}
      {admin && <AdminAccessPanel />}
      {children}
    </>
  );
}
