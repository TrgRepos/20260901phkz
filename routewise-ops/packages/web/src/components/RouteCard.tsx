import { Route } from "../types/route.types";

interface RouteCardProps {
  route: Route;
  isHistoryOpen: boolean;
  onToggleHistory: (routeId: string) => void;
}

const STATUS_LABEL: Record<Route["status"], string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  delayed: "Delayed",
};

export function RouteCard({ route, isHistoryOpen, onToggleHistory }: RouteCardProps) {
  return (
    <div className="route-card">
      <h3>{route.routeName}</h3>
      <p>{route.region}</p>
      <p>{route.distanceKm} km</p>
      <p>
        Status: <span className={`status status-${route.status}`}>{STATUS_LABEL[route.status]}</span>
      </p>
      <button
        type="button"
        aria-expanded={isHistoryOpen}
        onClick={() => onToggleHistory(route.id)}
      >
        {isHistoryOpen ? "Hide history" : "View history"}
      </button>
    </div>
  );
}
