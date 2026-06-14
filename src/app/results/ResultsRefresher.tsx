"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Polls the server every 5 seconds so the results page stays close to live
// without needing a websocket. Cheap, transparent, easy to explain.
export function ResultsRefresher() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      Auto-refreshing
    </div>
  );
}
