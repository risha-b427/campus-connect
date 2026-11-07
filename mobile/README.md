# Campus Connect mobile app

The mobile app is built with Expo, React Native, TypeScript, and Expo Router.

## Prerequisites

- [Node.js 22.13 or newer](https://nodejs.org/)
- The latest [Expo Go](https://expo.dev/go) app on an Android phone or iPhone, or Android Studio for an emulator

This project uses Expo SDK 58. Expo Go and the project must use the same SDK major version.

## First-time setup

From this `mobile` directory:

```bash
npm install
```

If you are using Expo Go on an iPhone, create a free account at [expo.dev/signup](https://expo.dev/signup) and sign in on both your computer and phone:

```bash
npx expo login
npx expo whoami
```

An Expo login is optional for local Android development.

## Run the app

```bash
npm start
```

or from the root

```bash
npm run mobile
```

Expo starts a development server and shows a QR code:

- Android phone: open Expo Go and scan the QR code.
- iPhone: scan the QR code with the Camera app, then open it in Expo Go.
- Android emulator: press `a` in the Expo terminal.
- Web: press `w` in the Expo terminal.

Your phone and computer should be on the same Wi-Fi network. If the phone cannot connect, stop Expo with `Ctrl+C` and use:

```bash
npx expo start --tunnel
```

Tunnel mode is slower, so use the normal LAN connection when possible.

## Everyday workflow

Run `npm start` for normal development. Run `npm install` after pulling changes to `package.json` or `package-lock.json`.

Use Expo's installer for Expo packages:

e.g.
```bash
npx expo install expo-camera
```

Use `npm install <package>` for ordinary JavaScript-only dependencies.

## Database access

The mobile app must call the Express backend for database-backed features. Never put `DATABASE_URL` or a privileged Supabase key in the mobile app.

## Authentication

Users sign up and log in with an email and password through Supabase Auth. The app talks to Supabase Auth directly for this, using Supabase's public publishable key (it starts with `sb_publishable_`). Everything else that reads or writes the database still goes through the Express backend (see Database access below).

### Set up your environment file

1. Start local Supabase from the repository root (Docker Desktop must be running):

   ```bash
   npm run db:start
   npm run db:reset
   ```

   `db:reset` applies every migration, including the one that creates a profile row for each new user.

2. Still in the repository root, copy the example file and fill it in:

   ```bash
   cp mobile/.env.example mobile/.env.local
   npx supabase status -o env
   ```

   Put the `API_URL` value in `EXPO_PUBLIC_SUPABASE_URL` and the `PUBLISHABLE_KEY` value in `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

3. A phone cannot reach `127.0.0.1`, because that means "this device". Replace it with your computer's address on the Wi-Fi network, for example `http://192.168.1.20:54321`. On macOS, `ipconfig getifaddr en0` prints it. The address changes when you switch networks. An emulator, simulator, or the web build can use `127.0.0.1`.

4. Restart Expo after changing `.env.local`.

`.env.local` is ignored by git. Anything starting with `EXPO_PUBLIC_` is bundled into the app and visible to anyone who has it, so only put public values there. Never put the `service_role` or secret key in the mobile app.

### How it works

| File | What it does |
| --- | --- |
| `src/shared/lib/supabase.ts` | Creates the one shared Supabase client. It saves the login in AsyncStorage, which keeps people logged in after the app closes. |
| `src/features/auth/AuthProvider.tsx` | Loads the saved login on startup and keeps it up to date. Read it in any component with `useAuth()`, which returns `{ session, loading }`. |
| `src/app/_layout.tsx` | Uses `Stack.Protected`: logged-out users can only open the login, sign-up, and forgot-password screens, and logged-in users can only open the app. Logging in or out switches between them automatically, so screens do not need to navigate by hand. |
| `src/features/auth/screens/` | The Log in, Sign up, Forgot password, and Reset password screens. |
| `src/features/auth/components/` | `PasswordInput` (Show / Hide toggle), `AuthButton` (press animation and spinner), and `Entrance` (slide-in and error shake, skipped when the device has Reduce Motion on). |
| `src/features/auth/resetLink.ts` | Reads the tokens or error message out of the link in a password reset email. |
| `src/features/auth/authStyles.ts` | Shared styles for the auth screens, including the Illinois blue and orange colors. |

To get the logged-in user in a component:

```tsx
const { session } = useAuth();
const email = session?.user.email;
```

To call a protected backend endpoint, send the access token. The backend's `requireAuth` middleware checks it:

```ts
const { data } = await supabase.auth.getSession();
fetch(`${API_URL}/api/spots`, {
  headers: { Authorization: `Bearer ${data.session?.access_token}` },
});
```

### New users get a profile automatically

The migration `supabase/migrations/20261021000000_create_profile_on_signup.sql` adds a database trigger. When someone signs up, it inserts a row into `public.users`. Because `username` and `display_name` are required, they are generated from the email: the display name is the part before the `@`, and the username is that name (lowercase, letters, numbers and underscores only) plus 8 characters of the user id so it is unique. Accounts created before the migration was applied do not get a profile row.

`public.users` has row level security turned on and no read policy yet, so the app cannot read profile rows until one is added.

### Forgot password

The Forgot password screen sends a reset email. The link in it opens the app on the Reset password screen, which asks for a new password. The app address the link returns to must be allowed in Supabase:

- Local Supabase: `additional_redirect_urls` in `supabase/config.toml`. Restart Supabase after changing it.
- Hosted Supabase: Authentication, then URL Configuration, in the Supabase dashboard. Add `mobile://reset-password`.

With local Supabase, reset emails are not delivered to a real inbox. Open http://127.0.0.1:54324 (Mailpit) to read them.

Known limitation: local Supabase does not redirect to Expo Go addresses that use an IP (for example `exp://192.168.1.5:8081/--/reset-password`), so the link will not open the app from Expo Go on a phone. Links that use this app's `mobile://` scheme work, so a development or production build should be fine, but this has not been tried.

### Tests

Run these from the `mobile` directory. They use Node's built-in test runner, so no extra packages are needed.

```bash
npm test            # unit tests, plus the auth tests if local Supabase is running
npm run test:unit   # unit tests only, nothing needs to be running
npm run test:auth   # auth tests only, needs Docker and `npm run db:start`
```

- `tests/resetLink.test.mjs` checks how the app reads a password reset link.
- `tests/auth.integration.test.mjs` signs real test users up against local Supabase and checks sign up, the profile row, log in, log out, staying logged in, and the password reset email and link. Every test user is deleted afterwards. If local Supabase is not running, these tests are skipped with a message. Supabase allows 30 sign-ups and logins per 5 minutes from one address, so avoid running the auth tests many times in a row.

The tests do not check what the screens look like. Run the app to check that.

## Frontend structure

```text
src/
  app/                    # Expo Router routes and navigator layouts only
    (tabs)/               # Bottom-tab route group
  features/               # Feature-owned screens, components, hooks, API calls, and types
    auth/                 # Log in, sign up, password reset, AuthProvider, and auth components
    home/
    study-spots/
    feed/
    profile/
  shared/                 # Code intentionally used by multiple features
    components/
    data/
    lib/                  # Shared setup code, such as the Supabase client
    utils/
tests/                    # Node test runner tests (see Authentication)
```

Keep route files in `src/app/` thin. Put feature-specific code in `src/features/<feature>/` and reusable code in `src/shared/`.
