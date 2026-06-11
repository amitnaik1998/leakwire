"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
