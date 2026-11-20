import type { ApiSpot } from "../../../shared/lib/api";
import { BUSYNESS_LABELS, getBusynessLevel } from "../../../shared/utils/busyness";

// Hours and pricing are not yet supplied by the spots API.
export type SpotDetails = ApiSpot & { hours?: string | null; isFree?: boolean | null; area?: string | null };

export const BUSYNESS_COLORS = {
  quiet: "#15803D", moderate: "#EAB308", busy: "#DC2626", full: "#DC2626",
};
export const UNKNOWN_COLOR = "#64748B";

export function spotStatus(spot: Pick<ApiSpot, "busyness">) {
  const occupancy = spot.busyness?.occupancy;
  if (occupancy == null || !Number.isFinite(occupancy)) {
    return { color: UNKNOWN_COLOR, label: "No recent reports" };
  }
  const level = getBusynessLevel(occupancy);
  return { color: BUSYNESS_COLORS[level], label: BUSYNESS_LABELS[level] };
}

export function hasCoordinates(spot: ApiSpot) {
  return Number.isFinite(spot.latitude) && Number.isFinite(spot.longitude)
    && Math.abs(spot.latitude) <= 90 && Math.abs(spot.longitude) <= 180;
}
