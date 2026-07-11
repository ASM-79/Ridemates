"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/api";

export function VerifyView() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setError("Missing verification token.");
      setStatus("error");
      return;
    }

    // Guard against React Strict Mode's double-invoked effect in dev,
    // which would otherwise replay this request and burn the one-time token.
    if (requestedRef.current) return;
    requestedRef.current = true;

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to verify email");
        setStatus("error");
      });
  }, [token]);

  if (status === "verifying") {
    return <p className="text-sm text-slate-500">Verifying your email…</p>;
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-100">
        <h2 className="text-base font-semibold text-red-700">Verification failed</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <Link href="/signup" className="mt-3 inline-block text-sm text-red underline">
          Back to sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gold/10 p-6 ring-1 ring-gold/25">
      <h2 className="text-base font-semibold text-gold-dark">Email verified</h2>
      <p className="mt-2 text-sm text-slate-600">You&apos;re all set and logged in.</p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-md bg-red px-4 py-2 text-sm font-medium text-white hover:bg-red-light"
      >
        Continue to Ridemates
      </Link>
    </div>
  );
}
