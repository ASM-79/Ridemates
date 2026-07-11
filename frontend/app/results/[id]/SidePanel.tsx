"use client";

import { useState, type ReactNode } from "react";
import type { CommuteRequestResult } from "@/lib/api";

type RiderMode = "rider" | "driver";

function NavItem({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-white/60 hover:text-slate-900"
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

function ResultSummary({ result }: { result: CommuteRequestResult }) {
  if (result.status === "matched") {
    const { match } = result;
    return (
      <div className="rounded-2xl bg-dark-green/8 p-4 ring-1 ring-dark-green/15">
        <h2 className="text-sm font-semibold tracking-wide text-dark-green uppercase">
          Carpool match found
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
          {match.riders.map((r) => (
            <li key={r.requestId} className="flex items-baseline gap-1.5">
              <span className="font-medium text-slate-900">{r.name}</span>
              <span className="truncate text-slate-500">{r.originAddress}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{match.explanation}</p>
        {match.carbonSavingsKg !== null && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-dark">
            🌱 {match.carbonSavingsKg} kg CO₂ saved
          </div>
        )}
      </div>
    );
  }

  const { transitSuggestion } = result;
  return (
    <div className="rounded-2xl bg-gold/10 p-4 ring-1 ring-gold/25">
      <h2 className="text-sm font-semibold tracking-wide text-gold-dark uppercase">
        No carpool match yet
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{transitSuggestion.summary}</p>
      <a
        href={transitSuggestion.plannerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block rounded-full bg-dark-green px-4 py-1.5 text-sm font-medium text-white transition hover:bg-dark-green-light"
      >
        Open VTA trip planner
      </a>
    </div>
  );
}

export function SidePanel({
  result,
  riderName,
}: {
  result: CommuteRequestResult | null;
  riderName: string | null;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [mode, setMode] = useState<RiderMode>("rider");

  if (dismissed) {
    return (
      <button
        type="button"
        onClick={() => setDismissed(false)}
        className="absolute top-4 left-4 z-[1000] rounded-full bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-800 shadow-lg ring-1 ring-black/5 backdrop-blur-xl transition hover:bg-white/90"
      >
        Show details
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-[1000] flex max-h-[calc(100vh-2rem)] w-96 flex-col overflow-y-auto rounded-3xl bg-white/70 p-5 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">DACarpool</h1>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dark-green text-sm font-semibold text-white">
          {(riderName ?? "G").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{riderName ?? "Guest"}</p>
          <p className="text-xs text-slate-500">De Anza College</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1 rounded-full bg-white/60 p-1 ring-1 ring-black/5">
        <button
          type="button"
          onClick={() => setMode("rider")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            mode === "rider" ? "bg-dark-green text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Rider
        </button>
        <button
          type="button"
          onClick={() => setMode("driver")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            mode === "driver" ? "bg-dark-green text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Driver
        </button>
      </div>

      <div className="mt-4">{result && <ResultSummary result={result} />}</div>

      <nav className="mt-4 space-y-0.5 border-t border-black/5 pt-3">
        <NavItem label="My rides" icon="🚗" />
        <NavItem label="Account" icon="👤" />
        <NavItem label="Settings" icon="⚙️" />
      </nav>
    </div>
  );
}
