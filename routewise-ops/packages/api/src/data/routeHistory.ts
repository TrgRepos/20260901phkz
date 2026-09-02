import { RouteHistoryEntry } from "../types/route.types";

// Synthetic sample data only - never real driver, customer, or shipment data.
export const routeHistory: RouteHistoryEntry[] = [
  {
    id: "h1",
    routeId: "1",
    changedAt: "2026-01-05T08:10:00.000Z",
    previousStatus: "planned",
    newStatus: "in_progress",
    note: "Driver checked in and departed the depot.",
  },
  {
    id: "h2",
    routeId: "1",
    changedAt: "2026-01-05T10:45:00.000Z",
    previousStatus: "in_progress",
    newStatus: "completed",
    note: "All stops confirmed delivered.",
  },
  {
    id: "h3",
    routeId: "2",
    changedAt: "2026-01-06T08:20:00.000Z",
    previousStatus: "planned",
    newStatus: "in_progress",
    note: "Driver checked in and departed the depot.",
  },
  {
    id: "h4",
    routeId: "3",
    changedAt: "2026-01-06T09:30:00.000Z",
    previousStatus: "planned",
    newStatus: "in_progress",
    note: "Driver checked in and departed the depot.",
  },
  {
    id: "h5",
    routeId: "3",
    changedAt: "2026-01-06T12:05:00.000Z",
    previousStatus: "in_progress",
    newStatus: "delayed",
    note: "Road closure on Ridge Ave - rerouting in progress.",
  },
  {
    id: "h6",
    routeId: "5",
    changedAt: "2026-01-07T09:00:00.000Z",
    previousStatus: "planned",
    newStatus: "in_progress",
    note: "Driver checked in and departed the depot.",
  },
  {
    id: "h7",
    routeId: "5",
    changedAt: "2026-01-07T13:40:00.000Z",
    previousStatus: "in_progress",
    newStatus: "completed",
    note: "All stops confirmed delivered.",
  },
];
