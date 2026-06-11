// Server Component — static content from games.ts config.

import type { GameMilestone } from '@/lib/games'

interface MilestoneStripProps {
  milestones: GameMilestone[]
}

export default function MilestoneStrip({ milestones }: MilestoneStripProps) {
  return (
    <section className="bg-card/30 border-y border-border py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <p className="tabular text-xs text-accent uppercase tracking-[0.2em] mb-6 font-mono">
          Road to Launch
        </p>

        {/* 
          Horizontal strip — scrollable on mobile.
          overflow-x-auto + scrollbar-hidden = smooth swipe with no scrollbar.
          The connecting line is a border-t on the milestone items.
        */}
        <div className="overflow-x-auto scrollbar-hidden">
          <div className="flex items-start gap-0 min-w-max pb-2">
            {milestones.map((milestone, index) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                isLast={index === milestones.length - 1}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

// ── MilestoneItem ──────────────────────────────────────────────────────────────
function MilestoneItem({
  milestone,
  isLast,
}: {
  milestone: GameMilestone
  isLast: boolean
}) {
  const isDone     = milestone.status === 'done'
  const isLaunch   = milestone.status === 'launch'
  const isUpcoming = milestone.status === 'upcoming'

  // Format the date if present
  const dateStr = milestone.date
    ? new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'TBD'

  return (
    // flex-1 min-w-[160px] = each milestone gets at least 160px, expands equally
    <div className="flex-1 min-w-[160px] relative">

      {/* ── Connecting line ────────────────────────────────────────────────
          The line runs from the dot to the right, connecting milestones.
          We hide it on the last item.                                      */}
      {!isLast && (
        <div className={`
          absolute top-[11px] left-[calc(50%+12px)] right-0 h-px
          ${isDone ? 'bg-confirmed/40' : 'bg-border'}
        `} />
      )}

      {/* ── Dot + content ─────────────────────────────────────────────────*/}
      <div className="flex flex-col items-center text-center px-4">

        {/* Dot */}
        <div className={`
          relative z-10 w-5 h-5 rounded-full border-2 mb-3
          flex items-center justify-center
          ${isLaunch
            ? 'bg-accent border-accent shadow-[0_0_12px_var(--color-accent)]'
            : isDone
              ? 'bg-confirmed border-confirmed'
              : 'bg-bg border-border'
          }
        `}>
          {isDone && (
            // Checkmark inside done dots
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isUpcoming && (
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
          )}
        </div>

        {/* Label */}
        <p className={`
          text-xs font-semibold leading-tight mb-1
          ${isLaunch ? 'text-accent' : isDone ? 'text-fore' : 'text-muted'}
        `}>
          {milestone.label}
        </p>

        {/* Date */}
        <p className="tabular text-[10px] text-subtle font-mono">
          {dateStr}
        </p>

        {/* Optional note */}
        {milestone.note && (
          <p className="text-[10px] text-subtle mt-1 max-w-[120px] leading-relaxed">
            {milestone.note}
          </p>
        )}

      </div>
    </div>
  )
}
