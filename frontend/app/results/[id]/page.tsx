import { ResultsView } from "./ResultsView";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Your commute match</h1>
      <div className="mt-8">
        <ResultsView requestId={id} />
      </div>
    </main>
  );
}
