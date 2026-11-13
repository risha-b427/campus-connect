import type { Spot, SpotType } from "./api";
import { getNoiseLevel, type NoiseLevel } from "./noise";

export const SPOT_TYPES: SpotType[] = [
  "Library",
  "Cafe",
  "Lounge",
  "University Housing",
  "Restaurant",
  "Outdoor",
];

// null means "All" (no filter).
export type SpotFilterValues = {
  type: SpotType | null;
  noise: NoiseLevel | null;
  // true sorts closest first ("Near you"); false keeps A–Z order.
  nearYou: boolean;
};

export const NO_FILTERS: SpotFilterValues = { type: null, noise: null, nearYou: false };

// Keep a spot only if it matches every filter that is turned on.
export function filterSpots(spots: Spot[], filters: SpotFilterValues): Spot[] {
  return spots.filter(
    (spot) =>
      (filters.type === null || spot.spotType === filters.type) &&
      (filters.noise === null || getNoiseLevel(spot) === filters.noise),
  );
}
