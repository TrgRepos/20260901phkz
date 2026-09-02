import { useQuery } from "@tanstack/react-query";
import { fetchRouteHistory } from "../api/routesApi";

/**
 * Wraps fetchRouteHistory in TanStack Query's useQuery, using the current
 * (v5) API: queryKey and queryFn passed together in a single object, and
 * isPending (not the pre-v5 isLoading) as the "no data yet" flag.
 */
export function useRouteHistory(routeId: string) {
  return useQuery({
    queryKey: ["routeHistory", routeId],
    queryFn: () => fetchRouteHistory(routeId),
  });
}
