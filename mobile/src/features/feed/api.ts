import { apiGet } from "@/shared/lib/api";

// One item from GET /api/feed (see backend/docs/routes/feed.md).
export type FeedItem = {
  id: string;
  user: { id: string; name: string };
  spot: { id: string; name: string };
  checkedInAt: string;
  checkedOutAt: string | null;
  isActive: boolean;
};

export function fetchFeed(accessToken: string): Promise<FeedItem[]> {
  return apiGet<FeedItem[]>("/api/feed", accessToken);
}
