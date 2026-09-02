import { useState } from "react";
import { useRoutes } from "../hooks/useRoutes";
import { RouteCard } from "./RouteCard";
import { RouteHistoryView } from "./RouteHistoryView";

export function RouteDashboard() {
  const { routes, isLoading, error } = useRoutes();
  const [openRouteId, setOpenRouteId] = useState<string | null>(null);

  if (isLoading) {
    return <p role="status">Loading routes…</p>;
  }

  if (error) {
    return <p role="alert">Could not load routes: {error}</p>;
  }

  function handleToggleHistory(routeId: string) {
    setOpenRouteId((current) => (current === routeId ? null : routeId));
  }

  return (
    <section>
      <h2>Routes</h2>
      <ul className="route-list">
        {routes.map((route) => (
          <li key={route.id} className="route-list-item">
            <RouteCard
              route={route}
              isHistoryOpen={openRouteId === route.id}
              onToggleHistory={handleToggleHistory}
            />
            {openRouteId === route.id && <RouteHistoryView routeId={route.id} />}
          </li>
        ))}
      </ul>
    </section>
  );
}
