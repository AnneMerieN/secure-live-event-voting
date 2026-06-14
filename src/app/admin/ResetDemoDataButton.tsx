"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResetDemoDataButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("Delete all voting codes and votes? Teams will be kept.")) return;
    setBusy(true);
    setError(null);
    setDone(false);
    const res = await fetch("/api/admin/reset", { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      setError("Couldn't reset. Are you signed in as an admin?");
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button type="button" className="btn-danger" onClick={handleClick} disabled={busy}>
        {busy ? "Resetting…" : "Reset demo data"}
      </button>
      {done && <p className="text-xs text-emerald-400">All codes and votes cleared.</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
