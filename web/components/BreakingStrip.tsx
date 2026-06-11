// Server Component — rendered conditionally by the page.
// The page calls getBreakingArticles() and only renders this if the array is non-empty.
// So this component can assume articles.length > 0.

import type { Article } from '@/lib/schemas'

interface BreakingStripProps {
  articles: Article[]
}

export default function BreakingStrip({ articles }: BreakingStripProps) {
  // Take the 3 most recent breaking articles for the strip
  const items = articles.slice(0, 3)

  return (
    // The badge-breaking class from globals.css applies the pulsing animation
    // and the accent background color. This is the "urgent" visual signal.
    <div className="bg-accent/10 border-y border-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-4">

        {/* ── Label ──────────────────────────────────────────────────────── */}
        <span className="badge-breaking shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wide">
          ⚡ Breaking
        </span>

        {/* ── Article titles ─────────────────────────────────────────────── */}
        {/* overflow-hidden prevents titles from breaking layout on small screens */}
        <div className="flex items-center gap-4 overflow-hidden">
          {items.map((article, i) => (
            <a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-sm text-fore font-medium
                hover:text-accent transition-colors duration-150
                truncate                          
                shrink-0 max-w-xs sm:max-w-sm
              "
              // truncate = overflow: hidden + text-overflow: ellipsis + white-space: nowrap
            >
              {article.title}
              {/* Separator dot between articles (not after the last one) */}
              {i < items.length - 1 && (
                <span className="text-subtle ml-4 font-normal">·</span>
              )}
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}
