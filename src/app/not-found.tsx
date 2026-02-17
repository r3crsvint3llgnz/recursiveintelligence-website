import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto py-24 px-4 text-center">
      <h1 className="ri-heading inline-block text-4xl font-bold mb-6">
        404
      </h1>
      <p className="text-gray-400 mb-8">
        This page doesn&apos;t exist — yet.
      </p>
      <Link
        href="/"
        className="glass inline-block px-6 py-3 ri-link font-semibold hover:bg-white/[0.06] transition-colors"
      >
        ← Return Home
      </Link>
    </main>
  );
}
