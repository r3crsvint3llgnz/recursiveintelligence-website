"use client";
import { buildMailto } from "../lib/email";

// Icons
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" strokeWidth="1.8" />
      <path d="M3.5 7.5l7.6 5.1a3 3 0 0 0 1.8 0l7.6-5.1" strokeWidth="1.8" />
    </svg>
  );
}

function SubstackIcon(props: React.SVGProps<SVGSVGElement>) {
  // Simplified "stack" glyph
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 4h18v3H3V4zm0 5h18v3L12 15 3 12V9zm0 5l9 3 9-3v5H3v-5z" />
    </svg>
  );
}

function MastodonIcon(props: React.SVGProps<SVGSVGElement>) {
  // Simplified Mastodon silhouette
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c4.5 0 8 1 8 1v9.5c0 4.8-3.3 6.2-6.6 6.6-.9.1-1.7.1-2.7 0C7.4 18.7 4 17.3 4 12.5V3s3.5-1 8-1zm4.2 6.6v4.5h-2V8.9c0-1-.4-1.5-1.2-1.5s-1.2.5-1.2 1.5v4.5h-2V8.9c0-1-.4-1.5-1.2-1.5s-1.2.5-1.2 1.5v4.5h-2V8.6c0-2 1.1-3.2 3-3.2 1.4 0 2.3.6 2.8 1.6.5-1 1.4-1.6 2.8-1.6 1.9 0 3 1.2 3 3.2z" />
    </svg>
  );
}

// Shared button wrapper
type LinkBtnProps = {
  href: string;
  label: string;
  rel?: string;
  children: React.ReactNode;
};

function LinkBtn({ href, label, rel, children }: LinkBtnProps) {
  const base =
    "inline-flex items-center gap-2 rounded-md px-4 py-2 font-semibold text-base transition-colors ri-accent-ring";
  const style =
    "bg-transparent text-white ring-1 ring-[color:var(--ri-accent-700)]/60 hover:bg-white/5 hover:ring-[color:var(--ri-accent)]";

  return (
    <a
      href={href}
      target="_blank"
      rel={rel ?? "noopener noreferrer"}
      className={`${base} ${style}`}
      style={{ textDecoration: "none" }}
      aria-label={label}
      title={label}
    >
      {children}
      <span>{label}</span>
    </a>
  );
}

export default function FooterCTA() {
  const emailHref = buildMailto();

  return (
    <div className="mt-16 flex justify-center gap-4">
      {/* Email */}
      <a
        href={emailHref}
        className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-semibold text-base transition-colors ri-accent-ring bg-gray-100 text-black shadow ring-1 ring-[color:var(--ri-accent-700)]/60 hover:bg-white hover:ring-[color:var(--ri-accent)]"
        aria-label="Email to discuss consultation options"
        title="Email to discuss consultation options"
      >
        <MailIcon className="w-4 h-4" />
        <span>Let’s talk</span>
      </a>

      {/* Substack */}
      <LinkBtn href="https://r3crsvint3llgnz.substack.com/" label="Ideas in progress">
        <SubstackIcon className="w-4 h-4" />
      </LinkBtn>

      {/* Mastodon */}
      <LinkBtn
        href="https://hachyderm.io/@r3crsvint3llgnz"
        rel="me noopener noreferrer"
        label="Join the conversation"
      >
        <MastodonIcon className="w-4 h-4" />
      </LinkBtn>
    </div>
  );
}