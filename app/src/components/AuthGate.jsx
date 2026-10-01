import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { isFirebaseConfigured } from "../lib/backendConfig";
import { getAuthErrorMessage, signOut, subscribeAuth } from "../lib/auth";
import AuthScreen from "./AuthScreen";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return undefined;
    }

    let unsubscribe;

    try {
      unsubscribe = subscribeAuth((nextUser) => {
        setUser(nextUser);
        setLoading(false);
      });
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, []);

  async function handleSignOut() {
    try {
      setError("");
      await signOut();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    }
  }

  if (!isFirebaseConfigured()) {
    return (
      <AuthScreen
        productName="DayFlow"
        configurationRequired
      />
    );
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--bg,#0b0d10)] px-4 text-[var(--text,#f5f7fa)]">
        <p className="text-sm opacity-70">Checking your session…</p>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen productName="DayFlow" />;
  }

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-[var(--border,#272b33)] bg-[var(--surface,#11151b)]/95 px-4 py-2 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 text-xs">
          <div className="flex min-w-0 items-center gap-2 opacity-80">
            <UserRound size={15} />
            <span className="truncate">{user.email}</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[var(--text-muted,#9ca3af)] hover:bg-[var(--surface-muted,#1b2028)]"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
      {error && (
        <p className="mx-auto max-w-5xl px-4 py-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {children}
    </>
  );
}
