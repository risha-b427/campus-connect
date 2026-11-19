import request from "supertest";
import { jest } from "@jest/globals";
import {
  accessToken,
  app,
  db,
  mockAuthenticatedUser,
} from "../../support/api-test-setup.js";

// Same id that mockAuthenticatedUser() logs in as
const userId = "00000000-0000-4000-8000-000000000000";
const spotId = "22222222-2222-4222-8222-222222222221";
const checkInId = "33333333-3333-4333-8333-333333333331";

// What the repository returns (pg gives real Date objects)
const row = {
  id: checkInId,
  userId,
  userName: "Sam",
  spotId,
  note: "CS 225",
  busyness: 6,
  noise: 4,
  startedAt: new Date("2026-11-14T15:00:00.000Z"),
  endedAt: null,
};

// What the API sends back
const body = {
  ...row,
  startedAt: "2026-11-14T15:00:00.000Z",
  endedAt: null,
};

// Fakes the database client that checkout uses for its transaction
function mockTransaction(updateRows: unknown[]) {
  const query = jest.fn(async (sql: string) =>
    sql.includes("UPDATE public.check_ins")
      ? { rows: updateRows }
      : { rows: [] },
  );
  const release = jest.fn();
  jest.spyOn(db, "connect").mockResolvedValue({ query, release } as never);
  return { query, release };
}

function sqlCalls(query: { mock: { calls: unknown[][] } }) {
  return query.mock.calls.map((call) => String(call[0]));
}

beforeAll(() => {
  mockAuthenticatedUser();
});

beforeEach(() => {
  jest.spyOn(db, "query").mockResolvedValue({ rows: [row] } as never);
  jest.spyOn(db, "connect").mockImplementation((() => {
    throw new Error("db.connect was not expected in this test");
  }) as never);
});

afterEach(() => {
  jest.spyOn(db, "query").mockRestore();
  jest.spyOn(db, "connect").mockRestore();
});

// ---------- POST /api/check-ins ----------

describe("POST /api/check-ins", () => {
  const valid = { spotId, note: "CS 225", busyness: 6, noise: 4 };

  test("creates a check-in for the signed-in user", async () => {
    const response = await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(valid);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(body);
    // The user id comes from the token, never from the request body
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO public.check_ins"),
      [userId, spotId, "CS 225", 6, 4],
    );
  });

  test("stores a missing or blank note as null", async () => {
    await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ spotId, note: "   ", busyness: 6, noise: 4 });

    expect(db.query).toHaveBeenCalledWith(expect.any(String), [
      userId,
      spotId,
      null,
      6,
      4,
    ]);
  });

  test("ignores a userId sent in the body", async () => {
    await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ...valid, userId: "99999999-9999-4999-8999-999999999999" });

    expect(db.query).toHaveBeenCalledWith(expect.any(String), [
      userId,
      spotId,
      "CS 225",
      6,
      4,
    ]);
  });

  test.each(["not-a-uuid", "", 5, undefined])(
    "rejects invalid spot ID %p without querying",
    async (badId) => {
      const response = await request(app)
        .post("/api/check-ins")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...valid, spotId: badId });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid spot ID" });
      expect(db.query).not.toHaveBeenCalled();
    },
  );

  test.each([
    { busyness: 0, noise: 4 },
    { busyness: 11, noise: 4 },
    { busyness: 6, noise: 0 },
    { busyness: 6, noise: 11 },
    { busyness: 5.5, noise: 4 },
    { busyness: "6", noise: 4 },
    { noise: 4 },
    { busyness: 6 },
  ])("rejects invalid scores %j without querying", async (scores) => {
    const response = await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ spotId, ...scores });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "busyness and noise must be whole numbers from 1 to 10",
    });
    expect(db.query).not.toHaveBeenCalled();
  });

  test("rejects a note longer than 200 characters", async () => {
    const response = await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ...valid, note: "a".repeat(201) });

    expect(response.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  test("returns 409 when the user is already checked in", async () => {
    jest.spyOn(db, "query").mockRejectedValue({ code: "23505" });

    const response = await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(valid);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: "You are already checked in" });
  });

  test("returns 404 when the spot does not exist", async () => {
    jest.spyOn(db, "query").mockRejectedValue({ code: "23503" });

    const response = await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(valid);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Spot not found" });
  });

  test("returns 500 without leaking database details", async () => {
    jest
      .spyOn(db, "query")
      .mockRejectedValue(new Error("secret database detail"));

    const response = await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(valid);

    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain("secret database detail");
  });

  test("requires authentication", async () => {
    const response = await request(app).post("/api/check-ins").send(valid);

    expect(response.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });
});

// ---------- PATCH /api/check-ins/:id/checkout ----------

