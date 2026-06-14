import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { VotingCode } from "@/lib/types";
import { CodesManager } from "./CodesManager";

export const dynamic = "force-dynamic";

export default async function AdminCodesPage() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("voting_codes")
    .select("code, is_used, used_at, used_for, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Voting codes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Generate codes to hand out at check-in. Each code can only be used once.
        </p>
      </div>
      <CodesManager initialCodes={(data ?? []) as VotingCode[]} />
    </div>
  );
}
