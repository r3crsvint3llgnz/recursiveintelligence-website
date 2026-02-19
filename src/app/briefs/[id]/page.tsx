import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrief } from "@/lib/briefs";
import type { BriefItem } from "@/types/brief";

export const dynamic = "force-dynamic";

function isSafeUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.startsWith("http:") || lower.startsWith("https:");
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const brief = await getBrief(id);
    if (!brief) {
      return { title: "Brief Not Found" };
    }
    return {
      title: brief.title,
      description: brief.summary,
    };
  } catch {
    return { title: "Brief Not Found" };
  }
}

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let brief;
  try {
    brief = await getBrief(id);
  } catch {
    notFound();
  }

  if (!brief) {
    notFound();
  }

  return (
    <div className="py-12">
      {/* Back link */}
      <div className="mb-8">
        <Link href="/briefs" className="ri-link ri-accent-ring text-sm">
          ← Back to Briefs
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-8 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">
          {brief.title}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-6 text-sm text-[color:var(--ri-muted)]">
          <time dateTime={brief.date}>{formatDate(brief.date)}</time>
          {brief.category && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)]">
                {brief.category}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-[color:var(--ri-fg)] text-base leading-relaxed mb-10 max-w-2xl">
        {brief.summary}
      </p>

      <div className="ri-divider mb-10" aria-hidden="true" />

      {/* Links section */}
      <section>
        <h2 className="font-space-grotesk text-2xl font-bold text-[color:var(--ri-fg)] mb-6">
          Links
        </h2>
        <ol className="space-y-3 ri-list pl-6 list-decimal">
          {brief.items.map((item: BriefItem, index: number) => (
            <li key={index} className="text-[color:var(--ri-fg)] leading-relaxed">
              {isSafeUrl(item.url) ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ri-link ri-accent-ring"
                >
                  {item.title}
                </a>
              ) : (
                <span>{item.title}</span>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
