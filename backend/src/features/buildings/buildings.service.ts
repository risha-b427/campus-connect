import { findAllBuildings } from "./buildings.repository.js";

type Building = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

async function getAllBuildings(): Promise<Building[]> {
  const buildings = await findAllBuildings();

  return buildings.map((building) => ({
    ...building,
    latitude: Number(building.latitude),
    longitude: Number(building.longitude),
  }));
}

export type { Building };
export { getAllBuildings };
