// Server Component — pure display, no interactivity needed.
// Receives pre-computed signal mix data from the Feed or page.

import { computeSignalMix } from '@/lib/utils'
import type { Article } from '@/lib/schemas'

interface SignalMixProps {
  articles: Article[]
}

export default function SignalMix({ articles }: SignalMixProps) {
  const mix = computeSignalMix(articles.map(a => a.confidence))

  if (mix.total === 0) return null

  return (
    <div className="bg-card border border-border rounded-card p-4 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted">
          Signal Mix
        </h3>
        <span className="text-xs tabular text-subtle">{mix.total} articles</span>
      </div>

      {/* ── Stacked bar ───────────────────────────────────────────────────── */}
      {/* The visual "thermometer" showing the overall reliability of the feed */}
      <div className="flex h-2 rounded-pill overflow-hidden gap-px">
        {mix.confirmedPct > 0 && (
          <div
            className="bg-confirmed transition-all"
            style={{ width: `${mix.confirmedPct}%` }}
          />
        )}
        {mix.likelyPct > 0 && (
          <div
            className="bg-likely transition-all"
            style={{ width: `${mix.likelyPct}%` }}
          />
        )}
        {mix.rumourPct > 0 && (
          <div
            className="bg-rumour transition-all"
            style={{ width: `${mix.rumourPct}%` }}
          />
        )}
      </div>

      {/* ── Legend rows ───────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <MixRow
          label="Confirmed"
          count={mix.confirmedCount}
          pct={mix.confirmedPct}
          colorClass="bg-confirmed"
          textClass="text-confirmed"
        />
        <MixRow
          label="Likely"
          count={mix.likelyCount}
          pct={mix.likelyPct}
          colorClass="bg-likely"
          textClass="text-likely"
        />
        <MixRow
          label="Rumour"
          count={mix.rumourCount}
          pct={mix.rumourPct}
          colorClass="bg-rumour"
          textClass="text-rumour"
        />
      </div>

    </div>
  )
}

function MixRow({
  label, count, pct, colorClass, textClass,
}: {
  label: string
  count: number
  pct: number
  colorClass: string
  textClass: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Color dot */}
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorClass}`} />
      <span className="text-muted flex-1">{label}</span>
      <span className={`tabular font-mono font-bold ${textClass}`}>
        {pct}%
      </span>
      <span className="tabular text-subtle w-8 text-right">{count}</span>
    </div>
  )
}
