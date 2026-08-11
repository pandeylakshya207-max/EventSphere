import rateLimit from "express-rate-limit";

/**
 * Rate limiting on auth endpoints — specifically to slow down
 * credential-stuffing / brute-force login attempts, which was an
 * explicitly documented gap in this project's README until now.
 *
 * Deliberately stricter on /login than /signup: login is the endpoint an
 * attacker would hammer to brute-force a known email's password. Signup
 * abuse (mass fake account creation) is a real concern too, but a
 * slightly looser limit there avoids annoying legitimate users signing
 * up in quick succession from behind a shared/corporate IP (NAT).
 *
 * LIMITATION, stated honestly: this is in-memory, per-process rate
 * limiting (express-rate-limit's default store). It resets on server
 * restart and does NOT share state across multiple server instances --
 * running this behind a load balancer with several backend replicas
 * would need a shared store (e.g. Redis, via rate-limit-redis) so all
 * instances agree on one attacker's request count. Documented as a
 * scaling limitation, not fixed here, since this app runs as a single
 * instance.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many accounts created from this network. Please try again later." },
});
