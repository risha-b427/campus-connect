export type BusynessLevel = "full" | "busy" | "moderate" | "quiet";

// Least to most busy.
export const BUSYNESS_LEVELS: BusynessLevel[] = [
  "quiet",
  "moderate",
  "busy",
  "full",
];

// The lowest occupancy (0 to 1) that counts as each level.
const MIN_OCCUPANCY: Record<BusynessLevel, number> = {
  quiet: 0,
  moderate: 0.3,
  busy: 0.6,
  full: 0.85,
};

export const BUSYNESS_LABELS: Record<BusynessLevel, string> = {
  full: "Full",
  busy: "Busy",
  moderate: "Moderate",
  quiet: "Not busy",
};

export function getBusynessLevel(occupancy: number): BusynessLevel {
  // Check from most to least busy and return the first level reached.
  const level = [...BUSYNESS_LEVELS]
    .reverse()
    .find((l) => occupancy >= MIN_OCCUPANCY[l]);
  return level ?? "quiet";
}

export function formatPercent(occupancy: number): string {
  return `${Math.round(occupancy * 100)}%`;
}

// The range of occupancy each level covers, e.g. "30–59%" or "85%+".
export function getBusynessRange(level: BusynessLevel): string {
  const index = BUSYNESS_LEVELS.indexOf(level);
  const min = Math.round(MIN_OCCUPANCY[level] * 100);
  const next = BUSYNESS_LEVELS[index + 1];

  if (!next) return `${min}%+`;
  const max = Math.round(MIN_OCCUPANCY[next] * 100) - 1;
  if (min === 0) return `Under ${max + 1}%`;
  return `${min}–${max}%`;
}
