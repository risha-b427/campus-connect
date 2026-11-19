import {
  endCheckIn,
  findActiveCheckIns,
  insertCheckIn,
} from "./check-ins.repository.js";

type CheckIn = {
  id: string;
  userId: string;
  userName: string;
  spotId: string;
  note: string | null;
  busyness: number;
  noise: number;
  startedAt: string;
  endedAt: string | null;
};

type Row = Awaited<ReturnType<typeof insertCheckIn>>;

function toCheckIn(row: Row): CheckIn {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName ?? "Student",
    spotId: row.spotId,
    note: row.note,
    busyness: row.busyness,
    noise: row.noise,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt ? row.endedAt.toISOString() : null,
  };
}

async function checkIn(
  userId: string,
  spotId: string,
  note: string | null,
  busyness: number,
  noise: number,
): Promise<CheckIn> {
  return toCheckIn(await insertCheckIn(userId, spotId, note, busyness, noise));
}

async function checkOut(
  checkInId: string,
  userId: string,
  busyness: number,
  noise: number,
  rating?: number,
): Promise<CheckIn | null> {
  const row = await endCheckIn(checkInId, userId, busyness, noise, rating);
  return row ? toCheckIn(row) : null;
}

async function getActiveCheckIns(): Promise<CheckIn[]> {
  return (await findActiveCheckIns()).map(toCheckIn);
}

export type { CheckIn };
export { checkIn, checkOut, getActiveCheckIns };