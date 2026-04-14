import { type NextRequest, NextResponse } from "next/server";

interface WaitlistRequest {
  email?: string;
  source?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // Log the signup so it lands in Vercel logs / any log drain.
  // When a real provider is wired (Resend, ConvertKit, Loops, Supabase)
  // the POST should fan out from here.
  console.log(
    JSON.stringify({
      event: "waitlist.signup",
      ts: new Date().toISOString(),
      site: "policyapp.com",
      source,
      email,
    }),
  );

  return NextResponse.json({ ok: true });
}
