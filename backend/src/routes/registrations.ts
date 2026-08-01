import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../middleware.js";

const router = Router();

router.get("/mine", requireAuth, (req, res) => {
  const registrations = db
    .prepare(
      `SELECT r.*, e.title as event_title, e.event_date, e.location
       FROM registrations r JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ? ORDER BY e.event_date ASC`
    )
    .all(req.user!.userId);
  res.json(registrations);
});

router.get("/event/:eventId", requireAuth, requireRole("organizer"), (req, res) => {
  const eventId = req.params.eventId as string;
  // Ownership check: an organizer can only see registrations for THEIR OWN
  // events, not any event in the system just because they have the
  // 'organizer' role. This is authorization, not just authentication --
  // role check alone is insufficient here.
  const event = db.prepare("SELECT organizer_id FROM events WHERE id = ?").get(eventId) as any;
  if (!event) return res.status(404).json({ error: "Event not found" });
  if (event.organizer_id !== req.user!.userId) {
    return res.status(403).json({ error: "You do not own this event" });
  }

  const registrations = db
    .prepare(
      `SELECT r.*, u.display_name as user_name, u.email as user_email
       FROM registrations r JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ? ORDER BY r.created_at ASC`
    )
    .all(eventId);
  res.json(registrations);
});

router.patch("/:id/checkin", requireAuth, requireRole("organizer"), (req, res) => {
  const id = req.params.id as string;
  const registration = db
    .prepare(
      `SELECT r.*, e.organizer_id FROM registrations r
       JOIN events e ON r.event_id = e.id WHERE r.id = ?`
    )
    .get(id) as any;

  if (!registration) return res.status(404).json({ error: "Registration not found" });
  if (registration.organizer_id !== req.user!.userId) {
    return res.status(403).json({ error: "You do not own this event" });
  }
  if (registration.checked_in) {
    return res.status(409).json({ error: "Already checked in" });
  }

  db.prepare(
    `UPDATE registrations SET checked_in = 1, check_in_time = datetime('now') WHERE id = ?`
  ).run(id);

  const updated = db
    .prepare(
      `SELECT r.*, e.title as event_title, u.display_name as user_name, u.email as user_email
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`
    )
    .get(id);
  res.json(updated);
});

export default router;
