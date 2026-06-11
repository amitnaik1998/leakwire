import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame } from "@/lib/games";
import {
  getArticles,
  getArticleStats,
  getCategoryCounts,
  getBreakingArticles,
} from "@/lib/articles";
import Hero from "@/components/Hero";
import BreakingStrip from "@/components/BreakingStrip";
import Feed from "@/components/Feed";
import FactFile from "@/components/FactFile";
import TrailerSection from "@/components/TrailerSection";
import MilestoneStrip from "@/components/MilestoneStrip";
import FAQ from "@/components/FAQ";
import SubscribeForm from "@/components/SubscribeForm";

// ISR — revalidate this page every 5 minutes.
// Next.js serves the cached HTML instantly, then rebuilds in the background
// when 5 minutes have passed and a new request comes in.
// This means the pipeline can run every 30 mins and the page stays fresh.
export const revalidate = 300;

interface PageProps {
  params: Promise<{ game: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) return {};

  return {
    title: `${game.name} Intel Tracker`,
    description: game.seoDescription,
    openGraph: {
      title: `${game.name} Intel Tracker | Leakwire`,
      description: game.seoDescription,
      type: "website",
    },
  };
}

// generateStaticParams tells Next.js which [game] values to pre-build
// at deploy time. So /gta6 is built as static HTML on deploy, not on first visit.
export async function generateStaticParams() {
  const { getAllGameSlugs } = await import("@/lib/games");
  return getAllGameSlugs().map((slug) => ({ game: slug }));
}

export default async function GamePage({ params }: PageProps) {
  const { game: slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  // Fetch all data in parallel — Promise.all means these four queries
  // run simultaneously, not one after another. Much faster.
  const [articles, stats, categoryCounts, breaking] = await Promise.all([
    getArticles({ game: slug }),
    getArticleStats(slug),
    getCategoryCounts(slug),
    getBreakingArticles(slug),
  ]);

  return (
    <>
      <Hero game={game} stats={stats} />

      {/* Breaking strip only renders if there's actually a fresh article */}
      {breaking.length > 0 && <BreakingStrip articles={breaking} />}

      <Feed articles={articles} categoryCounts={categoryCounts} game={game} />

      <FactFile facts={game.facts} />
      <TrailerSection trailers={game.trailers} />
      <MilestoneStrip milestones={game.milestones} />
      <FAQ faqs={game.faqs} />
      <SubscribeForm game={game.slug} />
    </>
  );
}
