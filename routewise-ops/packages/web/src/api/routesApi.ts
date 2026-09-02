import { Route, RouteHistoryEntry } from "../types/route.types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export async function fetchRoutes(minDistance?: number): Promise<Route[]> {
  const url = new URL("/api/routes", API_BASE);
  if (minDistance !== undefined) {
    url.searchParams.set("minDistance", String(minDistance));
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Failed to fetch routes: ${res.status}`);
  }

  return res.json();
}

export async function fetchRouteById(id: string): Promise<Route> {
  const res = await fetch(`${API_BASE}/api/routes/${id}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch route ${id}: ${res.status}`);
  }

  return res.json();
}

export async function fetchRouteHistory(id: string): Promise<RouteHistoryEntry[]> {
  const res = await fetch(`${API_BASE}/api/routes/${id}/history`);

  if (!res.ok) {
    throw new Error(`Failed to fetch history for route ${id}: ${res.status}`);
  }

  return res.json();
}
