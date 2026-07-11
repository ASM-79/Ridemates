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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
