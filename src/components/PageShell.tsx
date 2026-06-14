import Link from "next/link";

export function PageShell({
  children,
  hideNav = false,
}: {
  children: React.ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && (
        <header className="border-b border-white/10 bg-surface-base/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-100">
              <span className="inline-block h-7 w-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20" />
              <span>Live Event Voting</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/vote" className="rounded-lg px-3 py-2 text-slate-400 hover:bg-surface-elevated hover:text-slate-100">
                Vote
              </Link>
              <Link href="/results" className="rounded-lg px-3 py-2 text-slate-400 hover:bg-surface-elevated hover:text-slate-100">
                Results
              </Link>
              <Link href="/admin" className="rounded-lg px-3 py-2 text-slate-400 hover:bg-surface-elevated hover:text-slate-100">
                Admin
              </Link>
            </nav>
          </div>
        </header>
      )}
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 bg-surface-base">
        <div className="mx-auto max-w-6xl px-6 py-4 text-center text-xs text-slate-500">
          Built with Next.js, Tailwind CSS, and Supabase — portfolio project.
        </div>
      </footer>
    </div>
  );
}
