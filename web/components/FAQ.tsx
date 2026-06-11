// Server Component — native <details>/<summary> HTML elements.
// Why native <details> instead of a JS accordion?
//   - Works without JavaScript (progressive enhancement)
//   - Keyboard accessible by default (Enter/Space to toggle)
//   - Screen readers understand it natively
//   - One less client component = smaller JS bundle
//
// The FAQPage JSON-LD schema is added in Stage 4 (pages), since it wraps
// the whole page metadata. This component just renders the HTML.

import type { GameFAQ } from '@/lib/games'

interface FAQProps {
  faqs: GameFAQ[]
}

export default function FAQ({ faqs }: FAQProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

      {/* Section header */}
      <div className="mb-8">
        <p className="tabular text-xs text-accent uppercase tracking-[0.2em] mb-2 font-mono">
          FAQ
        </p>
        <h2 className="text-2xl font-bold text-fore tracking-tight">
          Frequently asked questions
        </h2>
      </div>

      {/* FAQ list */}
      <div className="max-w-2xl space-y-2">
        {faqs.map(faq => (
          <FAQItem key={faq.id} faq={faq} />
        ))}
      </div>

    </section>
  )
}

// ── FAQItem ────────────────────────────────────────────────────────────────────
function FAQItem({ faq }: { faq: GameFAQ }) {
  return (
    // <details> is a native HTML disclosure widget. No JS needed.
    // The browser handles open/close state and keyboard interaction.
    <details
      id={`faq-${faq.id}`}
      className="group bg-card border border-border rounded-card overflow-hidden"
      // 'group' enables group-open: variants on children
    >

      {/* <summary> is the clickable header */}
      <summary className="
        flex items-center justify-between
        px-4 py-3.5 cursor-pointer
        text-sm font-medium text-fore
        hover:text-accent transition-colors duration-150
        list-none
        [&::-webkit-details-marker]:hidden
      ">
        {/* [&::-webkit-details-marker]:hidden removes the default browser triangle */}
        {faq.question}

        {/* Custom chevron icon — rotates 180deg when open */}
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
          // group-open:rotate-180 = Tailwind variant: applies when the <details> is open
        >
          <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      {/* Answer — shown when <details> is open */}
      <div className="px-4 pb-4 border-t border-border">
        <p className="text-sm text-muted leading-relaxed pt-3">
          {faq.answer}
        </p>
      </div>

    </details>
  )
}
