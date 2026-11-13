import type { Request, Response } from "express";
import { getFeed } from "./feed.service.js";

async function getFeedHandler(req: Request, res: Response) {
  // requireAuth runs before this route, so the user is always set here.
  if (!req.user) {
    throw new Error("feed route must be mounted after requireAuth");
  }

  // The feed changes constantly, so never serve a cached copy on refresh.
  res.set("Cache-Control", "no-store");
  res.json(await getFeed(req.user.id));
}

export { getFeedHandler };
