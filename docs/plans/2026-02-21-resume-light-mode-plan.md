# Resume Page — Light Mode, Anthropic Chat, Collaborative Content Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the `/resume` page from a dark "industrial" theme to a classic light-mode resume, fix the chat backend (Bedrock → Anthropic API), and reframe all content for accurate cross-functional attribution.

**Architecture:** The `.industrial` CSS scope in `globals.css` controls all visual variables — updating them propagates to most components automatically. The chat API route is a clean swap of SDK client (Bedrock → Anthropic). Content lives in `idenity.yaml` and is read at build time via `getIdentity()`.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind v4, `@anthropic-ai/sdk`, `js-yaml`, Vitest

---

## Prerequisites (manual, before running tasks)

1. **Add `ANTHROPIC_API_KEY` to Amplify console:**
   Amplify console → App `d2dmx5f9lbvzyb` (us-east-2) → Branch `main` → Environment variables → Add:
   `ANTHROPIC_API_KEY` = `<your key>`

2. **Verify Node 20 is active** before Task 2:
   ```bash
   . ~/.nvm/nvm.sh && nvm use v20 && node --version   # must print v20.x.x
   ```

---

### Task 1: Remove Resume from nav

**Files:**
- Modify: `src/components/NavTabs.tsx`

**Step 1: Delete the resume nav entry**

In `src/components/NavTabs.tsx`, remove the line:
```ts
{ href: "/resume",   label: "Resume" },
```
The `items` array should read:
```ts
const items = [
  { href: "/about",    label: "About" },
  { href: "/briefs",   label: "Briefs" },
  { href: "/support",  label: "Support" },
];
```

**Step 2: Verify build compiles**
```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
npm run build 2>&1 | tail -5
```
Expected: `✓ Compiled successfully` (or similar — no errors)

**Step 3: Commit**
```bash
git add src/components/NavTabs.tsx
git commit -m "feat(resume): remove resume from nav — access by direct link only"
```

---

### Task 2: Install Anthropic SDK under Node 20

**Files:**
- Modify: `package.json`, `package-lock.json`

**Step 1: Install under Node 20 (single shell invocation)**
```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website && \
  . ~/.nvm/nvm.sh && nvm use v20 && \
  npm install @anthropic-ai/sdk && \
  npm ci
```
Expected: `added N packages` then `npm ci` exits 0.

**Step 2: Verify package appears in package.json**
```bash
grep anthropic package.json
```
Expected: `"@anthropic-ai/sdk": "^x.x.x"`

**Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "feat(resume): add @anthropic-ai/sdk dependency"
```

---

### Task 3: Wire ANTHROPIC_API_KEY into next.config.ts

**Files:**
- Modify: `next.config.ts`

**Step 1: Add key to the `env` block**

Open `next.config.ts`. In the `env: { ... }` object, add this line (after `RAINDROP_TOKEN`):
```ts
ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
```

**Step 2: Verify build compiles**
```bash
npm run build 2>&1 | tail -5
```
Expected: no errors

**Step 3: Commit**
```bash
git add next.config.ts
git commit -m "feat(resume): embed ANTHROPIC_API_KEY at build time for Amplify SSR"
```

---

### Task 4: Rewrite chat API route (Bedrock → Anthropic)

**Files:**
- Modify: `src/app/api/chat/route.ts`
- Create: `src/app/api/chat/route.test.ts`

**Step 1: Write the failing tests**

Create `src/app/api/chat/route.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock must be hoisted before imports resolve
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('@anthropic-ai/sdk', () => ({
  default: class Anthropic {
    messages = { create: mockCreate }
  },
}))

