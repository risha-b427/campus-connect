import type { Request, Response } from "express";
import { getSpots, getSpotById } from "./spots.service.js";

async function getSpotsHandler(_req: Request, res: Response) {
  const spots = await getSpots();
  res.json(spots);
}

async function getSpotHandler(req: Request<{ id: string }>, res: Response) {
  res.set("Cache-Control", "no-store");
  const { id } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    res.status(400).json({ message: "Invalid spot ID" });
    return;
  }

  const spot = await getSpotById(id);
  if (spot === undefined) {
    res.status(404).json({ message: "Spot not found" });
    return;
  }

  res.json(spot);
}

export { getSpotsHandler, getSpotHandler };
