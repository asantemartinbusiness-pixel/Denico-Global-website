import { describe, expect, it } from "vitest";
import { RateLimiter, RecentResults } from "@/lib/enquiry/rate-limit";

describe("RateLimiter", () => {
  it("allows up to the limit within the window, then blocks with a retry time", () => {
    const limiter = new RateLimiter(2, 60_000);
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("a", 1_000).allowed).toBe(true);
    const blocked = limiter.check("a", 2_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(58);
  });

  it("tracks keys independently and recovers after the window", () => {
    const limiter = new RateLimiter(1, 1_000);
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("b", 0).allowed).toBe(true);
    expect(limiter.check("a", 500).allowed).toBe(false);
    expect(limiter.check("a", 1_001).allowed).toBe(true);
  });

  it("SEC-B: never tracks more than maxKeys, evicting the least recently seen", () => {
    const limiter = new RateLimiter(5, 60_000, 100);
    for (let i = 0; i < 10_000; i++) limiter.check(`rotating-${i}`, i);
    expect(limiter.size).toBe(100);
  });
});

describe("RecentResults", () => {
  it("expires entries after the TTL", () => {
    const recent = new RecentResults<string>(1_000);
    recent.set("k", "v", 0);
    expect(recent.get("k", 999)).toBe("v");
    expect(recent.get("k", 1_000)).toBeUndefined();
  });

  it("evicts the oldest entry when full", () => {
    const recent = new RecentResults<number>(10_000, 2);
    recent.set("a", 1, 0);
    recent.set("b", 2, 0);
    recent.set("c", 3, 0);
    expect(recent.get("a", 1)).toBeUndefined();
    expect(recent.get("c", 1)).toBe(3);
  });
});
