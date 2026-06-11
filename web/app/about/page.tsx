import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Leakwire",
  description:
    "How Leakwire works — automated news tracking, AI classification, " +
    "and confidence scoring for gaming news.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-12">
      {/* Header */}
      <div>
        <p className="tabular text-xs text-accent uppercase tracking-[0.2em] mb-2 font-mono">
          About
        </p>
        <h1 className="text-3xl font-bold text-fore tracking-tight">
          How Leakwire works
        </h1>
      </div>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-fore">The pipeline</h2>
        <p className="text-muted text-sm leading-relaxed">
          Every 30 minutes, Leakwire fetches articles from 16 sources — major
          outlets like IGN and Eurogamer, community feeds like r/GTA6, and known
          insider accounts. Each article is classified by an AI model (Google
          Gemini) into categories like Release Date, Gameplay, Story, and
          Rumour.
        </p>
        <p className="text-muted text-sm leading-relaxed">
          The classifier also assigns a confidence score between 0 and 1,
          reflecting how reliable the source and claim are. We bucket that into
          three tiers:
        </p>

        {/* Confidence tier explanation */}
        <div className="space-y-2">
          {[
            {
              label: "CONFIRMED",
              range: "≥ 90%",
              desc: "Official sources or corroborated by multiple press outlets.",
              cls: "badge-confirmed",
            },
            {
              label: "LIKELY",
              range: "65–89%",
              desc: "Credible insiders or strong inference from known facts.",
              cls: "badge-likely",
            },
            {
              label: "RUMOUR",
              range: "< 65%",
              desc: "Community speculation or single unverified source.",
              cls: "badge-rumour",
            },
          ].map((tier) => (
            <div
              key={tier.label}
              className="flex items-start gap-3 bg-card border border-border rounded-card p-3"
            >
              <span
                className={`${tier.cls} rounded-pill px-2 py-0.5 text-xs font-mono font-bold shrink-0 mt-px`}
              >
                {tier.label}
              </span>
              <div>
                <span className="tabular text-xs text-subtle font-mono mr-2">
                  {tier.range}
                </span>
                <span className="text-sm text-muted">{tier.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Source tiers */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-fore">Source tiers</h2>
        <p className="text-muted text-sm leading-relaxed">
          Every article shows a source tier so you know where the information
          comes from at a glance.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { tier: "Official", desc: "Rockstar Games, Take-Two Interactive" },
            { tier: "Press", desc: "IGN, Eurogamer, Kotaku, Bloomberg" },
            {
              tier: "Insider",
              desc: "Known industry insiders with track record",
            },
            { tier: "Community", desc: "Reddit, forums, fan sites" },
          ].map((s) => (
            <div
              key={s.tier}
              className="bg-card border border-border rounded-card p-3"
            >
              <p className="text-xs font-mono font-bold text-fore mb-1">
                {s.tier}
              </p>
              <p className="text-xs text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border border-rumour/40 rounded-card p-5 space-y-2">
        <p className="text-rumour text-xs font-mono font-bold uppercase tracking-wide">
          ⚠ Unofficial Site
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Leakwire is an independent fan project. We are not affiliated with,
          endorsed by, or connected to Rockstar Games or Take-Two Interactive in
          any way. All game names, characters, and trademarks are the property
          of their respective owners.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Article summaries are AI-generated. We link to original sources —
          always click through to read the full story. We do not publish
          original reporting.
        </p>
      </section>
    </div>
  );
}
