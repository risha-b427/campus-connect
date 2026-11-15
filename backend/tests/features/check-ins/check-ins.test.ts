import request from "supertest";
import { jest } from "@jest/globals";
import {
  accessToken,
  app,
  db,
  mockAuthenticatedUser,
  testUserId,
} from "../../support/api-test-setup.js";

const otherUserId = "00000000-0000-4000-8000-000000000001";
const spot = { id: "22222222-2222-4222-8222-222222222221", name: "Grainger Library First Floor" };
const missingSpotId = "22222222-2222-4222-8222-999999999999";
const missingCheckInId = "33333333-3333-4333-8333-999999999999";
const scores = { busyness: 6, noise: 3 };

type StoredCheckIn = {
  id: string;
  userId: string;
  spotId: string;
  checkedInAt: Date;
  checkedOutAt: Date | null;
  busyness: number;
  noise: number;
};

// A small in-memory stand-in for the check_ins table. It answers each query
// the repository sends and follows the same rules as the shared database:
// scores are required on insert, and there is no unique index on active
// check-ins (unless a test turns `uniqueActiveIndex` on).
let rows: StoredCheckIn[];
let clock: number;
let uniqueActiveIndex: boolean;

function toRow(checkIn: StoredCheckIn) {
  const { userId: _userId, ...row } = checkIn;
  return { ...row, spotName: spot.name };
}

function fakeQuery(sql: string, params: unknown[] = []) {
  if (sql.includes("FROM public.spots WHERE id = $1")) {
    const found = params[0] === spot.id;
    return { rows: found ? [{}] : [], rowCount: found ? 1 : 0 };
  }

  if (sql.includes("WHERE user_id = $1 AND check_out_time IS NULL")) {
    const active = rows.filter((row) => row.userId === params[0] && row.checkedOutAt === null);
    return { rows: active.map(() => ({})), rowCount: active.length };
  }

  if (sql.includes("INSERT INTO public.check_ins")) {
    const [userId, spotId, busyness, noise] = params as [string, string, number, number];
    if (uniqueActiveIndex && rows.some((row) => row.userId === userId && !row.checkedOutAt)) {
      throw Object.assign(new Error("duplicate key"), { code: "23505" });
    }
    const created: StoredCheckIn = {
      id: `33333333-3333-4333-8333-${String(rows.length + 1).padStart(12, "0")}`,
      userId,
      spotId,
      checkedInAt: new Date((clock += 60_000)),
      checkedOutAt: null,
      busyness,
      noise,
    };
    rows.push(created);
    return { rows: [toRow(created)] };
  }

  if (sql.includes("UPDATE public.check_ins")) {
    const [id, userId, busyness, noise] = params as [string, string, number | null, number | null];
    const match = rows.find(
      (row) => row.id === id && row.userId === userId && row.checkedOutAt === null,
    );
    if (!match) return { rows: [] };
    // COALESCE: a null score keeps the existing value.
    match.busyness = busyness ?? match.busyness;
    match.noise = noise ?? match.noise;
    match.checkedOutAt = new Date((clock += 60_000));
    return { rows: [toRow(match)] };
  }

  if (sql.includes("WHERE c.id = $1 AND c.user_id = $2")) {
    const [id, userId] = params;
    return { rows: rows.filter((row) => row.id === id && row.userId === userId).map(toRow) };
  }

  if (sql.includes("WHERE c.user_id = $1")) {
    return {
      rows: rows
        .filter((row) => row.userId === params[0])
        .sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime())
        .map(toRow),
    };
  }

  throw new Error(`Unexpected query: ${sql}`);
}

function api() {
  const auth = (req: request.Test) => req.set("Authorization", `Bearer ${accessToken}`);
  return {
    checkIn: (body: object) => auth(request(app).post("/api/check-ins")).send(body),
    checkOut: (id: string, body: object = {}) =>
      auth(request(app).patch(`/api/check-ins/${id}/check-out`)).send(body),
    history: () => auth(request(app).get("/api/check-ins/me")),
  };
}

