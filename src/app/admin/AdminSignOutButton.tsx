"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminSignOutButton() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button type="button" className="btn-secondary" onClick={handleSignOut}>
      Sign out
    </button>
  );
}
