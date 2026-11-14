import type { StudySpot } from "@/shared/data/mockStudySpots";

export type CostFilter = "all" | "free" | "paid";

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Match every search word against the spot name or building, then apply cost. */
export function filterStudySpots(
  spots: readonly StudySpot[],
  query: string,
  cost: CostFilter,
): StudySpot[] {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return spots.filter((spot) => {
    const matchesCost = cost === "all" || (cost === "free" ? spot.isFree : !spot.isFree);
    const searchable = normalizeSearch(`${spot.area ?? ""} ${spot.name}`);
    return matchesCost && words.every((word) => searchable.includes(word));
  });
}
