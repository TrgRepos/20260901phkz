import { Route } from "../types/route.types";

// Synthetic sample data only - never real driver, customer, or shipment data.
export const routes: Route[] = [
  {
    id: "1",
    routeName: "Route 12 – Riverside Loop",
    region: "North",
    distanceKm: 18.4,
    status: "completed",
    createdAt: "2026-01-05T08:00:00.000Z",
  },
  {
    id: "2",
    routeName: "Route 4 – Harbor District",
    region: "East",
    distanceKm: 27.1,
    status: "in_progress",
    createdAt: "2026-01-06T08:00:00.000Z",
  },
  {
    id: "3",
    routeName: "Route 9 – North Ridge Express",
    region: "North",
    distanceKm: 41.7,
    status: "delayed",
    createdAt: "2026-01-06T09:15:00.000Z",
  },
  {
    id: "4",
    routeName: "Route 21 – Old Town Circuit",
    region: "Central",
    distanceKm: 12.9,
    status: "planned",
    createdAt: "2026-01-07T07:30:00.000Z",
  },
  {
    id: "5",
    routeName: "Route 6 – Southbay Connector",
    region: "South",
    distanceKm: 33.5,
    status: "completed",
    createdAt: "2026-01-07T08:45:00.000Z",
  },
  {
    id: "6",
    routeName: "Route 15 – Lakeside Run",
    region: "West",
    distanceKm: 22.0,
    status: "in_progress",
    createdAt: "2026-01-08T06:50:00.000Z",
  },
  {
    id: "7",
    routeName: "Route 3 – Industrial Park Loop",
    region: "Central",
    distanceKm: 15.6,
    status: "planned",
    createdAt: "2026-01-08T09:00:00.000Z",
  },
  {
    id: "8",
    routeName: "Route 18 – Airport Corridor",
    region: "East",
    distanceKm: 38.2,
    status: "completed",
    createdAt: "2026-01-09T07:10:00.000Z",
  },
];
