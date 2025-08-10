import { notFound } from "next/navigation";
export default function PlaceholderPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
        Coming Soon
      </h1>
      <p className="text-lg text-gray-200">
        This page will be available soon.
      </p>
    </main>
  );
}
