  export type Spot = {
    id: string; name: string; building: string; isFree: boolean;
    hours: string; latitude: number; longitude: number;
  };
  export type CheckIn = {
    id: string; userId: string; userName: string; spotId: string;
    note?: string; startedAt: string; endedAt?: string | null;
    rating?: { busyness: number; noise: number };
  };