'use client'

// WHY 'use client'?
// Every interaction here (typing in search, clicking a pill, toggling the switch)
// updates local state that immediately re-renders the Feed. That's browser-only.

import type { Category } from '@/lib/schemas'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/schemas'

// These types are also used by Feed.tsx which owns the actual state.
// FilterBar is a "controlled component" — it receives state and callbacks as props,
// and tells the parent when something changes. The parent owns the state.
export interface FilterState {
  category:      Category | null  // null = All
  confirmedOnly: boolean
  sort:          'latest' | 'confidence'
  search:        string
}

interface FilterBarProps {
  state:          FilterState
  categoryCounts: Record<string, number>
  onFilterChange: (update: Partial<FilterState>) => void
}

export default function FilterBar({ state, categoryCounts, onFilterChange }: FilterBarProps) {
  return (
    // sticky top-14 = sticks just below the Nav (Nav is h-14 = 3.5rem)
    // z-40           = below Nav (z-50), above feed cards
    // The md:top-14 accounts for the mobile countdown strip adding ~40px
    <div className="sticky top-14 md:top-14 z-40 bg-bg/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">

        {/* ── Row 1: Search + confirmed toggle + sort ─────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Search input */}
          <div className="relative flex-1 min-w-48">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle w-3.5 h-3.5"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={state.search}
              onChange={e => onFilterChange({ search: e.target.value })}
              placeholder="Search articles…"
              // pl-9 = padding-left 2.25rem — clears the search icon
              className="
                w-full bg-card border border-border rounded-sm
                pl-9 pr-3 py-1.5 text-sm text-fore
                placeholder:text-subtle
                focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                transition-colors
              "
            />
          </div>

          {/* Confirmed only toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"   // sr-only = visually hidden but accessible to screen readers
                checked={state.confirmedOnly}
                onChange={e => onFilterChange({ confirmedOnly: e.target.checked })}
              />
              {/* Custom toggle track */}
              <div className={`
                w-8 h-4 rounded-pill transition-colors duration-200
                ${state.confirmedOnly ? 'bg-confirmed' : 'bg-border'}
              `} />
              {/* Toggle thumb */}
              <div className={`
                absolute top-0.5 w-3 h-3 bg-white rounded-full shadow
                transition-transform duration-200
                ${state.confirmedOnly ? 'translate-x-4.5' : 'translate-x-0.5'}
              `} />
            </div>
            <span className="text-sm text-muted">
              <span className="text-confirmed mr-0.5">✓</span>
              Confirmed only
            </span>
          </label>

          {/* Sort selector */}
          <select
            value={state.sort}
            onChange={e => onFilterChange({ sort: e.target.value as FilterState['sort'] })}
            className="
              bg-card border border-border rounded-sm
              px-2.5 py-1.5 text-sm text-muted
              focus:outline-none focus:border-accent
              cursor-pointer shrink-0
            "
          >
            <option value="latest">Latest first</option>
            <option value="confidence">Most confident</option>
          </select>

        </div>

        {/* ── Row 2: Category pills ────────────────────────────────────────── */}
        {/* scrollbar-hidden + overflow-x-auto = horizontal scroll on mobile   */}
        {/* without showing a scrollbar — clean look on iOS/Android             */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden pb-1">

          {/* "All" pill */}
          <CategoryPill
            label="All"
            count={Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
            active={state.category === null}
            onClick={() => onFilterChange({ category: null })}
          />

          {/* One pill per category (skip unrelated — those are filtered by pipeline) */}
          {CATEGORIES.filter(c => c !== 'unrelated').map(cat => (
            <CategoryPill
              key={cat}
              label={CATEGORY_LABELS[cat]}
              count={categoryCounts[cat] ?? 0}
              active={state.category === cat}
              onClick={() => onFilterChange({ category: cat === state.category ? null : cat })}
            />
          ))}

        </div>

      </div>
    </div>
  )
}

// ── CategoryPill ───────────────────────────────────────────────────────────────
function CategoryPill({
  label, count, active, onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      // shrink-0 = prevent pills from shrinking when row is crowded
      className={`
        shrink-0 rounded-pill px-3 py-1 text-xs font-medium
        transition-colors duration-150 whitespace-nowrap
        ${active
          ? 'bg-accent text-white'
          : 'bg-card border border-border text-muted hover:border-accent/50 hover:text-fore'
        }
      `}
    >
      {label}
      {/* Show count in parentheses only if non-zero */}
      {count > 0 && (
        <span className={`ml-1.5 tabular ${active ? 'text-white/70' : 'text-subtle'}`}>
          {count}
        </span>
      )}
    </button>
  )
}
