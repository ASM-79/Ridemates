import { SettingsView } from "./SettingsView";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <div className="mt-8">
        <SettingsView />
      </div>
    </main>
  );
}
