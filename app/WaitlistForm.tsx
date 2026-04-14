"use client";

import { useState } from "react";

interface WaitlistFormProps {
  source: "hero" | "footer";
  className?: string;
}

export default function WaitlistForm({ source, className = "" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Could not join the waitlist.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`mt-${source === "hero" ? "10" : "8"} max-w-md mx-auto rounded-lg border border-forest/20 bg-white px-6 py-5 text-center ${className}`}
        role="status"
        aria-live="polite"
      >
        <p className="text-forest font-semibold">You&apos;re on the list.</p>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll email <span className="font-medium text-foreground">{email}</span> the moment PolicyApp opens.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={`mt-${source === "hero" ? "10" : "8"} flex flex-col sm:flex-row gap-3 max-w-md mx-auto ${className}`}
    >
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        placeholder="you@email.com"
        aria-label="Email address"
        aria-invalid={status === "error"}
        className="flex-1 h-12 px-4 rounded-lg border border-muted-light/40 bg-white text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="h-12 px-6 rounded-lg bg-forest text-white font-medium hover:bg-forest-dark transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Joining…" : "Get Early Access"}
      </button>
      {status === "error" && (
        <p className="sm:absolute sm:mt-14 text-sm text-red-600 w-full text-center" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
