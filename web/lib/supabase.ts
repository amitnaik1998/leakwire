import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

// ─── WHY TWO CLIENTS? ─────────────────────────────────────────────────────────
//
// SERVER (Next.js Server Components, Route Handlers, generateStaticParams)
// ─────────────────────────────────────────────────────────────────────────
// Next.js 16 App Router runs Server Components in a Node.js process.
// That process is shared across many requests. If you create a module-level
// Supabase singleton (const db = createClient(...) at top level), all
// concurrent requests share that same client instance — including any
// in-flight requests or cached auth state.
//
// We avoid this by exporting a function (db()) that creates a fresh client
// on every call. In our case we don't use auth, so the risk is low, but
// it's the correct pattern and costs almost nothing (createClient is cheap).
//
// BROWSER (Client Components — anything with 'use client')
// ─────────────────────────────────────────────────────────
// In the browser, each user gets their own page context, so a singleton is
// safe and desirable: Supabase maintains a WebSocket for realtime, and you
// don't want to open multiple connections to the same project.
//
// We expose browserDb() which creates once and returns the cached instance.

// ─── SHARED OPTIONS ───────────────────────────────────────────────────────────
const clientOptions = {
  auth: {
    // We use the anon key + RLS for access control, not user sessions.
    // Disabling session persistence saves a localStorage read/write per call.
    persistSession: false,
    autoRefreshToken: false,
  },
  // Supabase JS v2: default fetch timeout is 10s — reasonable for our ISR pages
}

// ─── SERVER CLIENT ────────────────────────────────────────────────────────────
// Call this inside Server Components, generateStaticParams, and Route Handlers.
// Do NOT call at module level — call inside the function body.
//
// Usage:
//   const { data } = await db().from('articles').select('*')

export function db(): SupabaseClient {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    clientOptions
  )
}

// ─── BROWSER CLIENT ───────────────────────────────────────────────────────────
// Use in Client Components ('use client') for interactive features:
//  - Email subscribe form (INSERT into subscribers)
//  - Future: bookmarks (if we add user accounts)
//
// The singleton lives in module scope — fine for browser, not for server.
// This file can be imported in Client Components because all env vars here
// are NEXT_PUBLIC_* (bundled into the browser by Next.js).

let _browserClient: SupabaseClient | null = null

export function browserDb(): SupabaseClient {
  if (_browserClient) return _browserClient

  _browserClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    clientOptions
  )

  return _browserClient
}
