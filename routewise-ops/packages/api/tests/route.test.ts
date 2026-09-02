import request from "supertest";
import app from "../src/server";

describe("GET /health", () => {
  it("returns 200 and an ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/routes", () => {
  it("returns 200 and a non-empty list of routes", async () => {
    const res = await request(app).get("/api/routes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("returns routes shaped like the Route type", async () => {
    const res = await request(app).get("/api/routes");
    const route = res.body[0];
    expect(route).toHaveProperty("id");
    expect(route).toHaveProperty("routeName");
    expect(route).toHaveProperty("region");
    expect(route).toHaveProperty("distanceKm");
    expect(route).toHaveProperty("status");
    expect(route).toHaveProperty("createdAt");
  });

  it("filters by minDistance when provided", async () => {
    const res = await request(app).get("/api/routes?minDistance=20");
    expect(res.status).toBe(200);
    for (const route of res.body) {
      expect(route.distanceKm).toBeGreaterThanOrEqual(20);
    }
  });

  it("rejects a non-numeric minDistance", async () => {
    const res = await request(app).get("/api/routes?minDistance=abc");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("rejects a negative minDistance", async () => {
    const res = await request(app).get("/api/routes?minDistance=-5");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /api/routes/:id", () => {
  it("returns 200 and the matching route for a valid, existing id", async () => {
    const res = await request(app).get("/api/routes/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("1");
    expect(res.body.routeName).toBe("Route 12 – Riverside Loop");
  });

  it("returns 404 for a well-formed but non-existent id", async () => {
    const res = await request(app).get("/api/routes/999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 for an invalid id format", async () => {
    const res = await request(app).get("/api/routes/abc");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /api/routes/:id/history", () => {
  it("returns 200 and an array of history entries for a route with history", async () => {
    const res = await request(app).get("/api/routes/1/history");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("previousStatus");
    expect(res.body[0]).toHaveProperty("newStatus");
  });

  it("returns 200 and an empty array for a route with no recorded history", async () => {
    const res = await request(app).get("/api/routes/4/history");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 404 for a well-formed but non-existent route id", async () => {
    const res = await request(app).get("/api/routes/999/history");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 for an invalid id format", async () => {
    const res = await request(app).get("/api/routes/abc/history");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
