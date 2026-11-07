import { jest } from "@jest/globals";

process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:5432/test";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";

export const accessToken = "eyJhbGciOiJIUzI1NiJ9.test.signature";

export const { app } = await import("../../src/app.js");
export const { db } = await import("../../src/services/db.js");
export const { supabase } = await import("../../src/services/supabase.js");

export function mockAuthenticatedUser() {
  jest.spyOn(supabase.auth, "getClaims").mockResolvedValue({
    data: {
      claims: {
        iss: "https://test.supabase.co/auth/v1",
        aud: "authenticated",
        role: "authenticated",
        sub: "00000000-0000-4000-8000-000000000000",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
    },
    error: null,
  } as never);
}
