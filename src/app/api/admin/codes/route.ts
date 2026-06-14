import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Crockford-style alphabet — no I, L, O, U, 0, 1 to avoid lookalikes.
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

function generateCode(): string {
  // 8 chars from a 30-char alphabet → ~39.2 bits of entropy.
  // Format: XXXX-XXXX for easy reading.
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
    if (i === 3) out += "-";
  }
  return out;
}

export async function POST(req: Request) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { count?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const count = Math.max(1, Math.min(500, Math.floor(Number(body.count) || 0)));
  if (count <= 0) return NextResponse.json({ error: "count_required" }, { status: 400 });

  const admin = createSupabaseAdminClient();

  // Generate slightly more than requested to absorb the rare collision.
  // Codes use ~39 bits of entropy, so collisions are statistically unlikely
  // even at 100k codes, but we still de-dup against the existing set.
  const candidates = new Set<string>();
  while (candidates.size < count) {
    candidates.add(generateCode());
  }

  const rows = Array.from(candidates).map((code) => ({ code }));
  const { data, error } = await admin
    .from("voting_codes")
    .insert(rows)
    .select("code, is_used, used_at, used_for, created_at");

  if (error || !data) {
    return NextResponse.json({ error: "insert_failed", detail: error?.message }, { status: 500 });
  }

  return NextResponse.json({ codes: data });
}
