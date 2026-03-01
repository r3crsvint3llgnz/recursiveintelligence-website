import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import MDXContent from "../../../components/MDXContent";
import { genPageMetadata } from '../../seo'
import ContentWrapper from "../../../components/ContentWrapper"

export function generateStaticParams() {
  return allPosts
    .filter((post) => post.access === "public")
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug)
  if (!post) return { title: 'Not Found' }
  return genPageMetadata({ title: post.title, description: post.description })
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);

  if (!post || post.access !== "public") {
    return notFound();
  }

  return (
    <>
      {/* Full-bleed cover image — spans full content width, outside reading column */}
      {post.coverImage && (
        <div className="w-full overflow-hidden" style={{ maxHeight: "480px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      )}
    <ContentWrapper>
    <article className="py-12">
      {/* Back link */}
      <div className="mb-8 ri-fade-up">
        <Link href="/blog" className="ri-link text-sm ri-accent-ring">
          &larr; Back to Dispatches
        </Link>
      </div>

      {/* Post header */}
      <header className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold leading-tight mb-4">
          {post.title}
        </h1>

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
                <span className="text-xs px-2 py-0.5 rounded-full border border-[color:var(--ri-border)] text-[color:var(--ri-muted)]">
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
      <div className="prose dark:prose-invert prose-orange max-w-none prose-headings:font-space-grotesk prose-a:text-[color:var(--ri-accent)] prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none">
        <MDXContent code={post.body.code} />
      </div>

      {/* Footer back link */}
      <div className="mt-12 pt-8 border-t border-[color:var(--ri-border)]">
        <Link href="/blog" className="ri-link text-sm ri-accent-ring">
          &larr; Back to Dispatches
        </Link>
      </div>

      {/* Article structured data — Safe: JSON.stringify of static MDX frontmatter, not user input */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: {
              "@type": "Person",
              name: "Seth Robins",
              url: "https://recursiveintelligence.io/about",
            },
            publisher: {
              "@type": "Organization",
              name: "Recursive Intelligence",
              url: "https://recursiveintelligence.io",
            },
          }),
        }}
      />
    </article>
    </ContentWrapper>
    </>
  );
}
