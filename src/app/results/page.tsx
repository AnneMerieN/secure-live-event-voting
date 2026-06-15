import { PageShell } from "@/components/PageShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ResultRow } from "@/lib/types";
import { colorForTeam } from "@/lib/teamColor";
import { ResultsRefresher } from "./ResultsRefresher";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("results_view")
    .select("team_id, team_name, team_description, vote_count");

  const rows = (data ?? []) as ResultRow[];
  const totalVotes = rows.reduce((sum, r) => sum + r.vote_count, 0);
  const maxVotes = Math.max(1, ...rows.map((r) => r.vote_count));

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Live results</h1>
            <p className="mt-2 text-slate-400">
              {totalVotes === 0
                ? "No votes yet — results will appear here as soon as voting starts."
                : `${totalVotes} ${totalVotes === 1 ? "vote" : "votes"} cast so far. Ranked by total.`}
            </p>
          </div>
          <ResultsRefresher />
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Couldn&apos;t load results. Please try again in a moment.
          </div>
        )}

        <ol className="mt-8 space-y-3">
          {rows.length === 0 && !error && (
            <li className="card text-sm text-slate-400">
              No teams have been added yet. An admin can add them on the dashboard.
            </li>
          )}
          {rows.map((row, idx) => {
            const pct = Math.round((row.vote_count / maxVotes) * 100);
            const color = colorForTeam(row.team_id);
            return (
              <li key={row.team_id} className="card">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated text-xs font-semibold text-slate-300">
                        {idx + 1}
                      </span>
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      <h3 className="truncate text-base font-semibold text-slate-100">
                        {row.team_name}
                      </h3>
                    </div>
                    {row.team_description && (
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {row.team_description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-bold tabular-nums text-white">
                      {row.vote_count}
                    </div>
                    <div className="text-xs text-slate-500">
                      {row.vote_count === 1 ? "vote" : "votes"}
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                    }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </PageShell>
  );
}
