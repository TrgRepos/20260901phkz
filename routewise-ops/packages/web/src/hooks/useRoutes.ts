import { useEffect, useState } from "react";
import { Route } from "../types/route.types";
import { fetchRoutes } from "../api/routesApi";

interface UseRoutesResult {
  routes: Route[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches the route list by hand with useState + useEffect - no caching,
 * no request de-duplication, no built-in retry. This is the "old pattern"
 * that Session 2.1's TanStack Query work is explicitly written to not
 * imitate for new data-fetching hooks.
 */
export function useRoutes(minDistance?: number): UseRoutesResult {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchRoutes(minDistance)
      .then((data) => {
        if (!cancelled) {
          setRoutes(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [minDistance]);

  return { routes, isLoading, error };
}