describe("PATCH /api/check-ins/:id/checkout", () => {
  const ended = { ...row, endedAt: new Date("2026-11-14T16:00:00.000Z") };
  const endedBody = { ...body, endedAt: "2026-11-14T16:00:00.000Z" };

  test("ends the check-in and saves the overall rating", async () => {
    const { query, release } = mockTransaction([ended]);

    const response = await request(app)
      .patch(`/api/check-ins/${checkInId}/checkout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ busyness: 8, noise: 3, rating: 4 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(endedBody);

    const sql = sqlCalls(query);
    expect(sql[0]).toBe("BEGIN");
    expect(sql.some((s) => s.includes("INSERT INTO public.ratings"))).toBe(true);
    expect(sql[sql.length - 1]).toBe("COMMIT");
    expect(release).toHaveBeenCalledTimes(1);

    // Only the owner's active check-in can be updated
    const updateCall = query.mock.calls.find((call) =>
      String(call[0]).includes("UPDATE public.check_ins"),
    );
    expect(String(updateCall?.[0])).toContain("user_id = $2");
    expect(String(updateCall?.[0])).toContain("check_out_time IS NULL");
  });

  test("works without an overall rating and skips the ratings table", async () => {
    const { query } = mockTransaction([ended]);

    const response = await request(app)
      .patch(`/api/check-ins/${checkInId}/checkout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ busyness: 8, noise: 3 });

    expect(response.status).toBe(200);
    expect(
      sqlCalls(query).some((s) => s.includes("INSERT INTO public.ratings")),
    ).toBe(false);
  });

  test("returns 404 and rolls back when the check-in is not yours or already ended", async () => {
    const { query, release } = mockTransaction([]);

    const response = await request(app)
      .patch(`/api/check-ins/${checkInId}/checkout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ busyness: 8, noise: 3, rating: 4 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Active check-in not found" });
    expect(sqlCalls(query)).toContain("ROLLBACK");
    expect(sqlCalls(query)).not.toContain("COMMIT");
    expect(release).toHaveBeenCalledTimes(1);
  });

  test("rolls back and releases the connection on a database error", async () => {
    const query = jest.fn(async (sql: string) => {
      if (sql.includes("UPDATE public.check_ins")) {
        throw new Error("secret database detail");
      }
      return { rows: [] };
    });
    const release = jest.fn();
    jest.spyOn(db, "connect").mockResolvedValue({ query, release } as never);

    const response = await request(app)
      .patch(`/api/check-ins/${checkInId}/checkout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ busyness: 8, noise: 3 });

    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain("secret database detail");
    expect(sqlCalls(query)).toContain("ROLLBACK");
    expect(release).toHaveBeenCalledTimes(1);
  });

  test.each(["not-a-uuid", "33333333333343338333333333333331"])(
    "rejects malformed check-in ID %s without touching the database",
    async (id) => {
      const response = await request(app)
        .patch(`/api/check-ins/${id}/checkout`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ busyness: 8, noise: 3 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid check-in ID" });
      expect(db.connect).not.toHaveBeenCalled();
    },
  );

  test.each([
    { busyness: 0, noise: 3 },
    { busyness: 8, noise: 11 },
    { busyness: 8.5, noise: 3 },
    { noise: 3 },
  ])("rejects invalid scores %j", async (scores) => {
    const response = await request(app)
      .patch(`/api/check-ins/${checkInId}/checkout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(scores);

    expect(response.status).toBe(400);
    expect(db.connect).not.toHaveBeenCalled();
  });

  test.each([0, 6, 3.5, "4"])("rejects overall rating %p", async (rating) => {
    const response = await request(app)
      .patch(`/api/check-ins/${checkInId}/checkout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ busyness: 8, noise: 3, rating });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "rating must be a whole number from 1 to 5",
    });
    expect(db.connect).not.toHaveBeenCalled();
  });

  test("requires authentication", async () => {
    const response = await request(app)
      .patch(`/api/check-ins/${checkInId}/checkout`)
      .send({ busyness: 8, noise: 3 });

    expect(response.status).toBe(401);
    expect(db.connect).not.toHaveBeenCalled();
  });
});

// ---------- GET /api/check-ins/active ----------

describe("GET /api/check-ins/active", () => {
  test("returns everyone who is checked in", async () => {
    const response = await request(app)
      .get("/api/check-ins/active")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([body]);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("check_out_time IS NULL"),
    );
  });

  test("uses a fallback name when the user has no profile row", async () => {
    jest
      .spyOn(db, "query")
      .mockResolvedValue({ rows: [{ ...row, userName: null }] } as never);

    const response = await request(app)
      .get("/api/check-ins/active")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.body[0].userName).toBe("Student");
  });

  test("returns an empty array when nobody is checked in", async () => {
    jest.spyOn(db, "query").mockResolvedValue({ rows: [] } as never);

    const response = await request(app)
      .get("/api/check-ins/active")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("requires authentication", async () => {
    const response = await request(app).get("/api/check-ins/active");

    expect(response.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });
});