beforeEach(() => {
  rows = [];
  clock = Date.parse("2026-11-07T14:00:00Z");
  uniqueActiveIndex = false;
  mockAuthenticatedUser();
  jest
    .spyOn(db, "query")
    .mockImplementation(((sql: string, params?: unknown[]) =>
      Promise.resolve(fakeQuery(sql, params))) as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("a user can check in, check out, and see the visit in their history", async () => {
  const checkIn = await api().checkIn({ spotId: spot.id, ...scores });

  expect(checkIn.status).toBe(201);
  expect(checkIn.body).toEqual({
    id: expect.any(String),
    spot,
    checkedInAt: "2026-11-07T14:01:00.000Z",
    checkedOutAt: null,
    busyness: 6,
    noise: 3,
    isActive: true,
  });

  const checkOut = await api().checkOut(checkIn.body.id, { busyness: 8, noise: 2 });

  expect(checkOut.status).toBe(200);
  expect(checkOut.body).toEqual({
    ...checkIn.body,
    checkedOutAt: "2026-11-07T14:02:00.000Z",
    busyness: 8,
    noise: 2,
    isActive: false,
  });

  const history = await api().history();

  expect(history.status).toBe(200);
  expect(history.body).toEqual([checkOut.body]);
});

test("checking out without scores keeps the scores from check-in", async () => {
  const checkIn = await api().checkIn({ spotId: spot.id, ...scores });

  const checkOut = await api().checkOut(checkIn.body.id);

  expect(checkOut.status).toBe(200);
  expect(checkOut.body).toMatchObject({ busyness: 6, noise: 3, isActive: false });
});

test("checking out can update just one score", async () => {
  const checkIn = await api().checkIn({ spotId: spot.id, ...scores });

  const checkOut = await api().checkOut(checkIn.body.id, { noise: 9 });

  expect(checkOut.body).toMatchObject({ busyness: 6, noise: 9 });
});

test("the check-in is saved for the signed-in user, not one sent by the client", async () => {
  await api().checkIn({ spotId: spot.id, ...scores, userId: otherUserId });

  expect(rows[0].userId).toBe(testUserId);
});

test("history is newest first", async () => {
  const first = await api().checkIn({ spotId: spot.id, ...scores });
  await api().checkOut(first.body.id);
  const second = await api().checkIn({ spotId: spot.id, ...scores });

  const history = await api().history();

  expect(history.body.map((item: { id: string }) => item.id)).toEqual([
    second.body.id,
    first.body.id,
  ]);
});

test("history is an empty array when the user has no check-ins", async () => {
  const history = await api().history();

  expect(history.status).toBe(200);
  expect(history.body).toEqual([]);
});

test("a second active check-in is rejected with 409", async () => {
  await api().checkIn({ spotId: spot.id, ...scores });
  const second = await api().checkIn({ spotId: spot.id, ...scores });

  expect(second.status).toBe(409);
  expect(rows).toHaveLength(1);
});

test("a user can check in again after checking out", async () => {
  const first = await api().checkIn({ spotId: spot.id, ...scores });
  await api().checkOut(first.body.id);

  const second = await api().checkIn({ spotId: spot.id, ...scores });

  expect(second.status).toBe(201);
});

test("a duplicate caught by a database unique index is also a 409", async () => {
  uniqueActiveIndex = true;
  await api().checkIn({ spotId: spot.id, ...scores });
  // Simulate two requests at once: the active check misses the first check-in.
  const querySpy = jest.spyOn(db, "query");
  querySpy.mockImplementation(((sql: string, params?: unknown[]) =>
    Promise.resolve(
      sql.includes("check_out_time IS NULL LIMIT 1") ? { rows: [], rowCount: 0 } : fakeQuery(sql, params),
    )) as never);

  const second = await api().checkIn({ spotId: spot.id, ...scores });

  expect(second.status).toBe(409);
  expect(rows).toHaveLength(1);
});

test("a user cannot check out another user's check-in or see it in their history", async () => {
  const theirs = await api().checkIn({ spotId: spot.id, ...scores });

  mockAuthenticatedUser(otherUserId);
  const checkOut = await api().checkOut(theirs.body.id, scores);
  const history = await api().history();

  expect(checkOut.status).toBe(404);
  expect(rows[0].checkedOutAt).toBeNull();
  expect(history.body).toEqual([]);
});

test("checking out a check-in that doesn't exist returns 404", async () => {
  const response = await api().checkOut(missingCheckInId, scores);

  expect(response.status).toBe(404);
});

test("checking out an already completed check-in returns 400", async () => {
  const checkIn = await api().checkIn({ spotId: spot.id, ...scores });
  await api().checkOut(checkIn.body.id);

  const again = await api().checkOut(checkIn.body.id, { busyness: 2, noise: 2 });

  expect(again.status).toBe(400);
  expect(rows[0].busyness).toBe(6);
});

const badScores = [
  { busyness: 0, noise: 3 },
  { busyness: 11, noise: 3 },
  { busyness: 5.5, noise: 3 },
  { busyness: 6, noise: -1 },
  { busyness: "6", noise: 3 },
  { busyness: null, noise: 3 },
];

test.each([...badScores, { busyness: 6 }, {}])(
  "check-in requires busyness and noise as whole numbers from 1 to 10: %j",
  async (body) => {
    const response = await api().checkIn({ spotId: spot.id, ...body });

    expect(response.status).toBe(400);
    expect(rows).toHaveLength(0);
  },
);

test.each(badScores)("check-out scores must be whole numbers from 1 to 10: %j", async (body) => {
  const checkIn = await api().checkIn({ spotId: spot.id, ...scores });

  const response = await api().checkOut(checkIn.body.id, body);

  expect(response.status).toBe(400);
  expect(rows[0].checkedOutAt).toBeNull();
});

test.each([
  ["no spotId", { ...scores }],
  ["a spotId that isn't an ID", { spotId: "grainger", ...scores }],
])("check-in with %s returns 400", async (_case, body) => {
  const response = await api().checkIn(body);

  expect(response.status).toBe(400);
  expect(rows).toHaveLength(0);
});

test("check-in at a spot that doesn't exist returns 400", async () => {
  const response = await api().checkIn({ spotId: missingSpotId, ...scores });

  expect(response.status).toBe(400);
  expect(rows).toHaveLength(0);
});

test("check-out with an ID that isn't an ID returns 400", async () => {
  const response = await api().checkOut("not-an-id", scores);

  expect(response.status).toBe(400);
});

test.each([
  ["POST", "/api/check-ins"],
  ["PATCH", `/api/check-ins/${missingCheckInId}/check-out`],
  ["GET", "/api/check-ins/me"],
])("%s %s without a token returns 401", async (method, path) => {
  const response = await request(app)[method.toLowerCase() as "post" | "patch" | "get"](path);

  expect(response.status).toBe(401);
  expect(db.query).not.toHaveBeenCalled();
});
