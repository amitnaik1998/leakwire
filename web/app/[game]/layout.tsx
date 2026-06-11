import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getGame } from "@/lib/games";

interface GameLayoutProps {
  children: React.ReactNode;
  params: Promise<{ game: string }>;
}

export async function generateMetadata({
  params,
}: GameLayoutProps): Promise<Metadata> {
  const { game: slug } = await params;
  const game = getGame(slug);

  if (!game) return {};

  return {
    title: {
      template: `%s | Leakwire — ${game.name} Tracker`,
      default: `${game.name} Intel Tracker | Leakwire`,
    },
    description: game.seoDescription,
    keywords: game.seoKeywords,
  };
}

export default async function GameLayout({
  children,
  params,
}: GameLayoutProps) {
  const { game: slug } = await params;
  const game = getGame(slug);

  // If someone visits /unknowngame, show a 404 instead of crashing
  if (!game) notFound();

  return (
    // This single style prop is the entire multi-game theming system.
    // --color-accent flows down to every component inside via CSS inheritance.
    // bg-accent, text-accent, border-accent all read this variable.
    <div style={{ "--color-accent": game.accentHex } as React.CSSProperties}>
      <Nav game={game} />
      <main>{children}</main>
      <Footer game={game} />
    </div>
  );
}
