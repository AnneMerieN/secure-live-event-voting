# Secure Live Event Voting Platform

A full-stack voting system for live events where **only people who physically attend can vote**.
Attendees receive a unique **one-time voting code** at check-in, scan a QR or visit
`/vote`, enter the code, pick a finalist team, and submit. Once a code is used, it is
burned — the same person cannot vote twice.

Built as a portfolio project, so the code is intentionally readable and the security
model is small enough to explain end-to-end.

## Why I built this

Live demo-day-style events almost always run into the same three problems with show-of-hands
or "scan this Google Form" voting:

1. **People who aren't at the event vote** (the form link gets shared).
2. **Attendees double-vote** by submitting the form twice from the same device.
3. **Staff can't audit who voted** if there's ever a dispute.

The one-time-code design solves all three at once: codes are distributed in person, each
code is consumed by exactly one vote, and the database has a clear used/unused trail.

## Key features

- **Attendee voting flow** (`/vote`) — code entry → team selection → confirmation.
- **Live results page** (`/results`) — vote totals with a bar chart, auto-refreshes every 5s.
- **Admin dashboard** (`/admin`) — sign-in, overview stats, demo-data reset.
- **Team management** (`/admin/teams`) — create, edit, delete finalists.
- **Code management** (`/admin/codes`) — bulk-generate codes, filter used/unused, copy to clipboard.
- **Atomic vote casting** — a single Postgres function validates the code, inserts the vote,
  and marks the code used in one transaction. No race conditions, no duplicate votes.
- **Row-Level Security** — anonymous users can only call the `cast_vote` and `validate_code`
  RPCs and read aggregated results. They cannot read or write the underlying tables.

## Tech stack

| Layer       | Choice                                |
|-------------|----------------------------------------|
| Framework   | Next.js 14 (App Router)               |
| Language    | TypeScript                             |
| Styling     | Tailwind CSS                           |
| Database    | Supabase (Postgres) with RLS + RPC     |
| Auth        | Supabase Auth (email + password)       |
| Deployment  | Vercel-ready (no extra infrastructure) |

## Database schema

Four tables and one view, defined in [`supabase/schema.sql`](supabase/schema.sql):

```
teams           — finalist teams attendees vote on
  id            uuid pk
  name          text
  description   text
  created_at    timestamptz

voting_codes    — one-time codes handed out at check-in
  code          text pk
  is_used       boolean
  used_at       timestamptz
  used_for      uuid → teams.id
  created_at    timestamptz

votes           — one row per cast vote
  id            uuid pk
  team_id       uuid → teams.id
  code          text → voting_codes.code (UNIQUE — enforces single-use)
  created_at    timestamptz

admin_users     — links a Supabase auth user to admin privileges
  user_id       uuid pk → auth.users.id
  created_at    timestamptz

results_view    — aggregated tallies, publicly readable
```

Plus three Postgres functions:

- `cast_vote(p_code, p_team_id)` — `SECURITY DEFINER`, locks the code row, rejects if used,
  inserts the vote, marks the code used. **All in one transaction.**
- `validate_code(p_code)` — lightweight existence check used by the UI before showing teams.
- `reset_demo_data(p_clear_teams)` — admin-only; clears votes and codes.

## How the one-time voting code system works

```
┌─────────────┐    1. Enter code     ┌─────────────────┐
│  Attendee   │ ───────────────────► │   /vote page    │
│  on phone   │                      │  (Next.js RSC)  │
└─────────────┘                      └────────┬────────┘
                                              │ rpc('validate_code', { p_code })
                                              ▼
                                     ┌─────────────────┐
                                     │   Supabase      │
                                     │  validate_code  │── exists & unused? → true
                                     └─────────────────┘
                                              │
              2. Pick team, submit            ▼
                                     rpc('cast_vote', { p_code, p_team_id })
                                              ▼
                                     ┌──────────────────────────────────┐
                                     │ cast_vote (SECURITY DEFINER)     │
                                     │                                  │
                                     │  BEGIN                           │
                                     │   SELECT FOR UPDATE the code row │
                                     │   IF is_used  → raise            │
                                     │   INSERT INTO votes              │
                                     │   UPDATE voting_codes SET used   │
                                     │  COMMIT                          │
                                     └──────────────────────────────────┘
```

