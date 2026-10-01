export default function AccessDenied({ productName }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg,#0b0d10)] px-4 py-8 text-[var(--text,#f5f7fa)]">
      <section className="w-full max-w-md rounded-3xl border border-[var(--border,#272b33)] bg-[var(--surface,#11151b)] p-6 text-center shadow-2xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">PALMI-D3V ACCESS</p>
        <h1 className="mt-2 text-2xl font-bold">Access pending</h1>
        <p className="mt-3 text-sm leading-6 opacity-70">
          Your account is authenticated, but {productName} has not been enabled for this account yet.
        </p>
        <p className="mt-4 text-xs opacity-50">An administrator can enable or disable each PALMI-D3V app independently.</p>
      </section>
    </main>
  );
}
