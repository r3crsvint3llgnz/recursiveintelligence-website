import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export async function getPageBySlug(slug: string) {
  const res = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      and: [
        { property: "Status", status: { does_not_equal: "Draft" } },
        { property: "Slug", rich_text: { equals: slug.toLowerCase() } },
      ],
    },
    page_size: 1,
  });
  return res.results[0] ?? null;
}

export async function getBlocks(blockId: string) {
  const blocks: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 50,
      start_cursor: cursor,
    });
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
  return blocks;
}

export function rtToText(rt: any[] = []) {
  return rt.map((r) => r.plain_text ?? "").join("");
}

export function groupLists(blocks: any[]) {
  // Collapse consecutive bullets / numbers into <ul>/<ol> groups
  const out: any[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "bulleted_list_item") {
      const items: any[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        items.push(blocks[i]);
        i++;
      }
      out.push({ type: "ul", items });
      continue;
    }
    if (b.type === "numbered_list_item") {
      const items: any[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        items.push(blocks[i]);
        i++;
      }
      out.push({ type: "ol", items });
      continue;
    }
    out.push(b);
    i++;
  }
  return out;
}
