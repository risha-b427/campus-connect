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

The app needs two values: the Supabase project URL and the project's publishable key. The team shares one remote Supabase project, so you do not need Docker or a local database.

1. Open the **Env Variables** document in the team's Google Drive and follow its instructions to get the credentials.
2. From the repository root, copy the example file and put the project URL and the publishable key (it starts with `sb_publishable_`) into it:

   ```bash
   cp mobile/.env.example mobile/.env.local
   ```

   ```text
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

3. The backend has its own file, `backend/.env` (copy `backend/.env.example`). Fill it in from the same document. The app and the backend must use the **same** Supabase project, or the backend will reject the app's login token with a 401 error.
4. Restart Expo after changing `.env.local`.

Because the project is shared and lives on the internet:

- A phone can reach it from any network, so you do not need your computer's network address.
- Everyone shares the same data. Accounts you create show up for the whole team, so use obviously fake test emails and throwaway passwords.
- Database changes (the files in `supabase/migrations/`) have to be applied to the remote project by whoever manages it. `supabase/seed.sql` is likewise loaded there separately.
- Auth settings live in the Supabase dashboard. Check Authentication there for whether new users must confirm their email. If they must, the sign-up screen shows "Check your email" instead of opening the app. Confirmation and reset emails go to real inboxes, and Supabase's built-in email sending has a low hourly limit.

#### Keep your credentials safe

`.env.local` and `backend/.env` are ignored by git. Never commit them, and never paste credentials into GitHub comments, pull requests, or chat. Anything starting with `EXPO_PUBLIC_` is bundled into the app and visible to anyone who has it, so only the project URL and the publishable key belong in `mobile/.env.local`. A secret key, a `service_role` key, or a database password belongs only in the backend, never in the mobile app.

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

The migration `supabase/migrations/20261021000000_create_profile_on_signup.sql` adds a database trigger. It must be applied to the remote project; until it is, sign-up works but no profile row is created. When someone signs up, it inserts a row into `public.users`. Because `username` and `display_name` are required, they are generated from the email: the display name is the part before the `@`, and the username is that name (lowercase, letters, numbers and underscores only) plus 8 characters of the user id so it is unique. Accounts created before the migration was applied do not get a profile row.

`public.users` has row level security turned on and no read policy yet, so the app cannot read profile rows until one is added.

### Forgot password

The Forgot password screen sends a reset email. The link in it opens the app on the Reset password screen, which asks for a new password.

For the link to open the app, the address it returns to must be allowed in the Supabase dashboard: under Authentication, then URL Configuration, add `mobile://reset-password` to the Redirect URLs. Links that use this app's `mobile://` scheme work in a development or production build.

Not checked on the remote project: Expo Go opens links with an address like `exp://192.168.1.5:8081/--/reset-password`. With a local Supabase, such IP-based addresses were rejected and the link fell back to the default site URL, so the reset link did not open the app from Expo Go. The remote project may behave differently if a matching pattern is added to the Redirect URLs, but this has not been tried.

### Tests

Run this from the `mobile` directory. It uses Node's built-in test runner, so no extra packages are needed, and nothing has to be running.

```bash
npm test
```

`tests/resetLink.test.mjs` checks how the app reads a password reset link: valid tokens, an Expo Go style link, an expired or used link, a link with missing tokens, and no link at all.

The tests do not cover Supabase itself or what the screens look like. Run the app to check those.

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
