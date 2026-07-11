"use client";

import dynamic from "next/dynamic";
import type { Viewer } from "@/lib/api";
import { SidePanel } from "@/components/dashboard/SidePanel";
import { DE_ANZA_COLLEGE } from "@/lib/constants";

const MatchMap = dynamic(() => import("@/components/dashboard/MatchMap").then((m) => m.MatchMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-red/5 text-sm text-slate-500">
      Loading map…
    </div>
  ),
});

export function DashboardHome({ viewer }: { viewer: Viewer }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <SidePanel viewer={viewer} />
      <div className="relative h-full flex-1">
        <MatchMap origins={[]} destination={DE_ANZA_COLLEGE} />
      </div>
    </div>
  );
}
