// Server Component — no interactivity needed, renders on the server.
// The game-switcher pill is read-only in V1 (dropdown in V2 when 2+ games exist).

import Link from "next/link";
import type { GameConfig } from "@/lib/games";
import { GAMES } from "@/lib/games";

interface NavProps {
  game: GameConfig;
}

export default function Nav({ game }: NavProps) {
  // V2: when GAMES.length > 1, render a dropdown from this list
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _otherGames = GAMES.filter((g) => g.slug !== game.slug);

  return (
    // sticky top-0    = sticks to top of viewport as you scroll
    // z-50            = sits above the filter bar (z-40) and everything else
    // bg-bg/95        = 95% opaque bg — the /95 is Tailwind's opacity modifier
    // backdrop-blur   = frosted glass effect on the 5% transparency
    // border-b        = 1px bottom border using our --color-border token
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4 sm:gap-6">
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link
          href={`/${game.slug}`}
          // tracking-tight = slightly compressed letter-spacing — editorial feel
          className="font-display font-bold text-lg tracking-tight shrink-0"
        >
          LEAK<span className="text-accent">WIRE</span>
        </Link>

        {/* ── Game switcher pill ────────────────────────────────────── */}
        {/* V1: static pill. V2: make this a <details> dropdown */}
        <div className="shrink-0">
          <span
            className="
            inline-flex items-center gap-1
            bg-card border border-border
            rounded-pill                 
            px-3 py-1 text-sm font-medium text-fore
            select-none
          "
          >
            {/* rounded-pill = border-radius: 9999px — our custom token */}
            {game.name}
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="currentColor"
              className="text-muted"
            >
              <path d="M0 0l5 6 5-6H0z" />
            </svg>
          </span>
        </div>

        {/* ── Nav links ─────────────────────────────────────────────── */}
        {/* hidden md:flex = visible only on medium screens and above */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          <Link
            href={`/${game.slug}`}
            className="text-muted hover:text-fore transition-colors duration-150"
          >
            Feed
          </Link>
          {/* Timeline and Sources are V2 — shown as disabled to signal roadmap */}
          <span
            className="text-subtle opacity-50 cursor-not-allowed select-none"
            title="Coming in V2"
          >
            Timeline
          </span>
          <span
            className="text-subtle opacity-50 cursor-not-allowed select-none"
            title="Coming in V2"
          >
            Sources
          </span>
          <Link
            href="/about"
            className="text-muted hover:text-fore transition-colors duration-150"
          >
            About
          </Link>
        </div>

        {/* ── Spacer — pushes CTA to the right ─────────────────────── */}
        {/* flex-1 = grow to fill all available space between links and CTA */}
        <div className="flex-1" />

        {/* ── Subscribe CTA ─────────────────────────────────────────── */}
        <a
          href="#subscribe"
          className="
            hidden sm:inline-flex
            bg-accent hover:bg-accent-dim
            text-white text-sm font-medium
            px-4 py-1.5 rounded-pill
            transition-colors duration-150
            shrink-0
          "
        >
          Intel Brief
        </a>
      </nav>
    </header>
  );
}
