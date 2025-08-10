export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto py-24 px-4 text-center">
      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="inline-block rounded-lg bg-gray-800 px-4 py-2 text-sky-400 hover:underline">
        Return Home
      </a>
    </main>
  );
}
