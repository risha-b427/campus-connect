import { apiGet } from "@/shared/lib/api";

export type SpotType =
  | "Cafe"
  | "Library"
  | "University Housing"
  | "Restaurant"
  | "Outdoor"
  | "Lounge";

// One item from GET /api/spots (see backend/docs/routes/spots.md).
export type Spot = {
  id: string;
  name: string;
  description: string | null;
  buildingId: string;
  building: string;
  latitude: number;
  longitude: number;
  spotType: SpotType;
  // People checked in right now (checked in, not checked out yet).
  activeCheckInCount: number;
  // 1–10 averages from people checked in right now; null when nobody is.
  averageNoise: number | null;
  averageCrowdedness: number | null;
  // 1–5 average of all ratings; null when there are none.
  averageRating: number | null;
  ratingCount: number;
};

export function fetchSpots(accessToken: string): Promise<Spot[]> {
  return apiGet<Spot[]>("/api/spots", accessToken);
}
