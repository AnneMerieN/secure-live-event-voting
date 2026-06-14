import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell>
      <section className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-72 max-w-3xl bg-gradient-to-b from-brand-500/20 via-brand-500/5 to-transparent blur-3xl" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-400" />
            Portfolio project · Next.js + Supabase
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            Secure live-event voting with one-time codes.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            Only attendees who check in at the door can vote. Each person gets a unique
            one-time code; the system validates it server-side, records their vote, and
            burns the code so nobody can submit twice.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/vote" className="btn-primary">
              Cast a vote →
            </Link>
            <Link href="/results" className="btn-secondary">
              View live results
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            title="One-time codes"
            body="Codes are validated and consumed atomically in a Postgres transaction — no double-voting, even under load."
          />
          <FeatureCard
            title="Tamper-resistant"
            body="Anonymous clients can't write to the votes table directly. They go through a SECURITY DEFINER RPC behind Supabase RLS."
          />
          <FeatureCard
            title="Live results"
            body="Aggregated tallies stream from a read-only view, sorted by vote count and rendered as a clean bar chart."
          />
        </div>

        <HowItWorks />
      </section>
    </PageShell>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card">
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
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
    <div className="mt-20">
      <h2 className="text-2xl font-bold tracking-tight text-slate-50">How it works</h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <li key={s.n} className="card">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white shadow-lg shadow-brand-500/20">
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
