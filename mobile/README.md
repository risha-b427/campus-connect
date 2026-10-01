# Campus Connect mobile app

The Campus Connect mobile app frontend is built with Expo, React Native, TypeScript, and Expo Router.

## Prerequisites

- Node.js 22.13 or newer
- The Expo Go app on an Android device or iPhone, if you plan to test on a physical phone. (Expo Go allows you to run the app locally on your mobile device, but you don't need it if you are testing on web or emulator)

## First-time setup

From this `mobile` directory, install the project dependencies:

```powershell
npm install
```

If you are using Expo Go on a physical iPhone, create a free Expo account at [expo.dev/signup](https://expo.dev/signup), then sign in on both your computer and phone with the same account. 

If you signed up with email and password, use:

```powershell
npx expo login
```

If your Expo account uses Google or another browser-based sign-in provider, use:

```powershell
npx eas-cli@latest login
```

This opens a browser so you can use the same OAuth provider. 

Then verify the CLI session with `npx expo whoami`.

On Android, an Expo login is currently optional for local Expo Go development.

## Run the app

```powershell
npm start
```

This starts Expo's development server and shows a QR code.

- Android: open Expo Go and use **Scan QR code**.
- iPhone: scan the QR code with the Camera app, then open it in Expo Go.
- Android emulator: press `a` in the Expo terminal (note you need to download an Android Emulator via Android Studios).
- Web: press `w` in the Expo terminal.

Your phone and computer need to be on the same Wi-Fi network. If a phone cannot connect, stop Expo with `Ctrl+C` and run:

```powershell
npx expo start --tunnel
```

Tunnel mode is slower, so prefer the normal LAN connection when possible.

## Everyday workflow

Run `npm start` for normal development. Run `npm install` again after pulling changes that modify `package.json` or `package-lock.json`.

Use Expo's installer for Expo packages so it selects a version compatible with this SDK:

```powershell
npx expo install expo-camera
```

Use `npm install <package>` for ordinary JavaScript-only dependencies.

## Frontend structure

The app uses a hybrid Expo Router and feature-based structure:

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
```

### Placement rules

- Keep `src/app/` files thin: they define navigation or export a feature screen.
- Put code used by one feature inside `src/features/<feature>/`.
- Put code used by multiple features inside `src/shared/`.
- Put shared integration setup in `src/services/` (for example,  `supabase.ts`). Keep feature-specific API calls inside their feature.
