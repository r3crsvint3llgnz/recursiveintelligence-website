/*
  Dispatches — editorial listing for long-form articles.
  Static: server component. ParticleField imported as client child.
*/
import Link from "next/link";
import { allPosts } from "contentlayer/generated";
import { genPageMetadata } from '../seo';
import ContentWrapper from "../../components/ContentWrapper";
import ParticleField from "../../components/ParticleField";

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
    <ContentWrapper>

      {/* Hero — particle field behind page title */}
      <div className="relative overflow-hidden" style={{ height: "230px" }}>
        <ParticleField
          count={90}
          className="absolute inset-0"
        />
        {/* Bottom fade to merge particle field with page background */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "60%",
            background: "linear-gradient(to bottom, transparent, var(--ri-bg))",
          }}
          aria-hidden="true"
        />
        {/* Title block sits over the canvas */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-6">
          <span className="ri-category-label mb-2 block">{'// Dispatches'}</span>
          <h1 className="text-4xl font-extrabold font-space-grotesk tracking-tight leading-[1.05]">
            Field Reports
          </h1>
          <p className="text-[color:var(--ri-muted)] text-sm mt-2 max-w-md">
            Applied cognitive science, industrial AI, and systems methodology — from practice, not theory.
          </p>
        </div>
      </div>

      {/* Article list — editorial rows, no glass cards */}
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

    </ContentWrapper>
  );
}
