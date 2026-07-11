import { Suspense } from "react";
import { VerifyView } from "./VerifyView";

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
          <VerifyView />
        </Suspense>
      </div>
    </main>
  );
}
