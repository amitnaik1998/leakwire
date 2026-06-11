import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArticleCard from "../ArticleCard";
import type { Article } from "@/lib/schemas";
import { requireGame } from "@/lib/games";

// A factory function that creates a valid Article object.
// We define sensible defaults and let each test override only what it cares about.
// This is cleaner than repeating the full object in every test.
function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    url: "https://ign.com/articles/gta6-test",
    title: "GTA 6 release date confirmed",
    source: "IGN",
    published_at: "2026-06-11T10:00:00Z",
    summary: "Rockstar confirmed the release date.",
    category: "release_date",
    is_relevant: true,
    confidence: 0.95,
    created_at: "2026-06-11T10:00:00Z",
    game: "gta6",
    og_image_url: null,
    ...overrides,
  };
}

const game = requireGame("gta6");

// ─── Confidence badge rendering ────────────────────────────────────────────────

describe("ArticleCard confidence badges", () => {
  it("shows CONFIRMED badge for high confidence", () => {
    render(
      <ArticleCard article={makeArticle({ confidence: 0.95 })} game={game} />,
    );
    expect(screen.getByText(/CONFIRMED/)).toBeInTheDocument();
  });

  it("shows LIKELY badge for medium confidence", () => {
    render(
      <ArticleCard article={makeArticle({ confidence: 0.75 })} game={game} />,
    );
    expect(screen.getByText(/LIKELY/)).toBeInTheDocument();
  });

  it("shows RUMOUR badge for low confidence", () => {
    render(
      <ArticleCard article={makeArticle({ confidence: 0.4 })} game={game} />,
    );
    expect(screen.getByText(/RUMOUR/)).toBeInTheDocument();
  });

  it("shows the confidence percentage", () => {
    render(
      <ArticleCard article={makeArticle({ confidence: 0.85 })} game={game} />,
    );
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });
});

// ─── Left edge class ───────────────────────────────────────────────────────────

describe("ArticleCard left edge", () => {
  it("applies confirmed edge class for high confidence", () => {
    const { container } = render(
      <ArticleCard article={makeArticle({ confidence: 0.95 })} game={game} />,
    );
    // The outer <a> tag should have the card-edge-confirmed class
    const link = container.querySelector("a");
    expect(link?.className).toContain("card-edge-confirmed");
  });

  it("applies likely edge class for medium confidence", () => {
    const { container } = render(
      <ArticleCard article={makeArticle({ confidence: 0.75 })} game={game} />,
    );
    const link = container.querySelector("a");
    expect(link?.className).toContain("card-edge-likely");
  });

  it("applies rumour edge class for low confidence", () => {
    const { container } = render(
      <ArticleCard article={makeArticle({ confidence: 0.4 })} game={game} />,
    );
    const link = container.querySelector("a");
    expect(link?.className).toContain("card-edge-rumour");
  });
});

// ─── Content rendering ─────────────────────────────────────────────────────────

describe("ArticleCard content", () => {
  it("renders the article title", () => {
    render(<ArticleCard article={makeArticle()} game={game} />);
    expect(
      screen.getByText("GTA 6 release date confirmed"),
    ).toBeInTheDocument();
  });

  it("renders the source name", () => {
    render(<ArticleCard article={makeArticle()} game={game} />);
    expect(screen.getByText("IGN")).toBeInTheDocument();
  });

  it("renders the summary when present", () => {
    render(<ArticleCard article={makeArticle()} game={game} />);
    expect(
      screen.getByText("Rockstar confirmed the release date."),
    ).toBeInTheDocument();
  });

  it("links to the article URL", () => {
    const { container } = render(
      <ArticleCard article={makeArticle()} game={game} />,
    );
    const link = container.querySelector("a");
    expect(link?.href).toBe("https://ign.com/articles/gta6-test");
  });

  it("opens in a new tab", () => {
    const { container } = render(
      <ArticleCard article={makeArticle()} game={game} />,
    );
    const link = container.querySelector("a");
    expect(link?.target).toBe("_blank");
  });
});
