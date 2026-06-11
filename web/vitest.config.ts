import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vitest is essentially Jest but built on Vite's fast bundler.
// Why Vitest over Jest?
//   - Native ESM support (no transform hacks)
//   - Same config as Vite (which Turbopack supersedes for dev, but Vite
//     still handles test bundling fine)
//   - Vitest 4 + React Testing Library 16 are the current standard pair

export default defineConfig({
  plugins: [
    // @vitejs/plugin-react handles JSX transform and React Fast Refresh
    // in test mode. Without this, TSX files would fail to parse.
    react(),
  ],

  test: {
    // jsdom simulates a browser DOM inside Node.js.
    // Alternative: 'happy-dom' (faster but less spec-compliant).
    // We pick jsdom because Testing Library is tested against it.
    environment: 'jsdom',

    // globals: true means no need to import describe/it/expect in each file.
    // TypeScript sees these via the types in vitest.setup.ts.
    globals: true,

    // This file runs before each test file — we use it to import
    // @testing-library/jest-dom which adds .toBeInTheDocument(), etc.
    setupFiles: ['./vitest.setup.ts'],

    // Where our unit and component tests live
    include: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],

    // Don't accidentally run Playwright E2E tests via Vitest
    exclude: ['node_modules', 'tests/e2e/**'],
  },

  resolve: {
    alias: {
      // Mirror the @ alias from tsconfig so imports work identically
      // in app code and test files
      '@': path.resolve(__dirname, '.'),
    },
  },
})
