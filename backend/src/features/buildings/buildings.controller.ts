import type { Request, Response } from "express";
import { getAllBuildings } from "./buildings.service.js";

async function getBuildings(_req: Request, res: Response) {
  const buildings = await getAllBuildings();
  res.json(buildings);
}

export { getBuildings };
