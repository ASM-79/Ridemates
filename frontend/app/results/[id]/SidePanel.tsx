"use client";

import { useState, type ReactNode } from "react";
import type { CommuteRequestResult } from "@/lib/api";
import { RiderPanel } from "./RiderPanel";
import { DriverPanel } from "./DriverPanel";

type Mode = "rider" | "driver";

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

export function SidePanel({ result }: { result: CommuteRequestResult | null }) {
  const [dismissed, setDismissed] = useState(false);
  const [mode, setMode] = useState<Mode>("rider");

  const viewer = result?.viewer ?? null;

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
        <h1 className="text-2xl font-extrabold tracking-tight text-red">Ridemates</h1>
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red text-sm font-semibold text-white">
          {(viewer?.name ?? "G").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{viewer?.name ?? "Guest"}</p>
          <p className="text-xs text-slate-500">De Anza College</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1 rounded-full bg-white/60 p-1 ring-1 ring-black/5">
        <button
          type="button"
          onClick={() => setMode("rider")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            mode === "rider" ? "bg-red text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Rider
        </button>
        <button
          type="button"
          onClick={() => setMode("driver")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            mode === "driver" ? "bg-red text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Driver
        </button>
      </div>

      <div className="mt-4">
        {mode === "rider" ? <RiderPanel viewer={viewer} /> : <DriverPanel viewer={viewer} />}
      </div>

      <nav className="mt-4 space-y-0.5 border-t border-black/5 pt-3">
        <NavItem label="Account" icon="👤" />
        <NavItem label="Settings" icon="⚙️" />
      </nav>
    </div>
  );
}
