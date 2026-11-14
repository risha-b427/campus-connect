import express from "express";
import healthRouter from "./features/health/health.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requireAuth } from "./middleware/requireAuth.js";

import buildingsRouter from "./features/buildings/buildings.routes.js";
import spotsRouter from "./features/spots/spots.routes.js";
import checkInsRouter from "./features/check-ins/check-ins.routes.js";

const app = express();

// Middleware
app.use(express.json());

// API endpoints
app.use("/api/health", healthRouter);

// Mount protected API routes after this middleware. Health stays public.
app.use("/api", requireAuth);
app.use("/api/buildings", buildingsRouter);
app.use("/api/spots", spotsRouter);
app.use("/api/check-ins", checkInsRouter);  

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export { app };
