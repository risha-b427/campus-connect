import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set in the backend environment.");
}

const hostname = new URL(connectionString).hostname;
const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(hostname);

export const db = new pg.Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

db.on("error", (error) => {
  console.error("Unexpected error on an idle PostgreSQL connection:", error.message);
});
