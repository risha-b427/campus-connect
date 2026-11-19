import { findSpots, findSpotById, type SpotRow } from "./spots.repository.js";

const spotTypes = [
  "Cafe",
  "Library",
  "University Housing",
  "Restaurant",
  "Outdoor",
  "Lounge",
] as const;

type SpotType = (typeof spotTypes)[number];

type Spot = {
  id: string;
  name: string;
  description: string | null;
  buildingId: string;
  building: string;
  latitude: number;
  longitude: number;
  spotType: SpotType;
  activeCheckInCount: number;
  averageNoise: number | null;
  averageCrowdedness: number | null;
  averageRating: number | null;
  ratingCount: number;
  busyness: Busyness;
};

function isSpotType(value: string): value is SpotType {
  return spotTypes.includes(value as SpotType);
}

type BusynessLevel = "quiet" | "moderate" | "busy" | "full";

type Busyness = {
  level: BusynessLevel | null;
  occupancy: number | null;
  activeCount: number;
};

function toBusynessLevel(occupancy: number): BusynessLevel {
  if (occupancy >= 0.85) return "full";
  if (occupancy >= 0.6) return "busy";
  if (occupancy >= 0.3) return "moderate";
  return "quiet";
}

function toBusyness(count: number, average: number | null): Busyness {
  if (count === 0 || average === null) {
    return { level: null, occupancy: null, activeCount: 0 };
  }
  // The average has one decimal, so this gives exactly two (6.5 -> 0.65)
  const occupancy = Math.round(average * 10) / 100;
  return { level: toBusynessLevel(occupancy), occupancy, activeCount: count };
}

function toSpot(spot: SpotRow): Spot {
  if (!isSpotType(spot.spotType)) {
    throw new Error(`Unexpected spot type returned by database: ${spot.spotType}`);
  }

  const { busynessActiveCount, busynessAverage, ...rest } = spot;

  return {
    ...rest,
    spotType: spot.spotType,
    latitude: Number(spot.latitude),
    longitude: Number(spot.longitude),
    activeCheckInCount: Number(spot.activeCheckInCount),
    averageNoise: spot.averageNoise === null ? null : Number(spot.averageNoise),
    averageCrowdedness:
      spot.averageCrowdedness === null ? null : Number(spot.averageCrowdedness),
    averageRating: spot.averageRating === null ? null : Number(spot.averageRating),
    ratingCount: Number(spot.ratingCount),
    busyness: toBusyness(
      Number(busynessActiveCount ?? 0),
      busynessAverage == null ? null : Number(busynessAverage),
    ),
  };
}

async function getSpots(): Promise<Spot[]> {
  const spots = await findSpots();
  return spots.map(toSpot);
}

async function getSpotById(id: string): Promise<Spot | undefined> {
  const spot = await findSpotById(id);
  return spot === undefined ? undefined : toSpot(spot);
}

export type { Spot };
export { getSpots, getSpotById };
