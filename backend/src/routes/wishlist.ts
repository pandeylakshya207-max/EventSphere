import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const events = db
    .prepare(
      `SELECT e.* FROM wishlists w JOIN events e ON w.event_id = e.id
       WHERE w.user_id = ? ORDER BY w.created_at DESC`
    )
    .all(req.user!.userId);
  res.json(events);
});

router.post("/:eventId/toggle", requireAuth, (req, res) => {
  const userId = req.user!.userId;
  const eventId = req.params.eventId as string;

  const existing = db
    .prepare("SELECT 1 FROM wishlists WHERE user_id = ? AND event_id = ?")
    .get(userId, eventId);

  if (existing) {
    db.prepare("DELETE FROM wishlists WHERE user_id = ? AND event_id = ?").run(userId, eventId);
    return res.json({ wishlisted: false });
  } else {
    const event = db.prepare("SELECT id FROM events WHERE id = ?").get(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    db.prepare("INSERT INTO wishlists (user_id, event_id) VALUES (?, ?)").run(userId, eventId);
    return res.json({ wishlisted: true });
  }
});

export default router;
