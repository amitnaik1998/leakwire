import { describe, it, expect } from "vitest";
import {
  getConfidenceTier,
  getConfidenceLabel,
  formatConfidencePct,
  getEdgeClass,
  getBadgeClass,
  getRecencyBadge,
  relativeTime,
  getCountdown,
  pad2,
  computeSignalMix,
  CONFIRMED_THRESHOLD,
  LIKELY_THRESHOLD,
  BREAKING_HOURS,
} from "../utils";

// ─── Confidence tiers ──────────────────────────────────────────────────────────

describe("getConfidenceTier", () => {
  it("returns confirmed at exactly the threshold", () => {
    expect(getConfidenceTier(CONFIRMED_THRESHOLD)).toBe("confirmed");
  });

  it("returns confirmed above the threshold", () => {
    expect(getConfidenceTier(1.0)).toBe("confirmed");
    expect(getConfidenceTier(0.95)).toBe("confirmed");
  });

  it("returns likely at exactly the likely threshold", () => {
    expect(getConfidenceTier(LIKELY_THRESHOLD)).toBe("likely");
  });

  it("returns likely between thresholds", () => {
    expect(getConfidenceTier(0.75)).toBe("likely");
    expect(getConfidenceTier(0.89)).toBe("likely");
  });

  it("returns rumour just below the likely threshold", () => {
    expect(getConfidenceTier(LIKELY_THRESHOLD - 0.01)).toBe("rumour");
  });

  it("returns rumour at zero", () => {
    expect(getConfidenceTier(0)).toBe("rumour");
  });
});

describe("getConfidenceLabel", () => {
  it("returns uppercase labels", () => {
    expect(getConfidenceLabel("confirmed")).toBe("CONFIRMED");
    expect(getConfidenceLabel("likely")).toBe("LIKELY");
    expect(getConfidenceLabel("rumour")).toBe("RUMOUR");
  });
});

describe("formatConfidencePct", () => {
  it("formats to nearest integer percent", () => {
    expect(formatConfidencePct(0.96)).toBe("96%");
    expect(formatConfidencePct(0.5)).toBe("50%");
    expect(formatConfidencePct(1.0)).toBe("100%");
    expect(formatConfidencePct(0)).toBe("0%");
  });

  it("rounds correctly", () => {
    expect(formatConfidencePct(0.655)).toBe("66%");
    expect(formatConfidencePct(0.654)).toBe("65%");
  });
});

describe("getEdgeClass", () => {
  it("returns correct edge class per tier", () => {
    expect(getEdgeClass(0.95)).toBe("card-edge-confirmed");
    expect(getEdgeClass(0.75)).toBe("card-edge-likely");
    expect(getEdgeClass(0.4)).toBe("card-edge-rumour");
  });
});

describe("getBadgeClass", () => {
  it("returns correct badge class per tier", () => {
    expect(getBadgeClass(0.95)).toBe("badge-confirmed");
    expect(getBadgeClass(0.75)).toBe("badge-likely");
    expect(getBadgeClass(0.4)).toBe("badge-rumour");
  });
});

// ─── Recency badges ────────────────────────────────────────────────────────────

