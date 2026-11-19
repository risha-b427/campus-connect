import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import {
  createCheckIn,
  endCheckIn,
  getActiveCheckIns,
  getSpots,
  type ApiCheckIn,
  type ApiSpot,
} from "@/shared/lib/api";

type CheckInContextValue = {
  spots: ApiSpot[];
  checkIns: ApiCheckIn[]; // everyone who is checked in right now
  myCheckIn: ApiCheckIn | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  // These return true if the backend accepted the request
  checkIn: (
    spotId: string,
    note: string,
    busyness: number,
    noise: number,
  ) => Promise<boolean>;
  checkOut: (
    busyness: number,
    noise: number,
    rating?: number,
  ) => Promise<boolean>;
};

const CheckInContext = createContext<CheckInContextValue | null>(null);

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function CheckInProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [spots, setSpots] = useState<ApiSpot[]>([]);
  const [checkIns, setCheckIns] = useState<ApiCheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [loadedSpots, loadedCheckIns] = await Promise.all([
        getSpots(),
        getActiveCheckIns(),
      ]);
      setSpots(loadedSpots);
      setCheckIns(loadedCheckIns);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load when someone logs in, clear when they log out
  useEffect(() => {
    if (!userId) {
      setSpots([]);
      setCheckIns([]);
      setError(null);
      return;
    }
    refresh();
  }, [userId, refresh]);

  const myCheckIn = checkIns.find((c) => c.userId === userId);

  async function checkIn(
    spotId: string,
    note: string,
    busyness: number,
    noise: number,
  ) {
    setError(null);
    try {
      const created = await createCheckIn(spotId, note, busyness, noise);
      setCheckIns((prev) => [created, ...prev]);
      return true;
    } catch (e) {
      setError(messageOf(e));
      return false;
    }
  }

  async function checkOut(busyness: number, noise: number, rating?: number) {
    if (!myCheckIn) return false;
    setError(null);
    try {
      const ended = await endCheckIn(myCheckIn.id, busyness, noise, rating);
      setCheckIns((prev) => prev.filter((c) => c.id !== ended.id));
      return true;
    } catch (e) {
      setError(messageOf(e));
      return false;
    }
  }

  return (
    <CheckInContext.Provider
      value={{ spots, checkIns, myCheckIn, loading, error, refresh, checkIn, checkOut }}
    >
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIns() {
  const context = useContext(CheckInContext);
  if (!context) {
    throw new Error("useCheckIns must be used inside a CheckInProvider");
  }
  return context;
}