import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();

  // Delete votes first (FK), then codes. Teams are kept.
  const { error: votesError } = await admin.from("votes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (votesError) return NextResponse.json({ error: "votes_delete_failed" }, { status: 500 });

  const { error: codesError } = await admin.from("voting_codes").delete().neq("code", "__never__");
  if (codesError) return NextResponse.json({ error: "codes_delete_failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
