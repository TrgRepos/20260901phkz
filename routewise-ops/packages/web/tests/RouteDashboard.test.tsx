import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouteDashboard } from "../src/components/RouteDashboard";
import { renderWithProviders } from "./test-utils";

const sampleRoutes = [
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
];

const sampleHistory = [
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
];

function mockFetchByUrl() {
  return vi.fn().mockImplementation((url: string) => {
    if (url.includes("/history")) {
      return Promise.resolve({ ok: true, json: async () => sampleHistory });
    }
    return Promise.resolve({ ok: true, json: async () => sampleRoutes });
  });
}

describe("RouteDashboard", () => {
  beforeEach(() => {
    global.fetch = mockFetchByUrl() as unknown as typeof fetch;
  });

  it("shows a loading state before the routes arrive", () => {
    renderWithProviders(<RouteDashboard />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the fetched routes after loading", async () => {
    renderWithProviders(<RouteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Route 12 – Riverside Loop")).toBeInTheDocument();
    });

    expect(screen.getByText("Route 4 – Harbor District")).toBeInTheDocument();
  });

  it("shows an error message if the fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    renderWithProviders(<RouteDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("shows a route's history after clicking 'View history', and hides it again on toggle", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RouteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Route 12 – Riverside Loop")).toBeInTheDocument();
    });

    const [firstViewHistoryButton] = screen.getAllByRole("button", { name: "View history" });
    await user.click(firstViewHistoryButton);

    await waitFor(() => {
      expect(screen.getByText("All stops confirmed delivered.")).toBeInTheDocument();
    });

    const hideButton = screen.getByRole("button", { name: "Hide history" });
    await user.click(hideButton);

    expect(screen.queryByText("All stops confirmed delivered.")).not.toBeInTheDocument();
  });
});
