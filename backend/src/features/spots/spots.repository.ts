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
  activeCheckInCount: string;
  averageNoise: string | null;
  averageCrowdedness: string | null;
  averageRating: string | null;
  ratingCount: string;
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
      s.spot_type AS "spotType",
      COALESCE(activity.active_count, 0) AS "activeCheckInCount",
      activity.average_noise AS "averageNoise",
      activity.average_crowdedness AS "averageCrowdedness",
      ratings.average_rating AS "averageRating",
      COALESCE(ratings.rating_count, 0) AS "ratingCount"
    FROM public.spots AS s
    INNER JOIN public.buildings AS b ON b.id = s.building_id
    LEFT JOIN (
      SELECT spot_id, COUNT(*) AS active_count,
        ROUND(AVG(noise_level), 1) AS average_noise,
        ROUND(AVG(crowd_level), 1) AS average_crowdedness
      FROM public.check_ins
      WHERE check_out_time IS NULL
      GROUP BY spot_id
    ) AS activity ON activity.spot_id = s.id
    LEFT JOIN (
      SELECT spot_id, COUNT(*) AS rating_count,
        ROUND(AVG(rating), 1) AS average_rating
      FROM public.ratings
      GROUP BY spot_id
    ) AS ratings ON ratings.spot_id = s.id
    ${filters}
    ORDER BY s.name ASC, s.id ASC
  `,
    values,
  );

  return result.rows;
}

export { findSpots };
