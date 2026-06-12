// web/lib/schemas.ts

import { z } from "zod";

// ─── WHY VALIDATE AT THE FETCH BOUNDARY? ──────────────────────────────────────
// Supabase returns `any[]` — there's no automatic type safety from DB → app.
// Running Zod here means:
//  1. If the DB schema drifts (someone adds/renames a column), you get a clear
//     error at the fetch point, not a silent `undefined` deep in a component.
//  2. TypeScript types in the rest of the app are guaranteed to match reality,
//     not just your assumptions about what Supabase returns.
//  3. Tests can import these schemas and test against them directly.
//
// We use .parse() (throws on invalid) rather than .safeParse() (returns result)
// at the fetch boundary, because invalid DB data is a programming error that
// should crash loudly, not be silently swallowed.

// ─── CATEGORY ─────────────────────────────────────────────────────────────────
// These must match exactly what the Gemini classifier writes to the DB.
// Changing one here without updating the pipeline = broken filtering.
export const CATEGORIES = [
  "release_date",
  "gameplay",
  "story",
  "trailer",
  "rumour",
  "business",
  "other",
  "unrelated",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Human-readable labels for each category — used in filter pills and page titles
export const CATEGORY_LABELS: Record<Category, string> = {
  release_date: "Release Date",
  gameplay: "Gameplay",
  story: "Story",
  trailer: "Trailers",
  rumour: "Rumours",
  business: "Business",
  other: "Other",
  unrelated: "Unrelated",
};

// ─── ARTICLE SCHEMA ───────────────────────────────────────────────────────────
// Mirrors the `articles` table schema (post-migration) exactly.
// nullable() = the column exists but can be NULL in the DB.
// optional() = the key might not be present in the query response (we always
//              select *, so this is only for partial query safety).

export const ArticleSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  source: z.string().min(1),
  published_at: z.string().datetime({ offset: true }), // TIMESTAMPTZ → ISO string with offset
  summary: z.string().nullable(),
  category: z.enum(CATEGORIES).default("other"),
  is_relevant: z.boolean().default(false),
  confidence: z.number().min(0).max(1).default(0),
  created_at: z.string().datetime({ offset: true }),
  game: z.string().default("gta6"),
  og_image_url: z.string().url().nullable().default(null),
  tags: z.array(z.string()).default([]),
  // TEXT[] from Postgres arrives as a plain JS array of strings.
  // default([]) matches the DB default of '{}' — no article ever has undefined tags.
});

export type Article = z.infer<typeof ArticleSchema>;

// Array variant — parse the whole response in one call
export const ArticleArraySchema = z.array(ArticleSchema);

// ─── SUBSCRIBER SCHEMA ────────────────────────────────────────────────────────
// Used by the email signup form to validate input BEFORE writing to Supabase.
// This gives us a friendly error message in the UI rather than a Supabase error.

export const SubscriberInsertSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase() // normalise — "User@Gmail.com" and "user@gmail.com" are the same
    .trim(),
  game: z.string().default("gta6"),
});

export type SubscriberInsert = z.infer<typeof SubscriberInsertSchema>;

// DB row (includes created_at which Supabase sets automatically)
export const SubscriberSchema = SubscriberInsertSchema.extend({
  created_at: z.string().datetime({ offset: true }),
});

export type Subscriber = z.infer<typeof SubscriberSchema>;

// ─── ARTICLE STATS ────────────────────────────────────────────────────────────
// Used by the Hero section: "X articles tracked · Y sources · Z today"

export const ArticleStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  sourceCount: z.number().int().nonnegative(),
  todayCount: z.number().int().nonnegative(),
  confirmedCount: z.number().int().nonnegative(),
  likelyCount: z.number().int().nonnegative(),
  rumourCount: z.number().int().nonnegative(),
});

export type ArticleStats = z.infer<typeof ArticleStatsSchema>;
