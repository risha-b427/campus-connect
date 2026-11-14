import {
  checkOutCheckIn,
  findUserCheckIn,
  findUserCheckIns,
  hasActiveCheckIn,
  insertCheckIn,
  spotExists,
  type CheckInRow,
} from "./check-ins.repository.js";

type CheckIn = {
  id: string;
  spot: { id: string; name: string };
  checkedInAt: string;
  checkedOutAt: string | null;
  busyness: number;
  noise: number;
  isActive: boolean;
};

// Expected failures the controller turns into an HTTP status.
class CheckInError extends Error {
  constructor(
    readonly status: 400 | 404 | 409,
    message: string,
  ) {
    super(message);
  }
}

// Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

function hasPgCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function toCheckIn(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    spot: { id: row.spotId, name: row.spotName },
    checkedInAt: row.checkedInAt.toISOString(),
    checkedOutAt: row.checkedOutAt ? row.checkedOutAt.toISOString() : null,
    busyness: row.busyness,
    noise: row.noise,
    isActive: row.checkedOutAt === null,
  };
}

const ALREADY_ACTIVE = "You already have an active check-in";
const SPOT_NOT_FOUND = "Study spot not found";

async function checkIn(
  userId: string,
  spotId: string,
  busyness: number,
  noise: number,
): Promise<CheckIn> {
  if (!(await spotExists(spotId))) {
    throw new CheckInError(400, SPOT_NOT_FOUND);
  }

  // The shared database doesn't enforce one active check-in per user yet, so
  // check here. (Two requests at the exact same moment could still both pass.)
  if (await hasActiveCheckIn(userId)) {
    throw new CheckInError(409, ALREADY_ACTIVE);
  }

  try {
    return toCheckIn(await insertCheckIn(userId, spotId, busyness, noise));
  } catch (error) {
    // If a unique index on active check-ins is added later, it lands here.
    if (hasPgCode(error, UNIQUE_VIOLATION)) {
      throw new CheckInError(409, ALREADY_ACTIVE);
    }
    // The spot was deleted between the existence check and the insert.
    if (hasPgCode(error, FOREIGN_KEY_VIOLATION)) {
      throw new CheckInError(400, SPOT_NOT_FOUND);
    }
    throw error;
  }
}

async function checkOut(
  userId: string,
  checkInId: string,
  busyness: number | null,
  noise: number | null,
): Promise<CheckIn> {
  const updated = await checkOutCheckIn(checkInId, userId, busyness, noise);
  if (updated) {
    return toCheckIn(updated);
  }

  // Nothing was updated: either it's already checked out, or it isn't the user's.
  const existing = await findUserCheckIn(checkInId, userId);
  if (existing) {
    throw new CheckInError(400, "This check-in is already completed");
  }
  // Same response for "doesn't exist" and "someone else's", so IDs aren't revealed.
  throw new CheckInError(404, "Check-in not found");
}

async function getMyCheckIns(userId: string): Promise<CheckIn[]> {
  const rows = await findUserCheckIns(userId);
  return rows.map(toCheckIn);
}

export type { CheckIn };
export { CheckInError, checkIn, checkOut, getMyCheckIns };
