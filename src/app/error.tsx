"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 text-center">
      <h1 className="font-space-grotesk text-4xl font-bold tracking-tight mb-4 text-gray-100">
        Something went wrong
      </h1>
      <p className="text-gray-400 mb-8 text-lg">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Try Again
        </button>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 text-sky-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
