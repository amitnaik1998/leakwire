import type { MetadataRoute } from "next";
import { getAllGameSlugs, getGame } from "@/lib/games";
import { getArticles } from "@/lib/articles";

// Sitemap is rebuilt whenever the page revalidates (every 5 mins)
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://leakwire.vercel.app";
  const slugs = getAllGameSlugs();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Game homepages + category pages
  const gameRoutes: MetadataRoute.Sitemap = slugs.flatMap((slug) => {
    const game = getGame(slug)!;
    const categories = game.categories.filter((c) => c !== "unrelated");

    return [
      // Game homepage e.g. /gta6
      {
        url: `${baseUrl}/${slug}`,
        changeFrequency: "hourly" as const,
        priority: 0.9,
      },
      // Category pages e.g. /gta6/gameplay
      ...categories.map((cat) => ({
        url: `${baseUrl}/${slug}/${cat}`,
        changeFrequency: "hourly" as const,
        priority: 0.7,
      })),
    ];
  });

  // Article URLs — use published_at as lastmod so Google knows when each was indexed
  // We fetch all articles and use their URLs + dates
  const articleRoutes: MetadataRoute.Sitemap = [];
  for (const slug of slugs) {
    const articles = await getArticles({ game: slug, limit: 200 });
    for (const article of articles) {
      articleRoutes.push({
        url: article.url,
        lastModified: new Date(article.published_at),
        changeFrequency: "never", // articles don't change after publish
        priority: 0.5,
      });
    }
  }

  return [...staticRoutes, ...gameRoutes, ...articleRoutes];
}
