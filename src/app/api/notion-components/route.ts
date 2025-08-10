import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    const databaseId = process.env.NOTION_DATABASE_ID!;

    // Always exclude Draft status
    let filter: any = {
      property: "Status",
      status: { does_not_equal: "Draft" }
    };

    // If slug is provided, use rich_text contains for tolerant matching
    if (slug) {
      filter = {
        and: [
          {
            property: "Status",
            status: { does_not_equal: "Draft" }
          },
          {
            property: "Slug",
            rich_text: { contains: slug }
          }
        ]
      };
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      sorts: [
        {
          property: "Priority",
          direction: "ascending"
        }
      ]
    });

    return NextResponse.json(
      { results: response.results },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (error: any) {
    console.error("Notion API error:", error);
    return NextResponse.json(
      { results: [], error: "Server error" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  }
}
