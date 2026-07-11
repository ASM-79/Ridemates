export interface CreateCommuteRequestInput {
  name: string;
  email: string;
  originAddress: string;
  destAddress: string;
  departureTime: string;
  flexibilityMinutes: number;
}

export interface CommuteRequest {
  id: string;
  user_id: string;
  origin_lat: number;
  origin_lng: number;
  origin_address: string;
  dest_lat: number;
  dest_lng: number;
  dest_address: string;
  departure_time: string;
  flexibility_minutes: number;
  status: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CreateCommuteRequestResponse {
  user: User;
  commuteRequest: CommuteRequest;
}

export interface MatchedRider {
  requestId: string;
  name: string;
  originAddress: string;
  originLat: number;
  originLng: number;
  destAddress: string;
  destLat: number;
  destLng: number;
}

export interface MatchedResult {
  status: "matched";
  match: {
    id: string;
    explanation: string | null;
    carbonSavingsKg: number | null;
    riders: MatchedRider[];
  };
}

export interface TransitSuggestion {
  plannerUrl: string;
  line: string;
  summary: string;
  estimatedDurationMin: number;
}

export interface UnmatchedResult {
  status: "unmatched";
  transitSuggestion: TransitSuggestion;
  commuteRequest: {
    id: string;
    originAddress: string;
    originLat: number;
    originLng: number;
    destAddress: string;
    destLat: number;
    destLng: number;
  };
}

export interface Viewer {
  name: string;
  email: string;
}

export type CommuteRequestResult = (MatchedResult | UnmatchedResult) & { viewer: Viewer | null };

export interface RiderDashboardRequest {
  commuteRequest: CommuteRequest;
  status: "matched" | "pending";
  match?: {
    id: string;
    explanation: string | null;
    carbonSavingsKg: number | null;
    riders: { requestId: string; name: string; originAddress: string }[];
  };
  mySelectedDriverRequestId?: string | null;
  pickedMeAsDriver?: string[];
  transitSuggestion?: TransitSuggestion;
}

export interface RiderDashboard {
  user: User;
  requests: RiderDashboardRequest[];
}

export interface Route {
  id: string;
  driver_user_id: string;
  start_lat: number;
  start_lng: number;
  start_address: string;
  end_lat: number;
  end_lng: number;
  end_address: string;
  schedule: unknown;
  seats_available: number;
  is_online: boolean;
  created_at: string;
}

export interface DriverRouteSummary {
  route: Route;
  isOnline: boolean;
  seatsAvailable: number;
  confirmedCount: number;
  seatsRemaining: number;
  confirmedRiders: { requestId: string; name: string; originAddress: string; destAddress: string }[];
  pendingNearby: {
    requestId: string;
    name: string;
    originAddress: string;
    destAddress: string;
    departureTime: string;
  }[];
}

export interface DriverDashboard {
  driver: User;
  routes: DriverRouteSummary[];
}

export interface ScheduleRouteInput {
  name: string;
  email: string;
  startAddress: string;
  endAddress: string;
  schedule: { days: string[]; time: string };
  seatsAvailable: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getCommuteRequestResult(id: string): Promise<CommuteRequestResult> {
  const res = await fetch(`${API_URL}/commute-requests/${id}/result`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to load result");
  }

  return data as CommuteRequestResult;
}

export async function createCommuteRequest(
  input: CreateCommuteRequestInput
): Promise<CreateCommuteRequestResponse> {
  const res = await fetch(`${API_URL}/commute-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to submit commute request");
  }

  return data as CreateCommuteRequestResponse;
}

export async function getRiderDashboard(email: string): Promise<RiderDashboard> {
  const res = await fetch(`${API_URL}/riders/${encodeURIComponent(email)}/dashboard`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to load rider dashboard");
  }

  return data as RiderDashboard;
}

export async function getDriverDashboard(email: string): Promise<DriverDashboard> {
  const res = await fetch(`${API_URL}/drivers/${encodeURIComponent(email)}/dashboard`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to load driver dashboard");
  }

  return data as DriverDashboard;
}

export async function scheduleRoute(
  input: ScheduleRouteInput
): Promise<{ driver: User; route: Route }> {
  const res = await fetch(`${API_URL}/routes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to schedule route");
  }

  return data;
}

export async function confirmPickup(
  routeId: string,
  requestId: string
): Promise<{ match: unknown }> {
  const res = await fetch(`${API_URL}/routes/${routeId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to confirm pickup");
  }

  return data;
}

export async function setRouteOnline(routeId: string, online: boolean): Promise<{ route: Route }> {
  const res = await fetch(`${API_URL}/routes/${routeId}/online`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ online }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to update online status");
  }

  return data;
}

export async function selectDriver(
  matchId: string,
  selectorRequestId: string,
  selectedRequestId: string
): Promise<void> {
  const res = await fetch(`${API_URL}/matches/${matchId}/select-driver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selectorRequestId, selectedRequestId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to select driver");
  }
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export async function signup(input: SignupInput): Promise<{ user: User }> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to sign up");
  }

  return data;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<{ user: User }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to log in");
  }

  return data;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}
