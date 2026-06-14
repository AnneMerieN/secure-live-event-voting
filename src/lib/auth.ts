import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminCheck =
  | { ok: true; userId: string; email: string | null }
  | { ok: false; reason: "no-session" | "not-admin" };

export async function requireAdmin(): Promise<AdminCheck> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: "no-session" };

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) return { ok: false, reason: "not-admin" };

  return { ok: true, userId: user.id, email: user.email ?? null };
}
