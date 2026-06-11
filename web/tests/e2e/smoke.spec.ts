import { test, expect } from "@playwright/test";

// These are smoke tests — they verify the app basically works end to end.
// They don't test every detail (that's what Vitest does), just that
// the critical paths work in a real browser against a real server.

test.describe("Homepage", () => {
  test("loads and shows the hero section", async ({ page }) => {
    await page.goto("/gta6");

    // H1 should contain the tagline
    const h1 = page.locator("h1");
    await expect(h1).toContainText("GTA VI");
  });

  test("shows the feed with articles", async ({ page }) => {
    await page.goto("/gta6");

    // Feed should render at least one article card
    // Article cards are <a> tags with card-edge-* class
    const cards = page.locator('a[class*="card-edge"]');
    await expect(cards.first()).toBeVisible();
  });

  test("countdown timer ticks", async ({ page }) => {
    await page.goto("/gta6");

    // Target the compact countdown in the right rail specifically
    // It contains the pattern "160d 12h 41m 19s"
    const countdown = page.locator("aside .tabular").first();
    await expect(countdown).toBeVisible();

    const before = await countdown.textContent();
    await page.waitForTimeout(2000);
    const after = await countdown.textContent();

    expect(before).not.toBe(after);
  });
});

test.describe("Filter bar", () => {
  test("category filter updates the article count", async ({ page }) => {
    await page.goto("/gta6");

    // Target specifically the feed count paragraph — not the rail widget
    const countText = page
      .locator("main p")
      .filter({ hasText: /\d+ articles/ });
    await expect(countText).toBeVisible();
    const initial = await countText.textContent();

    const rumourPill = page.locator("button", { hasText: "Rumours" });

    if (await rumourPill.isVisible()) {
      await rumourPill.click();
      const updated = await countText.textContent();
      expect(updated).not.toBe(initial);
    }
  });

  test("search filters articles instantly", async ({ page }) => {
    await page.goto("/gta6");

    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();

    // Type a search term that won't match anything
    await searchInput.fill("zzzzzzzzzzzzzzz");

    // Should show 0 results or the empty state
    const countText = page.locator("text=/0 of \\d+ articles/");
    await expect(countText).toBeVisible();
  });
});

test.describe("Category pages", () => {
  test("gameplay category page loads", async ({ page }) => {
    await page.goto("/gta6/gameplay");

    // Should have an H1 with Gameplay in it
    await expect(page.locator("h1")).toContainText("Gameplay");
  });

  test("unknown category shows 404", async ({ page }) => {
    const response = await page.goto("/gta6/notacategory");
    expect(response?.status()).toBe(404);
  });
});
