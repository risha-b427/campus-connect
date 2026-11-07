import { createContext, useContext, useState, type ReactNode } from "react";

import { CURRENT_USER } from "@/shared/data/currentUser";
import { mockCheckIns, type CheckIn } from "@/shared/data/mockCheckIns";

type Rating = { busyness: number; noise: number };

type CheckInContextValue = {
  checkIns: CheckIn[];
  checkIn: (spotId: string, note?: string) => void;
  checkOut: (checkInId: string, rating?: Rating) => void;
};

const CheckInContext = createContext<CheckInContextValue | null>(null);

export function CheckInProvider({ children }: { children: ReactNode }) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>(mockCheckIns);

  function checkIn(spotId: string, note?: string) {
    const alreadyCheckedIn = checkIns.some(
      (c) => c.userId === CURRENT_USER.id && !c.endedAt,
    );
    if (alreadyCheckedIn) return;

    const newCheckIn: CheckIn = {
      id: `c${Date.now()}`,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      spotId,
      note: note || undefined,
      startedAt: new Date().toISOString(),
    };
    setCheckIns((prev) => [newCheckIn, ...prev]);
  }

  function checkOut(checkInId: string, rating?: Rating) {
  setCheckIns((prev) =>
    prev.map((c) =>
      c.id === checkInId
        ? { ...c, endedAt: new Date().toISOString(), ...(rating && { rating }) }
        : c,
    ),
  );
}

  return (
    <CheckInContext.Provider value={{ checkIns, checkIn, checkOut }}>
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