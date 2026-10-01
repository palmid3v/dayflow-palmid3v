import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { getAuthErrorMessage, signIn, signUp } from "../lib/auth";

export default function AuthScreen({ productName, configurationRequired = false }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      if (mode === "signup") {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg,#0b0d10)] px-4 py-8 text-[var(--text,#f5f7fa)]">
      <section className="w-full max-w-md rounded-3xl border border-[var(--border,#272b33)] bg-[var(--surface,#11151b)] p-6 shadow-2xl sm:p-8">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">PALMI-D3V</p>
          <h1 className="mt-2 text-2xl font-bold">{productName}</h1>
          <p className="mt-2 text-sm opacity-65">
            {configurationRequired
              ? "Firebase Authentication is ready in the project, but this deployment still needs its Vercel environment variables."
              : "Sign in to keep your personal data tied to your Firebase account."}
          </p>
        </div>

        {configurationRequired ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            Add the Firebase Web SDK variables from the Firebase project to this app's environment configuration, then rebuild.
          </div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-[var(--surface-muted,#1b2028)] p-1">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "signin" ? "bg-[var(--surface,#11151b)]" : "opacity-60"}`}
                aria-pressed={mode === "signin"}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "signup" ? "bg-[var(--surface,#11151b)]" : "opacity-60"}`}
                aria-pressed={mode === "signup"}
              >
                Create account
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-11 rounded-xl border border-[var(--border,#272b33)] bg-transparent px-3 outline-none focus:border-[var(--text,#f5f7fa)]"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium">
                Password
                <input
                  type="password"
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-11 rounded-xl border border-[var(--border,#272b33)] bg-transparent px-3 outline-none focus:border-[var(--text,#f5f7fa)]"
                />
              </label>

              {mode === "signup" && (
                <label className="grid gap-1.5 text-sm font-medium">
                  Confirm password
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="min-h-11 rounded-xl border border-[var(--border,#272b33)] bg-transparent px-3 outline-none focus:border-[var(--text,#f5f7fa)]"
                  />
                </label>
              )}

              {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent,#7c5cff)] px-4 text-sm font-bold text-[var(--accent-contrast,#fff)] disabled:cursor-wait disabled:opacity-50"
              >
                {mode === "signin" ? <LogIn size={17} /> : <UserPlus size={17} />}
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
