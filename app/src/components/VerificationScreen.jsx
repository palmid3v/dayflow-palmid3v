import { useState } from "react";
import { getAuthErrorMessage, refreshVerification, resendVerification, signOut } from "../lib/auth";

export default function VerificationScreen({ productName, user }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRefresh() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const verified = await refreshVerification(user);
      setMessage(verified ? "Email verified. Loading your app…" : "Your email is not verified yet. Open the verification email and try again.");
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await resendVerification(user);
      setMessage("Verification email sent. Check your inbox and spam folder.");
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg,#0b0d10)] px-4 py-8 text-[var(--text,#f5f7fa)]">
      <section className="w-full max-w-md rounded-3xl border border-[var(--border,#272b33)] bg-[var(--surface,#11151b)] p-6 shadow-2xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">PALMI-D3V</p>
        <h1 className="mt-2 text-2xl font-bold">Verify your email</h1>
        <p className="mt-3 text-sm leading-6 opacity-70">
          {productName} requires a verified email before your account can access productivity data.
        </p>
        <div className="mt-5 rounded-2xl border border-[var(--border,#272b33)] bg-[var(--surface-muted,#1b2028)] p-4 text-sm">
          <p className="font-semibold">{user?.email}</p>
          <p className="mt-1 opacity-60">We sent a verification link to this address.</p>
        </div>
        {message && <p className="mt-4 text-sm text-emerald-400" role="status">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>}
        <div className="mt-6 grid gap-3">
          <button type="button" onClick={handleRefresh} disabled={busy} className="min-h-11 rounded-xl bg-[var(--accent,#7c5cff)] px-4 text-sm font-bold text-white disabled:opacity-50">
            {busy ? "Checking…" : "I verified my email"}
          </button>
          <button type="button" onClick={handleResend} disabled={busy} className="min-h-11 rounded-xl border border-[var(--border,#272b33)] px-4 text-sm font-semibold disabled:opacity-50">
            Resend verification email
          </button>
          <button type="button" onClick={() => signOut()} className="min-h-10 text-sm opacity-60 hover:opacity-100">
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}
