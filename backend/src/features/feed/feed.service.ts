import { findFriendCheckIns, type FeedRow } from "./feed.repository.js";

type FeedItem = {
  id: string;
  user: { id: string; name: string };
  spot: { id: string; name: string };
  checkedInAt: string;
  checkedOutAt: string | null;
  isActive: boolean;
};

// How far back the feed looks, and the most items it returns.
const FEED_WINDOW_DAYS = 7;
const FEED_LIMIT = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

// Shown when a friend checked in before creating a profile.
const UNKNOWN_USER_NAME = "Someone";

function toFeedItem(row: FeedRow): FeedItem {
  return {
    id: row.id,
    user: { id: row.userId, name: row.userName ?? UNKNOWN_USER_NAME },
    spot: { id: row.spotId, name: row.spotName },
    checkedInAt: row.checkedInAt.toISOString(),
    checkedOutAt: row.checkedOutAt ? row.checkedOutAt.toISOString() : null,
    isActive: row.checkedOutAt === null,
  };
}

async function getFeed(userId: string, now: Date = new Date()): Promise<FeedItem[]> {
  const since = new Date(now.getTime() - FEED_WINDOW_DAYS * DAY_MS);
  const rows = await findFriendCheckIns(userId, since, FEED_LIMIT);
  return rows.map(toFeedItem);
}

export type { FeedItem };
export { FEED_LIMIT, FEED_WINDOW_DAYS, getFeed };
