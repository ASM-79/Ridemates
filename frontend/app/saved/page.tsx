import { SavedRidesView } from "./SavedRidesView";

export default function SavedPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Saved rides</h1>
      <div className="mt-8">
        <SavedRidesView />
      </div>
    </main>
  );
}
