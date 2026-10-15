# Campus Connect

Campus Connect is a mobile app and API built with Expo, React Native, TypeScript, Expo Router, Node.js, and Express.

## Tech stack

| Area | Technology |
| --- | --- |
| Mobile framework | Expo SDK 57, React Native |
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

```powershell
npm run db:start # Starts supabase
npx supabase status
```

Create a migration when changing the database schema, then edit its SQL file under `supabase/migrations/`:

```powershell
npx supabase migration new <name of change>
```

Apply pending migrations with `npm run db:up`. To rebuild the local database from all migrations, use `npm run db:reset`; this clears local database data. 

Root shortcuts are also available for the backend and mobile app (look into the root package.json if you want to see what these shortcuts are actually doing):

```powershell
npm run backend:dev # Starts backend
npm run mobile # Starts frontend
```

## Mobile app guide

See [mobile/README.md](mobile/README.md) for complete onboarding, development commands, quality checks, and frontend structure conventions.

## Backend API guide

See [backend/README.md](backend/README.md) for complete onboarding, development commands, quality checks, and backend structure conventions.
