import express from "express";
import healthRouter from "./features/health/health.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

const app = express();

// Middleware
app.use(express.json());

// API endpoints
app.use("/api/health", healthRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export { app };
