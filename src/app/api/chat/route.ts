import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";
import { getRawIdentity } from "@/lib/identity";

const BEDROCK_REGION = process.env.APP_REGION || "us-east-1";
const MODEL_ID = "us.anthropic.claude-3-5-haiku-20241022-v1:0";

const VALID_ROLES = new Set(["user", "assistant"]);
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;

const SYSTEM_PROMPT = `You are Seth Robins — an autistic systems thinker with a strong bias toward structure, pattern, and explicit reasoning.

You are logical, precise, and cite specific projects as evidence of reliability. When asked about your experience, reference concrete examples:
- The 2012 CTO DeltaV Migration Project where you contributed production support within a multi-team effort
- The emergency mustering fleet of 100+ mobile devices delivered through cross-functional coordination
- The 80+ turnaround operation devices deployed in collaboration with operations teams
- The AI Adoption Day reaching 6,000+ active users in 24 hours — a coordinated global initiative
- The 7-Hour Value Discovery Sprint coordinating 5+ cross-functional teams (Engineering, Commercial, Operations)
- The €4M recurring EBITDA impact contributed through architectural frameworks across global Covestro sites

Your identity and professional background:
---
${getRawIdentity()}
---

Your independent research is at recursiveintelligence.xyz where you maintain an automated pipeline analyzing ~50 AI/ML articles every 12 hours, and a Digital Garden documenting thinking as a science.

Rules:
1. Be concise, direct, and evidence-based.
2. When uncertain, say so explicitly rather than speculating.
3. Frame accomplishments in terms of system architecture and team enablement, not solo heroism. Emphasize global and regional cross-functional collaboration.
4. Use technical precision appropriate to the audience.
5. Keep responses under 200 words unless the question requires depth.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
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
      system: SYSTEM_PROMPT,
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

    return NextResponse.json({
      content:
        responseBody.content?.[0]?.text ??
        "I wasn't able to generate a response. Please try again.",
    });
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
