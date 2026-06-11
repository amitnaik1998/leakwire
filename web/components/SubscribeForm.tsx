'use client'

// WHY 'use client'?
// The form has loading/success/error state that changes as the user interacts.
// Forms with live feedback must be client components.
//
// WHY a Server Action for the submit?
// We could POST to a Route Handler, but Server Actions are cleaner:
//   - No API endpoint to define or secure
//   - Automatically handles CSRF protection
//   - Works even if JS fails (progressive enhancement for plain <form>)
//   - TypeScript end-to-end: the action signature IS the API contract

import { useState } from 'react'
import { subscribeAction } from '@/app/actions'

interface SubscribeFormProps {
  game: string    // game slug, e.g. 'gta6'
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function SubscribeForm({ game }: SubscribeFormProps) {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<FormState>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return

    setStatus('loading')
    setMessage('')

    const result = await subscribeAction(email.trim(), game)

    if (result.success) {
      setStatus('success')
      setMessage("You're on the list. We'll ping you when something big breaks.")
      setEmail('')
    } else {
      setStatus('error')
      setMessage(result.error ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    // id="subscribe" so the nav "Intel Brief" CTA and rail link can anchor to this
    <section id="subscribe" className="bg-card/50 border-y border-border py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl">

          {/* Header */}
          <p className="tabular text-xs text-accent uppercase tracking-[0.2em] mb-2 font-mono">
            Intel Brief
          </p>
          <h2 className="text-2xl font-bold text-fore tracking-tight mb-2">
            Signal, not noise
          </h2>
          <p className="text-muted text-sm mb-6">
            One email when a high-confidence story breaks. No drip. No roundups. Just signal.
          </p>

          {/* Success state */}
          {status === 'success' ? (
            <div className="flex items-start gap-3 bg-confirmed/10 border border-confirmed/30 rounded-card p-4">
              <span className="text-confirmed text-lg">✓</span>
              <p className="text-sm text-confirmed">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap sm:flex-nowrap">

              {/* Email input */}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
                className="
                  flex-1 min-w-0
                  bg-card border border-border rounded-sm
                  px-4 py-2.5 text-sm text-fore
                  placeholder:text-subtle
                  focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="
                  shrink-0
                  bg-accent hover:bg-accent-dim
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-white text-sm font-medium
                  px-6 py-2.5 rounded-sm
                  transition-colors duration-150
                  whitespace-nowrap
                "
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe free'}
              </button>

            </form>
          )}

          {/* Error message */}
          {status === 'error' && message && (
            <p className="mt-2 text-sm text-rumour">{message}</p>
          )}

          {/* Privacy note */}
          <p className="text-xs text-subtle mt-3">
            No spam. Unsubscribe any time. We don't share your email.
          </p>

        </div>
      </div>
    </section>
  )
}
