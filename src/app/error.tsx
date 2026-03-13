"use client";

import Link from "next/link";
import ContentWrapper from "../components/ContentWrapper";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <ContentWrapper>
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
          className="px-6 py-3 bg-[color:var(--ri-accent)] hover:bg-[color:var(--ri-accent-700)] text-white rounded-lg transition-colors ri-accent-ring"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 ri-link hover:underline rounded-lg transition-colors ri-accent-ring"
        >
          Go Home
        </Link>
      </div>
    </div>
    </ContentWrapper>
  );
}
