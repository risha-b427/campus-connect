// Integration tests for Supabase Auth, the profile trigger, and password reset.
//
// They talk to the LOCAL Supabase, so Docker and `npm run db:start` (repo root)
// must be running. If Supabase is not running, every test is skipped.
// Each test user is created with a random email and deleted afterwards.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

import { readResetLink } from "../src/features/auth/resetLink.ts";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const PASSWORD = "test-pass-1";

// Reads the local URL and keys from `npx supabase status`, or from env vars.
function loadConfig() {
  const values = {
    API_URL: process.env.SUPABASE_URL,
    ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    MAILPIT_URL: process.env.MAILPIT_URL,
  };

  if (!values.API_URL || !values.ANON_KEY || !values.SERVICE_ROLE_KEY) {
    try {
      const output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 10_000,
      });
      for (const line of output.split("\n")) {
        const match = /^([A-Z_]+)="?(.*?)"?$/.exec(line.trim());
        if (match) values[match[1]] ??= match[2];
      }
    } catch {
      return null; // Supabase is not running
    }
  }

  return {
    url: values.API_URL,
    anonKey: values.ANON_KEY,
    serviceKey: values.SERVICE_ROLE_KEY,
    mailUrl: values.MAILPIT_URL ?? "http://127.0.0.1:54324",
  };
}

