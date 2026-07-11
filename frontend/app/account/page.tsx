import { AccountView } from "./AccountView";

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Account</h1>
      <div className="mt-8">
        <AccountView />
      </div>
    </main>
  );
}
