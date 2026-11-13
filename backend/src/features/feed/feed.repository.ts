import { db } from "../../services/db.js";

type FeedRow = {
  id: string;
  userId: string;
  userName: string | null;
  spotId: string;
  spotName: string;
  checkedInAt: Date;
  checkedOutAt: Date | null;
};

// Recent check-ins by the user's connections, newest first.
//
// `connections` stores each pair once with user_1 < user_2, so the user can be
// in either column; the friend is whichever side isn't them.
// `users` is a LEFT JOIN because a check-in can exist before a profile does.
async function findFriendCheckIns(
  userId: string,
  since: Date,
  limit: number,
): Promise<FeedRow[]> {
  const result = await db.query<FeedRow>(
    `
    SELECT
      c.id,
      c.user_id AS "userId",
      u.display_name AS "userName",
      c.spot_id AS "spotId",
      s.name AS "spotName",
      c.check_in_time AS "checkedInAt",
      c.check_out_time AS "checkedOutAt"
    FROM public.connections AS f
    INNER JOIN public.check_ins AS c
      ON c.user_id = CASE WHEN f.user_1 = $1 THEN f.user_2 ELSE f.user_1 END
    INNER JOIN public.spots AS s ON s.id = c.spot_id
    LEFT JOIN public.users AS u ON u.user_id = c.user_id
    WHERE (f.user_1 = $1 OR f.user_2 = $1)
      AND c.check_in_time >= $2
    ORDER BY c.check_in_time DESC, c.id DESC
    LIMIT $3
  `,
    [userId, since, limit],
  );

  return result.rows;
}

export type { FeedRow };
export { findFriendCheckIns };
