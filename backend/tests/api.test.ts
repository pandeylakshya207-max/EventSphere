/**
 * api.test.ts — Integration tests for the EventSphere backend.
 * Uses a fresh in-memory SQLite database per test run (DB_PATH=:memory:)
 * so tests never touch real data and are fully isolated/repeatable.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-do-not-use-in-production";
process.env.DB_PATH = ":memory:";

const { createApp } = await import("../src/index.js");
const app = createApp();

describe("Auth", () => {
  it("signs up a new organizer and returns a valid token + user", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "organizer@test.com",
      password: "password123",
      displayName: "Test Organizer",
      role: "organizer",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe("organizer");
  });

  it("rejects signup with a duplicate email", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "organizer@test.com",
      password: "password123",
      displayName: "Duplicate",
      role: "attendee",
    });
    expect(res.status).toBe(409);
  });

  it("rejects signup with a short password", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "shortpw@test.com",
      password: "abc",
      displayName: "Short",
      role: "attendee",
    });
    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "organizer@test.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it("rejects login with wrong password, with the SAME error as a nonexistent email (no user enumeration)", async () => {
    const wrongPw = await request(app).post("/api/auth/login").send({
      email: "organizer@test.com",
      password: "wrongpassword",
    });
    const noUser = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@test.com",
      password: "whatever123",
    });
    expect(wrongPw.status).toBe(401);
    expect(noUser.status).toBe(401);
    expect(wrongPw.body.error).toBe(noUser.body.error);
  });

  it("rejects access to a protected route without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("Events and registration (capacity logic)", () => {
  let organizerToken: string;
  let attendeeToken: string;
  let eventId: string;

  beforeAll(async () => {
    const org = await request(app).post("/api/auth/signup").send({
      email: "org2@test.com", password: "password123",
      displayName: "Org Two", role: "organizer",
    });
    organizerToken = org.body.token;

    const att = await request(app).post("/api/auth/signup").send({
      email: "attendee@test.com", password: "password123",
      displayName: "Attendee One", role: "attendee",
    });
    attendeeToken = att.body.token;
  });

  it("lets an organizer create an event", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: "Tech Meetup", description: "A meetup", eventDate: "2027-01-01T18:00:00Z",
        location: "Bengaluru", category: "Tech", price: 100, capacity: 2,
      });
    expect(res.status).toBe(201);
    expect(res.body.ticketsSold ?? res.body.tickets_sold).toBe(0);
    eventId = res.body.id;
  });

  it("rejects event creation by an attendee (role check)", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${attendeeToken}`)
      .send({
        title: "Should Fail", description: "x", eventDate: "2027-01-01T18:00:00Z",
        location: "x", category: "x", price: 0, capacity: 5,
      });
    expect(res.status).toBe(403);
  });

  it("registers an attendee for the event", async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set("Authorization", `Bearer ${attendeeToken}`)
      .send({ ticketCount: 2 });
    expect(res.status).toBe(201);
  });

  it("rejects a duplicate registration for the same event by the same user", async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set("Authorization", `Bearer ${attendeeToken}`)
      .send({ ticketCount: 1 });
    expect(res.status).toBe(409);
  });

  it("rejects registration that would exceed capacity (the core business rule)", async () => {
    const another = await request(app).post("/api/auth/signup").send({
      email: "attendee2@test.com", password: "password123",
      displayName: "Attendee Two", role: "attendee",
    });
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set("Authorization", `Bearer ${another.body.token}`)
      .send({ ticketCount: 1 }); // capacity=2, already 2 sold -> should be rejected
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/remaining/i);
  });
});

describe("Authorization boundaries", () => {
  it("prevents an organizer from viewing check-in data for an event they don't own", async () => {
    const orgA = await request(app).post("/api/auth/signup").send({
      email: "ownerA@test.com", password: "password123", displayName: "Owner A", role: "organizer",
    });
    const orgB = await request(app).post("/api/auth/signup").send({
      email: "ownerB@test.com", password: "password123", displayName: "Owner B", role: "organizer",
    });
    const event = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${orgA.body.token}`)
      .send({
        title: "Owner A's Event", description: "x", eventDate: "2027-01-01T18:00:00Z",
        location: "x", category: "x", price: 0, capacity: 10,
      });

    const res = await request(app)
      .get(`/api/registrations/event/${event.body.id}`)
      .set("Authorization", `Bearer ${orgB.body.token}`);
    expect(res.status).toBe(403);
  });
});
