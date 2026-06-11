// Server Component — fetches nothing itself, receives data as props from the page.
// The CountdownTimer inside is a Client Component — that's fine. Server Components
// can render Client Components as children.

import CountdownTimer from './CountdownTimer'
import type { GameConfig } from '@/lib/games'
import type { ArticleStats } from '@/lib/schemas'

interface HeroProps {
  game: GameConfig
  stats: ArticleStats
}

export default function Hero({ game, stats }: HeroProps) {
  return (
    <>
      {/* ── Mobile sticky countdown strip ─────────────────────────────────
          Only visible on mobile (md:hidden). Sticks just below the Nav.
          On desktop this is hidden; the full countdown is in the hero body.
          z-40 = below Nav (z-50) but above the feed content             */}
      <div className="md:hidden sticky top-14 z-40 bg-bg/95 backdrop-blur border-b border-border px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-muted font-mono uppercase tracking-widest">
          Until launch
        </span>
        <CountdownTimer targetDate={game.releaseDate} variant="compact" />
      </div>

      {/* ── Main hero ─────────────────────────────────────────────────────── */}
      {/* py-16 md:py-24 = more vertical breathing room on larger screens     */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-24">

        {/* ── Game label eyebrow ────────────────────────────────────────── */}
        <p className="tabular text-xs text-accent uppercase tracking-[0.2em] mb-4 font-mono">
          {/* tracking-[0.2em] = wide letter-spacing for "newsroom label" feel */}
          {game.fullName} · Intel Tracker
        </p>

        {/* ── Tagline ───────────────────────────────────────────────────── */}
        {/* This is the H1 for the page — one per page, required for SEO    */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-fore leading-tight max-w-2xl mb-6">
          {game.tagline}
        </h1>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        {/* Three numbers showing feed health at a glance                   */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-12 text-sm">
          <StatPill value={stats.total} label="articles tracked" />
          <StatPill value={stats.sourceCount} label="sources monitored" />
          <StatPill value={stats.todayCount} label="published today" />
        </div>

        {/* ── Full countdown — desktop only ─────────────────────────────── */}
        {/* hidden md:block = invisible on mobile (compact strip used instead) */}
        <div className="hidden md:block">
          <p className="tabular text-xs text-subtle uppercase tracking-widest mb-4 font-mono">
            Days until GTA VI launches
          </p>
          <CountdownTimer targetDate={game.releaseDate} variant="full" />
          <p className="text-subtle text-sm mt-4 font-mono tabular">
            {/* Inline confidence signal for the release date itself */}
            November 19, 2026 ·{' '}
            <span className="text-confirmed">
              {game.releaseConfirmed ? '✓ confirmed' : 'window only'}
            </span>
            {' '}· PS5 / Xbox Series X|S
          </p>
        </div>

      </section>
    </>
  )
}

// ── StatPill sub-component ─────────────────────────────────────────────────────
// Small inline component used only inside Hero — no need for a separate file.
function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      {/* tabular + font-mono for the number — data should feel like data */}
      <span className="tabular font-mono text-lg font-bold text-fore">
        {value.toLocaleString()}
      </span>
      <span className="text-muted">{label}</span>
    </div>
  )
}
