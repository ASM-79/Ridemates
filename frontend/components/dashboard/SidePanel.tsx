"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout, type Viewer } from "@/lib/api";
import { RiderPanel } from "./RiderPanel";
import { DriverPanel } from "./DriverPanel";

type Mode = "rider" | "driver";

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-red/5 hover:text-slate-900"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-base transition group-hover:bg-white group-hover:shadow-sm">
        {icon}
      </span>
      {label}
    </Link>
  );
}

export function SidePanel({ viewer }: { viewer: Viewer | null }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState<Mode>("rider");

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (collapsed) {
    return (
      <div className="flex h-full w-16 shrink-0 flex-col items-center gap-4 bg-white py-5 shadow-xl">
        <div className="h-1.5 w-8 rounded-full bg-gradient-to-r from-red to-gold" />
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red transition hover:bg-red/20"
        >
          »
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red text-sm font-semibold text-white ring-2 ring-gold ring-offset-2">
          {(viewer?.name ?? "G").charAt(0).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-[26rem] shrink-0 flex-col bg-white shadow-2xl">
      <div className="h-1.5 shrink-0 bg-gradient-to-r from-red via-gold to-red" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-red">Ridemates</h1>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            «
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-red/5 to-gold/10 p-4 ring-1 ring-black/5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red text-lg font-semibold text-white ring-2 ring-gold ring-offset-2">
            {(viewer?.name ?? "G").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900">
              {viewer?.name ?? "Guest"}
            </p>
            <p className="text-xs text-slate-500">De Anza College</p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
          <div
            className={`absolute inset-y-1.5 w-[calc(50%-0.375rem)] rounded-xl bg-red shadow-md transition-transform duration-300 ease-out ${
              mode === "driver" ? "translate-x-[calc(100%+0.375rem)]" : "translate-x-0"
            }`}
          />
          <button
            type="button"
            onClick={() => setMode("rider")}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold transition ${
              mode === "rider" ? "text-white" : "text-slate-500"
            }`}
          >
            🧍 Rider
          </button>
          <button
            type="button"
            onClick={() => setMode("driver")}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold transition ${
              mode === "driver" ? "text-white" : "text-slate-500"
            }`}
          >
            🚗 Driver
          </button>
        </div>

        <div className="mt-5">
          {mode === "rider" ? <RiderPanel viewer={viewer} /> : <DriverPanel viewer={viewer} />}
        </div>

        <nav className="mt-5 space-y-0.5 border-t border-black/5 pt-4">
          <NavItem href="/rides" label="Ride history" icon="🕓" />
          <NavItem href="/saved" label="Saved rides" icon="⭐" />
          <NavItem href="/account" label="Account" icon="👤" />
          <NavItem href="/settings" label="Settings" icon="⚙️" />
        </nav>
      </div>

      <div className="shrink-0 border-t border-black/5 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red/30 py-2.5 text-sm font-medium text-red transition hover:bg-red/5"
        >
          🚪 Sign out
        </button>
      </div>
    </div>
  );
}
