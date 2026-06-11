import { db } from "./supabase";
import {
  ArticleArraySchema,
  type Article,
  type ArticleStats,
  CATEGORIES,
} from "./schemas";
import type { Category } from "./schemas";
import { getConfidenceTier, CONFIRMED_THRESHOLD } from "./utils";

// ─── WHY A DEDICATED QUERY MODULE? ────────────────────────────────────────────
// Having all DB queries in one file means:
//  1. One place to look when something breaks
//  2. Easy to add caching/memoisation later
//  3. Tests can mock this module instead of mocking Supabase directly
//  4. The Supabase query builder types are contained here; components just get
//     clean typed Article[] arrays

// ─── GET ARTICLES ─────────────────────────────────────────────────────────────

export interface GetArticlesOptions {
  game?: string; // defaults to 'gta6'
  category?: Category; // filter by single category
  limit?: number; // defaults to 60
  confirmedOnly?: boolean; // true = confidence >= 0.90 only
}

/**
 * Fetch relevant articles from Supabase, newest first.
 * Called from Server Components — uses db() (fresh client per call).
 *
 * ISR note: the calling page uses `export const revalidate = 300` (§5),
 * meaning Next.js caches this response for 5 minutes before re-fetching.
 * You don't need to add any caching here — Next.js handles it at the fetch level.
 */
export async function getArticles(
  options: GetArticlesOptions = {},
): Promise<Article[]> {
  const {
    game = "gta6",
    category,
    limit = 60,
    confirmedOnly = false,
  } = options;

  let query = db()
    .from("articles")
    .select("*")
    .eq("game", game)
    .eq("is_relevant", true) // pipeline marks unrelated articles false
    .order("published_at", { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq("category", category);
  }

  if (confirmedOnly) {
    // gte = greater than or equal — Supabase PostgREST filter syntax
    query = query.gte("confidence", CONFIRMED_THRESHOLD);
  }

  const { data, error } = await query;

  if (error) {
    // Throwing here will be caught by Next.js and show the nearest error.tsx boundary
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }

  if (!data) return [];

  // Parse at the fetch boundary — throws ZodError if DB schema drifts
  return ArticleArraySchema.parse(data);
}

// ─── GET BREAKING ARTICLES ────────────────────────────────────────────────────

/**
 * Fetch articles published in the last hour (for the Breaking Strip).
 * Returns empty array quickly if nothing recent — strip renders conditionally.
 */
export async function getBreakingArticles(game = "gta6"): Promise<Article[]> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await db()
    .from("articles")
    .select("*")
    .eq("game", game)
    .eq("is_relevant", true)
    .gte("published_at", oneHourAgo)
    .order("published_at", { ascending: false });

  if (error)
    throw new Error(`Failed to fetch breaking articles: ${error.message}`);
  if (!data?.length) return [];

  return ArticleArraySchema.parse(data);
}

// ─── GET ARTICLE STATS ────────────────────────────────────────────────────────

/**
 * Returns counts for the Hero section stats bar:
 * "X articles tracked · Y sources · Z published today"
 *
 * Uses separate queries because Supabase doesn't support GROUP BY in the
 * JS client without raw SQL. These are fast COUNT queries on indexed columns.
 */
export async function getArticleStats(game = "gta6"): Promise<ArticleStats> {
  const client = db();

  // Total relevant articles
  const { count: total, error: e1 } = await client
    .from("articles")
    .select("*", { count: "exact", head: true }) // head: true = don't return rows
    .eq("game", game)
    .eq("is_relevant", true);

  // Unique sources
  const { data: sourceData, error: e2 } = await client
    .from("articles")
    .select("source")
    .eq("game", game)
    .eq("is_relevant", true);

  // Articles published today (UTC midnight boundary)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count: todayCount, error: e3 } = await client
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("game", game)
    .eq("is_relevant", true)
    .gte("published_at", todayStart.toISOString());

  // Signal mix counts — we need confidence values to bucket them
  const { data: signalData, error: e4 } = await client
    .from("articles")
    .select("confidence")
    .eq("game", game)
    .eq("is_relevant", true);

  if (e1 ?? e2 ?? e3 ?? e4) {
    // Non-fatal — return zeros rather than crashing the whole page
    console.error("getArticleStats error:", e1 ?? e2 ?? e3 ?? e4);
    return {
      total: 0,
      sourceCount: 0,
      todayCount: 0,
      confirmedCount: 0,
      likelyCount: 0,
      rumourCount: 0,
    };
  }

  // Count unique sources from the returned rows
  const sourceCount = new Set(sourceData?.map((r) => r.source) ?? []).size;

  // Bucket signal mix
  const confidences = (signalData ?? []).map((r) => r.confidence as number);
  const confirmedCount = confidences.filter(
    (c) => getConfidenceTier(c) === "confirmed",
  ).length;
  const likelyCount = confidences.filter(
    (c) => getConfidenceTier(c) === "likely",
  ).length;
  const rumourCount = confidences.filter(
    (c) => getConfidenceTier(c) === "rumour",
  ).length;

  return {
    total: total ?? 0,
    sourceCount,
    todayCount: todayCount ?? 0,
    confirmedCount,
    likelyCount,
    rumourCount,
  };
}

// ─── GET CATEGORY COUNTS ──────────────────────────────────────────────────────

/**
 * Returns a count per category — used to show "(12)" next to filter pills.
 * Fetched once at page render and passed to the Filter component as a prop.
 */
export async function getCategoryCounts(
  game = "gta6",
): Promise<Record<string, number>> {
  const { data, error } = await db()
    .from("articles")
    .select("category")
    .eq("game", game)
    .eq("is_relevant", true);

  if (error || !data) return {};

  // Count occurrences of each category
  const counts: Record<string, number> = {};
  for (const cat of CATEGORIES) counts[cat] = 0;

  for (const row of data) {
    const cat = row.category as string;
    if (cat in counts) counts[cat] = (counts[cat] ?? 0) + 1;
  }

  return counts;
}

// ─── SUBSCRIBE EMAIL ──────────────────────────────────────────────────────────
// Used by the browser-side Intel Brief signup form.
// Import browserDb() from supabase.ts in the Client Component, not db().

export type SubscribeResult =
  | { success: true }
  | {
      success: false;
      error: "already_subscribed" | "invalid_email" | "unknown";
    };

/**
 * Insert an email into the subscribers table.
 * Call from a Server Action (not a Client Component) so the anon key isn't
 * in the POST body. See app/actions.ts (built in Stage 4).
 */
export async function subscribeEmail(
  email: string,
  game = "gta6",
): Promise<SubscribeResult> {
  const { error } = await db()
    .from("subscribers")
    .insert({ email: email.toLowerCase().trim(), game });

  if (!error) return { success: true };

  // Supabase returns code '23505' for unique constraint violations (duplicate email)
  if (error.code === "23505")
    return { success: false, error: "already_subscribed" };

  console.error("subscribeEmail error:", error);
  return { success: false, error: "unknown" };
}
