# Resume Page — Light Mode, Chat Backend Fix, Collaborative Content

**Date:** 2026-02-21
**Status:** Approved — ready for implementation

---

## Goals

1. Remove the `/resume` nav link so the page is access-by-link-only (not discoverable via nav)
2. Convert the dark "industrial" theme to a classic light-mode resume aesthetic
3. Fix the chat backend (Bedrock → Anthropic API, explicit key)
4. Keep `SystemHealthWidget` (shows build/deploy date = data currency for recruiters)
5. Keep `ChatWidget` (signals AI/ML competency — intentional design choice)
6. Reframe `idenity.yaml` highlights to reflect cross-functional / global-regional collaboration
7. Ensure `next.config.ts` embeds the new `ANTHROPIC_API_KEY` env var at build time

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/NavTabs.tsx` | Remove `{ href: "/resume", label: "Resume" }` entry |
| `src/app/globals.css` | Retheme `.industrial` and all `ind-*` classes to light palette |
| `src/app/api/chat/route.ts` | Replace Bedrock SDK with Anthropic SDK; use `claude-3-5-haiku-20241022` |
| `next.config.ts` | Add `ANTHROPIC_API_KEY` to the `env` block |
| `idenity.yaml` | Rewrite highlights for collaborative framing throughout |
| `src/components/portfolio/ChatWidget.tsx` | Update hardcoded dark `ind-*` surface colors → CSS vars (auto-adapts with theme) |
| `src/components/portfolio/SystemHealthWidget.tsx` | Update styles to match light theme |
| `package.json` / `package-lock.json` | Add `@anthropic-ai/sdk`; regenerate lock under Node 20 |

---

## Light Theme Palette

Replace the `.industrial` CSS variable block:

```css
.industrial {
  --ind-bg: #ffffff;
  --ind-bg-alt: #f9fafb;
  --ind-surface: #f9fafb;
  --ind-surface-elevated: #f3f4f6;
  --ind-fg: #374151;
  --ind-fg-strong: #111827;
  --ind-muted: #6b7280;
  --ind-accent: #475569;       /* slate — section headings, borders */
  --ind-accent-dim: #64748b;
  --ind-accent-glow: rgba(71, 85, 105, 0.08);
  --ind-border: #e5e7eb;
  --ind-border-accent: #cbd5e1;
  --ind-chat-accent: #1e40af;  /* blue — chat bubble only */
}
```

Component style rules:
- `.ind-card`, `.ind-metric`, `.ind-spotlight`: clean `1px solid var(--ind-border)`, no glow/shadow/transform
- `.ind-section-heading`: charcoal (`--ind-fg-strong`) uppercase, bottom border `--ind-border`
- `.ind-tag`: light slate background, dark slate text
- `.ind-pulse`: slate color, not emerald
- Chat bubble: uses `--ind-chat-accent` (blue) so it reads as a distinct interactive element
- Chat panel: white background with `--ind-border` borders; messages styled appropriately for light bg

---

## Chat Backend — Anthropic API

**Current (broken in Amplify SSR Lambda):**
```ts
const client = new BedrockRuntimeClient({ region: BEDROCK_REGION });
// No explicit credentials → fails in Amplify managed Lambda
```

**New:**
```ts
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// Model: claude-3-5-haiku-20241022
```

Env var flow:
1. Add `ANTHROPIC_API_KEY` in Amplify console (us-east-2, app d2dmx5f9lbvzyb, branch main)
2. Add `ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? ''` to `next.config.ts` `env` block
3. Route reads `process.env.ANTHROPIC_API_KEY` — embedded as literal at build time

---

## SystemHealthWidget — No Logic Change

The widget calls `new Date()` at server render. Because `resume/page.tsx` is `force-static`,
this runs at build/deploy time and is baked into the static HTML. The displayed date accurately
reflects when the resume data was last deployed — exactly what recruiters need to assess data
currency. Restyle only (light theme); do not change the timestamp logic.

---

## Content — Collaborative Reframing (`idenity.yaml`)

All highlights rewritten to reflect that outcomes were achieved through global and regional
cross-functional collaboration. Framing rules:

- Replace solo verbs ("Architected", "Designed", "Built", "Led") with collaborative equivalents
  ("Contributed architectural frameworks to...", "Partnered with regional teams to...",
  "Coordinated with global and regional stakeholders to...")
- Retain specific metrics (€4M, 6,000+ users, $6M workshop) — they are accurate
- Add context clarifying the collaborative scope ("across global Covestro sites",
  "coordinating with Engineering, Commercial, and Operations teams")
- Summary: lead with collaborative systems thinking, not solo architecture

The chat system prompt already has rule #3 correct:
> "Frame accomplishments in terms of system architecture and team enablement, not solo heroism."

---

## Amplify Deployment Note

After adding `ANTHROPIC_API_KEY` to Amplify console and `next.config.ts`:
- Run `npm run build` locally to verify no TypeScript errors
- Regenerate `package-lock.json` under Node 20 after adding `@anthropic-ai/sdk`
- Push → Amplify builds and embeds the key as a compile-time literal
