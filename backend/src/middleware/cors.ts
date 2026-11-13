import type { RequestHandler } from "express";

// Browsers block a web page from calling an API on a different origin (for
// example the Expo web app on :8081 calling this API on :3000) unless the API
// allows it. Phones running the native app aren't affected.
// Set CORS_ORIGINS to a comma-separated list to allow other origins.
// Read on first request, after .env has been loaded.
let allowedOrigins: Set<string> | undefined;

function getAllowedOrigins(): Set<string> {
  allowedOrigins ??= new Set(
    (process.env.CORS_ORIGINS ?? "http://localhost:8081")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  return allowedOrigins;
}

export const cors: RequestHandler = (req, res, next) => {
  const origin = req.get("origin");

  if (origin && getAllowedOrigins().has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  }

  // Answer the browser's permission check before auth runs (it carries no token).
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
};