// fs.readFileSync is called at module scope in route.ts — stub it
vi.mock('fs', () => ({
  default: { readFileSync: () => 'basics:\n  name: Seth Robins\n' },
  readFileSync: () => 'basics:\n  name: Seth Robins\n',
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    process.env.ANTHROPIC_API_KEY = 'test-key'
  })

  it('returns assistant content on success', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Hello, I am Seth.' }],
    })

    const res = await POST(makeRequest({
      messages: [{ role: 'user', content: 'Tell me about yourself.' }],
    }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.content).toBe('Hello, I am Seth.')
  })

  it('returns 400 when messages array is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/messages/)
  })

  it('returns 400 when messages is empty', async () => {
    const res = await POST(makeRequest({ messages: [] }))
    expect(res.status).toBe(400)
  })

  it('returns 500 on Anthropic API error', async () => {
    mockCreate.mockRejectedValue(new Error('rate limit exceeded'))

    const res = await POST(makeRequest({
      messages: [{ role: 'user', content: 'Hello' }],
    }))

    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toMatch(/Chat service error/)
  })

  it('returns fallback when content array is empty', async () => {
    mockCreate.mockResolvedValue({ content: [] })

    const res = await POST(makeRequest({
      messages: [{ role: 'user', content: 'Hello' }],
    }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.content).toMatch(/wasn't able/)
  })
})
```

**Step 2: Run tests — verify they fail**
```bash
npm test -- src/app/api/chat/route.test.ts 2>&1 | tail -20
```
Expected: FAIL — `route.ts` still uses Bedrock SDK

**Step 3: Rewrite `src/app/api/chat/route.ts`**

Replace the entire file content:
```ts
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MODEL_ID = "claude-3-5-haiku-20241022";

// Load identity once at module scope (runs at build time for static pages)
let identityContent: string | null = null;
function loadIdentity(): string {
  if (!identityContent) {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "idenity.yaml"),
      "utf-8"
    );
    identityContent = raw
      .replace(/\[cite_start\]/g, "")
      .replace(/\s*\[cite:\s*[\d,\s]+\]/g, "");
  }
  return identityContent;
}

const SYSTEM_PROMPT = `You are Seth Robins — an autistic systems thinker with a strong bias toward structure, pattern, and explicit reasoning.

You are logical, precise, and cite specific projects as evidence of reliability. When asked about your experience, reference concrete examples:
- The 2012 CTO DeltaV Migration Project where you contributed production support within a multi-team effort
- The emergency mustering fleet of 100+ mobile devices delivered through cross-functional coordination
- The 80+ turnaround operation devices deployed in collaboration with operations teams
- The AI Adoption Day reaching 6,000+ active users in 24 hours — a global cross-functional initiative
- The 7-Hour Value Discovery Sprint coordinating 5+ cross-functional teams (Engineering, Commercial, Operations)
- The €4M recurring EBITDA impact contributed through architectural frameworks across global Covestro sites

Your identity and professional background:
---
${loadIdentity()}
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

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return NextResponse.json({
      content:
        response.content?.[0]?.type === "text"
          ? response.content[0].text
          : "I wasn't able to generate a response. Please try again.",
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
```

**Step 4: Run tests — verify they pass**
```bash
npm test -- src/app/api/chat/route.test.ts 2>&1 | tail -20
```
Expected: `5 passed` (or similar green output)

**Step 5: Run full test suite**
```bash
npm test 2>&1 | tail -10
```
Expected: all tests pass

**Step 6: Commit**
```bash
git add src/app/api/chat/route.ts src/app/api/chat/route.test.ts
git commit -m "feat(resume): replace Bedrock chat with Anthropic SDK (claude-3-5-haiku)"
```

---

### Task 5: Retheme .industrial CSS to light mode

**Files:**
- Modify: `src/app/globals.css`

This is the largest change. Replace the entire `.industrial` block and all `ind-*` class definitions.
Find the section that starts with `Industrial Systems Theme` and ends after `.ind-animate`.

**Step 1: Replace the `.industrial` variable block**

Find:
```css
.industrial {
  --ind-bg: #0a0f1a;
  --ind-bg-alt: #0d1321;
  --ind-surface: #111827;
  --ind-surface-elevated: #1e293b;
  --ind-fg: #c8d1dc;
  --ind-fg-strong: #e2e8f0;
  --ind-muted: #6b7a8d;
  --ind-accent: #10b981;
  --ind-accent-dim: #059669;
  --ind-accent-glow: rgba(16, 185, 129, 0.12);
  --ind-border: rgba(148, 163, 184, 0.1);
  --ind-border-accent: rgba(16, 185, 129, 0.25);
  --ind-danger: #ef4444;

  background-color: var(--ind-bg);
  color: var(--ind-fg);
  font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
```

