import type { Coordinates } from "@/shared/data/mockStudySpots";

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

// Straight-line ("as the crow flies") distance using the haversine formula.
export function distanceInMiles(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

// Returns a new list, closest first. Works for anything with a latitude and
// longitude (spots, buildings, ...). The original list isn't changed.
export function sortByDistance<T extends Coordinates>(items: T[], userLocation: Coordinates): T[] {
  return items
    .map((item) => ({ item, miles: distanceInMiles(userLocation, item) }))
    .sort((a, b) => a.miles - b.miles)
    .map(({ item }) => item);
}

export function formatMiles(miles: number): string {
  return `${miles.toFixed(1)} mi`;
}
