import { findSpots } from "./spots.repository.js";

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
};

function isSpotType(value: string): value is SpotType {
  return spotTypes.includes(value as SpotType);
}

async function getSpots(spotType?: SpotType): Promise<Spot[]> {
  const spots = await findSpots(spotType);

  return spots.map((spot) => {
    if (!isSpotType(spot.spotType)) {
      throw new Error(`Unexpected spot type returned by database: ${spot.spotType}`);
    }

    return {
      ...spot,
      spotType: spot.spotType,
      latitude: Number(spot.latitude),
      longitude: Number(spot.longitude),
    };
  });
}

export type { Spot };
export { getSpots, isSpotType };