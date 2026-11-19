import type { Request, Response } from "express";
import { checkIn, checkOut, getActiveCheckIns } from "./check-ins.service.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isScore(value: unknown, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= max;
}

// pg errors carry a `code` property
function pgCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

async function checkInHandler(req: Request, res: Response) {
  const { spotId, note, busyness, noise } = req.body ?? {};

  if (typeof spotId !== "string" || !uuidPattern.test(spotId)) {
    res.status(400).json({ message: "Invalid spot ID" });
    return;
  }
  if (!isScore(busyness, 10) || !isScore(noise, 10)) {
    res.status(400).json({ message: "busyness and noise must be whole numbers from 1 to 10" });
    return;
  }
  if (note !== undefined && (typeof note !== "string" || note.length > 200)) {
    res.status(400).json({ message: "note must be text of 200 characters or fewer" });
    return;
  }

  try {
    const created = await checkIn(
      req.user!.id,
      spotId,
      note?.trim() || null,
      busyness,
      noise,
    );
    res.status(201).json(created);
  } catch (error) {
    if (pgCode(error) === "23505") {
      res.status(409).json({ message: "You are already checked in" });
      return;
    }
    if (pgCode(error) === "23503") {
      res.status(404).json({ message: "Spot not found" });
      return;
    }
    throw error;
  }
}

async function checkOutHandler(req: Request, res: Response) {
  const id = req.params.id;
  const { busyness, noise, rating } = req.body ?? {};

  if (typeof id !== "string" || !uuidPattern.test(id)) {
    res.status(400).json({ message: "Invalid check-in ID" });
    return;
  }
  if (!isScore(busyness, 10) || !isScore(noise, 10)) {
    res.status(400).json({ message: "busyness and noise must be whole numbers from 1 to 10" });
    return;
  }
  if (rating !== undefined && !isScore(rating, 5)) {
    res.status(400).json({ message: "rating must be a whole number from 1 to 5" });
    return;
  }

  const result = await checkOut(id, req.user!.id, busyness, noise, rating);
  if (!result) {
    res.status(404).json({ message: "Active check-in not found" });
    return;
  }
  res.json(result);
}

async function getActiveHandler(_req: Request, res: Response) {
  res.json(await getActiveCheckIns());
}

export { checkInHandler, checkOutHandler, getActiveHandler };