Three properties fall out of this design:

1. **Single-use is enforced by the DB, not the app.** `votes.code` is `UNIQUE`, so even if
   the application logic were buggy, Postgres would reject a second insert.
2. **No race conditions.** `SELECT … FOR UPDATE` locks the code row for the duration of
   the transaction, so two concurrent submissions of the same code can't both succeed.
3. **The browser never has rights to write to `votes` or `voting_codes` directly.** Anon
   users can only `EXECUTE` the two RPCs. RLS denies everything else.

## How to run locally

### 1. Clone and install

```bash
git clone <this-repo>
cd live-event-voting-system
npm install
```

### 2. Create a Supabase project

- Go to [supabase.com](https://supabase.com), create a new project.
- In **Project Settings → API**, copy:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-side only!)

### 3. Configure env vars

```bash
cp .env.example .env.local
# fill in the three values
```

### 4. Apply the database schema

Open the Supabase SQL editor and paste the contents of [`supabase/schema.sql`](supabase/schema.sql).
Run it. This creates all tables, RLS policies, and functions, and seeds a few demo teams.

### 5. Create your admin user

In Supabase → **Authentication → Users**, click "Add user", set an email and password.
Copy the user id, then in the SQL editor run:

```sql
insert into public.admin_users (user_id) values ('<paste-user-id>');
```

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/admin`, generate some
codes at `/admin/codes`, then test the voting flow at `/vote`.

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import into Vercel.
3. Add the three env vars (same as `.env.local`).
4. Deploy.

That's it — no extra infrastructure, no background workers.

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # / landing
│   ├── vote/                     # /vote — attendee voting flow
│   ├── results/                  # /results — live tallies + bar chart
│   ├── admin/                    # /admin — gated dashboard
│   │   ├── teams/                # /admin/teams — CRUD finalists
│   │   └── codes/                # /admin/codes — generate & list codes
│   └── api/admin/                # admin-only API routes (re-check auth on every call)
├── components/PageShell.tsx      # shared nav + footer
├── lib/
│   ├── supabase/                 # browser / server / service-role clients
│   ├── auth.ts                   # requireAdmin() helper
│   ├── types.ts                  # shared TypeScript types + error messages
│   └── env.ts                    # env-var validation
└── middleware.ts                 # refreshes Supabase auth cookies
supabase/schema.sql               # full DB schema, RLS, and RPCs
```

## Security notes

- **Anon key is safe in the browser.** RLS makes it useless for anything beyond the two
  RPCs and the aggregated results view.
- **Service-role key is server-only.** It's only imported from `src/lib/supabase/admin.ts`,
  which is itself only used inside API routes that first call `requireAdmin()`.
- **Admin pages double-check.** The middleware refreshes the session but does not gate
  access — each admin page/API route calls `requireAdmin()` itself, so a bug in the
  middleware can never accidentally open the admin surface.
- **Codes use ~39 bits of entropy** from a Crockford-style alphabet (no ambiguous chars).
  Brute-forcing 10k valid codes from the ~10^11 keyspace is not realistic at event scale,
  but rate-limiting is listed under "future improvements" for production use.

## Future improvements

- **Server-side QR generation** for each code, with a printable PDF sheet.
- **Per-IP rate limiting** on the `cast_vote` RPC (Supabase Edge Functions or a Vercel
  middleware-level limiter).
- **Multi-event support** — currently a single event lives in the DB; add an `events`
  table and scope codes/teams/votes to it.
- **Realtime results** via Supabase Realtime (currently a 5s poll for simplicity).
- **Audit log** of admin actions (who created which codes, who reset demo data).
- **Email-based admin invites** so new admins onboard without a manual SQL insert.
- **Multi-round voting** (semi-final → final) with weighted ballots.

## License

MIT. Built as a learning project — feel free to fork and adapt.
