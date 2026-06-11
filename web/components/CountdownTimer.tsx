'use client'

// WHY 'use client'?
// This component needs to run JavaScript in the browser to tick every second.
// Server Components are rendered once and sent as HTML — they can't update.
// Any component with setInterval, setTimeout, or live-updating state needs
// 'use client' to run in the browser.

import { useState, useEffect } from 'react'
import { getCountdown, pad2 } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate: string   // ISO date string, e.g. "2026-11-19"
  variant?: 'full' | 'compact'
}

export default function CountdownTimer({
  targetDate,
  variant = 'full',
}: CountdownTimerProps) {
  // WHY null initial state?
  // On the server, new Date() is the build time. In the browser, it's now.
  // If we initialise with getCountdown() directly, the server HTML shows
  // one number and the browser shows a slightly different one — React calls
  // this a "hydration mismatch" and logs a warning.
  // Fix: start null on both server and client, set the real value in useEffect
  // (which only runs in the browser). We show a loading skeleton until then.
  const [countdown, setCountdown] = useState<ReturnType<typeof getCountdown> | null>(null)

  useEffect(() => {
    // Set immediately (don't wait a full second for first render)
    setCountdown(getCountdown(targetDate))

    // Then tick every second
    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDate))
    }, 1000)

    // Cleanup: cancel the interval when the component unmounts.
    // Without this, the interval keeps running in memory — a memory leak.
    return () => clearInterval(interval)
  }, [targetDate])

  // ── Compact variant — used in right rail and mobile sticky strip ──────────
  if (variant === 'compact') {
    if (!countdown) {
      // Skeleton while hydrating — same width as real content to avoid layout shift
      return (
        <div className="tabular text-sm text-muted animate-pulse">
          —d ——h ——m ——s
        </div>
      )
    }

    if (countdown.total <= 0) {
      return <span className="tabular text-sm font-bold text-confirmed">LAUNCHED</span>
    }

    return (
      // tabular = Space Mono + tabular-nums (digits stay same width as they change)
      <div className="tabular text-sm text-muted">
        <span className="text-accent font-bold">{countdown.days}d</span>
        {' '}{pad2(countdown.hours)}h {pad2(countdown.minutes)}m{' '}
        <span className="text-subtle">{pad2(countdown.seconds)}s</span>
      </div>
    )
  }

  // ── Full variant — used in the Hero section ───────────────────────────────
  if (!countdown) {
    // Skeleton: four blocks matching the real layout
    return (
      <div className="flex items-end gap-4 sm:gap-6">
        {['DAYS', 'HRS', 'MIN', 'SEC'].map(label => (
          <div key={label} className="text-center animate-pulse">
            <div className="tabular text-4xl sm:text-6xl font-bold text-fore/20 leading-none w-16 sm:w-20">
              ——
            </div>
            <div className="tabular text-xs text-subtle mt-1">{label}</div>
          </div>
        ))}
      </div>
    )
  }

  if (countdown.total <= 0) {
    return (
      <div className="tabular text-4xl sm:text-6xl font-bold text-confirmed">
        LAUNCHED 🎮
      </div>
    )
  }

  const units = [
    { value: countdown.days,    label: 'DAYS', raw: true  },
    { value: countdown.hours,   label: 'HRS',  raw: false },
    { value: countdown.minutes, label: 'MIN',  raw: false },
    { value: countdown.seconds, label: 'SEC',  raw: false },
  ]

  return (
    <div className="flex items-end gap-4 sm:gap-6">
      {units.map(({ value, label, raw }) => (
        <div key={label} className="text-center">
          {/* text-4xl sm:text-6xl = 36px on mobile, 60px on sm+ screens */}
          <div className="tabular text-4xl sm:text-6xl font-bold text-fore leading-none">
            {raw ? value : pad2(value)}
          </div>
          <div className="tabular text-xs text-subtle tracking-widest mt-1.5">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
