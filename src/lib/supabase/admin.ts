import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role client. Bypasses RLS. NEVER import this in client components.
// Only use inside route handlers / server actions that have already verified
// the caller is an admin.
export function createSupabaseAdminClient() {
  return createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
