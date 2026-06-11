import { redirect } from 'next/navigation'

// Root route (/): redirect to the GTA 6 hub.
//
// WHY redirect() instead of a rewrite in next.config.ts?
//   - redirect() is a server-side 307 (temporary) redirect at runtime
//   - We use 307 (not 308 permanent) so if we add a second game and turn
//     this into a game-picker page, browsers haven't cached the redirect
//
// V2 path: when games registry has 2+ entries, this page renders a
// game-picker UI (import games from '@/lib/games') instead of redirecting.
// For V1 (GTA 6 only), the redirect is always correct.

export default function RootPage() {
  redirect('/gta6')
}
