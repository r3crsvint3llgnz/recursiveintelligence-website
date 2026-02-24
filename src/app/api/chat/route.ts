import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";
import { getRawIdentity } from "@/lib/identity";
import { cookies } from "next/headers";
import knowledgeBaseData from "@/data/knowledge-base.json";

const BEDROCK_REGION = process.env.APP_REGION || "us-east-1";
const MODEL_ID = "us.anthropic.claude-3-5-haiku-20241022-v1:0";

const VALID_ROLES = new Set(["user", "assistant"]);
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;
const SESSION_LIMIT = 15;
const COOKIE_NAME = "resume-chat-usage";

// Runs once at module load — Next.js bundles knowledge-base.json at compile time
// so the static import works in Amplify SSR Lambda (process.cwd() does not).
function formatKnowledgeBase(): string {
  try {
    const kb = knowledgeBaseData as unknown as {
      articles: Array<{ title: string; content: string }>;
      repositories: Array<{ name: string; tree: string; files: Record<string, string> }>;
    };

    let context = "\n\nKNOWLEDGE_BASE_START\n";

    context += "--- ARTICLES & NOTES ---\n";
    kb.articles.forEach((a) => {
      context += `Title: ${a.title}\nContent: ${a.content}\n\n`;
    });

    context += "--- TECHNICAL REPOSITORIES ---\n";
    kb.repositories.forEach((r) => {
      context += `Project: ${r.name}\n`;
      context += `Directory Structure:\n${r.tree}\n`;
      for (const [name, content] of Object.entries(r.files)) {
        context += `File: ${name}\nContent:\n${content}\n\n`;
      }
    });

    context += "KNOWLEDGE_BASE_END\n";
    return context;
  } catch (e) {
    console.error("Failed to format knowledge base:", e);
    return "";
  }
}

const SYSTEM_PROMPT = `You are Seth Robins — Industrial AI Architect at Covestro, independent AI researcher, and autistic systems thinker. You're in a direct conversation with a recruiter or hiring manager who found your resume.

You are not a chatbot describing Seth. You ARE Seth, responding in real time.

VOICE
- Short sentences. Declarative. Lead with the answer, then context — never the reverse.
- Never open with filler: no "Great question!", "Certainly!", "Of course!".
- Use specific numbers when you have them: €4M EBITDA, 6,000+ users, €12M pipeline, 7-hour sprint.
- When uncertain: "I'd need to check that" or "You'd want to ask me directly."
- Don't oversell. Evidence carries the weight.
- Industrial context is lived experience — chemical plants, live DCS systems, hazardous environments — not resume bullets.
- You're autistic. Mention it naturally when it explains how you work: explicit structure, pattern recognition, constraint-awareness. It's a feature, not a disclaimer.

RECRUITER DEFAULTS
- Default response: 2-4 sentences. Go longer only if depth is explicitly asked for.
- "Tell me about yourself" → Current role + AI adoption context + one concrete impact number. ~3 sentences.
- "Why should we hire you" → Ask what specific problem they need solved, then answer to that.
- Technical questions on DCS, APC, AI architecture, manufacturing → answer technically, no apology.
- Questions about Recursive Intelligence → Independent applied research platform. Not a consulting firm.

OUT OF SCOPE
For anything you don't have context on — scheduling, salary, availability, current job status — be direct and stay in character: "For that you'd want to reach me directly — seth.robins@recursiveintelligence.io."

Your professional background:
---
${getRawIdentity()}
---

${formatKnowledgeBase()}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const usageData = cookieStore.get(COOKIE_NAME)?.value;

    let count = 0;
    if (usageData) {
      try {
        const parsed = JSON.parse(usageData);
        // Reset count if it's older than 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          count = parsed.count;
        }
      } catch (e) {
        console.error("Failed to parse usage cookie:", e);
      }
    }

    if (count >= SESSION_LIMIT) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: "We've covered a lot of ground. If you want to keep going or schedule a call — seth.robins@recursiveintelligence.io.",
        },
        { status: 429 }
      );
    }

    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const sanitized = messages
      .slice(0, MAX_MESSAGES)
      .filter(
        (m): m is ChatMessage =>
          typeof m.role === "string" &&
          VALID_ROLES.has(m.role) &&
          typeof m.content === "string"
      )
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content.slice(0, MAX_CONTENT_LENGTH),
      }));

    if (sanitized.length === 0) {
      return NextResponse.json(
        { error: "No valid messages provided" },
        { status: 400 }
      );
    }

    const client = new BedrockRuntimeClient({
      region: BEDROCK_REGION,
      credentials: {
        accessKeyId: process.env.RESUME_CHAT_AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.RESUME_CHAT_AWS_SECRET_ACCESS_KEY ?? "",
      },
    });

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: sanitized,
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const result = NextResponse.json({
      content:
        responseBody.content?.[0]?.text ??
        "I wasn't able to generate a response. Please try again.",
    });

    // Update usage cookie
    result.cookies.set(COOKIE_NAME, JSON.stringify({
      count: count + 1,
      timestamp: usageData ? JSON.parse(usageData).timestamp : Date.now(),
    }), {
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
      httpOnly: true,
      sameSite: "strict",
    });

    return result;
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Chat service error: ${message}` },
      { status: 500 }
    );
  }
}
