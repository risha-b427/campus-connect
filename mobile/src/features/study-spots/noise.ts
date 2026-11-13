import type { Spot, SpotType } from "./api";

export type NoiseLevel = "Quiet" | "Moderate" | "Loud";

export const NOISE_LEVELS: NoiseLevel[] = ["Quiet", "Moderate", "Loud"];

// Noise scores use the same 1–10 scale as the API's averageNoise.
export function noiseLevelFromScore(score: number): NoiseLevel {
  if (score <= 3) return "Quiet";
  if (score <= 6) return "Moderate";
  return "Loud";
}

// FAKE noise scores until enough people check in to use real ones.
// Keyed by spot ID from supabase/seed.sql.
const FAKE_NOISE_SCORES: Record<string, number> = {
  "22222222-2222-4222-8222-222222222221": 3, // Grainger Library First Floor
  "22222222-2222-4222-8222-222222222222": 2, // Orange Room
  "22222222-2222-4222-8222-222222222223": 8, // Illini Union Basement
  "22222222-2222-4222-8222-222222222224": 6, // Siebel Basement
  "22222222-2222-4222-8222-222222222225": 6, // Expresso Royale
  "22222222-2222-4222-8222-222222222226": 7, // Caffe Paradiso
  "22222222-2222-4222-8222-222222222227": 5, // CIF
  "22222222-2222-4222-8222-222222222228": 4, // MechE Building
  "22222222-2222-4222-8222-222222222229": 3, // Everitt Lab
  "22222222-2222-4222-8222-22222222222a": 5, // ISR
  "22222222-2222-4222-8222-22222222222b": 6, // Cafe Bene
  "22222222-2222-4222-8222-22222222222c": 2, // Funk
};

// Fallback for spots not listed above, so every spot has a noise level.
const FAKE_NOISE_BY_TYPE: Record<SpotType, number> = {
  Library: 2,
  "University Housing": 5,
  Lounge: 5,
  Outdoor: 5,
  Cafe: 7,
  Restaurant: 8,
};

// To switch to real data later, return spot.averageNoise when it isn't null.
export function getNoiseLevel(spot: Spot): NoiseLevel {
  const score = FAKE_NOISE_SCORES[spot.id] ?? FAKE_NOISE_BY_TYPE[spot.spotType];
  return noiseLevelFromScore(score);
}
