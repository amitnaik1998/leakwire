// ─── CONFIDENCE TIERS ─────────────────────────────────────────────────────────
// The Gemini classifier outputs a float 0–1. We bucket it into three tiers.
// These thresholds are defined in the brief (§3) and tested in Stage 5.
// DO NOT change without also updating the tests.

export type ConfidenceTier = 'confirmed' | 'likely' | 'rumour'

// Thresholds — exported so tests can assert against them directly
export const CONFIRMED_THRESHOLD = 0.90
export const LIKELY_THRESHOLD    = 0.65

/** Map a confidence float (0–1) to a display tier. */
export function getConfidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= CONFIRMED_THRESHOLD) return 'confirmed'
  if (confidence >= LIKELY_THRESHOLD)    return 'likely'
  return 'rumour'
}

/** Human-readable tier label (uppercase, as shown in badges). */
export function getConfidenceLabel(tier: ConfidenceTier): string {
  return tier.toUpperCase() as Uppercase<ConfidenceTier>
  // 'confirmed' → 'CONFIRMED', 'likely' → 'LIKELY', 'rumour' → 'RUMOUR'
}

/** Format a 0–1 float as a percentage string for badge display. */
export function formatConfidencePct(confidence: number): string {
  // Math.round avoids "96.000000001%" from floating point
  return `${Math.round(confidence * 100)}%`
}

/** Combined label+pct string: "CONFIRMED · 96%" */
export function getConfidenceBadgeText(confidence: number): string {
  const tier  = getConfidenceTier(confidence)
  const label = getConfidenceLabel(tier)
  const pct   = formatConfidencePct(confidence)
  return `${label} · ${pct}`
}

// ─── CSS CLASS HELPERS ────────────────────────────────────────────────────────
// Returns the Tailwind utility class names from globals.css for a given tier.
// Centralising this means if we rename a class, we fix it in one place.

/** Returns the card-edge-* class for a confidence score. */
export function getEdgeClass(confidence: number): string {
  const tier = getConfidenceTier(confidence)
  return `card-edge-${tier}`   // card-edge-confirmed | card-edge-likely | card-edge-rumour
}

/** Returns the badge-* class for a confidence score. */
export function getBadgeClass(confidence: number): string {
  const tier = getConfidenceTier(confidence)
  return `badge-${tier}`       // badge-confirmed | badge-likely | badge-rumour
}

/** Returns the text-* Tailwind class for a confidence score. */
export function getSignalColorClass(confidence: number): string {
  const tier = getConfidenceTier(confidence)
  return `text-${tier}`        // text-confirmed | text-likely | text-rumour
}

// ─── RECENCY BADGES ───────────────────────────────────────────────────────────
// Applied on top of confidence badges — indicates how fresh the article is.
// Thresholds match §3 of the brief exactly.

export type RecencyBadge = 'breaking' | 'new' | 'today' | null

// Hour cutoffs — exported for tests
export const BREAKING_HOURS = 1
export const NEW_HOURS      = 6

/** Compute which recency badge an article should show, relative to `now`.
 *  Accepts an optional `now` parameter so tests can pass a fixed date. */
export function getRecencyBadge(
  publishedAt: Date | string,
  now: Date = new Date()
): RecencyBadge {
  const date    = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt
  const diffMs  = now.getTime() - date.getTime()
  const diffHrs = diffMs / (1000 * 60 * 60)

  if (diffHrs < 0)              return null   // future-dated article — ignore
  if (diffHrs < BREAKING_HOURS) return 'breaking'
  if (diffHrs < NEW_HOURS)      return 'new'

  // "today" = same calendar day (midnight boundary in local time).
  // We use toDateString() which gives "Wed Jun 10 2026" — same day = same string.
  // Note: this uses the CLIENT's local timezone. For a global audience, "today"
  // might differ by timezone — acceptable for this MVP. Fix in V2 if needed.
  if (date.toDateString() === now.toDateString()) return 'today'

  return null
}

/** Human-readable recency label. */
export function getRecencyLabel(badge: RecencyBadge): string | null {
  if (!badge) return null
  return badge.toUpperCase()  // 'breaking' → 'BREAKING', etc.
}

/** Returns the badge-* class for a recency badge. */
export function getRecencyBadgeClass(badge: RecencyBadge): string | null {
  if (!badge) return null
  return `badge-${badge}`   // badge-breaking | badge-new | badge-today
}

// ─── RELATIVE TIME FORMATTING ─────────────────────────────────────────────────
// Formats a date as "2h ago", "3d ago", "Jun 5", etc.
// Used on article card timestamps.

/** Format a date as a short relative-time string.
 *  Accepts an optional `now` parameter for testability. */
export function relativeTime(
  date: Date | string,
  now: Date = new Date()
): string {
  const d       = typeof date === 'string' ? new Date(date) : date
  const diffMs  = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffWks  = Math.floor(diffDays / 7)

  if (diffMin  <  1) return 'just now'
  if (diffMin  < 60) return `${diffMin}m ago`
  if (diffHrs  < 24) return `${diffHrs}h ago`
  if (diffDays <  7) return `${diffDays}d ago`
  if (diffWks  <  8) return `${diffWks}w ago`

  // For older articles, show the date — Space Mono in the UI makes this readable
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Format a full ISO timestamp for a <time> element's datetime attribute.
 *  Always ISO 8601 — required for machine-readable timestamps in JSON-LD. */
export function toISOString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────
// Returns the days/hours/minutes/seconds until a target date.
// Used by the CountdownTimer component. Calculated client-side (live ticking).

export interface CountdownParts {
  days:    number
  hours:   number
  minutes: number
  seconds: number
  total:   number  // total milliseconds remaining (negative = past)
}

/** Compute time remaining until `target`. Returns zeroes if target is past. */
export function getCountdown(
  target: Date | string,
  now: Date = new Date()
): CountdownParts {
  const targetMs = typeof target === 'string'
    ? new Date(target).getTime()
    : target.getTime()

  const total = targetMs - now.getTime()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total }
  }

  const days    = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, total }
}

/** Zero-pad a number to 2 digits — "9" → "09". Used in countdown display. */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

// ─── SIGNAL MIX ───────────────────────────────────────────────────────────────
// Calculates the ratio of confirmed/likely/rumour articles for the Signal Mix widget.

export interface SignalMix {
  confirmedCount: number
  likelyCount:    number
  rumourCount:    number
  total:          number
  confirmedPct:   number   // 0–100
  likelyPct:      number
  rumourPct:      number
}

/** Compute signal mix from an array of confidence values. */
export function computeSignalMix(confidences: number[]): SignalMix {
  const confirmedCount = confidences.filter(c => getConfidenceTier(c) === 'confirmed').length
  const likelyCount    = confidences.filter(c => getConfidenceTier(c) === 'likely').length
  const rumourCount    = confidences.filter(c => getConfidenceTier(c) === 'rumour').length
  const total          = confidences.length

  if (total === 0) {
    return { confirmedCount: 0, likelyCount: 0, rumourCount: 0,
             total: 0, confirmedPct: 0, likelyPct: 0, rumourPct: 0 }
  }

  return {
    confirmedCount,
    likelyCount,
    rumourCount,
    total,
    confirmedPct: Math.round((confirmedCount / total) * 100),
    likelyPct:    Math.round((likelyCount    / total) * 100),
    rumourPct:    Math.round((rumourCount    / total) * 100),
  }
}
