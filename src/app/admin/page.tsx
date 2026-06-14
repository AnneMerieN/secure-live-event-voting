import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ResetDemoDataButton } from "./ResetDemoDataButton";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = createSupabaseAdminClient();

  const [{ count: teamCount }, { count: codeCount }, { count: usedCount }, { count: voteCount }] =
    await Promise.all([
      admin.from("teams").select("*", { count: "exact", head: true }),
      admin.from("voting_codes").select("*", { count: "exact", head: true }),
      admin
        .from("voting_codes")
        .select("*", { count: "exact", head: true })
        .eq("is_used", true),
      admin.from("votes").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Finalist teams", value: teamCount ?? 0, href: "/admin/teams" },
    { label: "Codes generated", value: codeCount ?? 0, href: "/admin/codes" },
    { label: "Codes used", value: usedCount ?? 0, href: "/admin/codes" },
    { label: "Votes cast", value: voteCount ?? 0, href: "/results" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card transition hover:border-brand-300">
            <div className="text-xs uppercase tracking-wider text-slate-500">{s.label}</div>
            <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="text-brand-700 hover:underline" href="/admin/teams">
                → Add or edit finalist teams
              </Link>
            </li>
            <li>
              <Link className="text-brand-700 hover:underline" href="/admin/codes">
                → Generate one-time voting codes
              </Link>
            </li>
            <li>
              <Link className="text-brand-700 hover:underline" href="/results">
                → Open the live results page
              </Link>
            </li>
          </ul>
        </div>
        <div className="card">
          <h2 className="text-base font-semibold text-slate-900">Reset demo data</h2>
          <p className="mt-2 text-sm text-slate-600">
            Clears all voting codes and votes so you can run another demo. Teams are kept.
          </p>
          <div className="mt-4">
            <ResetDemoDataButton />
          </div>
        </div>
      </div>
    </div>
  );
}
