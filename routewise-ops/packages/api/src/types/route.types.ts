export type RouteStatus = "planned" | "in_progress" | "completed" | "delayed";

export interface Route {
  id: string;
  routeName: string;
  region: string;
  distanceKm: number;
  status: RouteStatus;
  createdAt: string;
}

export interface RouteHistoryEntry {
  id: string;
  routeId: string;
  changedAt: string;
  previousStatus: RouteStatus;
  newStatus: RouteStatus;
  note: string;
}
