import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { db, runInTransaction } from "../db.js";
import { requireAuth, requireRole } from "../middleware.js";
import { cache } from "../cache.js";

const EVENTS_LIST_CACHE_PREFIX = "events:list:";
const EVENTS_LIST_TTL_MS = 30 * 1000; // 30s: short enough that stale capacity numbers aren't visible for long

const router = Router();

router.get("/", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const cacheKey = `${EVENTS_LIST_CACHE_PREFIX}${limit}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  const events = db
    .prepare("SELECT * FROM events ORDER BY event_date ASC LIMIT ?")
    .all(limit);

  cache.set(cacheKey, events, EVENTS_LIST_TTL_MS);
  res.set("X-Cache", "MISS");
  res.json(events);
});

router.get("/mine", requireAuth, requireRole("organizer"), (req, res) => {
  const events = db
    .prepare("SELECT * FROM events WHERE organizer_id = ? ORDER BY event_date ASC")
    .all(req.user!.userId);
  res.json(events);
});

router.get("/:id", (req, res) => {
  const id = req.params.id as string;
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  eventDate: z.string().datetime(),
  location: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  imageUrl: z.string().url().optional(),
  price: z.number().min(0),
  capacity: z.number().int().positive(),
});

router.post("/", requireAuth, requireRole("organizer"), (req, res) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const d = parsed.data;
  const id = randomUUID();
  const organizer = db.prepare("SELECT display_name FROM users WHERE id = ?").get(req.user!.userId) as any;

  db.prepare(
    `INSERT INTO events (id, title, description, event_date, location, category, image_url, organizer_id, organizer_name, price, capacity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, d.title, d.description, d.eventDate, d.location, d.category, d.imageUrl ?? null,
        req.user!.userId, organizer.display_name, d.price, d.capacity);

  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
  cache.invalidatePrefix(EVENTS_LIST_CACHE_PREFIX);
  res.status(201).json(event);
});

const registerSchema = z.object({
  ticketCount: z.number().int().positive().max(10),
});

/**
 * POST /:id/register — the most important business-logic endpoint here.
 *
 * This uses a real SQL transaction to prevent overselling under concurrent
 * requests. The naive approach — SELECT tickets_sold, check in application
 * code if there's room, then INSERT — has a classic TOCTOU (time-of-check
 * to time-of-use) race condition: two requests can both read "5 seats left"
 * at the same time, both pass the check, and both insert, overselling the
 * event by one seat. Wrapping the check-and-update in a single database
 * transaction with better-sqlite3's synchronous API makes this atomic.
 */
router.post("/:id/register", requireAuth, (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { ticketCount } = parsed.data;
  const eventId = req.params.id as string;
  const userId = req.user!.userId;

  try {
    const registrationId = runInTransaction(() => {
      const event = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId) as any;
      if (!event) {
        throw { status: 404, message: "Event not found" };
      }
      const alreadyRegistered = db
        .prepare("SELECT id FROM registrations WHERE event_id = ? AND user_id = ?")
        .get(eventId, userId);
      if (alreadyRegistered) {
        throw { status: 409, message: "Already registered for this event" };
      }
      const remaining = event.capacity - event.tickets_sold;
      if (ticketCount > remaining) {
        throw { status: 409, message: `Only ${remaining} ticket(s) remaining` };
      }

      const registrationId = randomUUID();
      const totalPrice = event.price * ticketCount;

      db.prepare(
        `INSERT INTO registrations (id, event_id, user_id, ticket_count, total_price)
         VALUES (?, ?, ?, ?, ?)`
      ).run(registrationId, eventId, userId, ticketCount, totalPrice);

      db.prepare(
        `UPDATE events SET tickets_sold = tickets_sold + ? WHERE id = ?`
      ).run(ticketCount, eventId);

      return registrationId;
    });

    const registration = db.prepare("SELECT * FROM registrations WHERE id = ?").get(registrationId);
    // The events list cache includes tickets_sold, which just changed --
    // invalidate rather than let stale capacity numbers linger for up to
    // EVENTS_LIST_TTL_MS. A short TTL alone would eventually self-correct,
    // but explicit invalidation on write means users never see a stale
    // "3 spots left" right after a purchase that filled the event.
    cache.invalidatePrefix(EVENTS_LIST_CACHE_PREFIX);
    res.status(201).json(registration);
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
});

export default router;
