import request from "supertest";
import { jest } from "@jest/globals";
import {
  accessToken,
  app,
  db,
  mockAuthenticatedUser,
} from "../../support/api-test-setup.js";

const signedInUserId = "00000000-0000-4000-8000-000000000000";
const friendId = "00000000-0000-4000-8000-000000000001";
const spot = { id: "22222222-2222-4222-8222-222222222221", name: "Grainger Library First Floor" };

// Rows as the database returns them: newest first, timestamps as Dates.
const rows = [
  {
    id: "33333333-3333-4333-8333-000000000002",
    userId: friendId,
    userName: "Alex Kim",
    spotId: spot.id,
    spotName: spot.name,
    checkedInAt: new Date("2026-11-13T15:00:00Z"),
    checkedOutAt: null,
  },
  {
    id: "33333333-3333-4333-8333-000000000001",
    userId: friendId,
    userName: "Alex Kim",
    spotId: spot.id,
    spotName: spot.name,
    checkedInAt: new Date("2026-11-12T09:00:00Z"),
    checkedOutAt: new Date("2026-11-12T11:30:00Z"),
  },
];

function getFeed() {
  return request(app).get("/api/feed").set("Authorization", `Bearer ${accessToken}`);
}

beforeAll(() => {
  mockAuthenticatedUser();
});

beforeEach(() => {
  jest.spyOn(db, "query").mockResolvedValue({ rows } as never);
});

afterEach(() => {
  jest.spyOn(db, "query").mockRestore();
});

test("GET /api/feed returns friends' check-ins newest first, with names", async () => {
  const response = await getFeed();

  expect(response.status).toBe(200);
  expect(response.body).toEqual([
    {
      id: rows[0].id,
      user: { id: friendId, name: "Alex Kim" },
      spot,
      checkedInAt: "2026-11-13T15:00:00.000Z",
      checkedOutAt: null,
      isActive: true,
    },
    {
      id: rows[1].id,
      user: { id: friendId, name: "Alex Kim" },
      spot,
      checkedInAt: "2026-11-12T09:00:00.000Z",
      checkedOutAt: "2026-11-12T11:30:00.000Z",
      isActive: false,
    },
  ]);
});

test("GET /api/feed looks up the signed-in user's connections for the last 7 days", async () => {
  const querySpy = jest.spyOn(db, "query");
  const before = Date.now();

  await getFeed();

  const [sql, params] = querySpy.mock.calls[0] as unknown as [string, [string, Date, number]];
  const [userId, since, limit] = params;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(sql).toContain("FROM public.connections");
  // The user can be stored in either column of a connection.
  expect(sql).toContain("f.user_1 = $1 OR f.user_2 = $1");
  expect(sql).toContain("ORDER BY c.check_in_time DESC");
  expect(userId).toBe(signedInUserId);
  expect(before - since.getTime()).toBeGreaterThanOrEqual(sevenDaysMs - 1000);
  expect(before - since.getTime()).toBeLessThanOrEqual(sevenDaysMs + 1000);
  expect(limit).toBe(50);
});

test("GET /api/feed shows 'Someone' for a friend without a profile", async () => {
  jest
    .spyOn(db, "query")
    .mockResolvedValue({ rows: [{ ...rows[0], userName: null }] } as never);

  const response = await getFeed();

  expect(response.body[0].user.name).toBe("Someone");
});

test("GET /api/feed returns an empty array when friends have no recent check-ins", async () => {
  jest.spyOn(db, "query").mockResolvedValue({ rows: [] } as never);

  const response = await getFeed();

  expect(response.status).toBe(200);
  expect(response.body).toEqual([]);
});

test("GET /api/feed is never cached, so a refresh always gets new check-ins", async () => {
  const response = await getFeed();

  expect(response.headers["cache-control"]).toBe("no-store");
});

test("GET /api/feed without a token returns 401", async () => {
  const response = await request(app).get("/api/feed");

  expect(response.status).toBe(401);
  expect(db.query).not.toHaveBeenCalled();
});
