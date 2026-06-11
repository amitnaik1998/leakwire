// Server Component — pure display. All content comes from games.ts config.

import type { GameFact } from '@/lib/games'

interface FactFileProps {
  facts: GameFact[]
}

export default function FactFile({ facts }: FactFileProps) {
  return (
    <section className="bg-card/50 border-y border-border py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="mb-8">
          <p className="tabular text-xs text-accent uppercase tracking-[0.2em] mb-2 font-mono">
            Fact File
          </p>
          <h2 className="text-2xl font-bold text-fore tracking-tight">
            What we know for certain
          </h2>
        </div>

        {/* 
          Grid: 2 cols on mobile, 4 cols on large screens
          Each fact card shows: label, value, confirmed/rumoured stamp
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {facts.map(fact => (
            <FactCard key={fact.id} fact={fact} />
          ))}
        </div>

      </div>
    </section>
  )
}

// ── FactCard ───────────────────────────────────────────────────────────────────
function FactCard({ fact }: { fact: GameFact }) {
  const isConfirmed = fact.status === 'confirmed'

  return (
    // The left edge uses inline style here (not a Tailwind class) because
    // the color is dynamic based on status, and we can't use arbitrary
    // values like border-l-[#5BC98A] — Tailwind would need to generate that
    // class at build time. Inline style is the right tool here.
    <div
      className="bg-card border border-border rounded-card p-4 space-y-2"
      style={{
        borderLeft: `3px solid ${isConfirmed ? 'var(--color-confirmed)' : 'var(--color-rumour)'}`,
      }}
    >

      {/* Label */}
      <p className="text-xs text-subtle font-mono uppercase tracking-wide">
        {fact.label}
      </p>

      {/* Value */}
      <p className="text-sm font-semibold text-fore leading-snug">
        {fact.value}
      </p>

      {/* Status stamp */}
      <div>
        <span className={`
          inline-block rounded-pill px-2 py-0.5
          text-[10px] font-mono font-bold uppercase tracking-wide
          ${isConfirmed ? 'badge-confirmed' : 'badge-rumour'}
        `}>
          {isConfirmed ? '✓ Confirmed' : '? Rumoured'}
        </span>
      </div>

      {/* Optional note */}
      {fact.note && (
        <p className="text-xs text-subtle leading-relaxed">
          {fact.note}
        </p>
      )}

    </div>
  )
}
