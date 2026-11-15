import { db } from "../../services/db.js";

type CheckInRow = {
  id: string;
  spotId: string;
  spotName: string;
  checkedInAt: Date;
  checkedOutAt: Date | null;
  busyness: number;
  noise: number;
};

// Shared column list so every query returns the same row shape.
// `c` is a check-in row and `s` is its spot.
const checkInColumns = `
  c.id,
  c.spot_id AS "spotId",
  s.name AS "spotName",
  c.check_in_time AS "checkedInAt",
  c.check_out_time AS "checkedOutAt",
  c.crowd_level AS busyness,
  c.noise_level AS noise
`;

async function spotExists(spotId: string): Promise<boolean> {
  const result = await db.query("SELECT 1 FROM public.spots WHERE id = $1", [spotId]);
  return (result.rowCount ?? 0) > 0;
}

async function hasActiveCheckIn(userId: string): Promise<boolean> {
  const result = await db.query(
    "SELECT 1 FROM public.check_ins WHERE user_id = $1 AND check_out_time IS NULL LIMIT 1",
    [userId],
  );
  return (result.rowCount ?? 0) > 0;
}

async function insertCheckIn(
  userId: string,
  spotId: string,
  busyness: number,
  noise: number,
): Promise<CheckInRow> {
  const result = await db.query<CheckInRow>(
    `
    WITH c AS (
      INSERT INTO public.check_ins (user_id, spot_id, crowd_level, noise_level)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    )
    SELECT ${checkInColumns}
    FROM c
    INNER JOIN public.spots AS s ON s.id = c.spot_id
  `,
    [userId, spotId, busyness, noise],
  );

  return result.rows[0];
}

// Only updates a check-in that belongs to the user and is still active.
// Scores that aren't sent (null) keep their check-in values.
// Returns undefined when no row matched.
async function checkOutCheckIn(
  checkInId: string,
  userId: string,
  busyness: number | null,
  noise: number | null,
): Promise<CheckInRow | undefined> {
  const result = await db.query<CheckInRow>(
    `
    WITH c AS (
      UPDATE public.check_ins
      SET
        crowd_level = COALESCE($3, crowd_level),
        noise_level = COALESCE($4, noise_level),
        check_out_time = NOW()
      WHERE id = $1 AND user_id = $2 AND check_out_time IS NULL
      RETURNING *
    )
    SELECT ${checkInColumns}
    FROM c
    INNER JOIN public.spots AS s ON s.id = c.spot_id
  `,
    [checkInId, userId, busyness, noise],
  );

  return result.rows[0];
}

async function findUserCheckIn(
  checkInId: string,
  userId: string,
): Promise<CheckInRow | undefined> {
  const result = await db.query<CheckInRow>(
    `
    SELECT ${checkInColumns}
    FROM public.check_ins AS c
    INNER JOIN public.spots AS s ON s.id = c.spot_id
    WHERE c.id = $1 AND c.user_id = $2
  `,
    [checkInId, userId],
  );

  return result.rows[0];
}

async function findUserCheckIns(userId: string): Promise<CheckInRow[]> {
  const result = await db.query<CheckInRow>(
    `
    SELECT ${checkInColumns}
    FROM public.check_ins AS c
    INNER JOIN public.spots AS s ON s.id = c.spot_id
    WHERE c.user_id = $1
    ORDER BY c.check_in_time DESC, c.id DESC
  `,
    [userId],
  );

  return result.rows;
}

export type { CheckInRow };
export {
  checkOutCheckIn,
  findUserCheckIn,
  findUserCheckIns,
  hasActiveCheckIn,
  insertCheckIn,
  spotExists,
};
