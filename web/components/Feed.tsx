"use client";

// The Feed is the heart of the app — it owns the filter/search state and
// filters the article list entirely in the browser (no new network requests).
//
// Architecture: the page server-renders the full article list via ISR,
// passes it as a prop, and Feed handles all interaction from there.
// This is fast: filtering 500 articles in JS is instant; a new fetch would
// introduce a loading spinner on every keystroke.

import { useState, useMemo } from "react";
import FilterBar, { type FilterState } from "./FilterBar";
import ArticleCard from "./ArticleCard";
import SignalMix from "./SignalMix";
import CountdownTimer from "./CountdownTimer";
import AdSlot from "./AdSlot";
import type { Article } from "@/lib/schemas";
import type { GameConfig } from "@/lib/games";
import { getConfidenceTier } from "@/lib/utils";

interface FeedProps {
  articles: Article[];
  categoryCounts: Record<string, number>;
  game: GameConfig;
}

export default function Feed({ articles, categoryCounts, game }: FeedProps) {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    confirmedOnly: false,
    sort: "latest",
    search: "",
  });

  // Partial update helper — merge new values into existing state
  const updateFilters = (update: Partial<FilterState>) =>
    setFilters((prev) => ({ ...prev, ...update }));

  // ── Client-side filtering + sorting ───────────────────────────────────────
  // useMemo = only recompute when filters or articles change.
  // Without this, the filter runs on every render (e.g. parent re-renders).
  const filtered = useMemo(() => {
    let result = articles;

    // 1. Category filter
    if (filters.category) {
      result = result.filter((a) => a.category === filters.category);
    }

    // 2. Confirmed-only toggle
    if (filters.confirmedOnly) {
      result = result.filter(
        (a) => getConfidenceTier(a.confidence) === "confirmed",
      );
    }

    // 3. Search — matches title, summary, or source name
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.summary?.toLowerCase().includes(q) ?? false) ||
          a.source.toLowerCase().includes(q),
      );
    }

    // 4. Sort
    if (filters.sort === "confidence") {
      result = [...result].sort((a, b) => b.confidence - a.confidence);
    } else {
      // 'latest' — sort by published_at descending
      result = [...result].sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime(),
      );
    }

    return result;
  }, [articles, filters]);

  return (
    <div>
      {/* ── Sticky filter bar ─────────────────────────────────────────────── */}
      <FilterBar
        state={filters}
        categoryCounts={categoryCounts}
        onFilterChange={updateFilters}
      />

      {/* ── Main layout: feed + right rail ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* 
          flex-col on mobile (stacked), lg:flex-row on large screens (side by side)
          min-w-0 on the main column prevents flex children from overflowing
        */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Article grid ──────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Result count */}
            <p className="text-xs text-subtle mb-4 tabular font-mono">
              {filtered.length === articles.length
                ? `${articles.length} articles`
                : `${filtered.length} of ${articles.length} articles`}
              {filters.search && ` matching "${filters.search}"`}
            </p>

            {filtered.length === 0 ? (
              // Empty state
              <div className="bg-card border border-border rounded-card p-12 text-center">
                <p className="text-muted text-sm">
                  No articles match your filters.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      category: null,
                      confirmedOnly: false,
                      sort: "latest",
                      search: "",
                    })
                  }
                  className="mt-3 text-accent text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              // 2-col grid on sm+, 1-col on mobile
              // gap-4 = 1rem between cards
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                {filtered.map((article, index) => (
                  <div key={article.url}>
                    <ArticleCard
                      key={article.url}
                      article={article}
                      game={game}
                    />
                    {/* In-feed ad slot after every 10th card */}
                    {/* col-span-2 = stretches the ad across both columns */}
                    {(index + 1) % 10 === 0 && index < filtered.length - 1 && (
                      <div
                        key={`ad-${index}`}
                        className="col-span-1 sm:col-span-2"
                      >
                        <AdSlot variant="infeed" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* ── Right rail ────────────────────────────────────────────────── */}
          {/* 
            w-80 = fixed 320px width on desktop
            shrink-0 = don't let it compress when the grid is wide
            lg:block = only show as sidebar on large screens
            On mobile, these widgets are hidden (they drop below the feed
            in a future iteration, for now mobile is feed-only)
          */}
          <aside className="hidden lg:block w-80 shrink-0">
            {/* sticky top = nav (56px) + filter bar (~88px) + 16px gap */}
            <div className="sticky top-[160px] space-y-4">
              {/* Compact countdown */}
              <div className="bg-card border border-border rounded-card p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-subtle mb-2">
                  Until launch
                </p>
                <CountdownTimer
                  targetDate={game.releaseDate}
                  variant="compact"
                />
                <p className="text-xs text-subtle mt-1.5">
                  {game.releaseConfirmed
                    ? "✓ confirmed date"
                    : "window estimate"}
                </p>
              </div>

              {/* Signal mix */}
              <SignalMix articles={filtered.length > 0 ? filtered : articles} />

              {/* Intel Brief subscribe — links to the form below the feed */}
              <div className="bg-card border border-accent/20 rounded-card p-4 space-y-2">
                <p className="text-xs font-mono uppercase tracking-widest text-accent">
                  Intel Brief
                </p>
                <p className="text-sm text-muted">
                  Get notified when a high-confidence story breaks.
                </p>
                <a
                  href="#subscribe"
                  className="block text-center bg-accent hover:bg-accent-dim text-white text-sm font-medium py-2 rounded-sm transition-colors"
                >
                  Subscribe free
                </a>
              </div>

              {/* Reserved ad slot */}
              <AdSlot variant="rail" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
