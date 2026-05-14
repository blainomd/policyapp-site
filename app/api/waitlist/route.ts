import { type NextRequest, NextResponse } from "next/server";

interface WaitlistRequest {
  email?: string;
  source?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUPABASE_URL =
  "https://uhizqukdctkvluluheux.supabase.co/rest/v1/email_captures";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaXpxdWtkY3Rrdmx1bHVoZXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzQ1ODQsImV4cCI6MjA4OTQ1MDU4NH0._AxT5pBEi1GZ167JPJpHeg_k1E0Bbtzyj3UPKdTFEug";

export async function POST(req: NextRequest) {
  let body: WaitlistRequest;
  try {
    body = (await req.json()) as WaitlistRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = (body.email || "").trim();
  const source = (body.source || "unknown").slice(0, 32);

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  // Persist to Supabase email_captures table
  try {
    const r = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        email,
        brand: "policyapp.com",
        source: source || "policyapp_waitlist",
        metadata: { ...body },
      }),
    });

    if (!r.ok && r.status !== 201) {
      const b = await r.json().catch(() => ({}));
      // 23505 = unique violation (duplicate email) — treat as success
      if ((b as { code?: string })?.code !== "23505") {
        console.error("Supabase insert failed", r.status, b);
      }
    }
  } catch (err) {
    // Log but don't fail — user still joined
    console.error("Supabase error", err);
  }

  return NextResponse.json({ ok: true });
}
