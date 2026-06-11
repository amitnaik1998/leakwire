// Server Component — static content, no interactivity.

import Link from 'next/link'
import type { GameConfig } from '@/lib/games'
import { CATEGORY_LABELS } from '@/lib/schemas'

interface FooterProps {
  game: GameConfig
}

export default function Footer({ game }: FooterProps) {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── Top row: Logo + disclaimer ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">

          {/* Logo + identity */}
          <div className="space-y-2">
            <Link href={`/${game.slug}`} className="font-bold text-lg tracking-tight">
              LEAK<span className="text-accent">WIRE</span>
            </Link>
            <p className="text-sm text-muted max-w-xs">
              {game.seoDescription}
            </p>
          </div>

          {/* UNOFFICIAL SITE disclaimer — red and prominent */}
          {/* The brief requires this to be clearly visible to avoid confusion with Rockstar */}
          <div className="border border-rumour/40 rounded-card px-4 py-3 max-w-sm">
            <p className="text-rumour text-xs font-mono font-bold uppercase tracking-wide mb-1">
              ⚠ Unofficial Site
            </p>
            <p className="text-subtle text-xs leading-relaxed">
              Leakwire is an independent fan site. We are not affiliated with,
              endorsed by, or connected to Rockstar Games or Take-Two Interactive.
              All trademarks belong to their respective owners.
            </p>
          </div>

        </div>

        {/* ── Category links ────────────────────────────────────────────── */}
        <div>
          <p className="text-xs text-subtle uppercase tracking-widest font-mono mb-3">
            Browse by category
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {game.categories
              .filter(c => c !== 'unrelated')
              .map(cat => (
                <Link
                  key={cat}
                  href={`/${game.slug}/${cat}`}
                  className="text-sm text-muted hover:text-accent transition-colors duration-150"
                >
                  {CATEGORY_LABELS[cat]}
                </Link>
              ))
            }
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-subtle">
          <p>© {new Date().getFullYear()} Leakwire. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-muted transition-colors">About</Link>
            <span>Updated every 30 minutes</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
