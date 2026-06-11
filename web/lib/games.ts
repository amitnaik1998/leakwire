import type { Category } from "./schemas";

// ─── TYPES ────────────────────────────────────────────────────────────────────
// These types define the "shape" of a game in Leakwire.
// To add a second game (Red Dead 3, Fable, etc.), you just add another entry
// to the GAMES registry below — no changes to routes, components, or pipeline.

export type SourceTier = "official" | "press" | "community" | "insider";

export const SOURCE_TIER_LABELS: Record<SourceTier, string> = {
  official: "Official",
  press: "Press",
  community: "Community",
  insider: "Insider",
};

// Confidence status for Fact File cards — different from article confidence tiers.
// A fact is either confirmed (Rockstar/official) or rumoured (speculation).
export type FactStatus = "confirmed" | "rumoured";

export interface GameFact {
  id: string; // slug used in HTML id, e.g. "release-date"
  label: string; // "Release Date"
  value: string; // "November 19, 2026"
  status: FactStatus;
  note?: string; // optional footnote, e.g. "PS5/Xbox Series X|S only"
}

export interface GameFAQ {
  id: string; // slug for anchor links + JSON-LD
  question: string;
  answer: string; // plain text — rendered as <p> inside <details>
}

export interface GameTrailer {
  id: string; // internal id
  title: string; // "GTA VI — Trailer 1"
  youtubeId: string; // YouTube video ID — verify these in the Rockstar channel
  publishedAt: string; // ISO date, e.g. "2023-12-05"
  channel: string; // "Rockstar Games"
}

export type MilestoneStatus = "done" | "upcoming" | "launch";

export interface GameMilestone {
  id: string;
  label: string;
  date?: string; // ISO date if known; undefined = TBD
  status: MilestoneStatus;
  note?: string;
}

// ─── MAIN GAME CONFIG TYPE ────────────────────────────────────────────────────

export interface GameConfig {
  // Routing + identity
  slug: string; // URL segment: "gta6" → /gta6
  name: string; // Short: "GTA VI" — used in nav, headings
  fullName: string; // Long: "Grand Theft Auto VI" — used in <title>, JSON-LD
  tagline: string; // Hero tagline

  // Design
  accentHex: string; // CSS color — set on <html> style to swap the whole site's accent

  // Key dates
  releaseDate: string; // ISO date: "2026-11-19"
  releaseConfirmed: boolean; // true = earnings call confirmed; false = window only

  // Platforms
  platforms: string[]; // ["PS5", "Xbox Series X|S"]

  // Categories this game uses — controls which filter pills appear
  categories: Category[];

  // Source tier mapping: source name (as stored in DB) → tier
  // Keys should match `source` values exactly as the pipeline writes them.
  // Unmapped sources default to 'press'.
  sourceTiers: Record<string, SourceTier>;

  // Content for homepage sections
  facts: GameFact[];
  faqs: GameFAQ[];
  trailers: GameTrailer[];
  milestones: GameMilestone[];

  // SEO
  seoDescription: string;
  seoKeywords: string[];
}

// ─── GTA 6 CONFIG ─────────────────────────────────────────────────────────────
// Every piece of content in this config appears on the /gta6 page.
// Update values here as new information becomes confirmed.

