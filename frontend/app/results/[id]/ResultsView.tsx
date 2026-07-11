"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getCommuteRequestResult, type CommuteRequestResult } from "@/lib/api";

const MatchMap = dynamic(() => import("./MatchMap").then((m) => m.MatchMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500">
      Loading map…
    </div>
  ),
});

export function ResultsView({ requestId }: { requestId: string }) {
  const [result, setResult] = useState<CommuteRequestResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCommuteRequestResult(requestId)
      .then(setResult)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load result"));
  }, [requestId]);

  if (error) {
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }

  if (!result) {
    return <p className="text-sm text-gray-500">Loading your result…</p>;
  }

  if (result.status === "matched") {
    const { match } = result;
    const origins = match.riders.map((r) => ({ name: r.name, lat: r.originLat, lng: r.originLng }));
    const destination = match.riders[0]
      ? {
          lat: match.riders[0].destLat,
          lng: match.riders[0].destLng,
          address: match.riders[0].destAddress,
        }
      : null;

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-900">You have a carpool match</h2>
          <ul className="mt-3 space-y-1 text-sm text-green-900">
            {match.riders.map((r) => (
              <li key={r.requestId}>
                <span className="font-medium">{r.name}</span> — {r.originAddress}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-green-900">{match.explanation}</p>
          {match.carbonSavingsKg !== null && (
            <p className="mt-3 text-sm font-medium text-green-800">
              Estimated carbon savings: {match.carbonSavingsKg} kg CO₂
            </p>
          )}
        </div>
        {destination && <MatchMap origins={origins} destination={destination} />}
      </div>
    );
  }

  const { transitSuggestion, commuteRequest } = result;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-lg font-semibold text-blue-900">No carpool match yet</h2>
        <p className="mt-2 text-sm text-blue-900">{transitSuggestion.summary}</p>
        <a
          href={transitSuggestion.plannerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Open VTA trip planner
        </a>
      </div>
      <MatchMap
        origins={[{ name: "You", lat: commuteRequest.originLat, lng: commuteRequest.originLng }]}
        destination={{
          lat: commuteRequest.destLat,
          lng: commuteRequest.destLng,
          address: commuteRequest.destAddress,
        }}
      />
    </div>
  );
}
