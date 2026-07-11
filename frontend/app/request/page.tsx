import { CommuteRequestForm } from "./CommuteRequestForm";

export default function RequestPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Submit your commute</h1>
      <p className="mt-2 text-sm text-gray-600">
        Tell us your commute details and we&apos;ll match you with carpool riders or the
        best VTA route.
      </p>
      <div className="mt-8">
        <CommuteRequestForm />
      </div>
    </main>
  );
}
