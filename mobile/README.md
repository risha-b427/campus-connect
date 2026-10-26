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

## Frontend structure

```text
src/
  app/                    # Expo Router routes and navigator layouts only
    (tabs)/               # Bottom-tab route group
  features/               # Feature-owned screens, components, hooks, API calls, and types
    auth/
    home/
    study-spots/
    feed/
    profile/
  shared/                 # Code intentionally used by multiple features
    components/
    data/
    utils/
```

Keep route files in `src/app/` thin. Put feature-specific code in `src/features/<feature>/` and reusable code in `src/shared/`.
