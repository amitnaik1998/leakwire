// web/components/Hero.tsx

"use client";

// 'use client' needed because the countdown ticks every second via useEffect.
// The rest of the hero is static — only the CountdownTimer needs the browser.
// We could keep Hero as a Server Component and nest a Client Component inside,
// but since the countdown is the centrepiece we just make the whole hero client.
// The cost is negligible — Hero is small and renders once above the fold.

import { useState, useEffect } from "react";
import type { GameConfig } from "@/lib/games";
import type { ArticleStats } from "@/lib/schemas";
import { getCountdown, pad2 } from "@/lib/utils";
import CountdownTimer from "./CountdownTimer";

interface HeroProps {
  game: GameConfig;
  stats: ArticleStats;
}

export default function Hero({ game, stats }: HeroProps) {
  // Countdown state — null until hydrated to avoid SSR mismatch
  const [countdown, setCountdown] = useState<ReturnType<
    typeof getCountdown
  > | null>(null);

  useEffect(() => {
    setCountdown(getCountdown(game.releaseDate));
    const interval = setInterval(() => {
      setCountdown(getCountdown(game.releaseDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [game.releaseDate]);

  return (
    <>
      {/* ── Mobile sticky countdown strip ─────────────────────────────────
          Only visible on mobile (md:hidden). Sits below the Nav.          */}
      <div className="md:hidden sticky top-14 z-40 bg-bg/95 backdrop-blur border-b border-border px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-muted font-mono uppercase tracking-widest">
          Until launch
        </span>
        <CountdownTimer targetDate={game.releaseDate} variant="compact" />
      </div>

      {/* ── Main hero ─────────────────────────────────────────────────────── */}
      <section className="hidden md:block relative overflow-hidden">
        {/* ── Background gradient — Vice City palette ──────────────────────
            Deep navy/purple at top → warm coral/burnt orange at bottom.
            This colour journey is immediately associated with GTA 6 trailers
            without using any Rockstar-owned assets.                        */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(155deg, #06060f 0%, #0c0620 18%, #180840 35%, #280c50 48%, #3d1040 60%, #581525 72%, #6e1c18 83%, #7a2210 92%, #7d2810 100%)",
          }}
        />

        {/* ── Ambient colour glows ──────────────────────────────────────────
            Two soft radial glows — coral on the right, purple on the left.
            Adds depth without being loud.                                  */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 85% 40%, rgba(232,100,60,0.18) 0%, transparent 45%), radial-gradient(ellipse at 15% 60%, rgba(120,40,200,0.15) 0%, transparent 45%)",
          }}
        />

        {/* ── Subtle scanline texture ───────────────────────────────────────
            Very faint horizontal lines add a screen/terminal feel.
            Opacity is low enough that most users won't consciously notice
            it — it just makes the surface feel less flat.                  */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          }}
        />

        {/* ── VI watermark ─────────────────────────────────────────────────
            Massive faint "VI" in the background. Uses Arial Black (heavy
            condensed) rather than a serif — closer to the GTA title card
            aesthetic. Opacity is very low so it reads as atmosphere, not
            text. User sees it subconsciously before they read anything.    */}
        <div
          className="absolute pointer-events-none select-none"
          style={{
            right: "6%",
            top: "50%",
            transform: "translateY(-52%)",
            fontSize: "180px",
            fontWeight: 900,
            color: "rgba(255,255,255,0.055)",
            fontFamily: '"Arial Black", Arial, sans-serif',
            lineHeight: 1,
            letterSpacing: "-12px",
          }}
        >
          VI
        </div>

        {/* ── Bottom fade ───────────────────────────────────────────────────
            Gradient from transparent to page background color.
            Makes the hero flow into the filter bar rather than hard-cutting.*/}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "48px",
            background:
              "linear-gradient(to bottom, transparent, rgba(11,13,18,0.7))",
          }}
        />

        {/* ── Content ───────────────────────────────────────────────────────*/}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 gap-8 items-center">
          {/* ── Left: tagline + stats ──────────────────────────────────── */}
          <div>
            {/* Eyebrow label */}
            <p className="font-mono text-[9px] text-accent uppercase tracking-[0.18em] mb-3">
              {game.fullName} · Intel Tracker
            </p>

            {/* Tagline — H1 for SEO, one per page */}
            <h1 className="font-display text-[26px] font-bold leading-snug tracking-tight mb-5">
              {/* Line 1: "Every GTA VI signal." — GTA VI in accent coral */}
              <span className="text-fore">Every </span>
              <span className="text-accent">GTA VI</span>
              <span className="text-fore"> signal.</span>
              <br />
              {/* Line 2: "One feed." bright, "Zero noise." dimmed —
                  Three-level hierarchy: coral → white → dim white.
                  The dimming of "Zero noise." is intentional — the tagline
                  practises what it preaches.                               */}
              <span className="text-fore">One feed. </span>
              <span className="text-fore/50">Zero noise.</span>
            </h1>

            {/* Stats — horizontal row with dividers */}
            <div className="flex gap-0">
              <div className="flex-1 pr-4 border-r border-white/[0.08]">
                <div className="font-mono text-xl font-bold text-fore leading-none">
                  {stats.total.toLocaleString()}
                </div>
                <div className="font-mono text-[9px] text-white/35 mt-1">
                  articles tracked
                </div>
              </div>
              <div className="flex-1 px-4 border-r border-white/[0.08]">
                <div className="font-mono text-xl font-bold text-fore leading-none">
                  {stats.sourceCount}
                </div>
                <div className="font-mono text-[9px] text-white/35 mt-1">
                  sources monitored
                </div>
              </div>
              <div className="flex-1 pl-4">
                <div className="font-mono text-xl font-bold text-fore leading-none">
                  {stats.todayCount}
                </div>
                <div className="font-mono text-[9px] text-white/35 mt-1">
                  published today
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: countdown ──────────────────────────────────────── */}
          <div className="border-l border-white/[0.08] pl-8">
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.14em] mb-3">
              Until GTA VI launches
            </p>

            {/* Countdown numbers */}
            {!countdown ? (
              // Skeleton while hydrating — prevents layout shift
              <div className="flex gap-1.5 items-end mb-3 opacity-20">
                {["———", "——", "——", "——"].map((v, i) => (
                  <div key={i} className="text-center">
                    <span className="font-mono text-[40px] font-bold text-fore leading-none block">
                      {v}
                    </span>
                    <span className="font-mono text-[8px] text-white/30 uppercase tracking-[0.1em]">
                      {["days", "hrs", "min", "sec"][i]}
                    </span>
                  </div>
                ))}
              </div>
            ) : countdown.total <= 0 ? (
              <div className="font-mono text-4xl font-bold text-confirmed mb-3">
                LAUNCHED 🎮
              </div>
            ) : (
              <div className="flex gap-1.5 items-end mb-3">
                {[
                  { value: String(countdown.days), label: "days" },
                  { value: pad2(countdown.hours), label: "hrs" },
                  { value: pad2(countdown.minutes), label: "min" },
                  { value: pad2(countdown.seconds), label: "sec" },
                ].map(({ value, label }, i) => (
                  <div key={label} className="flex items-end">
                    <div className="text-center">
                      <span className="font-mono text-[40px] font-bold text-fore leading-none block tracking-tight">
                        {value}
                      </span>
                      <span className="font-mono text-[8px] text-white/30 uppercase tracking-[0.1em]">
                        {label}
                      </span>
                    </div>
                    {/* Coral separator colon — not shown after last unit */}
                    {i < 3 && (
                      <span
                        className="font-mono font-bold text-accent/70 pb-4 mx-1.5"
                        style={{ fontSize: "28px", lineHeight: 1 }}
                      >
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Confirmed status line with live green dot */}
            <div className="flex items-center gap-2">
              {/* Green dot — signals "live confirmed data" */}
              <div
                className="w-1.5 h-1.5 rounded-full bg-confirmed shrink-0"
                style={{ boxShadow: "0 0 6px rgba(91,201,138,0.6)" }}
              />
              <span className="font-mono text-[9px] text-white/40">
                Nov 19 2026 &nbsp;·&nbsp;{" "}
                <span className="text-confirmed">
                  {game.releaseConfirmed ? "confirmed" : "window estimate"}
                </span>{" "}
                &nbsp;·&nbsp; PS5 / Xbox Series X|S
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