Replace with:
```css
.industrial {
  --ind-bg: #ffffff;
  --ind-bg-alt: #f9fafb;
  --ind-surface: #f9fafb;
  --ind-surface-elevated: #f3f4f6;
  --ind-fg: #374151;
  --ind-fg-strong: #111827;
  --ind-muted: #6b7280;
  --ind-accent: #475569;
  --ind-accent-dim: #64748b;
  --ind-accent-glow: rgba(71, 85, 105, 0.08);
  --ind-border: #e5e7eb;
  --ind-border-accent: #cbd5e1;
  --ind-chat-accent: #1e40af;
  --ind-tag-bg: rgba(71, 85, 105, 0.06);
  --ind-tag-bg-hover: rgba(71, 85, 105, 0.12);
  --ind-tag-border: rgba(71, 85, 105, 0.15);
  --ind-danger: #dc2626;

  background-color: var(--ind-bg);
  color: var(--ind-fg);
  font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
```

**Step 2: Update `.ind-metric` — remove hover transform**

Find:
```css
.ind-metric:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 24px var(--ind-accent-glow);
}
```
Replace with:
```css
.ind-metric:hover {
  box-shadow: 0 2px 12px var(--ind-accent-glow);
}
```

**Step 3: Update `.ind-spotlight` — replace hardcoded emerald rgba**

Find:
```css
.ind-spotlight {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0.01) 100%);
```
Replace with:
```css
.ind-spotlight {
  background: linear-gradient(135deg, var(--ind-accent-glow) 0%, transparent 100%);
```

**Step 4: Update `.ind-tag` — replace hardcoded emerald rgba**

Find:
```css
.ind-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background: rgba(16, 185, 129, 0.08);
  color: var(--ind-accent);
  border: 1px solid rgba(16, 185, 129, 0.15);
  transition: background 0.15s;
}
.ind-tag:hover {
  background: rgba(16, 185, 129, 0.15);
}
```
Replace with:
```css
.ind-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background: var(--ind-tag-bg);
  color: var(--ind-accent);
  border: 1px solid var(--ind-tag-border);
  transition: background 0.15s;
}
.ind-tag:hover {
  background: var(--ind-tag-bg-hover);
}
```

**Step 5: Update `.ind-chat-bubble` — replace hardcoded emerald colors**

Find:
```css
.ind-chat-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ind-accent);
  color: #0a0f1a;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  transition: transform 0.15s, box-shadow 0.15s;
  z-index: 100;
}
.ind-chat-bubble:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(16, 185, 129, 0.45);
}
```
Replace with:
```css
.ind-chat-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ind-chat-accent);
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(30, 64, 175, 0.25);
  transition: transform 0.15s, box-shadow 0.15s;
  z-index: 100;
}
.ind-chat-bubble:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(30, 64, 175, 0.35);
}
```

**Step 6: Verify build**
```bash
npm run build 2>&1 | tail -5
```
Expected: no errors

**Step 7: Commit**
```bash
git add src/app/globals.css
git commit -m "feat(resume): retheme industrial CSS to classic light-mode resume palette"
```

---

### Task 6: Update ChatWidget for light theme

**Files:**
- Modify: `src/components/portfolio/ChatWidget.tsx`

The chat panel and input need explicit background adjustments, and the user message bubble should use `--ind-chat-accent` (blue) instead of `--ind-accent` (slate) so chat messages are visually distinct.

**Step 1: Update user message bubble background and send button**

