import { supabase } from "@/shared/lib/supabase";

// Defaults to the local backend, which works when testing in the web browser.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

// Shape of GET /api/spots (see backend/docs/routes/spots.md)
export type ApiSpot = {
  id: string;
  name: string;
  description: string | null;
  buildingId: string;
  building: string;
  latitude: number;
  longitude: number;
  spotType: string;
  activeCheckInCount: number;
  averageNoise: number | null;
  averageCrowdedness: number | null;
  averageRating: number | null;
  ratingCount: number;
};

// Shape of the check-in endpoints (see backend/docs/routes/check-ins.md)
export type ApiCheckIn = {
  id: string;
  userId: string;
  userName: string;
  spotId: string;
  note: string | null;
  busyness: number;
  noise: number;
  startedAt: string;
  endedAt: string | null;
};

// Sends a request with the logged-in user's token and returns the JSON.
// Throws an Error whose message comes from the backend when something fails.
async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("You are not logged in");
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const error = await response.json();
      if (typeof error.message === "string") message = error.message;
    } catch {
      // The response wasn't JSON, so keep the generic message.
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getSpots() {
  return request<ApiSpot[]>("/api/spots");
}

export function getActiveCheckIns() {
  return request<ApiCheckIn[]>("/api/check-ins/active");
}

export function createCheckIn(
  spotId: string,
  note: string,
  busyness: number,
  noise: number,
) {
  return request<ApiCheckIn>("/api/check-ins", {
    method: "POST",
    body: { spotId, note: note || undefined, busyness, noise },
  });
}

export function endCheckIn(
  checkInId: string,
  busyness: number,
  noise: number,
  rating?: number,
) {
  return request<ApiCheckIn>(`/api/check-ins/${checkInId}/checkout`, {
    method: "PATCH",
    body: { busyness, noise, rating },
  });
}