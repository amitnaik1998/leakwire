"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(_error);
  }, [_error]);
  return (
    <html>
      <body className="bg-bg text-fore flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <button
            onClick={reset}
            className="bg-accent text-white px-4 py-2 rounded-sm text-sm"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
