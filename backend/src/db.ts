/**
 * db.ts — SQLite database setup with a normalized relational schema.
 *
 * Uses Node's BUILT-IN node:sqlite module (DatabaseSync), not the
 * third-party better-sqlite3 package. This was a deliberate fix: 
 * better-sqlite3 ships a native C++ addon that must be compiled with
 * node-gyp on install, which requires Visual Studio Build Tools on
 * Windows -- a real environment failure hit during development
 * (`npm install` failed with "could not use PowerShell to find Visual
 * Studio 2017 or newer"). Node's built-in SQLite module needs zero
 * native compilation and ships with Node itself (stable since Node 22).
 *
 * Design decisions worth defending in an interview:
 *  - Foreign keys enforced (PRAGMA foreign_keys = ON) — SQLite doesn't
 *    enforce these by default, easy to forget.
 *  - wishlists is a proper junction table (user_id, event_id), NOT an
 *    array column on the user row. The original (fake) implementation
 *    stored wishlist as an array field on the user document — normalizing
 *    it into its own table avoids the classic "update a JSON array
 *    concurrently" race condition and makes querying "who wishlisted
 *    this event" trivial with a plain JOIN.
 *  - ticket capacity is enforced with a real SQL transaction (see
 *    routes/events.ts registerForEvent) to prevent overselling under
 *    concurrent requests — checking capacity in application code
 *    without a transaction is a classic race condition (TOCTOU bug).
 */
import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "eventsphere.db");

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA journal_mode = WAL");

/**
 * node:sqlite's DatabaseSync has no built-in `.transaction()` helper
 * (unlike better-sqlite3). This wraps a function in a real SQL
 * transaction manually -- BEGIN, run the function, COMMIT on success,
 * ROLLBACK on any thrown error (including the deliberate business-logic
 * errors thrown in routes/events.ts for "event full" etc).
 */
export function runInTransaction<T>(fn: () => T): T {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      photo_url TEXT,
      role TEXT NOT NULL CHECK (role IN ('organizer', 'attendee')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 100),
      description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 1000),
      event_date TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      organizer_id TEXT NOT NULL REFERENCES users(id),
      organizer_name TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      tickets_sold INTEGER NOT NULL DEFAULT 0 CHECK (tickets_sold >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      ticket_count INTEGER NOT NULL CHECK (ticket_count > 0),
      total_price REAL NOT NULL,
      checked_in INTEGER NOT NULL DEFAULT 0,
      check_in_time TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(event_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS wishlists (
      user_id TEXT NOT NULL REFERENCES users(id),
      event_id TEXT NOT NULL REFERENCES events(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, event_id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
    CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
  `);
}
