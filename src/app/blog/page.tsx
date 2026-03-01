/*
  Dispatches — editorial listing for long-form articles.
  Static: server component. Wide editorial grid (1100px), no local particle field.
*/
import Link from "next/link";
import { allPosts } from "contentlayer/generated";
import { genPageMetadata } from '../seo';

export const metadata = genPageMetadata({
  title: 'Dispatches',
  description: 'Field reports from the intersection of AI systems, cognitive science, and applied methodology.',
});

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = allPosts
    .filter((p) => p.access === "public")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="ri-grid-editorial py-8">

      {/* Hero — typographic header, global particle field shows through */}
      <div className="py-12">
        <span className="ri-category-label mb-2 block">{'// Dispatches'}</span>
        <h1 className="text-4xl font-extrabold font-space-grotesk tracking-tight leading-[1.05]">
          Field Reports
        </h1>
        <p className="text-[color:var(--ri-muted)] text-sm mt-2 max-w-md">
          Applied cognitive science, industrial AI, and systems methodology — from practice, not theory.
        </p>
      </div>

      {/* Bold stripe divider */}
      <div className="ri-stripe-bold" aria-hidden="true" />

      {/* Article list — editorial rows */}
      <div className="mt-2">
        {posts.length === 0 ? (
          <p className="py-12 text-[color:var(--ri-muted)]">No dispatches yet. Check back soon.</p>
        ) : (
          <ol className="list-none p-0 m-0">
            {posts.map((post, i) => (
              <li key={post.slug}>
                {/* Thin orange glow rule between entries */}
                {i > 0 && (
                  <div className="ri-stripe-bold" aria-hidden="true" />
                )}

                <article className="py-8 group">
                  {/* Cover image strip when present */}
                  {post.coverImage && (
                    <div className="mb-5 overflow-hidden rounded-sm" style={{ maxHeight: "220px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImage}
                        alt=""
                        className="w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Meta row: tags + reading time */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {post.featured && (
                      <span
                        className="font-mono text-[0.62rem] uppercase tracking-widest text-black bg-[color:var(--ri-accent)] px-2 py-0.5 rounded-full"
                        aria-label="Featured article"
                      >
                        Featured
                      </span>
                    )}
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[0.62rem] uppercase tracking-widest text-[color:var(--ri-muted)] border border-[color:var(--ri-border)] px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="font-mono text-[0.62rem] text-[color:var(--ri-muted)] ml-auto">
                      {post.readingTime} min read
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold font-space-grotesk leading-snug mb-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[color:var(--ri-fg)] hover:text-[color:var(--ri-accent)] transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {/* Description */}
                  <p className="text-[color:var(--ri-muted)] leading-relaxed mb-5 max-w-2xl text-sm">
                    {post.description}
                  </p>

                  {/* Footer row: date + read link */}
                  <div className="flex items-center justify-between">
                    <time
                      dateTime={post.date}
                      className="font-mono text-xs text-[color:var(--ri-muted)] tracking-wide"
                    >
                      {formatDate(post.date)}
                    </time>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-mono text-xs text-[color:var(--ri-accent)] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      Read dispatch →
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>

    </div>
  );
}
