import { Router } from "express";
import { listRoutes, getRouteById, getRouteHistory } from "../controllers/route.controller";
import { validateListQuery, validateIdParam } from "../validators/route.validator";

const router = Router();

// GET /api/routes — list all routes, optionally filtered by ?minDistance=
router.get("/", validateListQuery, listRoutes);

// GET /api/routes/:id/history — a route's status-change history
router.get("/:id/history", validateIdParam, getRouteHistory);

// GET /api/routes/:id — a single route by id
router.get("/:id", validateIdParam, getRouteById);

export default router;
