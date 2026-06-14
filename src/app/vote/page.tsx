import { PageShell } from "@/components/PageShell";
import { VoteFlow } from "./VoteFlow";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Team } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VotePage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, description, created_at")
    .order("name", { ascending: true });

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">Cast your vote</h1>
        <p className="mt-3 text-slate-400">
          Enter the one-time voting code you received at check-in. Each code can only be
          used once.
        </p>
        <div className="mt-8">
          <VoteFlow teams={(teams ?? []) as Team[]} initialCode={searchParams.code ?? ""} />
        </div>
      </section>
    </PageShell>
  );
}
