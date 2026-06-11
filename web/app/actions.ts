'use server'

// WHY 'use server' at the file level?
// Every export from this file becomes a Server Action — a function that
// runs on the server but can be called from a Client Component as if it
// were a normal async function.
//
// Under the hood Next.js:
//   1. Creates a POST endpoint for each exported function
//   2. Generates a client-side stub that calls it via fetch
//   3. Handles CSRF protection automatically
//
// From the component's perspective, it's just: `await subscribeAction(email, game)`

import { subscribeEmail } from '@/lib/articles'
import { SubscriberInsertSchema } from '@/lib/schemas'
import { ZodError } from 'zod'

// Return type is a plain serialisable object — no class instances, no functions.
// This is required: Server Action return values are serialised to JSON.
type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function subscribeAction(
  email: string,
  game: string
): Promise<ActionResult> {
  // 1. Validate input with Zod before touching the DB
  try {
    SubscriberInsertSchema.parse({ email, game })
  } catch (e) {
    if (e instanceof ZodError) {
      return {
        success: false,
        error: e.errors[0]?.message ?? 'Invalid email address',
      }
    }
    return { success: false, error: 'Validation failed' }
  }

  // 2. Write to Supabase
  const result = await subscribeEmail(email, game)

  if (result.success) return { success: true }

  if (result.error === 'already_subscribed') {
    return { success: false, error: "You're already subscribed — check your inbox!" }
  }

  return {
    success: false,
    error: 'Something went wrong on our end. Please try again.',
  }
}
