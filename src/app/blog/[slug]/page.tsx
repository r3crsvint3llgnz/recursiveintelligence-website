import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import MDXContent from "../../../components/MDXContent";

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const ACCESS_LABELS: Record<string, string> = {
  members: "Members",
  paid: "Paid",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) {
    return notFound();
  }

  const accessLabel =
    post.access !== "public" ? ACCESS_LABELS[post.access] : null;

  return (
    <article className="py-12">
      {/* Back link */}
      <div className="mb-8 ri-fade-up">
        <Link href="/blog" className="ri-link text-sm ri-accent-ring">
          &larr; Back to Blog
        </Link>
      </div>

      {/* Post header */}
      <header className="mb-10 ri-fade-up">
        {/* Title + access badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="ri-heading font-space-grotesk text-4xl font-bold leading-tight">
            {post.title}
          </h1>
          {accessLabel !== null && (
            <span className="shrink-0 self-start text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-accent)] text-black mt-1">
              {accessLabel}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-sm text-[color:var(--ri-muted)] mb-4">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime} min read</span>
        </div>

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
      </header>

      {/* Divider */}
      <div className="ri-divider mb-10" aria-hidden="true" />

      {/* Post body */}
      <div className="prose prose-invert prose-orange max-w-none prose-headings:font-space-grotesk prose-a:text-[color:var(--ri-accent)] prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none">
        <MDXContent code={post.body.code} />
      </div>

      {/* Footer back link */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <Link href="/blog" className="ri-link text-sm ri-accent-ring">
          &larr; Back to Blog
        </Link>
      </div>
    </article>
  );
}
