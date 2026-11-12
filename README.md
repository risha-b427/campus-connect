
# Campus Connect

Campus Connect is a mobile app and API built with Expo, React Native, TypeScript, Expo Router, Node.js, and Express.

## Start here

Follow these steps to run the project locally from Bash.

### Prerequisites

- [Node.js 22.13 or newer](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)
- Environment credentials from the **Members Google Drive**

The project uses a remote Supabase database, so Docker Desktop and a local Supabase instance are not required.

### First-time setup

Run these commands from the repository root:

```bash
npm install
npm --prefix backend install
npm --prefix mobile install
cp backend/.env.example backend/.env
```

**Configure environment variables:**

1. Check the **Members Google Drive** for the shared environment credentials.
2. Copy the required credentials into `backend/.env` and `mobile/.env.local` (create these files if you already have them).

> **Note:** Do not commit `.env` files or credentials to Git. Contact a project lead if you do not have access to the Members Google Drive.

Start the backend in one terminal:

```bash
npm run backend:dev
```

Start the mobile app in a second terminal:

```bash
npm run mobile
```

Then open the QR code with Expo Go, press `w` for web, or press `a` for an Android emulator.

For more details, see the [backend guide](backend/README.md) and [mobile guide](mobile/README.md).

## Tech stack

| Area | Technology |
| --- | --- |
| Mobile framework | Expo SDK 58, React Native |
| Backend API | Node.js, Express |
| Language | TypeScript |
| Navigation | Expo Router |
| Database | PostgreSQL via remote Supabase |

## Repository layout

```text
backend/    Express API
mobile/     Expo mobile application
supabase/   Supabase database migrations and seed data
```

## Supabase development

Campus Connect uses a **shared remote Supabase project** for development.

The backend connects directly to the remote Supabase PostgreSQL database using the credentials configured in `backend/.env`.
The frontend connects to Supabase Client using the credentials configured in `mobile/.env.local`.

## Guides

- [Backend setup guide](backend/README.md)
- [API reference](backend/docs/README.md)
- [Mobile app guide](mobile/README.md)
