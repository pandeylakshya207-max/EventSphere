/**
 * cache.test.ts — Verifies the caching layer added to GET /api/events:
 * cache hits on repeated reads, and invalidation on writes so users
 * never see stale ticket counts after a purchase.
 */
import { describe, it, expect } from "vitest";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-do-not-use-in-production";
process.env.DB_PATH = ":memory:";

const { createApp } = await import("../src/index.js");
const app = createApp();

describe("Events list caching", () => {
  it("reports a cache MISS on first request, then a HIT on the second identical request", async () => {
    const first = await request(app).get("/api/events?limit=10");
    expect(first.headers["x-cache"]).toBe("MISS");

    const second = await request(app).get("/api/events?limit=10");
    expect(second.headers["x-cache"]).toBe("HIT");
  });

  it("invalidates the cache when a new event is created, so the new event is immediately visible", async () => {
    // Warm the cache
    await request(app).get("/api/events?limit=50");

    const org = await request(app).post("/api/auth/signup").send({
      email: "cache-test-organizer@test.com",
      password: "password123",
      displayName: "Cache Test Organizer",
      role: "organizer",
    });

    const created = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${org.body.token}`)
      .send({
        title: "Brand New Event",
        description: "Should appear immediately",
        eventDate: "2027-06-01T18:00:00Z",
        location: "Bengaluru",
        category: "Test",
        price: 0,
        capacity: 10,
      });
    expect(created.status).toBe(201);

    // If the cache weren't invalidated, this would still show the stale
    // pre-creation list (a MISS is expected here since invalidation
    // cleared the entry) and might not include the new event at all.
    const afterCreate = await request(app).get("/api/events?limit=50");
    expect(afterCreate.headers["x-cache"]).toBe("MISS");
    const titles = afterCreate.body.map((e: any) => e.title);
    expect(titles).toContain("Brand New Event");
  });
});
