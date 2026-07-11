import { ResultsView } from "./ResultsView";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <ResultsView requestId={id} />
    </main>
  );
}
