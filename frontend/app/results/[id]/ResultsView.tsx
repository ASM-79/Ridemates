"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getCommuteRequestResult, type CommuteRequestResult } from "@/lib/api";
import { SidePanel } from "./SidePanel";

const MatchMap = dynamic(() => import("./MatchMap").then((m) => m.MatchMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-dark-green/5 text-sm text-foreground/60">
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
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-foreground/60">Loading your result…</p>
      </div>
    );
  }

  const origins =
    result.status === "matched"
      ? result.match.riders.map((r) => ({ name: r.name, lat: r.originLat, lng: r.originLng }))
      : [
          {
            name: result.viewer?.name ?? "You",
            lat: result.commuteRequest.originLat,
            lng: result.commuteRequest.originLng,
          },
        ];

  const destination =
    result.status === "matched"
      ? result.match.riders[0]
        ? {
            lat: result.match.riders[0].destLat,
            lng: result.match.riders[0].destLng,
            address: result.match.riders[0].destAddress,
          }
        : null
      : {
          lat: result.commuteRequest.destLat,
          lng: result.commuteRequest.destLng,
          address: result.commuteRequest.destAddress,
        };

  return (
    <div className="relative h-full w-full">
      {destination && <MatchMap origins={origins} destination={destination} />}
      <SidePanel result={result} />
    </div>
  );
}
