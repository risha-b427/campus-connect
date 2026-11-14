import { db } from "../../services/db.js";

type CheckInRow = {
  id: string;
  userId: string;
  userName: string | null;
  spotId: string;
  note: string | null;
  busyness: number;
  noise: number;
  startedAt: Date;
  endedAt: Date | null;
};

// Shared column list, renamed to the names the app uses
const columns = `
  c.id,
  c.user_id AS "userId",
  u.display_name AS "userName",
  c.spot_id AS "spotId",
  c.note,
  c.crowd_level AS busyness,
  c.noise_level AS noise,
  c.check_in_time AS "startedAt",
  c.check_out_time AS "endedAt"
`;

async function insertCheckIn(
  userId: string,
  spotId: string,
  note: string | null,
  busyness: number,
  noise: number,
): Promise<CheckInRow> {
  const result = await db.query<CheckInRow>(
    `
    WITH inserted AS (
      INSERT INTO public.check_ins (user_id, spot_id, note, crowd_level, noise_level)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    )
    SELECT ${columns}
    FROM inserted AS c
    LEFT JOIN public.users AS u ON u.user_id = c.user_id
  `,
    [userId, spotId, note, busyness, noise],
  );
  return result.rows[0];
}

// Returns null if the check-in isn't yours or is already ended
async function endCheckIn(
  checkInId: string,
  userId: string,
  busyness: number,
  noise: number,
  rating?: number,
): Promise<CheckInRow | null> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query<CheckInRow>(
      `
      WITH updated AS (
        UPDATE public.check_ins
        SET check_out_time = NOW(), crowd_level = $3, noise_level = $4
        WHERE id = $1 AND user_id = $2 AND check_out_time IS NULL
        RETURNING *
      )
      SELECT ${columns}
      FROM updated AS c
      LEFT JOIN public.users AS u ON u.user_id = c.user_id
    `,
      [checkInId, userId, busyness, noise],
    );

    const row = result.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return null;
    }

    if (rating !== undefined) {
      await client.query(
        `
        INSERT INTO public.ratings (user_id, spot_id, rating)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, spot_id)
        DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
      `,
        [userId, row.spotId, rating],
      );
    }

    await client.query("COMMIT");
    return row;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function findActiveCheckIns(): Promise<CheckInRow[]> {
  const result = await db.query<CheckInRow>(`
    SELECT ${columns}
    FROM public.check_ins AS c
    LEFT JOIN public.users AS u ON u.user_id = c.user_id
    WHERE c.check_out_time IS NULL
    ORDER BY c.check_in_time DESC, c.id DESC
  `);
  return result.rows;
}

export { insertCheckIn, endCheckIn, findActiveCheckIns };