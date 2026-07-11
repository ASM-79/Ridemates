"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  confirmPickup,
  getDriverDashboard,
  scheduleRoute,
  type DriverDashboard,
  type Viewer,
} from "@/lib/api";

export function DriverPanel({ viewer }: { viewer: Viewer | null }) {
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [time, setTime] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState(3);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function loadDashboard() {
    if (!viewer) return;
    try {
      const data = await getDriverDashboard(viewer.email);
      setDashboard(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load your routes");
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
      await scheduleRoute({
        name: viewer.name,
        email: viewer.email,
        startAddress,
        endAddress,
        schedule: { days: [], time },
        seatsAvailable,
      });
      setStartAddress("");
      setEndAddress("");
      setTime("");
      setSeatsAvailable(3);
      setFormOpen(false);
      setSubmitStatus("idle");
      await loadDashboard();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitStatus("error");
    }
  }

  async function handleConfirm(routeId: string, requestId: string) {
    setConfirmingId(requestId);
    try {
      await confirmPickup(routeId, requestId);
      await loadDashboard();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to confirm pickup");
    } finally {
      setConfirmingId(null);
    }
  }

  if (!viewer) {
    return <p className="text-sm text-slate-500">Sign in via a commute request to see driver tools.</p>;
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setFormOpen((v) => !v)}
        className="w-full rounded-full bg-red px-4 py-2 text-sm font-medium text-white transition hover:bg-red-light"
      >
        {formOpen ? "Cancel" : "+ Schedule a ride"}
      </button>

      {formOpen && (
        <form onSubmit={handleSubmit} className="space-y-2 rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
          <input
            type="text"
            required
            placeholder="Start address"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-sm focus:border-red focus:outline-none"
          />
          <input
            type="text"
            required
            placeholder="End address"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-sm focus:border-red focus:outline-none"
          />
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-sm focus:border-red focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Seats available</label>
            <input
              type="number"
              min={1}
              max={8}
              required
              value={seatsAvailable}
              onChange={(e) => setSeatsAvailable(Number(e.target.value))}
              className="w-16 rounded-lg border border-black/10 bg-white/80 px-2 py-1 text-sm focus:border-red focus:outline-none"
            />
          </div>
          {submitStatus === "error" && <p className="text-xs text-red-600">{submitError}</p>}
          <button
            type="submit"
            disabled={submitStatus === "submitting"}
            className="w-full rounded-full border border-gold-dark/40 bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold-dark transition hover:bg-gold/20 disabled:opacity-50"
          >
            {submitStatus === "submitting" ? "Scheduling…" : "Schedule route"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Your routes</h2>
        {loadError && <p className="text-xs text-red-600">{loadError}</p>}
        {dashboard && dashboard.routes.length === 0 && (
          <p className="text-sm text-slate-500">No routes yet — schedule one above.</p>
        )}
        {dashboard?.routes.map((r) => (
          <div key={r.route.id} className="rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
            <p className="truncate text-sm font-medium text-slate-900">
              {r.route.start_address.split(",")[0]} → {r.route.end_address.split(",")[0]}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded-full bg-red/15 px-2 py-0.5 text-xs font-medium text-red">
                {r.confirmedCount}/{r.seatsAvailable} seats filled
              </span>
              {r.seatsRemaining === 0 && (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Full
                </span>
              )}
            </div>

            {r.confirmedRiders.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
                {r.confirmedRiders.map((rider) => (
                  <li key={rider.requestId}>✓ {rider.name} — {rider.originAddress.split(",")[0]}</li>
                ))}
              </ul>
            )}

            {r.pendingNearby.length > 0 && (
              <div className="mt-2 space-y-1.5 border-t border-black/5 pt-2">
                <p className="text-xs font-medium text-slate-500">Riders nearby to confirm</p>
                {r.pendingNearby.map((rider) => (
                  <div key={rider.requestId} className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-slate-700">
                      {rider.name} — {rider.originAddress.split(",")[0]}
                    </span>
                    <button
                      type="button"
                      disabled={r.seatsRemaining === 0 || confirmingId === rider.requestId}
                      onClick={() => handleConfirm(r.route.id, rider.requestId)}
                      className="shrink-0 rounded-full bg-red px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-light disabled:opacity-40"
                    >
                      {confirmingId === rider.requestId ? "…" : "Confirm"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
