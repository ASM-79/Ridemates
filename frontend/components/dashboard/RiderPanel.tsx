"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  createCommuteRequest,
  getRiderDashboard,
  selectDriver,
  type RiderDashboard,
  type RiderDashboardRequest,
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

function IconInput({
  icon,
  ...props
}: { icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
        {icon}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-black/10 bg-white/80 py-1.5 pr-3 pl-9 text-sm focus:border-red focus:outline-none"
      />
    </div>
  );
}

function DriverPickerModal({
  request,
  onClose,
  onPicked,
}: {
  request: RiderDashboardRequest;
  onClose: () => void;
  onPicked: (selectedRequestId: string) => Promise<void>;
}) {
  const [pickingId, setPickingId] = useState<string | null>(null);
  const otherRiders = request.match?.riders.filter((r) => r.requestId !== request.commuteRequest.id) ?? [];

  async function handlePick(requestId: string) {
    setPickingId(requestId);
    try {
      await onPicked(requestId);
      onClose();
    } finally {
      setPickingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Who&apos;s driving?</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Pick who you&apos;d prefer to drive. They&apos;ll see that you selected them.
        </p>
        <div className="mt-4 space-y-2">
          {otherRiders.map((rider) => (
            <button
              key={rider.requestId}
              type="button"
              disabled={pickingId !== null}
              onClick={() => handlePick(rider.requestId)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                request.mySelectedDriverRequestId === rider.requestId
                  ? "border-red bg-red/5 text-red"
                  : "border-black/10 text-slate-700 hover:bg-red/5"
              } disabled:opacity-50`}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red text-xs font-semibold text-white">
                  {rider.name.charAt(0).toUpperCase()}
                </span>
                {rider.name}
              </span>
              {pickingId === rider.requestId ? "…" : request.mySelectedDriverRequestId === rider.requestId ? "✓" : ""}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RiderPanel({ viewer }: { viewer: Viewer | null }) {
  const [dashboard, setDashboard] = useState<RiderDashboard | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [pickerRequestId, setPickerRequestId] = useState<string | null>(null);

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

  const pickerRequest = dashboard?.requests.find((r) => r.commuteRequest.id === pickerRequestId) ?? null;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setFormOpen((v) => !v)}
        className="w-full rounded-full bg-red px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red/20 transition hover:scale-[1.02] hover:bg-red-light active:scale-95"
      >
        {formOpen ? "Cancel" : "+ New ride request"}
      </button>

      {formOpen && (
        <form onSubmit={handleSubmit} className="space-y-2 rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
          <IconInput
            icon="📍"
            type="text"
            required
            placeholder="Current location"
            value={originAddress}
            onChange={(e) => setOriginAddress(e.target.value)}
          />
          <IconInput
            icon="🏁"
            type="text"
            required
            placeholder="Destination"
            value={destAddress}
            onChange={(e) => setDestAddress(e.target.value)}
          />
          <IconInput
            icon="🕐"
            type="datetime-local"
            required
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
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
          <div
            key={r.commuteRequest.id}
            className="rounded-2xl bg-white/60 p-3 ring-1 ring-black/5 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-slate-900">
                📍 {r.commuteRequest.origin_address.split(",")[0]} → 🏁{" "}
                {r.commuteRequest.dest_address.split(",")[0]}
              </p>
              <StatusBadge status={r.status} />
            </div>
            {r.status === "matched" && r.match && (
              <>
                <p className="mt-1 text-xs text-slate-600">
                  Riding with{" "}
                  {r.match.riders
                    .filter((rider) => rider.requestId !== r.commuteRequest.id)
                    .map((rider) => rider.name)
                    .join(", ") || "no one else yet"}
                  {r.match.carbonSavingsKg !== null && ` · ${r.match.carbonSavingsKg} kg CO₂ saved`}
                </p>
                {r.pickedMeAsDriver && r.pickedMeAsDriver.length > 0 && (
                  <p className="mt-1.5 rounded-lg bg-gold/15 px-2.5 py-1.5 text-xs font-medium text-gold-dark">
                    🔔 {r.pickedMeAsDriver.join(", ")} picked you as driver!
                  </p>
                )}
                {r.match.riders.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPickerRequestId(r.commuteRequest.id)}
                    className="mt-2 rounded-full border border-red/30 px-3 py-1 text-xs font-medium text-red transition hover:bg-red/5"
                  >
                    {r.mySelectedDriverRequestId ? "Change driver pick" : "Choose your driver"}
                  </button>
                )}
              </>
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

      {pickerRequest && (
        <DriverPickerModal
          request={pickerRequest}
          onClose={() => setPickerRequestId(null)}
          onPicked={async (selectedRequestId) => {
            if (!pickerRequest.match) return;
            await selectDriver(pickerRequest.match.id, pickerRequest.commuteRequest.id, selectedRequestId);
            await loadDashboard();
          }}
        />
      )}
    </div>
  );
}
