import { notFound } from "next/navigation";
import { getPageBySlug, getBlocks, rtToText, groupLists } from "../../lib/notion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug.toLowerCase() === "footer") return notFound();

  const page: any = await getPageBySlug(slug.toLowerCase());
  if (!page) return notFound();

  const title =
    page.properties?.["Component Name"]?.title?.[0]?.plain_text ||
    page.properties?.["Name"]?.title?.[0]?.plain_text ||
    "Untitled";

  // Fetch Notion page BODY (blocks) and render
  const blocks = await getBlocks(page.id);
  const grouped = groupLists(blocks);

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
        {title}
      </h1>

      <article className="prose prose-invert max-w-none">
        {grouped.map((b: any, idx: number) => {
          switch (b.type) {
            case "heading_1":
              return (
                <h2 key={b.id ?? idx} className="mt-8">
                  {rtToText(b.heading_1?.rich_text)}
                </h2>
              );
            case "heading_2":
              return (
                <h3 key={b.id ?? idx} className="mt-6">
                  {rtToText(b.heading_2?.rich_text)}
                </h3>
              );
            case "heading_3":
              return (
                <h4 key={b.id ?? idx} className="mt-4">
                  {rtToText(b.heading_3?.rich_text)}
                </h4>
              );
            case "paragraph":
              return (
                <p key={b.id ?? idx}>{rtToText(b.paragraph?.rich_text)}</p>
              );
            case "quote":
              return (
                <blockquote key={b.id ?? idx}>
                  {rtToText(b.quote?.rich_text)}
                </blockquote>
              );
            case "callout":
              return (
                <div
                  key={b.id ?? idx}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  {rtToText(b.callout?.rich_text)}
                </div>
              );
            case "divider":
              return <hr key={b.id ?? idx} className="my-8 border-white/10" />;
            case "ul":
              return (
                <ul key={idx} className="list-disc ml-6">
                  {b.items.map((it: any) => (
                    <li key={it.id}>{rtToText(it.bulleted_list_item.rich_text)}</li>
                  ))}
                </ul>
              );
            case "ol":
              return (
                <ol key={idx} className="list-decimal ml-6">
                  {b.items.map((it: any, n: number) => (
                    <li key={it.id}>{rtToText(it.numbered_list_item.rich_text)}</li>
                  ))}
                </ol>
              );
            default:
              return null; // ignore unsupported blocks for MVP
          }
        })}
      </article>
    </main>
  );
}
