import type { Metadata } from "next";
import Link from "next/link";
import { allPosts } from "contentlayer/generated";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Long-form writing on AI systems, systems thinking, and philosophy of mind.",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = allPosts
    .filter((p) => p.access === "public")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="py-12">
      {/* Page header */}
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">
          Blog
        </h1>
        <p className="text-[color:var(--ri-muted)] text-lg max-w-xl">
          Long-form writing on AI systems, systems thinking, and philosophy of
          mind.
        </p>
      </div>

      {/* Post list */}
      {posts.length === 0 ? (
        <p className="text-[color:var(--ri-muted)]">No posts yet. Check back soon.</p>
      ) : (
        <ol className="space-y-6 list-none p-0">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="glass hover:bg-white/[0.06] transition-colors border-l-[3px] border-[color:var(--ri-accent)]">
                {/* Title row */}
                <div className="mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="ri-link text-xl font-bold leading-snug hover:underline ri-accent-ring"
                  >
                    {post.title}
                  </Link>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-[color:var(--ri-muted)] mb-3">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingTime} min read</span>
                </div>

                {/* Description */}
                <p className="text-sm text-[color:var(--ri-fg)] leading-relaxed mb-4">
                  {post.description}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-white/20 text-[color:var(--ri-muted)]">
                          {tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