In `ChatWidget.tsx`, find the message bubble style block:
```tsx
style={{
  background:
    msg.role === "user"
      ? "var(--ind-accent)"
      : "var(--ind-surface-elevated)",
  color:
    msg.role === "user"
      ? "var(--ind-bg)"
      : "var(--ind-fg)",
```
Replace with:
```tsx
style={{
  background:
    msg.role === "user"
      ? "var(--ind-chat-accent)"
      : "var(--ind-surface-elevated)",
  color:
    msg.role === "user"
      ? "#ffffff"
      : "var(--ind-fg)",
```

**Step 2: Update send button**

Find:
```tsx
style={{
  background: "var(--ind-accent)",
  color: "var(--ind-bg)",
}}
```
(The send button — it's the button with `onClick={handleSend}`)

Replace with:
```tsx
style={{
  background: "var(--ind-chat-accent)",
  color: "#ffffff",
}}
```

**Step 3: Verify build**
```bash
npm run build 2>&1 | tail -5
```
Expected: no errors

**Step 4: Commit**
```bash
git add src/components/portfolio/ChatWidget.tsx
git commit -m "feat(resume): update chat widget colors for light mode (blue chat accent)"
```

---

### Task 7: Rewrite idenity.yaml for collaborative attribution

**Files:**
- Modify: `idenity.yaml`

Replace the entire file. Citation markers (`[cite_start]`, `[cite: N]`) are stripped by `getIdentity()` — remove them in the rewrite for clean copy:

```yaml
# identity.yaml - Sovereign Source of Truth for recursiveintelligence.io/resume
basics:
  name: Seth Robins
  label: Industrial AI Architect | Manufacturing Optimization Specialist | Systems Thinker
  email: seth.robins@recursiveintelligence.io
  url: https://recursiveintelligence.io
  location: Pasadena, Texas
  summary: >
    Autistic systems thinker with a strong bias toward structure, pattern, and explicit reasoning.
    Specialized in the intersection of industrial control, machine learning, and live manufacturing operations.
    Proven track record of contributing architectural frameworks to global and regional cross-functional teams,
    delivering constraint-aware, intelligent systems that run in live plants (not sandboxes)
    and are measured strictly by operational and financial outcomes.

key_performance_indicators:
  realized_ebitda: "€4M recurring annual impact (2025) — contributed through global and regional cross-functional architectural frameworks."
  targeted_ebitda: "€12M pipeline (2026) — coordinating agentic systems and AI optimization across sites."
  peak_adoption: "6,000+ active users globally within 24 hours during AI Adoption Day — a coordinated global initiative."
  workshop_roi: "$6M in potential annual EBITDA surfaced in a single 7-hour sprint (2026) — coordinating 5+ cross-functional teams."
  user_growth: "Triple-digit percentage growth in MAU with sustained usage plateaus — driven by global adoption programs."

case_study_workshop:
  title: "The 7-Hour Value Discovery Sprint"
  methodology: "Translating cognitive science into actionable methodology to bridge the 'reality gap' — applied across Engineering, Commercial, and Operations teams."
  team_role: "Architect & Facilitator — coordinating 5+ cross-functional teams (Engineering, Commercial, Operations) across global and regional stakeholders."
  impact: "$6M in EBITDA opportunities identified through constraint-aware system modeling with cross-functional team input."

experience:
  - company: Covestro
    role: Artificial Intelligence Adoption Consultant
    period: Jan 2025 – Present
    highlights:
      - "Contributed architectural delivery frameworks to global and regional cross-functional initiatives, enabling €4M in recurring EBITDA impact."
      - "Collaborated with global engineering and operations teams to design end-to-end AI architectures spanning data ingestion, forecasting, and validated setpoint recommendations."
      - "Co-developed reusable platforms and internal AI use case catalogs in partnership with regional teams to support scalable deployment across multiple sites."
      - "Coordinated concurrent AI initiatives across global and regional stakeholders, targeting energy efficiency, throughput, and margin protection."

  - company: Covestro
    role: Industrial Mobility & Intelligent Operations Architect
    period: Apr 2022 – Jan 2025
    highlights:
      - "Partnered with plant operations and safety teams to deploy intrinsically safe smart devices integrated with plant Wi-Fi for hazardous industrial environments."
      - "Coordinated cross-functional delivery of 100+ mobile devices for emergency mustering, improving incident response readiness across site operations."
      - "Collaborated with turnaround teams to equip operations with 80+ mobile devices for real-time task execution and data capture."

  - company: Covestro
    role: Process Control Capability Development Specialist
    period: Apr 2019 – Apr 2022
    highlights:
      - "Coordinated global learning and capability development programs for ~250 direct and 2,000+ indirect personnel across sites."
      - "Partnered with operations and safety leaders to design qualification-based training for safety-critical plant functions (DCS, APC, and Process Safety)."

  - company: Bayer Technology Services / Material Science
    role: Process Control Technology Engineer / Production Technician
    period: Aug 2007 – Apr 2015
    highlights:
      - "Contributed to cross-functional DCS Migration Projects and supported system continuity through site acquisitions and mergers."
      - "Provided production support within a multi-team effort for the 2012 CTO DeltaV Migration Project."

  - company: Dow Chemical
    role: Instrumentation Technician
    period: Oct 2006 – Aug 2007
    highlights:
      - "Provided expert consultation on instrumentation design and Allen Bradley PLC systems in support of plant engineering teams."

independent_leadership:
  - organization: RECURSIVE INTELLIGENCE
    role: Founder / Applied Researcher
    highlights:
      - "Developed AWS-based automated research pipeline analyzing ~50 AI/ML articles every 12 hours."
      - "Maintains 'The Digital Garden' documenting thinking as a science and industrial constraint testing."

core_competencies:
  industrial_stack: [DCS Control, Advanced Process Control (APC), Process Safety Layers, Instrumentation]
  systems_architecture: [IT/OT Integration, Cloud-to-Edge Architecture, Agentic Workflows, RAG Pipelines]
  data_governance: [Historians, Industrial Data Pipelines, MES, Asset Management]

education:
  - school: Texas McCombs School of Business
    degree: Postgraduate Degree, AI (2024)
  - school: University of Phoenix
    degree: BS, IT/Software Engineering
  - school: Lee College
    degree: AAS, Instrumentation Technology
```

**Step 2: Verify build (getIdentity() parses the YAML at build time)**
```bash
npm run build 2>&1 | tail -10
```
Expected: no errors; the resume page generates without YAML parse errors.

**Step 3: Run tests**
```bash
npm test 2>&1 | tail -10
```
Expected: all pass

**Step 4: Commit**
```bash
git add idenity.yaml
git commit -m "content(resume): reframe highlights for cross-functional attribution accuracy"
```

---

### Task 8: Full build verification and push

**Step 1: Run full test suite**
```bash
npm test 2>&1 | tail -15
```
Expected: all tests pass, no failures

**Step 2: Production build**
```bash
npm run build 2>&1 | grep -E "error|warning|✓|Route"
```
Expected: `✓` lines for compiled pages; `/resume` appears in route list; no TypeScript errors.

**Step 3: Spot-check the resume route appears as static**
```bash
npm run build 2>&1 | grep resume
```
Expected: `○ /resume` (static) — not λ (dynamic)

**Step 4: Push to trigger Amplify deploy**
```bash
git push origin main
```

**Step 5: Monitor Amplify build**
```bash
aws amplify list-jobs \
  --app-id d2dmx5f9lbvzyb \
  --branch-name main \
  --region us-east-2 \
  --profile seth-dev \
  --query 'jobSummaries[0].{status:status,id:jobId}' \
  --output table
```
Expected: job status transitions to `SUCCEED`

---

## Post-deploy smoke test checklist

- [ ] `https://recursiveintelligence.io` nav has no "Resume" link
- [ ] `https://recursiveintelligence.io/resume` loads with white background
- [ ] Chat bubble is blue; opens a light-mode panel
- [ ] Send a message → response arrives (confirms `ANTHROPIC_API_KEY` is live)
- [ ] "Last updated" footer shows today's deploy date
- [ ] "Download Resume (PDF)" button returns a PDF
- [ ] No resume link discoverable from any public nav surface
