import { cloneElement, useEffect, useState } from "react";
import { Shield } from "lucide-react";
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
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

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

            // Provision the shared access record before email verification.
            // The record is always created with all app flags disabled.
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
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-2.5 text-[var(--text)] shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="label">DAYFLOW</p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{user.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {admin && (
              <button
                type="button"
                onClick={() => setAdminPanelOpen(true)}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-xs font-semibold"
                aria-label="Open admin access manager"
              >
                <Shield size={14} />
                Admin
              </button>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="Sign out"
              className="min-h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold transition hover:bg-[var(--surface-muted)]"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      {error && <p className="mx-auto max-w-3xl px-4 py-2 text-xs text-red-400" role="alert">{error}</p>}
      {admin && <AdminAccessPanel open={adminPanelOpen} onClose={() => setAdminPanelOpen(false)} />}
      {cloneElement(children, { access, admin })}
    </>
  );
}
