import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'

// ─── FONT LOADING ──────────────────────────────────────────────────────────────
// next/font does three things:
//  1. Self-hosts the font (no request to fonts.google.com at runtime → GDPR friendly)
//  2. Injects @font-face rules so the browser knows where to find the files
//  3. When you use the `variable` option, it creates a CSS custom property
//     (e.g. --nf-display) on any element that gets the returned className
//
// We use `variable` so globals.css can reference these via @theme inline.
// The --nf-* names avoid a naming conflict with Tailwind's --font-* vars.

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  // variable font: one file covers weights 300–700 — smaller network payload
  // than loading separate 400.woff2, 700.woff2, etc.
  variable: '--nf-display',
  display: 'swap', // show fallback font immediately; swap to Space Grotesk once loaded
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  // Space Mono is NOT a variable font — must request specific weights
  weight: ['400', '700'],
  variable: '--nf-mono',
  display: 'swap',
})

// ─── SITE-WIDE METADATA ────────────────────────────────────────────────────────
// These values are the defaults. Each page/layout can override them.
// The `template` in `title` means a page titled "Gameplay" renders as
// "Gameplay | Leakwire" — consistent branding without repetition.

export const metadata: Metadata = {
  title: {
    template: '%s | Leakwire',
    default: 'Leakwire — GTA VI Intel Tracker',
  },
  description:
    'Every GTA VI signal. One feed. Zero noise. ' +
    'Track confirmed news, credible leaks, and community rumours in real time.',
  keywords: ['GTA 6', 'GTA VI', 'Grand Theft Auto 6', 'leaks', 'news', 'release date'],
  authors: [{ name: 'Leakwire' }],

  // Tells crawlers this is the canonical domain once we buy one.
  // Update metadataBase when moving from *.vercel.app to leakwire.gg (or similar).
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leakwire.vercel.app'
  ),

  openGraph: {
    siteName: 'Leakwire',
    type: 'website',
    locale: 'en_US',
  },

  // Tells Search Console this is our verified site — set the env var in Vercel
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },

  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  // Prevents iOS from zooming on input focus — critical for the search bar UX
  width: 'device-width',
  initialScale: 1,
  // Accent color for browser chrome (tab bar on Android, address bar)
  themeColor: '#0B0D12',
}

// ─── ROOT LAYOUT ──────────────────────────────────────────────────────────────
// This layout wraps EVERY page in the app.
// It applies the font CSS variables and the base background/text.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Applying both font variable classes to <html> means:
    //  - --nf-display CSS var is available throughout the entire document
    //  - --nf-mono CSS var is available throughout the entire document
    // Tailwind's font-display and font-mono utilities reference these via @theme inline
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body>
        {/*
          No analytics providers here yet — Vercel Analytics and Speed Insights
          will be added in Stage 4 (pages) as part of the full page build.
          Sentry will wrap the app in Stage 5 (observability).
        */}
        {children}
      </body>
    </html>
  )
}