const gta6: GameConfig = {
  slug: "gta6",
  name: "GTA VI",
  fullName: "Grand Theft Auto VI",
  tagline: "Every GTA VI signal. One feed. Zero noise.",
  accentHex: "#E8643C",

  releaseDate: "2026-11-19",
  releaseConfirmed: true, // Confirmed on Take-Two Feb 2026 earnings call

  platforms: ["PS5", "Xbox Series X|S"],

  // All categories — for GTA 6 we show all of them in the filter bar
  categories: [
    "release_date",
    "gameplay",
    "story",
    "trailer",
    "rumour",
    "business",
    "other",
  ],
  // Note: 'unrelated' is excluded from the filter bar (the pipeline marks
  // irrelevant articles with is_relevant: false; they never reach the feed)

  // ── Source tier map ──────────────────────────────────────────────────────
  // Keys = source values as written by the pipeline (case-sensitive).
  // Add new sources here when the pipeline's RSS list grows.
  sourceTiers: {
    // Official
    "Rockstar Games": "official",
    "Rockstar Newswire": "official",
    "Take-Two Interactive": "official",

    // Press (major outlets — editorial standards, named sources)
    IGN: "press",
    Eurogamer: "press",
    Kotaku: "press",
    "PC Gamer": "press",
    GamesRadar: "press",
    "Game Informer": "press",
    VGC: "press",
    "Video Games Chronicle": "press",
    Polygon: "press",
    "The Verge": "press",
    Bloomberg: "press",
    Axios: "press",
    Reuters: "press",

    // Insiders (known industry insiders with track record on GTA/Rockstar)
    "Tom Henderson": "insider",
    "Jason Schreier": "insider",
    Tez2: "insider", // known GTA dataminer/leaker
    Yan2295: "insider", // known GTA dataminer
    GTAVocal: "insider",

    // Community (Reddit, forums, fan sites)
    "r/GTA6": "community",
    "r/GrandTheftAutoV": "community",
    "GTA Forums": "community",
    GTAForums: "community",
    GTA6Forums: "community",
    Reddit: "community",
  },

  // ── Fact File (§3: 8 fact cards) ─────────────────────────────────────────
  facts: [
    {
      id: "release-date",
      label: "Release Date",
      value: "November 19, 2026",
      status: "confirmed",
      note: "Confirmed on Take-Two Feb 2026 earnings call",
    },
    {
      id: "platforms",
      label: "Platforms",
      value: "PS5 · Xbox Series X|S",
      status: "confirmed",
      note: "No current-gen (PS4/Xbox One). PC not announced.",
    },
    {
      id: "price",
      label: "Price",
      value: "$70–80 (expected)",
      status: "rumoured",
      note: "Unannounced. Industry standard suggests $70–80 base.",
    },
    {
      id: "protagonists",
      label: "Protagonists",
      value: "Lucia & Jason",
      status: "confirmed",
      note: "Shown in Trailer 1 (Dec 2023). First female GTA lead.",
    },
    {
      id: "setting",
      label: "Setting",
      value: "Vice City / Leonida",
      status: "confirmed",
      note: "Fictional Florida state. Confirmed in Trailer 1.",
    },
    {
      id: "pc",
      label: "PC Version",
      value: "Not at launch",
      status: "rumoured",
      note: "Widely expected 2027–28, following GTA V pattern.",
    },
    {
      id: "pre-orders",
      label: "Pre-orders",
      value: "Not yet open",
      status: "confirmed", // The absence of pre-orders is a confirmed fact
      note: "Expected to open with summer 2026 marketing push.",
    },
    {
      id: "map-size",
      label: "Map Size",
      value: "Larger than GTA V",
      status: "rumoured",
      note: "Multiple leakers claim Leonida map dwarfs Los Santos.",
    },
  ],

  // ── FAQs (§3: 6 accordions + FAQPage JSON-LD) ────────────────────────────
  // These also power the JSON-LD schema on the page — keep answers factual.
  faqs: [
    {
      id: "release-date",
      question: "When does GTA 6 release?",
      answer:
        "GTA VI releases on November 19, 2026 for PS5 and Xbox Series X|S. " +
        "This date was confirmed by Take-Two Interactive on their February 2026 earnings call. " +
        "A PC release date has not been announced.",
    },
    {
      id: "ps4-xbox-one",
      question: "Will GTA 6 be on PS4 or Xbox One?",
      answer:
        "No. GTA VI is a current-generation exclusive, releasing only on PS5 and Xbox Series X|S. " +
        "Rockstar has not announced support for last-generation consoles.",
    },
    {
      id: "price",
      question: "How much will GTA 6 cost?",
      answer:
        "Rockstar Games has not announced an official price. " +
        "Industry analysts expect $69.99–$79.99 based on current AAA pricing trends, " +
        "but this is speculation until an official announcement.",
    },
    {
      id: "pc",
      question: "Is GTA 6 coming to PC?",
      answer:
        "No PC release has been announced. " +
        "GTA V launched on console in 2013 and arrived on PC in 2015 — " +
        "following that pattern, industry observers expect a GTA VI PC version in 2027–2028. " +
        "Nothing is confirmed.",
    },
    {
      id: "pre-orders",
      question: "Can I pre-order GTA 6?",
      answer:
        "Pre-orders are not yet open as of June 2026. " +
        "Retailers are expected to open pre-orders alongside a major marketing campaign, " +
        "potentially in summer 2026. Check the official Rockstar Games website for updates.",
    },
    {
      id: "characters",
      question: "Who are the main characters in GTA 6?",
      answer:
        "The confirmed protagonists are Lucia and Jason, a couple shown in Trailer 1. " +
        "Lucia is the first playable female lead in a mainline GTA game. " +
        "Both characters appear in a Vice City / Leonida setting inspired by Florida.",
    },
  ],

  // ── Trailers ──────────────────────────────────────────────────────────────
  // IMPORTANT: Verify these YouTube IDs by checking the Rockstar Games
  // YouTube channel (youtube.com/@RockstarGames). Update if incorrect.
  trailers: [
    {
      id: "trailer-1",
      title: "GTA VI — Trailer 1",
      youtubeId: "QdBZY2fkU-0",
      publishedAt: "2023-12-04",
      channel: "Rockstar Games",
    },
    {
      id: "trailer-2",
      title: "GTA VI — Trailer 2",
      youtubeId: "VQRLujxTm3c",
      publishedAt: "2025-05-06",
      channel: "Rockstar Games",
    },
  ],

  // ── Milestones ("Road to launch" strip) ───────────────────────────────────
  milestones: [
    {
      id: "trailer-1",
      label: "Trailer 1",
      date: "2023-12-05",
      status: "done",
      note: "First look at Lucia, Jason, and Vice City / Leonida",
    },
    {
      id: "trailer-2",
      label: "Trailer 2",
      date: "2025-05-01", // ← Update with actual date
      status: "done",
      note: "Extended gameplay and story details",
    },
    {
      id: "date-confirmed",
      label: "Date Confirmed",
      date: "2026-02-01", // ← Approximate; update with actual earnings call date
      status: "done",
      note: "Nov 19 confirmed on Take-Two earnings call",
    },
    {
      id: "trailer-3",
      label: "Trailer 3?",
      status: "upcoming",
      note: "Expected as part of summer 2026 marketing push",
    },
    {
      id: "launch",
      label: "LAUNCH",
      date: "2026-11-19",
      status: "launch",
    },
  ],

  seoDescription:
    "Track every GTA VI news signal in real time — confirmed announcements, credible leaks, " +
    "and community rumours, all classified by reliability. Updated every 30 minutes.",

  seoKeywords: [
    "GTA 6",
    "GTA VI",
    "Grand Theft Auto 6",
    "Grand Theft Auto VI",
    "GTA 6 release date",
    "GTA 6 news",
    "GTA 6 leaks",
    "GTA 6 trailer",
    "GTA 6 gameplay",
    "GTA 6 PS5",
    "GTA 6 Lucia Jason",
    "Vice City",
    "Leonida",
    "Rockstar Games",
    "GTA 6 price",
    "GTA 6 PC",
  ],
};

