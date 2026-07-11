"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signup } from "@/lib/api";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "done">("idle");
  const [error, setError] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const result = await signup({ name, email, password });
      setVerificationUrl(result.verificationUrl);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-gold/10 p-6 ring-1 ring-gold/25">
        <h2 className="text-base font-semibold text-gold-dark">Almost there</h2>
        <p className="mt-2 text-sm text-slate-600">
          We&apos;d normally email you a verification link. Since email sending isn&apos;t
          configured yet, here it is directly:
        </p>
        <Link
          href={verificationUrl.replace(/^https?:\/\/[^/]+/, "")}
          className="mt-3 inline-block break-all rounded-lg bg-white/70 px-3 py-2 text-sm text-gold-dark underline"
        >
          {verificationUrl}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-red focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@deanza.edu"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-red focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-red focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
      </div>

      {status === "error" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-red px-4 py-2 font-medium text-white hover:bg-red-light disabled:opacity-50"
      >
        {status === "submitting" ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-red underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
