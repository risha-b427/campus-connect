import { db } from "../../services/db.js";

type BuildingRow = {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
};

async function findAllBuildings(): Promise<BuildingRow[]> {
  const result = await db.query<BuildingRow>(`
    SELECT
      id,
      name,
      latitude,
      longitude
    FROM public.buildings
    ORDER BY name ASC, id ASC
  `);

  return result.rows;
}

export { findAllBuildings };
