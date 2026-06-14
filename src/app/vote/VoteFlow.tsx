"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  CAST_VOTE_ERROR_MESSAGES,
  type CastVoteError,
  type Team,
} from "@/lib/types";

type Step = "code" | "pick" | "done";

export function VoteFlow({ teams, initialCode }: { teams: Team[]; initialCode: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState(initialCode.toUpperCase().trim());
  const [validatingCode, setValidatingCode] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedTeam, setConfirmedTeam] = useState<Team | null>(null);

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError(CAST_VOTE_ERROR_MESSAGES.INVALID_CODE);
      return;
    }
    setCode(trimmed);
    setValidatingCode(true);
    try {
      const { data, error: rpcError } = await supabase.rpc("validate_code", { p_code: trimmed });
      if (rpcError) throw rpcError;
      if (!data) {
        setError(CAST_VOTE_ERROR_MESSAGES.CODE_NOT_FOUND);
        return;
      }
      setStep("pick");
    } catch {
      setError(CAST_VOTE_ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      setValidatingCode(false);
    }
  }

  async function handleVoteSubmit() {
    if (!selectedTeamId) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: rpcError } = await supabase.rpc("cast_vote", {
        p_code: code,
        p_team_id: selectedTeamId,
      });
      if (rpcError) {
        const known = (rpcError.message ?? "") as CastVoteError;
        const msg =
          CAST_VOTE_ERROR_MESSAGES[known] ?? CAST_VOTE_ERROR_MESSAGES.UNKNOWN_ERROR;
        setError(msg);
        return;
      }
      setConfirmedTeam(teams.find((t) => t.id === selectedTeamId) ?? null);
      setStep("done");
    } catch {
      setError(CAST_VOTE_ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "code") {
    return (
      <form className="card space-y-4" onSubmit={handleCodeSubmit}>
        <div>
          <label htmlFor="code" className="label">
            Voting code
          </label>
          <input
            id="code"
            name="code"
            autoFocus
            autoComplete="off"
            className="input font-mono uppercase tracking-widest"
            placeholder="e.g. K4XQ-9P7M"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>
        {error && <ErrorBanner message={error} />}
        <button type="submit" className="btn-primary w-full" disabled={validatingCode}>
          {validatingCode ? "Checking…" : "Continue"}
        </button>
      </form>
    );
  }

  if (step === "pick") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Code verified. Pick the finalist you want to vote for.
        </div>
        <div className="space-y-3">
          {teams.length === 0 ? (
            <div className="card text-sm text-slate-600">
              No finalists have been set up yet. Please contact event staff.
            </div>
          ) : (
            teams.map((team) => (
              <label
                key={team.id}
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                  selectedTeamId === team.id
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="team"
                  className="mt-1 h-4 w-4 text-brand-600"
                  checked={selectedTeamId === team.id}
                  onChange={() => setSelectedTeamId(team.id)}
                />
                <div>
                  <div className="font-semibold text-slate-900">{team.name}</div>
                  {team.description && (
                    <div className="mt-1 text-sm text-slate-600">{team.description}</div>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
        {error && <ErrorBanner message={error} />}
        <button
          type="button"
          className="btn-primary w-full"
          disabled={!selectedTeamId || submitting}
          onClick={handleVoteSubmit}
        >
          {submitting ? "Submitting…" : "Submit my vote"}
        </button>
      </div>
    );
  }

  return (
    <div className="card text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
        <svg
          className="h-6 w-6 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-900">Thanks for voting!</h2>
      <p className="mt-2 text-slate-600">
        Your vote for <span className="font-semibold">{confirmedTeam?.name}</span> has been
        recorded. Your code is now used and cannot be submitted again.
      </p>
      <div className="mt-6">
        <Link href="/results" className="btn-secondary">
          See live results →
        </Link>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  );
}
