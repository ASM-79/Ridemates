"use client";

import { useEffect, useState } from "react";
import { getSettings, saveSettings, type Settings } from "@/lib/settings";

export function SettingsView() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function update(next: Partial<Settings>) {
    if (!settings) return;
    const updated = { ...settings, ...next };
    setSettings(updated);
    saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!settings) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-medium text-slate-900">Email notifications</p>
          <p className="text-xs text-slate-500">Get notified when you're matched with a carpool.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.emailNotifications}
          onClick={() => update({ emailNotifications: !settings.emailNotifications })}
          className={`h-6 w-11 shrink-0 rounded-full transition ${
            settings.emailNotifications ? "bg-red" : "bg-slate-300"
          }`}
        >
          <span
            className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
              settings.emailNotifications ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <label htmlFor="flex" className="text-sm font-medium text-slate-900">
          Default flexibility window (minutes)
        </label>
        <p className="text-xs text-slate-500">Pre-fills new ride requests.</p>
        <input
          id="flex"
          type="number"
          min={0}
          step={5}
          value={settings.defaultFlexibilityMinutes}
          onChange={(e) => update({ defaultFlexibilityMinutes: Number(e.target.value) })}
          className="mt-2 w-24 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-red focus:outline-none"
        />
      </div>

      {saved && <p className="text-xs text-gold-dark">Saved</p>}
    </div>
  );
}
