/**
 * concurrency.test.ts — A REAL concurrent-load test, not a sequential
 * one. This closes a gap explicitly documented as missing: the original
 * test suite verified the capacity-check LOGIC was correct, but ran
 * requests one at a time, which cannot actually prove the race condition
 * is closed -- sequential requests can never race with each other.
 *
 * This test fires many registration requests at a single-seat event
 * TRULY simultaneously (Promise.all, all requests in flight before any
 * resolves) and asserts that AT MOST the available capacity ever
 * succeeds, no matter how many concurrent attempts hit it.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-do-not-use-in-production";
process.env.DB_PATH = ":memory:";

const { createApp } = await import("../src/index.js");
const app = createApp();

describe("Concurrency: ticket capacity under real simultaneous load", () => {
  let eventId: string;
  const CAPACITY = 5;
  const CONCURRENT_ATTEMPTS = 20;

  beforeAll(async () => {
    const org = await request(app).post("/api/auth/signup").send({
      email: "concurrency-organizer@test.com",
      password: "password123",
      displayName: "Concurrency Organizer",
      role: "organizer",
    });

    const event = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${org.body.token}`)
      .send({
        title: "Limited Capacity Event",
        description: "Only a few seats",
        eventDate: "2027-01-01T18:00:00Z",
        location: "Bengaluru",
        category: "Test",
        price: 0,
        capacity: CAPACITY,
      });
    eventId = event.body.id;
  }, 60000);

  it(
    `allows exactly ${CAPACITY} successful registrations out of ${CONCURRENT_ATTEMPTS} truly simultaneous attempts, never more`,
    async () => {
      // Create all attendee accounts and tokens FIRST, outside the timed
      // race, so the actual race only involves the register calls.
      const tokens: string[] = [];
      for (let i = 0; i < CONCURRENT_ATTEMPTS; i++) {
        const res = await request(app).post("/api/auth/signup").send({
          email: `racer-${i}@test.com`,
          password: "password123",
          displayName: `Racer ${i}`,
          role: "attendee",
        });
        tokens.push(res.body.token);
      }

      // Fire ALL registration requests at once -- every request is already
      // in flight before any of them resolves. This is what actually
      // exercises the race condition; sequential awaits never would.
      const results = await Promise.all(
        tokens.map((token) =>
          request(app)
            .post(`/api/events/${eventId}/register`)
            .set("Authorization", `Bearer ${token}`)
            .send({ ticketCount: 1 })
        )
      );

      const succeeded = results.filter((r) => r.status === 201);
      const rejected = results.filter((r) => r.status === 409);

      expect(succeeded.length).toBe(CAPACITY);
      expect(rejected.length).toBe(CONCURRENT_ATTEMPTS - CAPACITY);

      // The real proof this test exists to provide: the event was NEVER
      // oversold, verified directly against the database, not just against
      // the HTTP response codes above.
      const finalEvent = await request(app).get(`/api/events/${eventId}`);
      expect(finalEvent.body.tickets_sold).toBe(CAPACITY);
      expect(finalEvent.body.tickets_sold).toBeLessThanOrEqual(finalEvent.body.capacity);
    },
    // 60s: this test deliberately does 21 sequential bcrypt hashes (cost
    // factor 12, intentionally slow) during setup before the actual race
    // -- real time varies meaningfully across hardware, so this needs
    // real headroom rather than vitest's 5s default.
    60000
  );
});
