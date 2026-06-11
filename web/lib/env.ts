import { z } from 'zod'

// ─── WHY ENV VALIDATION? ───────────────────────────────────────────────────────
// Without this, a missing NEXT_PUBLIC_SUPABASE_URL would cause a cryptic
// "Cannot read properties of undefined" error somewhere inside a page component
// at request time — hard to diagnose, potentially in production.
//
// With this: the app crashes immediately at startup with a message like:
//   "NEXT_PUBLIC_SUPABASE_URL: Invalid url"
// So you know exactly what's wrong before any user sees the site.
//
// The alternative pattern is runtime checks in each file that uses env vars,
// but that's repetitive and still doesn't surface problems at boot.

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ required_error: 'NEXT_PUBLIC_SUPABASE_URL is required — copy web/.env.local.example to web/.env.local' })
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL (https://xxxxx.supabase.co)'),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ required_error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required' })
    .min(30, 'NEXT_PUBLIC_SUPABASE_ANON_KEY looks too short — check your Supabase dashboard'),

  // Optional — only needed once Search Console is set up
  NEXT_PUBLIC_GSC_VERIFICATION: z.string().optional(),

  // Optional — filled in by Sentry wizard in Stage 5
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
})

// z.parse() throws a ZodError with field-level messages if anything is invalid.
// This runs when the module is first imported (i.e. at boot time on the server,
// and at page hydration time on the client — both are fail-fast moments).
export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_GSC_VERIFICATION: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
})

// TypeScript type inferred from the schema — use this anywhere you need the
// validated env object's type, e.g. in tests
export type Env = z.infer<typeof envSchema>
