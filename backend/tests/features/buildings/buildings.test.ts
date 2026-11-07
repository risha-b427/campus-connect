import request from "supertest";
import { jest } from "@jest/globals";
import {
  accessToken,
  app,
  db,
  mockAuthenticatedUser,
} from "../../support/api-test-setup.js";

const buildings = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Grainger Engineering Library",
    latitude: "40.112688",
    longitude: "-88.226885",
  },
];

beforeAll(() => {
  mockAuthenticatedUser();
});

beforeEach(() => {
  jest.spyOn(db, "query").mockResolvedValue({ rows: buildings } as never);
});

afterEach(() => {
  jest.spyOn(db, "query").mockRestore();
});

test("GET /api/buildings returns building-shaped objects", async () => {
  const response = await request(app)
    .get("/api/buildings")
    .set("Authorization", `Bearer ${accessToken}`);

  expect(response.status).toBe(200);
  expect(response.body).toEqual([
    {
      id: buildings[0].id,
      name: buildings[0].name,
      latitude: 40.112688,
      longitude: -88.226885,
    },
  ]);
});
