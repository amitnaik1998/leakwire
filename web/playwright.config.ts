import { defineConfig, devices } from '@playwright/test'

// Playwright runs real browser automation tests against a running server.
// Why Playwright over Cypress?
//   - Ships with Chromium/Firefox/WebKit — no separate browser install for CI
//   - First-class TypeScript support
//   - Much faster on CI (parallel workers, smart sharding)
//   - Built-in network mocking, trace viewer, and video on failure

export default defineConfig({
  // Our E2E tests live here — separate from unit/component tests
  testDir: './tests/e2e',

  // Run all test files in parallel (each gets its own browser context)
  fullyParallel: true,

  // In CI, a test.only() would hide real failures — fail fast instead
  forbidOnly: !!process.env.CI,

  // Retry flaky tests twice in CI (network latency, SSR timing, etc.)
  // No retries locally — you want to see failures immediately
  retries: process.env.CI ? 2 : 0,

  // CI: single worker to avoid port conflicts on small machines
  // Locally: all CPU cores (default)
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    // All tests default to this base URL — change per environment
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',

    // On first failure, capture a trace (screenshot + DOM snapshot + network)
    // View with: npx playwright show-trace trace.zip
    trace: 'on-first-retry',
  },

  projects: [
    {
      // Smoke tests in Chromium only — covers ~70% of users, fast to run
      // Add Firefox/WebKit in a future pass if cross-browser issues emerge
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Playwright spins up the server if it's not already running.
  // In CI: `npm run build` first, then `npm run start`.
  // Locally: reuse whatever's already running on :3000.
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // 2 min: enough for `next build` on cold CI machines
  },
})
