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

type StoredCheckIn = {
  id: string;
  userId: string;
  spotId: string;
  note: string | null;
  checkedInAt: Date;
  checkedOutAt: Date | null;
  busyness: number | null;
  noise: number | null;
};

// A small in-memory stand-in for the check_ins table. It answers each query
// the repository sends and follows the same rules as the real database.
let rows: StoredCheckIn[];
let clock: number;

function toRow(checkIn: StoredCheckIn) {
  const { userId: _userId, ...row } = checkIn;
  return { ...row, spotName: spot.name };
}

function fakeQuery(sql: string, params: unknown[] = []) {
  if (sql.includes("FROM public.spots WHERE id = $1")) {
    const found = params[0] === spot.id;
    return { rows: found ? [{}] : [], rowCount: found ? 1 : 0 };
  }

  if (sql.includes("INSERT INTO public.check_ins")) {
    const [userId, spotId, note] = params as [string, string, string | null];
    if (rows.some((row) => row.userId === userId && row.checkedOutAt === null)) {
      throw Object.assign(new Error("duplicate key"), {
        code: "23505",
        constraint: "check_ins_one_active_per_user",
      });
    }
    const created: StoredCheckIn = {
      id: `33333333-3333-4333-8333-${String(rows.length + 1).padStart(12, "0")}`,
      userId,
      spotId,
      note,
      checkedInAt: new Date((clock += 60_000)),
      checkedOutAt: null,
      busyness: null,
      noise: null,
    };
    rows.push(created);
    return { rows: [toRow(created)] };
  }

  if (sql.includes("UPDATE public.check_ins")) {
    const [id, userId, busyness, noise] = params as [string, string, number, number];
    const match = rows.find(
      (row) => row.id === id && row.userId === userId && row.checkedOutAt === null,
    );
    if (!match) return { rows: [] };
    Object.assign(match, { busyness, noise, checkedOutAt: new Date((clock += 60_000)) });
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
    checkOut: (id: string, body: object) =>
      auth(request(app).patch(`/api/check-ins/${id}/check-out`)).send(body),
    history: () => auth(request(app).get("/api/check-ins/me")),
  };
}

beforeEach(() => {
  rows = [];
  clock = Date.parse("2026-11-07T14:00:00Z");
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
  const checkIn = await api().checkIn({ spotId: spot.id, note: "Studying for CS 225" });

  expect(checkIn.status).toBe(201);
  expect(checkIn.body).toEqual({
    id: expect.any(String),
    spot,
    note: "Studying for CS 225",
    checkedInAt: "2026-11-07T14:01:00.000Z",
    checkedOutAt: null,
    busyness: null,
    noise: null,
    isActive: true,
  });

  const checkOut = await api().checkOut(checkIn.body.id, { busyness: 6, noise: 3 });

  expect(checkOut.status).toBe(200);
  expect(checkOut.body).toEqual({
    ...checkIn.body,
    checkedOutAt: "2026-11-07T14:02:00.000Z",
    busyness: 6,
    noise: 3,
    isActive: false,
  });

  const history = await api().history();

  expect(history.status).toBe(200);
  expect(history.body).toEqual([checkOut.body]);
});

test("the check-in is saved for the signed-in user, not one sent by the client", async () => {
  await api().checkIn({ spotId: spot.id, userId: otherUserId });

  expect(rows[0].userId).toBe(testUserId);
});

test("history is newest first", async () => {
  const first = await api().checkIn({ spotId: spot.id });
  await api().checkOut(first.body.id, { busyness: 5, noise: 5 });
  const second = await api().checkIn({ spotId: spot.id });

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
  await api().checkIn({ spotId: spot.id });
  const second = await api().checkIn({ spotId: spot.id });

  expect(second.status).toBe(409);
  expect(rows).toHaveLength(1);
});

test("a user cannot check out another user's check-in or see it in their history", async () => {
  const theirs = await api().checkIn({ spotId: spot.id });

  mockAuthenticatedUser(otherUserId);
  const checkOut = await api().checkOut(theirs.body.id, { busyness: 6, noise: 3 });
  const history = await api().history();

  expect(checkOut.status).toBe(404);
  expect(rows[0].checkedOutAt).toBeNull();
  expect(history.body).toEqual([]);
});

test("checking out a check-in that doesn't exist returns 404", async () => {
  const response = await api().checkOut(missingCheckInId, { busyness: 6, noise: 3 });

  expect(response.status).toBe(404);
});

test("checking out an already completed check-in returns 400", async () => {
  const checkIn = await api().checkIn({ spotId: spot.id });
  await api().checkOut(checkIn.body.id, { busyness: 6, noise: 3 });

  const again = await api().checkOut(checkIn.body.id, { busyness: 2, noise: 2 });

  expect(again.status).toBe(400);
  expect(rows[0].busyness).toBe(6);
});

test.each([
  { busyness: 0, noise: 3 },
  { busyness: 11, noise: 3 },
  { busyness: 5.5, noise: 3 },
  { busyness: 6, noise: -1 },
  { busyness: "6", noise: 3 },
  { busyness: 6 },
  {},
])("busyness and noise must be whole numbers from 1 to 10: %j", async (body) => {
  const checkIn = await api().checkIn({ spotId: spot.id });

  const response = await api().checkOut(checkIn.body.id, body);

  expect(response.status).toBe(400);
  expect(rows[0].checkedOutAt).toBeNull();
});

test.each([
  ["no spotId", {}],
  ["a spotId that isn't an ID", { spotId: "grainger" }],
  ["a note that isn't text", { spotId: spot.id, note: 42 }],
])("check-in with %s returns 400", async (_case, body) => {
  const response = await api().checkIn(body);

  expect(response.status).toBe(400);
  expect(rows).toHaveLength(0);
});

test("check-in at a spot that doesn't exist returns 400", async () => {
  const response = await api().checkIn({ spotId: missingSpotId });

  expect(response.status).toBe(400);
  expect(rows).toHaveLength(0);
});

test("a blank note is saved as no note", async () => {
  const response = await api().checkIn({ spotId: spot.id, note: "   " });

  expect(response.body.note).toBeNull();
});

test("check-out with an ID that isn't an ID returns 400", async () => {
  const response = await api().checkOut("not-an-id", { busyness: 6, noise: 3 });

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
