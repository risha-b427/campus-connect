import request from "supertest";
import { jest } from "@jest/globals";
import {
  accessToken,
  app,
  db,
  mockAuthenticatedUser,
} from "../../support/api-test-setup.js";

const spots = [
  {
    id: "22222222-2222-4222-8222-222222222221",
    name: "Grainger Library First Floor",
    description: "Study space",
    buildingId: "11111111-1111-4111-8111-111111111111",
    building: "Grainger Engineering Library",
    latitude: "40.112688",
    longitude: "-88.226885",
    spotType: "Library",
    activeCheckInCount: "3",
    averageNoise: "4.3",
    averageCrowdedness: "6.7",
    averageRating: "3.5",
    ratingCount: "2",
  },
];

beforeAll(() => {
  mockAuthenticatedUser();
});

beforeEach(() => {
  jest.spyOn(db, "query").mockResolvedValue({ rows: spots } as never);
});

afterEach(() => {
  jest.spyOn(db, "query").mockRestore();
});

test("GET /api/spots returns spot-shaped objects", async () => {
  const response = await request(app)
    .get("/api/spots")
    .set("Authorization", `Bearer ${accessToken}`);

  expect(response.status).toBe(200);
  expect(response.body).toEqual([
    {
      ...spots[0],
      latitude: 40.112688,
      longitude: -88.226885,
      activeCheckInCount: 3,
      averageNoise: 4.3,
      averageCrowdedness: 6.7,
      averageRating: 3.5,
      ratingCount: 2,
    },
  ]);
});

test("GET /api/spots preserves null averages and zero counts", async () => {
  jest.spyOn(db, "query").mockResolvedValue({ rows: [{
    ...spots[0], activeCheckInCount: "0", averageNoise: null,
    averageCrowdedness: null, averageRating: null, ratingCount: "0",
  }] } as never);

  const response = await request(app).get("/api/spots")
    .set("Authorization", `Bearer ${accessToken}`);

  expect(response.status).toBe(200);
  expect(response.body[0]).toMatchObject({
    activeCheckInCount: 0, averageNoise: null, averageCrowdedness: null,
    averageRating: null, ratingCount: 0,
  });
});

test("GET /api/spots returns an empty array without matches", async () => {
  jest.spyOn(db, "query").mockResolvedValue({ rows: [] } as never);
  const response = await request(app).get("/api/spots")
    .set("Authorization", `Bearer ${accessToken}`);
  expect(response.status).toBe(200);
  expect(response.body).toEqual([]);
});

test.each(["spotType=Library", "spotType=Invalid", "spotType=Library&spotType=Cafe", "spotType="])(
  "GET /api/spots ignores removed filter %s", async (query) => {
    const response = await request(app).get(`/api/spots?${query}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(spots.length);
    expect(response.body[0].spotType).toBe("Library");
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.not.stringContaining("WHERE s.spot_type"), []);
  },
);

test("GET /api/spots requires authentication", async () => {
  const response = await request(app).get("/api/spots");
  expect(response.status).toBe(401);
  expect(db.query).not.toHaveBeenCalled();
});

test("GET /api/spots/:id returns a spot with numeric values and a parameterized lookup", async () => {
  const response = await request(app).get(`/api/spots/${spots[0].id}`)
    .set("Authorization", `Bearer ${accessToken}`);

  expect(response.status).toBe(200);
  expect(response.headers["cache-control"]).toBe("no-store");
  expect(response.body).toEqual({
    ...spots[0], latitude: 40.112688, longitude: -88.226885,
    activeCheckInCount: 3, averageNoise: 4.3, averageCrowdedness: 6.7,
    averageRating: 3.5, ratingCount: 2,
  });
  expect(db.query).toHaveBeenCalledTimes(1);
  expect(db.query).toHaveBeenCalledWith(expect.stringContaining("WHERE s.id = $1"), [spots[0].id]);
});

test("GET /api/spots/:id preserves null fields and zero counts", async () => {
  jest.spyOn(db, "query").mockResolvedValue({ rows: [{
    ...spots[0], description: null, activeCheckInCount: "0", averageNoise: null,
    averageCrowdedness: null, averageRating: null, ratingCount: "0",
  }] } as never);
  const response = await request(app).get(`/api/spots/${spots[0].id}`)
    .set("Authorization", `Bearer ${accessToken}`);
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({ description: null, activeCheckInCount: 0,
    averageNoise: null, averageCrowdedness: null, averageRating: null, ratingCount: 0 });
});

test.each(["not-a-uuid", "22222222222242228222222222222221", "22222222-2222-4222-8222-22222222222Z"])(
  "GET /api/spots/:id rejects malformed ID %s without querying", async (id) => {
    const response = await request(app).get(`/api/spots/${id}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Invalid spot ID" });
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(db.query).not.toHaveBeenCalled();
  },
);

test("GET /api/spots/:id returns 404 for an unknown valid UUID", async () => {
  jest.spyOn(db, "query").mockResolvedValue({ rows: [] } as never);
  const response = await request(app).get(`/api/spots/${spots[0].id}`)
    .set("Authorization", `Bearer ${accessToken}`);
  expect(response.status).toBe(404);
  expect(response.body).toEqual({ message: "Spot not found" });
  expect(response.headers["cache-control"]).toBe("no-store");
});

test("GET /api/spots/:id requires authentication", async () => {
  const response = await request(app).get(`/api/spots/${spots[0].id}`);
  expect(response.status).toBe(401);
  expect(db.query).not.toHaveBeenCalled();
});

test("GET /api/spots/:id reads current values on every request and ignores query parameters", async () => {
  jest.spyOn(db, "query")
    .mockResolvedValueOnce({ rows: spots } as never)
    .mockResolvedValueOnce({ rows: [{ ...spots[0], activeCheckInCount: "4" }] } as never);
  const first = await request(app).get(`/api/spots/${spots[0].id}`)
    .set("Authorization", `Bearer ${accessToken}`);
  const refreshed = await request(app).get(`/api/spots/${spots[0].id}?spotType=Cafe`)
    .set("Authorization", `Bearer ${accessToken}`);
  expect(first.status).toBe(200);
  expect(refreshed.status).toBe(200);
  expect(first.body.activeCheckInCount).toBe(3);
  expect(refreshed.body.activeCheckInCount).toBe(4);
  expect(db.query).toHaveBeenCalledTimes(2);
  expect(db.query).toHaveBeenLastCalledWith(expect.stringContaining("WHERE s.id = $1"), [spots[0].id]);
});
