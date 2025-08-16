"use client";
import { buildMailto } from "../lib/email";

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        ry="2"
        strokeWidth="1.8"
      />
      <path d="M3.5 7.5l7.6 5.1a3 3 0 0 0 1.8 0l7.6-5.1" strokeWidth="1.8" />
    </svg>
  );
}

export default function EmailCTA({
  variant = "solid" as "solid" | "ghost",
}) {
  const href = buildMailto();

  const base =
    "inline-flex items-center gap-2 rounded-md px-4 py-2 font-semibold text-base transition-colors ri-accent-ring";
  const solid =
    "bg-gray-100 text-black shadow ring-1 ring-[color:var(--ri-accent-700)]/60 hover:bg-white hover:ring-[color:var(--ri-accent)]";
  const ghost =
    "bg-transparent text-white ring-1 ring-[color:var(--ri-accent-700)]/60 hover:bg-white/5 hover:ring-[color:var(--ri-accent)]";

  return (
    <a
      href={href}
      aria-label="Email to discuss consultation options"
      className={`${base} ${variant === "ghost" ? ghost : solid}`}
    >
      <MailIcon className="w-4 h-4" />
      <span>Let’s talk</span>
    </a>
  );
}