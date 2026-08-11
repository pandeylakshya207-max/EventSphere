/**
 * cache.ts — A small TTL cache for read-heavy, rarely-changing data.
 *
 * Applied to GET /api/events, the app's most-read endpoint (loaded on
 * every visit to the homepage) but one that only changes when an event
 * is created or someone registers (affecting tickets_sold).
 *
 * DESIGN NOTE — why an interface, not just a raw Map:
 * This is deliberately written as a small interface (get/set/invalidate)
 * with an in-memory Map implementation behind it, rather than sprinkling
 * `new Map()` calls directly into route handlers. That separation means
 * swapping to a real Redis-backed implementation later — needed the
 * moment this app runs as more than one server instance, since an
 * in-memory cache is NOT shared across processes/machines — is a
 * one-file change (implement the same Cache interface with an ioredis
 * client) rather than a rewrite of every route that reads from cache.
 *
 * LIMITATION, stated honestly: this in-memory implementation is
 * correct for a single process. It is NOT a substitute for Redis in a
 * horizontally-scaled deployment — each server instance would have its
 * own independent cache, so a write on instance A would not invalidate
 * stale data cached on instance B. That's the real, standard reason
 * production systems use a shared external cache once they scale past
 * one instance, and is exactly the tradeoff this design makes explicit
 * rather than hiding.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface Cache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlMs: number): void;
  invalidate(key: string): void;
  invalidatePrefix(prefix: string): void;
}

class InMemoryCache implements Cache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}

export const cache: Cache = new InMemoryCache();
