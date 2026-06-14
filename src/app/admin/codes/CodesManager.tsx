"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { VotingCode } from "@/lib/types";

type Filter = "all" | "unused" | "used";

export function CodesManager({ initialCodes }: { initialCodes: VotingCode[] }) {
  const router = useRouter();
  const [codes, setCodes] = useState<VotingCode[]>(initialCodes);
  const [count, setCount] = useState(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [justGenerated, setJustGenerated] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (filter === "unused") return codes.filter((c) => !c.is_used);
    if (filter === "used") return codes.filter((c) => c.is_used);
    return codes;
  }, [codes, filter]);

  const stats = useMemo(() => {
    const total = codes.length;
    const used = codes.filter((c) => c.is_used).length;
    return { total, used, unused: total - used };
  }, [codes]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/codes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ count }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Couldn't generate codes.");
      return;
    }
    const { codes: created } = (await res.json()) as { codes: VotingCode[] };
    setCodes((existing) => [...created, ...existing]);
    setJustGenerated(created.map((c) => c.code));
    router.refresh();
  }

  function handleCopyAll() {
    const text = justGenerated.length > 0
      ? justGenerated.join("\n")
      : filtered.map((c) => c.code).join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <form className="card flex flex-wrap items-end gap-4" onSubmit={handleGenerate}>
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="count" className="label">
            How many codes?
          </label>
          <input
            id="count"
            type="number"
            min={1}
            max={500}
            className="input"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Generating…" : "Generate"}
        </button>
        {error && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </form>

      {justGenerated.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Just generated ({justGenerated.length})
            </h3>
            <button type="button" className="btn-secondary" onClick={handleCopyAll}>
              Copy all
            </button>
          </div>
          <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700">
            {justGenerated.join("\n")}
          </pre>
          <p className="mt-2 text-xs text-slate-500">
            Hand these out at check-in. Treat them like single-use tickets.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Total" value={stats.total} />
        <StatTile label="Unused" value={stats.unused} accent="emerald" />
        <StatTile label="Used" value={stats.used} accent="slate" />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
        <FilterChip active={filter === "unused"} onClick={() => setFilter("unused")}>Unused</FilterChip>
        <FilterChip active={filter === "used"} onClick={() => setFilter("used")}>Used</FilterChip>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Used at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                  No codes match this filter.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.code}>
                <td className="px-4 py-3 font-mono text-slate-900">{c.code}</td>
                <td className="px-4 py-3">
                  {c.is_used ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      Used
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      Unused
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {c.used_at ? new Date(c.used_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Showing up to 500 most recent codes. For large events, export the full list with a
        Supabase SQL query.
      </p>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent = "brand",
}: {
  label: string;
  value: number;
  accent?: "brand" | "emerald" | "slate";
}) {
  const color =
    accent === "emerald" ? "text-emerald-700" : accent === "slate" ? "text-slate-700" : "text-brand-700";
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
