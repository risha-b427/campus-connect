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
};

function isSpotType(value: string): value is SpotType {
  return spotTypes.includes(value as SpotType);
}

function toSpot(spot: SpotRow): Spot {
  if (!isSpotType(spot.spotType)) {
    throw new Error(`Unexpected spot type returned by database: ${spot.spotType}`);
  }

  return {
    ...spot,
    spotType: spot.spotType,
    latitude: Number(spot.latitude),
    longitude: Number(spot.longitude),
    activeCheckInCount: Number(spot.activeCheckInCount),
    averageNoise: spot.averageNoise === null ? null : Number(spot.averageNoise),
    averageCrowdedness:
      spot.averageCrowdedness === null ? null : Number(spot.averageCrowdedness),
    averageRating: spot.averageRating === null ? null : Number(spot.averageRating),
    ratingCount: Number(spot.ratingCount),
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
