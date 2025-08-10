import { notFound } from "next/navigation";
import { getBaseUrl } from "../../lib/baseUrl";
import { getBlocks, renderBlocks } from "../../lib/notion";

type NotionComponent = {
  id: string;
  properties: {
    ["Component Name"]?: { title?: { plain_text: string }[] };
    Type?: { select?: { name?: string } };
    Status?: { status?: { name?: string } };
    Content?: { rich_text?: { plain_text?: string }[] };
    Slug?: { rich_text?: { plain_text?: string }[] };
    ["Key Messages"]?: { multi_select?: { name: string }[] };
  };
};

type ParamArg = { slug: string } | Promise<{ slug: string }>;

async function getComponentBySlug(slug: string): Promise<NotionComponent | null> {
  const base = getBaseUrl();
  try {
    const res = await fetch(`${base}/api/notion-components?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const rows: NotionComponent[] = data?.results ?? [];
    const exact = rows.find(
      (c) => c?.properties?.Slug?.rich_text?.[0]?.plain_text?.trim()?.toLowerCase() === slug.trim().toLowerCase()
    );
    return exact ?? rows[0] ?? null;
  } catch (e) {
    console.error("slug page fetch error", e);
    return null;
  }
}

export default async function Page({ params }: { params: ParamArg }) {
  // Support Next 14 and 15 param shapes
  let slug: string;
  if ("then" in params && typeof params.then === "function") {
    const p = await (params as Promise<{ slug: string }>);
    slug = p.slug;
  } else {
    slug = (params as { slug: string }).slug;
  }
  if (!slug) return notFound();
  if (slug.toLowerCase() === "footer") return notFound();

  const component = await getComponentBySlug(slug);
  if (!component) return notFound();

  let blocks: unknown[] | null = null;
  try {
    blocks = await getBlocks(component.id);
  } catch (e) {
    console.error("block fetch failed", e);
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <section className="glass">
        <h1 className="text-3xl font-bold mb-4">
          {component.properties["Component Name"]?.title?.[0]?.plain_text ?? "Untitled"}
        </h1>
        {blocks && blocks.length > 0 ? (
          <div>{renderBlocks(blocks)}</div>
        ) : (
          <div className="mb-4">
            {component.properties.Content?.rich_text?.map((r) => r.plain_text).join("")}
          </div>
        )}
      </section>
    </main>
  );
}
