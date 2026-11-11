import type { Request, Response } from "express";
import { CheckInError, checkIn, checkOut, getMyCheckIns } from "./check-ins.service.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function isRating(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 10;
}

// requireAuth runs before these routes, so the user is always set here.
function currentUserId(req: Request): string {
  if (!req.user) {
    throw new Error("check-in routes must be mounted after requireAuth");
  }
  return req.user.id;
}

// The body is undefined when no JSON was sent, so fall back to an empty object.
function readBody(req: Request): Record<string, unknown> {
  const body: unknown = req.body;
  return typeof body === "object" && body !== null && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : {};
}

function sendCheckInError(res: Response, error: unknown): void {
  if (error instanceof CheckInError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  throw error;
}

async function createCheckInHandler(req: Request, res: Response) {
  const { spotId, note } = readBody(req);

  if (!isUuid(spotId)) {
    res.status(400).json({ message: "spotId must be a valid ID" });
    return;
  }

  if (note !== undefined && note !== null && typeof note !== "string") {
    res.status(400).json({ message: "note must be text" });
    return;
  }

  // Treat a blank note the same as no note.
  const trimmedNote = typeof note === "string" && note.trim() !== "" ? note.trim() : null;

  try {
    const created = await checkIn(currentUserId(req), spotId, trimmedNote);
    res.status(201).json(created);
  } catch (error) {
    sendCheckInError(res, error);
  }
}

async function checkOutHandler(req: Request, res: Response) {
  const { id } = req.params;
  const { busyness, noise } = readBody(req);

  if (!isUuid(id)) {
    res.status(400).json({ message: "Check-in ID must be a valid ID" });
    return;
  }

  if (!isRating(busyness) || !isRating(noise)) {
    res.status(400).json({ message: "busyness and noise must be whole numbers from 1 to 10" });
    return;
  }

  try {
    const updated = await checkOut(currentUserId(req), id, busyness, noise);
    res.json(updated);
  } catch (error) {
    sendCheckInError(res, error);
  }
}

async function getMyCheckInsHandler(req: Request, res: Response) {
  const checkIns = await getMyCheckIns(currentUserId(req));
  res.json(checkIns);
}

export { checkOutHandler, createCheckInHandler, getMyCheckInsHandler };
