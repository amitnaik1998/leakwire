import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame, getAllGameSlugs } from "@/lib/games";
import { getArticles, getCategoryCounts } from "@/lib/articles";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/schemas";
import type { Category } from "@/lib/schemas";
import Feed from "@/components/Feed";
import FAQ from "@/components/FAQ";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ game: string; category: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { game: slug, category } = await params;
  const game = getGame(slug);
  if (!game) return {};

  const label = CATEGORY_LABELS[category as Category] ?? category;

  return {
    title: `${game.name} ${label} News`,
    description:
      `Track every ${game.name} ${label.toLowerCase()} update — ` +
      `confirmed announcements, leaks, and rumours, classified by reliability.`,
  };
}

// Pre-build every game × category combination at deploy time.
// e.g. /gta6/gameplay, /gta6/story, /gta6/trailer etc.
export async function generateStaticParams() {
  const slugs = getAllGameSlugs();
  return slugs.flatMap((game) =>
    CATEGORIES.filter((c) => c !== "unrelated").map((category) => ({
      game,
      category,
    })),
  );
}

export default async function CategoryPage({ params }: PageProps) {
  const { game: slug, category } = await params;
  const game = getGame(slug);

  // Validate both segments
  if (!game) notFound();
  if (!CATEGORIES.includes(category as Category)) notFound();

  const cat = category as Category;

  const [articles, categoryCounts] = await Promise.all([
    getArticles({ game: slug, category: cat }),
    getCategoryCounts(slug),
  ]);

  const label = CATEGORY_LABELS[cat];

  // Filter FAQs relevant to this category — release_date page gets
  // the release date FAQ, etc. Falls back to all FAQs if no match.
  const relevantFaqs = game.faqs.filter((f) =>
    f.id.includes(cat.replace("_", "-")),
  );
  const faqs = relevantFaqs.length > 0 ? relevantFaqs : game.faqs;

  return (
    <>
      {/* Category header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-2">
        <p className="tabular text-xs text-accent uppercase tracking-[0.2em] mb-2 font-mono">
          {game.name} · {label}
        </p>
        {/* H1 — one per page, important for SEO on category pages */}
        <h1 className="text-3xl font-bold text-fore tracking-tight">
          {game.name} {label} News
        </h1>
        <p className="text-muted text-sm mt-2">
          {articles.length} articles tracked · updated every 30 minutes
        </p>
      </div>

      <Feed articles={articles} categoryCounts={categoryCounts} game={game} />

      <FAQ faqs={faqs} />
    </>
  );
}
