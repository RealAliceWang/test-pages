/**
 * Shared seat-pool utilisation semantics.
 *
 * Every meter, ring and countdown that talks about "how full is this pool"
 * must read its thresholds and colours from here — pages never hard-code
 * their own cut-offs, so 49% means the same thing on every screen.
 */

export type PoolHealth = "low" | "ok" | "full";

/**
 * Health bucket for a utilisation percentage.
 * `full` (>=100) means at capacity, `low` (<50) means under-used —
 * opposite problems, so they must never share a colour.
 */
export function poolHealth(pct: number): PoolHealth {
  if (pct >= 100) return "full";
  if (pct < 50) return "low";
  return "ok";
}

/** Meter fill per health bucket. The colour tokens live in index.css. */
export const METER_FILL: Record<PoolHealth, string> = {
  full: "var(--color-meter-full)",
  low: "var(--color-meter-low)",
  ok: "var(--color-meter-ok)",
};

/** Pools within this many days of expiry show the「剩 N 天」countdown. */
export const POOL_EXPIRING_DAYS = 30;
