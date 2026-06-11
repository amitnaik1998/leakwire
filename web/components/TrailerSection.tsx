// Server Component — iframes are static HTML, no client JS needed.
// Uses youtube-nocookie.com for privacy (no tracking cookies set on visit).

import type { GameTrailer } from '@/lib/games'

interface TrailerSectionProps {
  trailers: GameTrailer[]
}

export default function TrailerSection({ trailers }: TrailerSectionProps) {
  // Skip trailers that don't have a real YouTube ID yet
  const valid = trailers.filter(t => t.youtubeId && !t.youtubeId.startsWith('TODO'))

  if (valid.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

      {/* Section header */}
      <div className="mb-8">
        <p className="tabular text-xs text-accent uppercase tracking-[0.2em] mb-2 font-mono">
          Official Trailers
        </p>
        <h2 className="text-2xl font-bold text-fore tracking-tight">
          Straight from Rockstar
        </h2>
      </div>

      {/* 
        grid-cols-1 on mobile, md:grid-cols-2 for 2+ trailers on desktop.
        Each trailer is a 16:9 embed (aspect-video).
      */}
      <div className={`grid gap-6 ${valid.length > 1 ? 'md:grid-cols-2' : 'max-w-2xl'}`}>
        {valid.map(trailer => (
          <TrailerEmbed key={trailer.id} trailer={trailer} />
        ))}
      </div>

    </section>
  )
}

// ── TrailerEmbed ───────────────────────────────────────────────────────────────
function TrailerEmbed({ trailer }: { trailer: GameTrailer }) {
  const embedUrl =
    `https://www.youtube-nocookie.com/embed/${trailer.youtubeId}` +
    `?rel=0&modestbranding=1`
    // rel=0       = don't show related videos from other channels after playback
    // modestbranding=1 = minimal YouTube branding in the player

  // Format the publish date
  const date = new Date(trailer.publishedAt)
  const formatted = date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="space-y-3">
      {/* 
        aspect-video = padding-bottom: 56.25% trick — maintains 16:9 ratio.
        This is how you do responsive iframes: the container holds aspect ratio,
        the iframe fills it absolutely. Without this, iframes default to 150px tall.
      */}
      <div className="relative aspect-video bg-card rounded-card overflow-hidden border border-border">
        <iframe
          src={embedUrl}
          title={trailer.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          // absolute inset-0 = fills the aspect-ratio container exactly
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Trailer metadata */}
      <div>
        <p className="text-sm font-semibold text-fore">{trailer.title}</p>
        <p className="text-xs text-muted">
          {trailer.channel} · {formatted}
        </p>
      </div>
    </div>
  )
}
