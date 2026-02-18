import type { Metadata } from "next";
import Link from "next/link";
import { getBriefs, isTableNotProvisionedError } from "@/lib/briefs";
import type { Brief } from "@/types/brief";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Briefs",
  description: "Curated reading lists and analysis.",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BriefsPage() {
  let briefs: Brief[] = [];

  try {
    briefs = await getBriefs();
  } catch (err) {
    if (isTableNotProvisionedError(err)) {
      // Table not yet provisioned in this environment — render empty state.
      briefs = [];
    } else {
      throw err;
    }
  }

  return (
    <div className="py-12">
      {/* Page header */}
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">
          Briefs
        </h1>
        <p className="text-[color:var(--ri-muted)] text-lg max-w-xl">
          Curated reading lists and analysis.
        </p>
      </div>

      {/* Brief list */}
      {briefs.length === 0 ? (
        <p className="text-[color:var(--ri-muted)]">
          No briefs yet. Check back soon.
        </p>
      ) : (
        <ol className="space-y-6 list-none p-0">
          {briefs.map((brief) => (
            <li key={brief.id}>
              <article className="glass transition-colors border-l-[3px] border-[color:var(--ri-accent)]">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link
                    href={`/briefs/${brief.id}`}
                    className="ri-link text-xl font-bold leading-snug hover:underline ri-accent-ring"
                  >
                    {brief.title}
                  </Link>
                  {brief.category && (
                    <span className="shrink-0 self-start text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)]">
                      {brief.category}
                    </span>
                  )}
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-[color:var(--ri-muted)] mb-3">
                  <time dateTime={brief.date}>{formatDate(brief.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>
                    {brief.items.length}{" "}
                    {brief.items.length === 1 ? "link" : "links"}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-sm text-[color:var(--ri-fg)] leading-relaxed">
                  {brief.summary}
                </p>
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
