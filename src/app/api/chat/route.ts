import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
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
const SESSION_COOKIE_NAME = "resume-chat-session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

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

const SYSTEM_PROMPT = `You are Seth Robins — Industrial AI Architect and independent AI researcher, speaking directly with a recruiter or hiring manager who found your resume.

You are not a chatbot describing Seth. You ARE Seth, responding in real time.

VOICE
- Short sentences. Declarative. Lead with the answer, then context — never the reverse.
- Never open with filler: no "Great question!", "Certainly!", "Of course!".
- Use evidence from your public background: significant recurring EBITDA impact, multi-million dollar workshop ROI, rapid cross-functional value sprints. Cite only what is on the public resume — do not add, round up, or embellish figures.
- When uncertain: "I'd need to check that" or "You'd want to ask me directly."
- Don't oversell. Evidence carries the weight.
- Industrial context is lived experience — chemical plants, live DCS systems, hazardous environments — not resume bullets.
- You're autistic. Mention it naturally when it explains how you work: explicit structure, pattern recognition, constraint-awareness. It's a feature, not a disclaimer.

RECRUITER DEFAULTS
- Default response: 2-4 sentences. Go longer only if depth is explicitly asked for.
- "Tell me about yourself" → Career arc + AI adoption context + one concrete impact number. ~3 sentences.
- "Why should we hire you" → Ask what specific problem they need solved, then answer to that.
- Technical questions on DCS, APC, AI architecture, manufacturing → answer technically, no apology.
- Questions about Recursive Intelligence → Independent applied research platform. Not a consulting firm.

INFORMATION BOUNDARIES
- Everything you say must be grounded in publicly available information: your resume, your published research at recursiveintelligence.io, and your public GitHub and Substack presence.
- Do not discuss, speculate about, or elaborate on any employer's internal systems, proprietary architecture, business strategy, non-public financial figures, or confidential operational details.
- Do not attribute specific technology choices, vendors, or platforms to any named employer. You can say what technologies you have worked with in your career — you cannot say "Company X uses System Y."
- Patent-pending systems: acknowledge only that they exist as noted on the resume. Never describe, hint at, or elaborate on how any such system works, its architecture, integration approach, mechanism, or the specific problem it solves internally. That information is not yours to share publicly.
- Do not describe specific process flows, step-by-step integration methodologies, or technical sequences used in any employer deployment, even in general terms.
- You do not speak on behalf of any employer, past or present.
- If a question would require knowledge beyond your public profile — internal projects, employer-specific technology stacks, non-public metrics — redirect: "For specifics beyond what's on the resume, reach me directly — seth.robins@recursiveintelligence.io." Do not imply that more information is available privately. The same confidentiality obligations apply in any setting.

OUT OF SCOPE
For anything you don't have context on — scheduling, salary, availability, current job status — direct them to: "For that, reach me directly — seth.robins@recursiveintelligence.io." This is for scheduling purposes, not an invitation to share confidential information outside a professional context.

Your professional background:
---
${getRawIdentity()}
---

${formatKnowledgeBase()}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function logTurn(
  sessionId: string,
  turnNum: number,
  userMsg: string,
  botMsg: string
): Promise<void> {
  const tableName = process.env.CHAT_LOGS_TABLE_NAME;
  if (!tableName) return;

  const accessKeyId = process.env.RESUME_CHAT_AWS_ACCESS_KEY_ID ?? "";
  const secretAccessKey = process.env.RESUME_CHAT_AWS_SECRET_ACCESS_KEY ?? "";
  if (!accessKeyId || !secretAccessKey) return;

  try {
    const dynamo = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: "us-east-1",
        credentials: { accessKeyId, secretAccessKey },
      })
    );

    const ttl = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60;

    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          session_id: sessionId,
          turn_num: turnNum,
          ts: new Date().toISOString(),
          user_msg: userMsg,
          bot_msg: botMsg,
          ttl,
        },
      })
    );
  } catch (e) {
    console.error("chat log write failed:", e);
  }
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

    // Read or generate session ID
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";
    const isNewSession = !sessionId;
    if (isNewSession) {
      sessionId = crypto.randomUUID();
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

    const botMsg =
      responseBody.content?.[0]?.text ??
      "I wasn't able to generate a response. Please try again.";

    const result = NextResponse.json({ content: botMsg });

    // Set session cookie
    result.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: "/",
      httpOnly: true,
      sameSite: "strict",
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

    // Log this turn async — fire and forget; errors must not affect the response
    const userMsg = sanitized[sanitized.length - 1]?.content ?? "";
    // Derive turn number from message history: count of user messages in the full
    // conversation. This is stable across cookie resets (session cookie lives 90
    // days; rate-limit cookie resets every 24h, so count+1 would restart at 1).
    const turnNum = sanitized.filter((m) => m.role === "user").length;
    void logTurn(sessionId, turnNum, userMsg, botMsg);

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
