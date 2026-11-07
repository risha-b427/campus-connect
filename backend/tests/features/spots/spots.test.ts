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
    },
  ]);
});

test("GET /api/spots accepts a spotType filter", async () => {
  const querySpy = jest.spyOn(db, "query");

  const response = await request(app)
    .get("/api/spots")
    .query({ spotType: "Library" })
    .set("Authorization", `Bearer ${accessToken}`);

  expect(response.status).toBe(200);
  expect(response.body[0].spotType).toBe("Library");
  expect(querySpy).toHaveBeenCalledWith(
    expect.stringContaining("WHERE s.spot_type = $1"),
    ["Library"],
  );
});
