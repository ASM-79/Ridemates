"use client";

import { useState, type ReactNode } from "react";
import type { CommuteRequestResult } from "@/lib/api";

type RiderMode = "rider" | "driver";

function NavItem({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-dark-green/10"
    >
      <span className="text-dark-green">{icon}</span>
      {label}
    </button>
  );
}

function ResultSummary({ result }: { result: CommuteRequestResult }) {
  if (result.status === "matched") {
    const { match } = result;
    return (
      <div className="rounded-lg border border-dark-green/30 bg-dark-green/5 p-4">
        <h2 className="text-base font-semibold text-dark-green">You have a carpool match</h2>
        <ul className="mt-2 space-y-1 text-sm text-dark-green">
          {match.riders.map((r) => (
            <li key={r.requestId}>
              <span className="font-medium">{r.name}</span> — {r.originAddress}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-dark-green">{match.explanation}</p>
        {match.carbonSavingsKg !== null && (
          <p className="mt-3 text-sm font-medium text-gold-dark">
            Estimated carbon savings: {match.carbonSavingsKg} kg CO₂
          </p>
        )}
      </div>
    );
  }

  const { transitSuggestion } = result;
  return (
    <div className="rounded-lg border border-gold/40 bg-gold/10 p-4">
      <h2 className="text-base font-semibold text-gold-dark">No carpool match yet</h2>
      <p className="mt-2 text-sm text-gold-dark">{transitSuggestion.summary}</p>
      <a
        href={transitSuggestion.plannerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block rounded-md bg-dark-green px-3 py-1.5 text-sm font-medium text-white hover:bg-dark-green-light"
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
        className="absolute top-4 left-4 z-[1000] rounded-full bg-dark-green px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-dark-green-light"
      >
        Show details
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-[1000] flex max-h-[calc(100vh-2rem)] w-96 flex-col overflow-y-auto rounded-lg bg-background/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">DACarpool</h1>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="rounded-full px-2 py-1 text-foreground/60 hover:bg-dark-green/10 hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-md border border-dark-green/20 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dark-green text-sm font-semibold text-white">
          {(riderName ?? "G").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{riderName ?? "Guest"}</p>
          <p className="text-xs text-foreground/60">De Anza College</p>
        </div>
      </div>

      <div className="mt-3 flex rounded-md border border-dark-green/20 p-1">
        <button
          type="button"
          onClick={() => setMode("rider")}
          className={`flex-1 rounded px-3 py-1.5 text-sm font-medium ${
            mode === "rider" ? "bg-dark-green text-white" : "text-foreground/70"
          }`}
        >
          Rider mode
        </button>
        <button
          type="button"
          onClick={() => setMode("driver")}
          className={`flex-1 rounded px-3 py-1.5 text-sm font-medium ${
            mode === "driver" ? "bg-dark-green text-white" : "text-foreground/70"
          }`}
        >
          Driver mode
        </button>
      </div>

      <div className="mt-4">{result && <ResultSummary result={result} />}</div>

      <nav className="mt-4 space-y-1 border-t border-dark-green/20 pt-3">
        <NavItem label="My rides" icon="🚗" />
        <NavItem label="Account" icon="👤" />
        <NavItem label="Settings" icon="⚙️" />
      </nav>
    </div>
  );
}