async function isReachable(config) {
  try {
    const res = await fetch(`${config.url}/auth/v1/health`, {
      headers: { apikey: config.anonKey },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const config = loadConfig();
const running = config && (await isReachable(config));
const skip = running ? false : "Local Supabase is not running (start Docker, then npm run db:start)";

describe("Supabase Auth", { skip }, () => {
  const createdUserIds = [];
  const admin = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // A client whose saved login lives in `storage`, like the phone's AsyncStorage.
  const newApp = (storage = memoryStorage()) => ({
    storage,
    client: createClient(config.url, config.anonKey, {
      auth: {
        storage,
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }),
  });

  function memoryStorage() {
    const data = {};
    return {
      getItem: async (key) => data[key] ?? null,
      setItem: async (key, value) => void (data[key] = value),
      removeItem: async (key) => void delete data[key],
    };
  }

  const newEmail = (name = "user") => `${name}.${randomUUID().slice(0, 8)}@school.edu`;

  async function signUp(email = newEmail()) {
    const app = newApp();
    const { data, error } = await app.client.auth.signUp({ email, password: PASSWORD });
    assert.ifError(error);
    createdUserIds.push(data.user.id);
    return { ...app, email, user: data.user, session: data.session };
  }

  const getProfile = (userId) =>
    admin.from("users").select("*").eq("user_id", userId).maybeSingle();

  after(async () => {
    for (const id of createdUserIds) await admin.auth.admin.deleteUser(id);
  });

  describe("sign up", () => {
    it("creates an account and logs the user in", async () => {
      const { session, email } = await signUp();
      assert.ok(session, "expected a session");
      assert.equal(session.user.email, email);
    });

    it("creates a profile row with a username and display name", async () => {
      const { user, email } = await signUp(newEmail("sam"));
      const { data, error } = await getProfile(user.id);
      assert.ifError(error);
      assert.ok(data, "expected a profile row");
      assert.match(data.username, /^sam[a-z0-9]*_[0-9a-f]{8}$/);
      assert.equal(data.display_name, email.split("@")[0]);
    });

    it("gives two people with the same email name different usernames", async () => {
      const name = `twin${randomUUID().slice(0, 6)}`;
      const first = await signUp(`${name}@school.edu`);
      const second = await signUp(`${name}@other.edu`);
      const a = (await getProfile(first.user.id)).data;
      const b = (await getProfile(second.user.id)).data;
      assert.notEqual(a.username, b.username);
    });

    it("still creates a profile when the email name has only symbols", async () => {
      const { user } = await signUp(`...+${randomUUID().slice(0, 6)}@school.edu`);
      const { data } = await getProfile(user.id);
      assert.ok(data?.username);
      assert.ok(data?.display_name);
    });

    it("rejects a password that is too short", async () => {
      const { error } = await newApp().client.auth.signUp({
        email: newEmail(),
        password: "123",
      });
      assert.ok(error);
      assert.match(error.message, /at least 6 characters/i);
    });

    it("does not create a second account or profile for a used email", async () => {
      const original = await signUp();
      const { count: before } = await admin
        .from("users")
        .select("user_id", { count: "exact", head: true });

      const { error } = await newApp().client.auth.signUp({
        email: original.email,
        password: PASSWORD,
      });
      assert.ok(error, "expected an error for an email that is already used");

      const { count: after } = await admin
        .from("users")
        .select("user_id", { count: "exact", head: true });
      assert.equal(after, before);
    });
  });

  describe("log in and log out", () => {
    it("logs in with the right password", async () => {
      const { email } = await signUp();
      const { data, error } = await newApp().client.auth.signInWithPassword({
        email,
        password: PASSWORD,
      });
      assert.ifError(error);
      assert.equal(data.session.user.email, email);
    });

    it("rejects a wrong password", async () => {
      const { email } = await signUp();
      const { error } = await newApp().client.auth.signInWithPassword({
        email,
        password: "wrong-password",
      });
      assert.ok(error);
      assert.match(error.message, /invalid login credentials/i);
    });

    it("rejects an email that has no account", async () => {
      const { error } = await newApp().client.auth.signInWithPassword({
        email: newEmail("nobody"),
        password: PASSWORD,
      });
      assert.ok(error);
    });

    it("restores the saved login when the app is reopened", async () => {
      const { storage, email } = await signUp();
      const reopened = newApp(storage); // a new client with the same saved storage
      const { data } = await reopened.client.auth.getSession();
      assert.equal(data.session?.user.email, email);
    });

    it("clears the saved login on log out", async () => {
      const { client, storage } = await signUp();
      const { error } = await client.auth.signOut();
      assert.ifError(error);
      const reopened = newApp(storage);
      const { data } = await reopened.client.auth.getSession();
      assert.equal(data.session, null);
    });
  });

  describe("privacy", () => {
    it("does not let a logged-in user read the users table yet (no read policy)", async () => {
      const { client } = await signUp();
      const { data, error } = await client.from("users").select("*");
      assert.ifError(error);
      assert.deepEqual(data, []);
    });
  });

  describe("password reset", () => {
    const REDIRECT = "mobile://reset-password";

    // Finds the reset link in the newest email sent to this address.
    async function findResetLink(email) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const search = await fetch(
          `${config.mailUrl}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
        ).then((r) => r.json());

        if (search.messages?.length) {
          const message = await fetch(
            `${config.mailUrl}/api/v1/message/${search.messages[0].ID}`,
          ).then((r) => r.json());
          const href = /href="([^"]+)"/.exec(message.HTML)?.[1];
          if (href) return href.replaceAll("&amp;", "&");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      throw new Error(`No reset email arrived for ${email}`);
    }

    // Opens the link the way a phone would, without following the redirect.
    async function openLink(link) {
      const res = await fetch(link, { redirect: "manual" });
      return res.headers.get("location") ?? "";
    }

    it("sends an email whose link opens the app with login tokens", async () => {
      const { email } = await signUp();
      const { error } = await newApp().client.auth.resetPasswordForEmail(email, {
        redirectTo: REDIRECT,
      });
      assert.ifError(error);

      const location = await openLink(await findResetLink(email));
      assert.ok(location.startsWith(REDIRECT), `redirected to ${location.slice(0, 60)}`);

      const link = readResetLink(location);
      assert.equal(link.problem, null);
      assert.ok(link.accessToken && link.refreshToken);
    });

    it("lets the user choose a new password from the link", async () => {
      const { email } = await signUp();
      await newApp().client.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT });
      const link = readResetLink(await openLink(await findResetLink(email)));

      const app = newApp();
      const session = await app.client.auth.setSession({
        access_token: link.accessToken,
        refresh_token: link.refreshToken,
      });
      assert.ifError(session.error);

      const newPassword = "brand-new-pass-2";
      const update = await app.client.auth.updateUser({ password: newPassword });
      assert.ifError(update.error);

      const oldLogin = await newApp().client.auth.signInWithPassword({ email, password: PASSWORD });
      assert.ok(oldLogin.error, "the old password should stop working");
      const newLogin = await newApp().client.auth.signInWithPassword({ email, password: newPassword });
      assert.ifError(newLogin.error);
    });

    it("rejects a reset link that was already used", async () => {
      const { email } = await signUp();
      await newApp().client.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT });
      const emailLink = await findResetLink(email);

      await openLink(emailLink); // first use
      const second = readResetLink(await openLink(emailLink));
      assert.equal(second.accessToken, null);
      assert.match(second.problem, /invalid or has expired/i);
    });

    it("does not reveal whether an email has an account", async () => {
      const { error } = await newApp().client.auth.resetPasswordForEmail(newEmail("nobody"), {
        redirectTo: REDIRECT,
      });
      assert.ifError(error);
    });
  });
});
