import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { RouteHistoryView } from "../src/components/RouteHistoryView";
import { renderWithProviders } from "./test-utils";

const sampleHistory = [
  {
    id: "h1",
    routeId: "3",
    changedAt: "2026-01-06T09:30:00.000Z",
    previousStatus: "planned",
    newStatus: "in_progress",
    note: "Driver checked in and departed the depot.",
  },
  {
    id: "h2",
    routeId: "3",
    changedAt: "2026-01-06T12:05:00.000Z",
    previousStatus: "in_progress",
    newStatus: "delayed",
    note: "Road closure on Ridge Ave, rerouting in progress.",
  },
];

describe("RouteHistoryView", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleHistory,
    }) as unknown as typeof fetch;
  });

  it("shows a loading state before the history arrives", () => {
    renderWithProviders(<RouteHistoryView routeId="3" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders each history entry once loaded", async () => {
    renderWithProviders(<RouteHistoryView routeId="3" />);

    await waitFor(() => {
      expect(screen.getByText("Road closure on Ridge Ave, rerouting in progress.")).toBeInTheDocument();
    });

    expect(screen.getByText("Driver checked in and departed the depot.")).toBeInTheDocument();
    expect(screen.getByText("Planned → In Progress")).toBeInTheDocument();
  });

  it("shows a friendly message for a route with no recorded history", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as unknown as typeof fetch;

    renderWithProviders(<RouteHistoryView routeId="4" />);

    await waitFor(() => {
      expect(screen.getByText("No status changes recorded for this route yet.")).toBeInTheDocument();
    });
  });

  it("shows an error message if the history fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Route with id 999 not found." }),
    }) as unknown as typeof fetch;

    renderWithProviders(<RouteHistoryView routeId="999" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
