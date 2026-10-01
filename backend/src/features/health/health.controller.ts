import type { RequestHandler } from "express";
import { getHealthStatus } from "./health.service.js";

const getHealth: RequestHandler = (_req, res) => {
  res.json(getHealthStatus());
};

export { getHealth };
