import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { fetchSpots, type Spot } from "../api";

// Loads the study spots from the backend as the signed-in user.
// `reload` fetches them again, for example after an error.
export function useSpots() {
  const { session } = useAuth();
  const accessToken = session?.access_token;

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Changing this number makes the effect below run again.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    // Ignore the response if the screen closed before it arrived.
    let cancelled = false;

    fetchSpots(accessToken)
      .then(
        (result) => {
          if (cancelled) return;
          setSpots(result);
          setError(null);
        },
        (err) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : "Couldn't load study spots.");
        },
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, attempt]);

  const reload = () => {
    setLoading(true);
    setError(null);
    setAttempt((n) => n + 1);
  };

  return { spots, loading, error, reload };
}
