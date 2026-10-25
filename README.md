# Campus Connect

Campus Connect is a mobile app and API built with Expo, React Native, TypeScript, Expo Router, Node.js, and Express.

## Start here

Follow these steps to run the project locally from Bash.

### Prerequisites

- [Node.js 22.13 or newer](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/downloads)

Docker Desktop must be running before you start the local Supabase database.

### First-time setup

Run these commands from the repository root:

```bash
npm install
npm --prefix backend install
npm --prefix mobile install
cp backend/.env.example backend/.env
npm run db:start
npm run db:reset
```

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
| Database | Postgres via Supabase |

## Repository layout

```text
backend/    Express API
mobile/     Expo mobile application
supabase/   Local Supabase configuration and database migrations
```

## Supabase local development

The backend connects directly to the Supabase Postgres database. The Supabase CLI starts a local stack for development; Docker must be running.

Run these commands from the repository root:

```bash
npm run db:start
npx supabase status
```

Create a migration when changing the database schema:

```bash
npx supabase migration new <name-of-change>
```

Edit the generated file under `supabase/migrations/`, then apply pending migrations:

```bash
npm run db:up
```

To rebuild the local database from all migrations and reload seed data, use:

```bash
npm run db:reset
```

Resetting clears local database data.

## Guides

- [Backend API guide](backend/README.md)
- [Mobile app guide](mobile/README.md)
