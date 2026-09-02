import { Request, Response } from "express";
import { routes } from "../data/routes";
import { routeHistory } from "../data/routeHistory";

export function listRoutes(req: Request, res: Response): void {
  const { minDistance } = req.query;

  let result = routes;

  if (minDistance !== undefined) {
    const min = Number(minDistance);
    result = routes.filter((route) => route.distanceKm >= min);
  }

  res.status(200).json(result);
}

export function getRouteById(req: Request, res: Response): void {
  const { id } = req.params;

  const route = routes.find((r) => r.id === id);

  if (!route) {
    res.status(404).json({ error: `Route with id ${id} not found.` });
    return;
  }

  res.status(200).json(route);
}

/**
 * GET /api/routes/:id/history
 * Returns every status-change history entry for a route, or 404 if the
 * route itself doesn't exist. A route with no recorded changes yet
 * returns 200 with an empty array, not a 404.
 */
export function getRouteHistory(req: Request, res: Response): void {
  const { id } = req.params;

  const route = routes.find((r) => r.id === id);

  if (!route) {
    res.status(404).json({ error: `Route with id ${id} not found.` });
    return;
  }

  const entries = routeHistory.filter((entry) => entry.routeId === id);

  res.status(200).json(entries);
}
