export interface SavedRide {
  id: string;
  originAddress: string;
  destAddress: string;
  savedAt: string;
}

const STORAGE_KEY = "ridemates_saved_rides";

export function getSavedRides(): SavedRide[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedRide[]) : [];
  } catch {
    return [];
  }
}

export function saveRide(originAddress: string, destAddress: string): SavedRide[] {
  const rides = getSavedRides();
  const alreadySaved = rides.some(
    (r) => r.originAddress === originAddress && r.destAddress === destAddress
  );
  if (alreadySaved) return rides;

  const next: SavedRide[] = [
    { id: crypto.randomUUID(), originAddress, destAddress, savedAt: new Date().toISOString() },
    ...rides,
  ];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeSavedRide(id: string): SavedRide[] {
  const next = getSavedRides().filter((r) => r.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
