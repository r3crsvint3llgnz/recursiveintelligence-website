import { Client } from "@notionhq/client";
import React from "react";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function getBlocks(pageId: string) {
  const blocks: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor });
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
  return blocks;
}

function rtNodes(n: any) {
  return (n?.rich_text ?? []).map((t: any, i: number) => {
    const text = t?.plain_text ?? "";
    const a = t?.annotations ?? {};
    const href = t?.href ?? t?.text?.link?.url ?? null;
    let node: React.ReactNode = text;
    if (a.code) node = <code className="px-1 py-0.5 rounded bg-gray-800">{node}</code>;
    if (a.bold) node = <strong>{node}</strong>;
    if (a.italic) node = <em>{node}</em>;
    if (a.underline) node = <span className="underline">{node}</span>;
    if (a.strikethrough) node = <span className="line-through">{node}</span>;
    if (href) node = <a key={i} href={href} className="text-sky-400 hover:underline">{node}</a>;
    return <React.Fragment key={i}>{node}</React.Fragment>;
  });
}

export function renderBlocks(blocks: any[]) {
  // First pass: map items to React nodes with a simple tag choice
  const nodes = blocks.map((b: any, i: number) => {
    const t = b.type;
    const d = b[t];
    if (!d) return null;

    if (t === "heading_1") return <h2 key={b.id ?? i} className="mt-8 mb-3 text-3xl font-bold text-white">{rtNodes(d)}</h2>;
    if (t === "heading_2") return <h3 key={b.id ?? i} className="mt-6 mb-2 text-2xl font-semibold text-white">{rtNodes(d)}</h3>;
    if (t === "heading_3") return <h4 key={b.id ?? i} className="mt-4 mb-2 text-xl font-semibold text-white">{rtNodes(d)}</h4>;
    if (t === "paragraph") return <p key={b.id ?? i} className="mb-4 text-gray-200">{rtNodes(d)}</p>;
    if (t === "quote") return <blockquote key={b.id ?? i} className="border-l-4 border-gray-700 pl-4 italic text-gray-300 my-4">{rtNodes(d)}</blockquote>;
    if (t === "divider") return <hr key={b.id ?? i} className="my-6 border-gray-800" />;

    if (t === "bulleted_list_item") return <li key={b.id ?? i} className="list-disc ml-6 text-gray-200">{rtNodes(d)}</li>;
    if (t === "numbered_list_item") return <li key={b.id ?? i} className="list-decimal ml-6 text-gray-200">{rtNodes(d)}</li>;

    // Unsupported blocks are ignored for MVP
    return null;
  }).filter(Boolean) as React.ReactElement[];

  // Second pass: merge consecutive <li> into a single list
  const merged: React.ReactElement[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    const cls = el.props?.className ?? "";
    const isUL = cls.includes("list-disc");
    const isOL = cls.includes("list-decimal");
    if (!isUL && !isOL) {
      merged.push(el);
      continue;
    }
    const listType = isUL ? "ul" : "ol";
    const items: React.ReactElement[] = [el];
    while (i + 1 < nodes.length) {
      const next = nodes[i + 1];
      const ncls = next.props?.className ?? "";
      const sameType = isUL ? ncls.includes("list-disc") : ncls.includes("list-decimal");
      if (!sameType) break;
      items.push(next);
      i++;
    }
    merged.push(React.createElement(listType, { key: `${listType}-${i}`, className: "mb-4" }, items));
  }

  return merged;
}

export {};
