import express from "express";
import healthRouter from "./features/health/health.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();

// Middleware
app.use(express.json());

// API endpoints
app.use("/api/health", healthRouter);

// Mount protected API routes after this middleware. Health stays public.
app.use("/api", requireAuth);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export { app };
