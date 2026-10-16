/**
 * In-memory sliding-window limiter with a hard cap on tracked keys.
 *
 * Scope: one server process. On multi-instance or serverless hosting this
 * must be replaced with a shared store (see docs/forms-and-integrations.md).
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private checksSincePrune = 0;

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 10_000,
  ) {}

  /** Records a hit and returns whether it is allowed, with seconds until retry. */
  check(key: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
    const windowStart = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((t) => t > windowStart);

    // Re-insert so Map order tracks recency; the first key is the least recently seen.
    this.hits.delete(key);

    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      const oldest = recent[0] ?? now;
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000)) };
    }

    recent.push(now);
    this.hits.set(key, recent);

    // Amortised cleanup of expired keys, then a hard cap by recency.
    if (++this.checksSincePrune >= 1_000) {
      this.checksSincePrune = 0;
      for (const [k, times] of this.hits) {
        if (!times.some((t) => t > windowStart)) this.hits.delete(k);
      }
    }
    while (this.hits.size > this.maxKeys) {
      const leastRecent = this.hits.keys().next().value;
      if (leastRecent === undefined) break;
      this.hits.delete(leastRecent);
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }

  get size() {
    return this.hits.size;
  }
}

/** Remembers recent results so a repeated submission returns the original outcome. */
export class RecentResults<T> {
  private readonly entries = new Map<string, { value: T; expires: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 5_000,
  ) {}

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expires <= now) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, now = Date.now()) {
    this.entries.delete(key);
    if (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { value, expires: now + this.ttlMs });
  }
}
