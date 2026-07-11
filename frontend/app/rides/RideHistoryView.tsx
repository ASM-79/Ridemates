"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, getRiderDashboard, type RiderDashboardRequest, type User } from "@/lib/api";
import { saveRide } from "@/lib/savedRides";

function StatusBadge({ status }: { status: "matched" | "pending" }) {
  if (status === "matched") {
    return (
      <span className="rounded-full bg-red/15 px-2 py-0.5 text-xs font-medium text-red">Matched</span>
    );
  }
  return (
    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold-dark">
      Pending
    </span>
  );
}

export function RideHistoryView() {
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [requests, setRequests] = useState<RiderDashboardRequest[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u);
      if (!u) return;
      try {
        const dashboard = await getRiderDashboard(u.email);
        setRequests(dashboard.requests);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ride history");
      }
    });
  }, []);

  if (user === "loading") {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl bg-red/5 p-6 ring-1 ring-red/10">
        <p className="text-sm text-slate-600">Log in to see your ride history.</p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-full bg-red px-4 py-2 text-sm font-medium text-white hover:bg-red-light"
        >
          Log in
        </Link>
      </div>
    );
  }

  if (error) {
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl bg-red/5 p-6 ring-1 ring-red/10">
        <p className="text-sm text-slate-600">No rides yet.</p>
        <Link href="/request" className="mt-3 inline-block text-sm text-red underline">
          Submit your first commute
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.commuteRequest.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {r.commuteRequest.origin_address.split(",")[0]} →{" "}
              {r.commuteRequest.dest_address.split(",")[0]}
            </p>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {new Date(r.commuteRequest.departure_time).toLocaleString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          {r.status === "matched" && r.match && (
            <p className="mt-2 text-xs text-slate-600">
              Riding with{" "}
              {r.match.riders
                .filter((rider) => rider.requestId !== r.commuteRequest.id)
                .map((rider) => rider.name)
                .join(", ") || "no one else yet"}
              {r.match.carbonSavingsKg !== null && ` · ${r.match.carbonSavingsKg} kg CO₂ saved`}
            </p>
          )}
          {r.status === "pending" && r.transitSuggestion && (
            <p className="mt-2 text-xs text-slate-600">
              No match yet — {r.transitSuggestion.line}, ~{r.transitSuggestion.estimatedDurationMin} min
            </p>
          )}
          <button
            type="button"
            onClick={() =>
              saveRide(r.commuteRequest.origin_address, r.commuteRequest.dest_address)
            }
            className="mt-2 text-xs font-medium text-gold-dark hover:underline"
          >
            ☆ Save this route
          </button>
        </div>
      ))}
    </div>
  );
}
