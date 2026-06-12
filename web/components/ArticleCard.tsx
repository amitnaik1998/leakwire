// web/components/ArticleCard.tsx

"use client";

import Image from "next/image";
import { useState } from "react";
import type { Article } from "@/lib/schemas";
import type { GameConfig } from "@/lib/games";
import { getSourceTier, SOURCE_TIER_LABELS } from "@/lib/games";
import {
  getConfidenceTier,
  getConfidenceLabel,
  formatConfidencePct,
  getRecencyBadge,
  getRecencyLabel,
  relativeTime,
} from "@/lib/utils";

// Category fallback gradients — used when og_image_url is null.
// Each category gets a dark two-tone gradient that feels intentional,
// not like a broken image. Colors are derived from the design tokens.
const CATEGORY_GRADIENTS: Record<string, string> = {
  release_date: "linear-gradient(160deg, #1f1008 0%, #3d2010 100%)",
  gameplay: "linear-gradient(160deg, #0d1f10 0%, #1a3d20 100%)",
  story: "linear-gradient(160deg, #1a1040 0%, #2d1b5e 100%)",
  trailer: "linear-gradient(160deg, #1f0a0a 0%, #3d1515 100%)",
  rumour: "linear-gradient(160deg, #1f1008 0%, #3d200a 100%)",
  business: "linear-gradient(160deg, #0d0f1a 0%, #1a1f3d 100%)",
  other: "linear-gradient(160deg, #0f1318 0%, #1a2030 100%)",
  unrelated: "linear-gradient(160deg, #0f1318 0%, #1a2030 100%)",
};

// Confidence accent colors — the full-width bar at the bottom of each card.
// More prominent than the old left edge, immediately scannable.
const ACCENT_COLORS: Record<string, string> = {
  confirmed: "#5BC98A",
  likely: "#EDB14F",
  rumour: "#E0716F",
};

interface ArticleCardProps {
  article: Article;
  game: GameConfig;
}

export default function ArticleCard({ article, game }: ArticleCardProps) {
  const [imgError, setImgError] = useState(false);

  const tier = getConfidenceTier(article.confidence);
  const sourceTier = getSourceTier(article.source, game);
  const recency = getRecencyBadge(article.published_at);
  const hasImage = !!article.og_image_url && !imgError;
  const gradient =
    CATEGORY_GRADIENTS[article.category] ?? CATEGORY_GRADIENTS.other;
  const accent = ACCENT_COLORS[tier];

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative rounded-card overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
      style={{ minHeight: "180px" }}
    >
      {/* ── Background layer — real image or category gradient ──────────── */}
      <div className="absolute inset-0">
        {hasImage ? (
          <Image
            src={article.og_image_url!}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          // Category gradient fallback — looks intentional, not broken
          <div
            className="w-full h-full transition-opacity duration-500 group-hover:opacity-80"
            style={{ background: gradient }}
          />
        )}
      </div>

      {/* ── Gradient overlay — ensures text is always readable ──────────── */}
      {/* Two-layer gradient: heavy at bottom for content, subtle at top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* ── Confidence accent bar — full width at bottom ─────────────────── */}
      {/* This is the signature trust signal — instantly scannable */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{ height: "3px", background: accent }}
      />

      {/* ── Content — always at the bottom of the card ───────────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-4">
        {/* Source line */}
        {/* Source line */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-white/50 font-medium truncate">
            {article.source}
          </span>
          <span
            className="
    text-[9px] px-1.5 py-px rounded-pill font-mono uppercase tracking-wide
    border text-white/35 border-white/15
  "
          >
            {SOURCE_TIER_LABELS[sourceTier]}
          </span>
          {recency && (
            <span
              className={`
      ${recency === "breaking" ? "badge-breaking" : recency === "new" ? "badge-new" : "badge-today"}
      inline-block rounded-pill px-2 py-0.5 text-[9px] font-mono font-bold uppercase
    `}
            >
              {getRecencyLabel(recency)}
            </span>
          )}
          <span className="flex-1" />
          <time
            dateTime={article.published_at}
            className="text-[10px] text-white/40 font-mono shrink-0"
          >
            {relativeTime(article.published_at)}
          </time>
        </div>

        {/* Title */}
        <h3
          className="
          text-sm font-semibold text-white leading-snug mb-1.5
          line-clamp-2
          group-hover:text-white/90 transition-colors duration-150
        "
        >
          {article.title}
        </h3>

        {/* Summary — slightly muted white */}
        {article.summary && (
          <p className="text-[10px] text-white/55 leading-relaxed line-clamp-2 mb-2">
            {article.summary}
          </p>
        )}

        {/* Footer — confidence badge + tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="
            text-[9px] font-mono font-bold uppercase tracking-wide
            px-2 py-0.5 rounded-pill
            border
          "
            style={{
              color: accent,
              borderColor: `${accent}50`,
              background: `${accent}18`,
            }}
          >
            {getConfidenceLabel(tier)} ·{" "}
            {formatConfidencePct(article.confidence)}
          </span>

          {/* Tags — shown as subtle pills */}
          {article.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="
                text-[9px] px-1.5 py-0.5 rounded
                text-white/45 border border-white/10
                bg-white/5
              "
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
