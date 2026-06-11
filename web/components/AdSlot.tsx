// CLS = Cumulative Layout Shift — a Core Web Vitals metric.
// If an ad loads and pushes content down, CLS score tanks.
// Fix: reserve the exact space BEFORE the ad loads with a fixed-height div.
// When the real ad (Venatus/Playwire) is added, it fills this space exactly.
// No layout shift = no CLS penalty = better search rankings.

interface AdSlotProps {
  variant: 'infeed' | 'rail'
}

// Fixed heights match standard ad unit sizes:
//   infeed = 90px (leaderboard: 728×90 collapses to this height on mobile)
//   rail   = 250px (medium rectangle: 300×250 — standard display unit)
const HEIGHTS: Record<AdSlotProps['variant'], string> = {
  infeed: 'h-[90px]',
  rail:   'h-[250px]',
}

export default function AdSlot({ variant }: AdSlotProps) {
  return (
    <div
      className={`
        ${HEIGHTS[variant]}
        bg-card/50 border border-border border-dashed rounded-card
        flex items-center justify-center
      `}
      // aria-hidden: this is a layout placeholder, not content
      aria-hidden="true"
    >
      {/* Visible only in dev — remove or keep based on preference */}
      <span className="text-subtle text-xs font-mono opacity-30">
        ad · {variant}
      </span>
    </div>
  )
}
