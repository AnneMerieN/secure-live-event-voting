import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { requireAdmin } from "@/lib/auth";
import { AdminSignOutButton } from "./AdminSignOutButton";
import { AdminLogin } from "./AdminLogin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const check = await requireAdmin();

  if (!check.ok) {
    return (
      <PageShell>
        <section className="mx-auto max-w-md px-6 py-16">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-400">
            {check.reason === "not-admin"
              ? "You're signed in, but this account isn't registered as an admin."
              : "Sign in with the admin account configured for this event."}
          </p>
          <div className="mt-6">
            <AdminLogin notAdmin={check.reason === "not-admin"} />
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">Admin</div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-50">
              Event dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:inline">{check.email}</span>
            <AdminSignOutButton />
          </div>
        </div>
        <nav className="mb-6 flex flex-wrap gap-2 text-sm">
          <AdminNavLink href="/admin">Overview</AdminNavLink>
          <AdminNavLink href="/admin/teams">Teams</AdminNavLink>
          <AdminNavLink href="/admin/codes">Voting codes</AdminNavLink>
        </nav>
        {children}
      </div>
    </PageShell>
  );
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100"
    >
      {children}
    </Link>
  );
}
