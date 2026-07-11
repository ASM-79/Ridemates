import { RideHistoryView } from "./RideHistoryView";

export default function RidesPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Ride history</h1>
      <div className="mt-8">
        <RideHistoryView />
      </div>
    </main>
  );
}
