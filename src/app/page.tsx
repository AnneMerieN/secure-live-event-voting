import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text column */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Secure live-event voting with one-time codes.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              Only attendees who check in at the door can vote. Each person gets a unique
              one-time code; the system validates it server-side, records their vote, and
              burns the code so nobody can submit twice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/vote" className="btn-primary rounded-full px-6">
                Cast a vote →
              </Link>
              <Link href="/results" className="btn-secondary rounded-full px-6">
                View live results
              </Link>
            </div>
          </div>

          {/* Visual column */}
          <div className="lg:pl-4">
            <MockResultsPreview />
          </div>
        </div>

        <HowItWorks />
      </section>
    </PageShell>
  );
}

function MockResultsPreview() {
  // Static preview — illustrative only, not connected to the live results.
  const mockTeams = [
    { name: "Team Aurora", votes: 47, color: "#15AD70" },
    { name: "Team Helios", votes: 32, color: "#FFC700" },
    { name: "Team Nimbus", votes: 28, color: "#BF9FF1" },
    { name: "Team Quasar", votes: 19, color: "#73BDE7" },
  ];
  const max = Math.max(...mockTeams.map((t) => t.votes));

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500">Preview</div>
          <h3 className="mt-0.5 text-base font-semibold text-slate-100">Live results</h3>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-surface-base px-3 py-1 text-xs font-medium text-slate-300">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
          Live
        </div>
      </div>

      <ol className="mt-5 space-y-4">
        {mockTeams.map((team, idx) => {
          const pct = Math.round((team.votes / max) * 100);
          return (
            <li key={team.name}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[10px] font-semibold text-slate-300">
                    {idx + 1}
                  </span>
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: team.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-medium text-slate-100">
                    {team.name}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-white">
                  {team.votes}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: team.color }}
                  aria-hidden="true"
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Check in at the event",
      body: "Staff hands the attendee a unique voting code (printed on a slip, wristband, or shown after registration).",
    },
    {
      n: "2",
      title: "Scan the QR or visit /vote",
      body: "Attendee enters their code. The server confirms it exists and hasn't been used.",
    },
    {
      n: "3",
      title: "Pick a finalist team",
      body: "Voter sees the list of finalists, picks one, and submits.",
    },
    {
      n: "4",
      title: "Code is burned",
      body: "The vote is recorded and the code is marked used in the same transaction — no retries, no duplicates.",
    },
  ];
  return (
    <div className="mt-24 sm:mt-32">
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">How it works</h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <li key={s.n} className="card">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
              {s.n}
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-100">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
