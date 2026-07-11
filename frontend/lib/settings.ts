export interface Settings {
  emailNotifications: boolean;
  defaultFlexibilityMinutes: number;
}

const STORAGE_KEY = "ridemates_settings";

const DEFAULT_SETTINGS: Settings = {
  emailNotifications: true,
  defaultFlexibilityMinutes: 15,
};

export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
