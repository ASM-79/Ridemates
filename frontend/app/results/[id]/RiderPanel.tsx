"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  createCommuteRequest,
  getRiderDashboard,
  type RiderDashboard,
  type Viewer,
} from "@/lib/api";

function StatusBadge({ status }: { status: "matched" | "pending" }) {
  if (status === "matched") {
    return (
      <span className="rounded-full bg-red/15 px-2 py-0.5 text-xs font-medium text-red">
        Matched
      </span>
    );
  }
  return (
    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold-dark">
      Pending
    </span>
  );
}

export function RiderPanel({ viewer }: { viewer: Viewer | null }) {
  const [dashboard, setDashboard] = useState<RiderDashboard | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const [originAddress, setOriginAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [flexibilityMinutes, setFlexibilityMinutes] = useState(15);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  async function loadDashboard() {
    if (!viewer) return;
    try {
      const data = await getRiderDashboard(viewer.email);
      setDashboard(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load your requests");
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer?.email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!viewer) return;
    setSubmitStatus("submitting");
    setSubmitError("");

    try {
      await createCommuteRequest({
        name: viewer.name,
        email: viewer.email,
        originAddress,
        destAddress,
        departureTime,
        flexibilityMinutes,
      });
      setOriginAddress("");
      setDestAddress("");
      setDepartureTime("");
      setFlexibilityMinutes(15);
      setFormOpen(false);
      setSubmitStatus("idle");
      await loadDashboard();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitStatus("error");
    }
  }

  if (!viewer) {
    return <p className="text-sm text-slate-500">Sign in via a commute request to see rider tools.</p>;
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setFormOpen((v) => !v)}
        className="w-full rounded-full bg-red px-4 py-2 text-sm font-medium text-white transition hover:bg-red-light"
      >
        {formOpen ? "Cancel" : "+ New ride request"}
      </button>

      {formOpen && (
        <form onSubmit={handleSubmit} className="space-y-2 rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
          <input
            type="text"
            required
            placeholder="Origin address"
            value={originAddress}
            onChange={(e) => setOriginAddress(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-sm focus:border-red focus:outline-none"
          />
          <input
            type="text"
            required
            placeholder="Destination address"
            value={destAddress}
            onChange={(e) => setDestAddress(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-sm focus:border-red focus:outline-none"
          />
          <input
            type="datetime-local"
            required
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-sm focus:border-red focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Flexibility (min)</label>
            <input
              type="number"
              min={0}
              step={5}
              required
              value={flexibilityMinutes}
              onChange={(e) => setFlexibilityMinutes(Number(e.target.value))}
              className="w-20 rounded-lg border border-black/10 bg-white/80 px-2 py-1 text-sm focus:border-red focus:outline-none"
            />
          </div>
          {submitStatus === "error" && <p className="text-xs text-red-600">{submitError}</p>}
          <button
            type="submit"
            disabled={submitStatus === "submitting"}
            className="w-full rounded-full border border-gold-dark/40 bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold-dark transition hover:bg-gold/20 disabled:opacity-50"
          >
            {submitStatus === "submitting" ? "Submitting…" : "Submit request"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Your requests</h2>
        {loadError && <p className="text-xs text-red-600">{loadError}</p>}
        {dashboard && dashboard.requests.length === 0 && (
          <p className="text-sm text-slate-500">No requests yet — submit one above.</p>
        )}
        {dashboard?.requests.map((r) => (
          <div key={r.commuteRequest.id} className="rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-slate-900">
                {r.commuteRequest.origin_address.split(",")[0]} →{" "}
                {r.commuteRequest.dest_address.split(",")[0]}
              </p>
              <StatusBadge status={r.status} />
            </div>
            {r.status === "matched" && r.match && (
              <p className="mt-1 text-xs text-slate-600">
                Riding with{" "}
                {r.match.riders
                  .filter((rider) => rider.requestId !== r.commuteRequest.id)
                  .map((rider) => rider.name)
                  .join(", ") || "no one else yet"}
                {r.match.carbonSavingsKg !== null && ` · ${r.match.carbonSavingsKg} kg CO₂ saved`}
              </p>
            )}
            {r.status === "pending" && r.transitSuggestion && (
              <p className="mt-1 text-xs text-slate-600">
                No match yet — {r.transitSuggestion.line}, ~{r.transitSuggestion.estimatedDurationMin}{" "}
                min
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