describe("getRecencyBadge", () => {
  // Fix "now" to a known time so tests are deterministic
  const now = new Date("2026-06-11T12:00:00Z");

  it("returns breaking for articles less than 1 hour old", () => {
    const date = new Date("2026-06-11T11:30:00Z"); // 30 mins ago
    expect(getRecencyBadge(date, now)).toBe("breaking");
  });

  it("returns breaking at exactly 0 minutes old", () => {
    expect(getRecencyBadge(now, now)).toBe("breaking");
  });

  it("returns new between 1 and 6 hours old", () => {
    const date = new Date("2026-06-11T07:00:00Z"); // 5 hours ago
    expect(getRecencyBadge(date, now)).toBe("new");
  });

  it("returns new at exactly the breaking boundary", () => {
    // Just over 1 hour ago — should be 'new' not 'breaking'
    const date = new Date(now.getTime() - BREAKING_HOURS * 60 * 60 * 1000 - 1);
    expect(getRecencyBadge(date, now)).toBe("new");
  });

  it("returns today for same calendar day beyond 6 hours", () => {
    const date = new Date("2026-06-11T01:00:00Z"); // 11 hours ago, same day
    expect(getRecencyBadge(date, now)).toBe("today");
  });

  it("returns null for yesterday", () => {
    const date = new Date("2026-06-10T12:00:00Z"); // yesterday
    expect(getRecencyBadge(date, now)).toBeNull();
  });

  it("returns null for future dates", () => {
    const date = new Date("2026-06-12T12:00:00Z"); // tomorrow
    expect(getRecencyBadge(date, now)).toBeNull();
  });

  it("accepts ISO string as well as Date", () => {
    expect(getRecencyBadge("2026-06-11T11:30:00Z", now)).toBe("breaking");
  });
});

// ─── Relative time ─────────────────────────────────────────────────────────────

describe("relativeTime", () => {
  const now = new Date("2026-06-11T12:00:00Z");

  it("returns just now for seconds ago", () => {
    const date = new Date(now.getTime() - 30 * 1000);
    expect(relativeTime(date, now)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const date = new Date(now.getTime() - 45 * 60 * 1000);
    expect(relativeTime(date, now)).toBe("45m ago");
  });

  it("returns hours ago", () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(relativeTime(date, now)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const date = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    expect(relativeTime(date, now)).toBe("4d ago");
  });

  it("returns weeks ago", () => {
    const date = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    expect(relativeTime(date, now)).toBe("2w ago");
  });

  it("returns formatted date for old articles", () => {
    const date = new Date("2026-01-15T12:00:00Z");
    expect(relativeTime(date, now)).toBe("Jan 15");
  });
});

// ─── Countdown ─────────────────────────────────────────────────────────────────

describe("getCountdown", () => {
  it("returns correct days/hours/minutes/seconds", () => {
    const target = new Date("2026-06-12T12:00:00Z"); // exactly 1 day away
    const now = new Date("2026-06-11T12:00:00Z");
    const result = getCountdown(target, now);
    expect(result.days).toBe(1);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it("returns zeroes when target is in the past", () => {
    const target = new Date("2026-06-10T12:00:00Z");
    const now = new Date("2026-06-11T12:00:00Z");
    const result = getCountdown(target, now);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.total).toBeLessThan(0);
  });
});

describe("pad2", () => {
  it("pads single digit numbers", () => {
    expect(pad2(0)).toBe("00");
    expect(pad2(9)).toBe("09");
  });

  it("does not pad double digit numbers", () => {
    expect(pad2(10)).toBe("10");
    expect(pad2(59)).toBe("59");
  });
});

// ─── Signal mix ────────────────────────────────────────────────────────────────

describe("computeSignalMix", () => {
  it("returns zeroes for empty array", () => {
    const mix = computeSignalMix([]);
    expect(mix.total).toBe(0);
    expect(mix.confirmedPct).toBe(0);
  });

  it("correctly counts and calculates percentages", () => {
    // 2 confirmed (>=0.90), 1 likely (0.65-0.89), 1 rumour (<0.65)
    const mix = computeSignalMix([0.95, 0.92, 0.75, 0.4]);
    expect(mix.confirmedCount).toBe(2);
    expect(mix.likelyCount).toBe(1);
    expect(mix.rumourCount).toBe(1);
    expect(mix.total).toBe(4);
    expect(mix.confirmedPct).toBe(50);
    expect(mix.likelyPct).toBe(25);
    expect(mix.rumourPct).toBe(25);
  });

  it("handles all confirmed", () => {
    const mix = computeSignalMix([0.95, 0.91, 0.9]);
    expect(mix.confirmedPct).toBe(100);
    expect(mix.likelyPct).toBe(0);
    expect(mix.rumourPct).toBe(0);
  });
});
