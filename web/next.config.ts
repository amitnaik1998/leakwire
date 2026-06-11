import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

// NOTE: When we add Sentry (Stage 5), this file gains:
//   import { withSentryConfig } from '@sentry/nextjs'
//   export default withSentryConfig(nextConfig, { ... })
// For now, export directly so the app builds without Sentry credentials.

export default nextConfig;
