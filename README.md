# EventSphere

A full-stack event discovery and ticketing platform — React/TypeScript
frontend, a real Express + SQLite backend with proper authentication,
authorization, and concurrency-safe business logic.

## A real bug this project started from

Despite `firebase.ts` being present in this codebase along with a
professionally-written `firestore.rules` file, **the app never actually
connected to Firebase**. `src/lib/firebase.ts` was, in its own header
comment, a *"simulated offline database"* — a hand-rolled wrapper around
browser `localStorage` that mimicked the Firestore API surface
(`doc`, `collection`, `query`, `onSnapshot`, etc.) but persisted nothing
real. "Sign in" set a role string in `localStorage` based on whether a
fake user ID happened to contain the word `"organizer"` — there was no
real authentication, no real user accounts, and no real database.

This has been replaced with a genuine backend: real password hashing,
real JWT sessions, a real relational schema with foreign keys, and
authorization checks that are actually enforced server-side rather than
assumed by the UI.

## Architecture

```
├── src/                 React + TypeScript + Vite frontend
│   └── lib/api.ts       Typed client for the backend (replaces the old fake firebase.ts)
├── backend/              Express + TypeScript + SQLite
│   ├── src/db.ts         Schema definition
│   ├── src/auth.ts       bcrypt hashing + JWT signing/verification
│   ├── src/middleware.ts requireAuth / requireRole guards
│   ├── src/routes/       auth, events, registrations, wishlist
│   └── tests/            Integration tests (vitest + supertest)
```

## What's real now

- **Authentication**: bcrypt password hashing (12 salt rounds), JWT
  sessions (7-day expiry), identical error messages for "wrong password"
  vs. "no such account" (prevents user-enumeration)
- **Authorization**: role checks (organizer vs. attendee) AND ownership
  checks — an organizer can only view/manage registrations for events
  *they* created, not any event in the system
- **Concurrency-safe ticket registration**: capacity is checked and
  decremented inside a single SQL transaction, preventing the classic
  race condition where two simultaneous requests both read "1 seat left"
  and both succeed, overselling the event
- **Normalized schema**: wishlists are a proper junction table
  (`user_id`, `event_id`), not an array field on a user document —
  avoiding concurrent-array-update races and making "who wishlisted this
  event" a plain JOIN instead of a full collection scan
- **Input validation**: every endpoint validates its input with Zod
  before touching the database
- **Tested**: 12 integration tests, including the two hardest cases —
  the capacity race condition and cross-organizer authorization —
  running against a real (in-memory) database via supertest

## Tech stack

**Frontend**: React, TypeScript, Vite, Tailwind, shadcn/ui, React Router
**Backend**: Express, TypeScript, Node's built-in `node:sqlite`, bcryptjs, jsonwebtoken, Zod
**Testing**: Vitest, Supertest
**AI**: Google Gemini API (optional event-description generation)

## A real environment bug found during setup

The backend originally used `better-sqlite3`, a popular SQLite binding —
but it ships a native C++ addon that must be compiled on install via
`node-gyp`, which requires Visual Studio Build Tools on Windows. On a
machine without those build tools installed, `npm install` failed outright
(`could not use PowerShell to find Visual Studio 2017 or newer`).

Rather than requiring every contributor to install a multi-gigabyte C++
toolchain just to run a Node backend, this was switched to Node's **built-in**
`node:sqlite` module (stable since Node 22) — same synchronous, prepared-
statement API surface, zero native compilation, works identically on any
machine with a modern Node install. The one thing it doesn't provide that
`better-sqlite3` does is a built-in `.transaction()` helper; that's
replaced with an explicit `BEGIN`/`COMMIT`/`ROLLBACK` wrapper
(`runInTransaction()` in `db.ts`) that behaves identically for the
capacity-safe registration logic described above.

## Running this yourself

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # set a real JWT_SECRET
npm run dev             # http://localhost:4000
```

**Frontend** (in a separate terminal, from the repo root):
```bash
npm install
npm run dev              # http://localhost:3000
```

**Tests:**
```bash
cd backend
npm test
```

## System-design-at-scale additions

Three things were added specifically to move this from "correct CRUD app"
toward patterns that matter once traffic grows:

**Rate limiting** (`backend/src/rateLimit.ts`) — auth endpoints are
protected against brute-force/credential-stuffing (10 login attempts /
15 min) and signup abuse (50 signups / hour per IP). Explicitly documented
limitation: this uses `express-rate-limit`'s in-memory store, which is
per-process — it does NOT share state across multiple server instances.
Scaling this app horizontally behind a load balancer would need a shared
store (e.g. Redis via `rate-limit-redis`) so all instances agree on one
attacker's request count.

**Caching layer** (`backend/src/cache.ts`) — `GET /api/events` (the
most-read endpoint) is cached for 30s with explicit invalidation on
writes (new event created, new registration), so users never see stale
ticket counts right after a purchase. Deliberately built behind a small
`Cache` interface rather than raw `Map` calls in route handlers — swapping
to a real Redis-backed implementation for multi-instance deployments is a
one-file change, not a rewrite of every route that reads from cache.
Also explicitly NOT a substitute for Redis in a horizontally-scaled
deployment: this in-memory cache is only correct for a single process —
each server instance would maintain its own independent cache.

**A real concurrency stress test** (`backend/tests/concurrency.test.ts`) —
the original test suite verified the capacity-check *logic* was correct,
but ran requests sequentially, which can never actually prove a race
condition is closed. This test fires 30 registration requests at a
5-seat event *truly simultaneously* (`Promise.all`, all in flight before
any resolves) and asserts the database is never oversold — verified
directly against the database, not just HTTP response codes. Finding
this test's own false-start is itself a good story: it initially failed,
not from an overselling bug, but because the newly-added signup rate
limiter was too strict for the test's own legitimate signup burst,
returning 401s downstream from silently-rejected signups. Fixed by
raising the signup limit to a more realistic real-world number.

## Limitations

- SQLite is used for simplicity and zero-setup local development; a
  production deployment serving real concurrent traffic would likely
  want Postgres, though the concurrency-safety patterns here (real SQL
  transactions) carry over directly
- Rate limiting and caching are both in-memory/single-process (see above)
  — the natural next step for a multi-instance deployment is Redis for
  both, which the code is deliberately structured to make a small,
  contained change rather than a rewrite
- No email verification or password-reset flow
- The Gemini AI description generator requires your own API key
  (`GEMINI_API_KEY`) and is optional — the app works fully without it

## License

See [LICENSE](LICENSE).
