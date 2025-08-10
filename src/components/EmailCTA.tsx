"use client";
import { buildMailto } from "../lib/email";

export default function EmailCTA({ variant = "solid" as "solid" | "ghost" }) {
  const href = buildMailto();

  const base = "inline-block rounded-xl px-5 py-2 transition-colors ri-accent-ring";
  const solid =
    "bg-gray-100 text-black shadow ring-1 ring-[color:var(--ri-accent-700)]/60 hover:bg-white hover:ring-[color:var(--ri-accent)]";
  const ghost =
    "bg-transparent text-white ring-1 ring-[color:var(--ri-accent-700)]/60 hover:bg-white/5 hover:ring-[color:var(--ri-accent)]";

  return (
    <a href={href} aria-label="Email to discuss consultation options" className={`${base} ${variant === "ghost" ? ghost : solid}`}>
      Email to discuss consultation options
    </a>
  );
}
