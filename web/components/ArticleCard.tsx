'use client'

// 'use client' because this is nested inside Feed (a client component).
// In Next.js, any component imported by a client component must also be a
// client component — the 'use client' boundary propagates downward.
// ArticleCard has no state of its own, but it needs the client context.

import Image from 'next/image'
import { useState } from 'react'
import type { Article } from '@/lib/schemas'
import type { GameConfig } from '@/lib/games'
import { getSourceTier, SOURCE_TIER_LABELS } from '@/lib/games'
import {
  getConfidenceTier,
  getConfidenceLabel,
  formatConfidencePct,
  getEdgeClass,
  getBadgeClass,
  getRecencyBadge,
  getRecencyLabel,
  relativeTime,
} from '@/lib/utils'
import { CATEGORY_LABELS } from '@/lib/schemas'

// Category thumbnail fallback colors — shown when og_image_url is null
const CATEGORY_FALLBACK_COLORS: Record<string, string> = {
  release_date: '#E8643C',
  gameplay:     '#5BC98A',
  story:        '#EDB14F',
  trailer:      '#E8643C',
  rumour:       '#E0716F',
  business:     '#8A8F98',
  other:        '#5A5F68',
  unrelated:    '#5A5F68',
}

interface ArticleCardProps {
  article: Article
  game:    GameConfig
}

export default function ArticleCard({ article, game }: ArticleCardProps) {
  // Track image load errors so we fall back to the color block
  const [imgError, setImgError] = useState(false)

  const tier        = getConfidenceTier(article.confidence)
  const edgeClass   = getEdgeClass(article.confidence)
  const badgeClass  = getBadgeClass(article.confidence)
  const recency     = getRecencyBadge(article.published_at)
  const sourceTier  = getSourceTier(article.source, game)
  const fallbackBg  = CATEGORY_FALLBACK_COLORS[article.category] ?? '#5A5F68'
  const hasImage    = !!article.og_image_url && !imgError

  return (
    // The whole card is a link to the original article
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      // group = enables group-hover: on child elements
      className={`
        group block relative
        bg-card border border-border
        rounded-card overflow-hidden
        transition-all duration-200
        hover:border-border/80 hover:shadow-card-hover
        hover:-translate-y-px
        ${edgeClass}
      `}
      // rounded-card = uses our --radius-card: 5px token
    >

      {/* ── Thumbnail ──────────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video bg-card overflow-hidden">
        {hasImage ? (
          <Image
            src={article.og_image_url!}
            alt={article.title}
            fill
            // object-cover = crop to fill, maintain aspect ratio (like CSS background-size: cover)
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            // sizes tells the browser which image size to download based on viewport
          />
        ) : (
          // Fallback: category-colored block with a subtle label
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${fallbackBg}18` }}
            // The 18 at the end = 10% opacity in hex (0–255 → 0–FF)
          >
            <span
              className="text-xs font-mono uppercase tracking-widest opacity-40"
              style={{ color: fallbackBg }}
            >
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
          </div>
        )}

        {/* ── Recency badge — overlaid on thumbnail ─────────────────────── */}
        {recency && (
          <div className="absolute top-2 left-2">
            <span className={`
              ${recency === 'breaking' ? 'badge-breaking' : recency === 'new' ? 'badge-new' : 'badge-today'}
              inline-block rounded-pill px-2 py-0.5 text-xs font-mono font-bold uppercase
            `}>
              {getRecencyLabel(recency)}
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div className="p-3 space-y-2">

        {/* ── Source line ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs text-muted">
          {/* Source name */}
          <span className="font-medium truncate">{article.source}</span>

          {/* Source tier badge — small pill */}
          <span className="
            shrink-0 bg-surface border border-border rounded-pill
            px-1.5 py-px text-subtle text-[10px] uppercase tracking-wide font-mono
          ">
            {SOURCE_TIER_LABELS[sourceTier]}
          </span>

          {/* Spacer */}
          <span className="flex-1" />

          {/* Relative timestamp */}
          <time
            dateTime={article.published_at}
            className="tabular text-subtle shrink-0"
          >
            {relativeTime(article.published_at)}
          </time>
        </div>

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <h3 className="
          text-sm font-semibold text-fore leading-snug
          line-clamp-2
          group-hover:text-accent transition-colors duration-150
        ">
          {/* line-clamp-2 = max 2 lines, then '…' — keeps cards uniform height */}
          {article.title}
        </h3>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        {article.summary && (
          <p className="text-xs text-muted leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        )}

        {/* ── Confidence badge ────────────────────────────────────────────── */}
        <div className="pt-1">
          <span className={`
            ${badgeClass}
            inline-block rounded-pill px-2.5 py-0.5
            text-xs font-mono font-bold uppercase tracking-wide
          `}>
            {getConfidenceLabel(tier)} · {formatConfidencePct(article.confidence)}
          </span>
        </div>

      </div>
    </a>
  )
}
