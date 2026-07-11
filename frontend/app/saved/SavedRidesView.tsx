"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedRides, removeSavedRide, type SavedRide } from "@/lib/savedRides";

export function SavedRidesView() {
  const [rides, setRides] = useState<SavedRide[] | null>(null);

  useEffect(() => {
    setRides(getSavedRides());
  }, []);

  if (rides === null) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (rides.length === 0) {
    return (
      <div className="rounded-2xl bg-red/5 p-6 ring-1 ring-red/10">
        <p className="text-sm text-slate-600">
          No saved rides yet. Save a route from your ride history to quickly reuse it later.
        </p>
        <Link href="/rides" className="mt-3 inline-block text-sm text-red underline">
          View ride history
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rides.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {r.originAddress.split(",")[0]} → {r.destAddress.split(",")[0]}
            </p>
            <p className="text-xs text-slate-500">
              Saved {new Date(r.savedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRides(removeSavedRide(r.id))}
            className="shrink-0 rounded-full border border-red/30 px-3 py-1 text-xs font-medium text-red hover:bg-red/5"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
