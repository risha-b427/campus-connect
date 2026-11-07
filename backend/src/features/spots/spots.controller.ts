import type { Request, Response } from "express";
import { getSpots, isSpotType } from "./spots.service.js";

async function getSpotsHandler(req: Request, res: Response) {
  const { spotType } = req.query;

  if (spotType !== undefined && typeof spotType !== "string") {
    res.status(400).json({ message: "spotType must be a single value" });
    return;
  }

  if (spotType !== undefined && !isSpotType(spotType)) {
    res.status(400).json({ message: `Unsupported spot type: ${spotType}` });
    return;
  }

  const spots = await getSpots(spotType);
  res.json(spots);
}

export { getSpotsHandler };