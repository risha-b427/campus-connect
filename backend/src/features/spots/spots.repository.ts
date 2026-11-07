import { db } from "../../services/db.js";

type SpotRow = {
  id: string;
  name: string;
  description: string | null;
  buildingId: string;
  building: string;
  latitude: string;
  longitude: string;
  spotType: string;
};

async function findSpots(spotType?: string): Promise<SpotRow[]> {
  const values: string[] = [];
  const filters = spotType
    ? (() => {
        values.push(spotType);
        return "WHERE s.spot_type = $1";
      })()
    : "";

  const result = await db.query<SpotRow>(
    `
    SELECT
      s.id,
      s.name,
      s.description,
      s.building_id AS "buildingId",
      b.name AS building,
      s.latitude,
      s.longitude,
      s.spot_type AS "spotType"
    FROM public.spots AS s
    INNER JOIN public.buildings AS b ON b.id = s.building_id
    ${filters}
    ORDER BY s.name ASC, s.id ASC
  `,
    values,
  );

  return result.rows;
}

export { findSpots };