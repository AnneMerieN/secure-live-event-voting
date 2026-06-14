import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Team } from "@/lib/types";
import { TeamsManager } from "./TeamsManager";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("teams")
    .select("id, name, description, created_at")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Finalist teams</h2>
        <p className="mt-1 text-sm text-slate-400">
          Add the teams or projects attendees will be voting on.
        </p>
      </div>
      <TeamsManager initialTeams={(data ?? []) as Team[]} />
    </div>
  );
}