// ─── REGISTRY ─────────────────────────────────────────────────────────────────
// The single source of truth for all supported games.
// To add a game: add a new config object above, then push it to this array.
// Routes (/[game]/...), the nav game-switcher, and the pipeline all read from here.

export const GAMES: GameConfig[] = [gta6];

// ─── LOOKUP HELPERS ───────────────────────────────────────────────────────────

/** Look up a game config by slug. Returns undefined if not found. */
export function getGame(slug: string): GameConfig | undefined {
  return GAMES.find((g) => g.slug === slug);
}

/** Look up a game config by slug. Throws if not found.
 *  Use in generateStaticParams and page components where a missing slug
 *  is a 404, not a maybe. */
export function requireGame(slug: string): GameConfig {
  const game = getGame(slug);
  if (!game)
    throw new Error(`Unknown game slug: "${slug}". Add it to lib/games.ts.`);
  return game;
}

/** Get the source tier for a given source name.
 *  Falls back to 'press' for unmapped sources — better than crashing. */
export function getSourceTier(
  sourceName: string,
  game: GameConfig,
): SourceTier {
  return game.sourceTiers[sourceName] ?? "press";
}

/** All game slugs — used in generateStaticParams for /[game]/... routes. */
export function getAllGameSlugs(): string[] {
  return GAMES.map((g) => g.slug);
}
