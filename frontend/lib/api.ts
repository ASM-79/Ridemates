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
    originAddress: string;
    originLat: number;
    originLng: number;
    destAddress: string;
    destLat: number;
    destLng: number;
  };
}

export type CommuteRequestResult = MatchedResult | UnmatchedResult;

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
