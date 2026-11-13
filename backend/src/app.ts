import express from "express";
import healthRouter from "./features/health/health.routes.js";
import { cors } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requireAuth } from "./middleware/requireAuth.js";

import buildingsRouter from "./features/buildings/buildings.routes.js";
import feedRouter from "./features/feed/feed.routes.js";
import spotsRouter from "./features/spots/spots.routes.js";

const app = express();

// Middleware
app.use(cors);
app.use(express.json());

// API endpoints
app.use("/api/health", healthRouter);

// Mount protected API routes after this middleware. Health stays public.
app.use("/api", requireAuth);
app.use("/api/buildings", buildingsRouter);
app.use("/api/spots", spotsRouter);
app.use("/api/feed", feedRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export { app };
