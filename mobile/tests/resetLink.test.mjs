// Unit tests for the password reset link reader. They need no running services.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readResetLink } from "../src/features/auth/resetLink.ts";

describe("readResetLink", () => {
  it("returns null while there is no link yet", () => {
    assert.equal(readResetLink(null), null);
  });

  it("reads the tokens after the #", () => {
    const link = readResetLink(
      "mobile://reset-password#access_token=abc.def&expires_in=3600&refresh_token=xyz&token_type=bearer",
    );
    assert.deepEqual(link, { accessToken: "abc.def", refreshToken: "xyz", problem: null });
  });

  it("works with an Expo Go style link", () => {
    const link = readResetLink(
      "exp://localhost:8081/--/reset-password#access_token=a&refresh_token=b",
    );
    assert.equal(link?.accessToken, "a");
    assert.equal(link?.refreshToken, "b");
  });

  it("reports Supabase's error message for an expired or used link", () => {
    const link = readResetLink(
      "mobile://reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired",
    );
    assert.equal(link?.accessToken, null);
    assert.equal(link?.problem, "Email link is invalid or has expired");
  });

  it("keeps a real + sign in an error message", () => {
    const link = readResetLink("mobile://reset-password#error_description=a%2Bb");
    assert.equal(link?.problem, "a+b");
  });

  it("gives a friendly message when the link has no tokens", () => {
    const link = readResetLink("mobile://reset-password");
    assert.equal(link?.accessToken, null);
    assert.match(link?.problem ?? "", /not valid/);
  });

  it("does not accept a link with only one of the two tokens", () => {
    const link = readResetLink("mobile://reset-password#access_token=abc");
    assert.equal(link?.accessToken, null);
    assert.ok(link?.problem);
  });
});
