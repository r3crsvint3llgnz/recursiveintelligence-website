"use client";
import EmailCTA from "./EmailCTA";

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" strokeWidth="1.8" />
      <path d="M3.5 7.5l7.6 5.1a3 3 0 0 0 1.8 0l7.6-5.1" strokeWidth="1.8" />
    </svg>
  );
}

// Simple Icons paths (normalized). CC0-1.0. Kept as single-color, minimalist.
function SubstackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      {/* Substack "stack" glyph */}
      <path d="M3 4h18v3H3V4zm0 5h18v3L12 15 3 12V9zm0 5l9 3 9-3v5H3v-5z" />
    </svg>
  );
}

function MastodonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      {/* Simplified Mastodon silhouette */}
      <path d="M12 2c4.5 0 8 1 8 1v9.5c0 4.8-3.3 6.2-6.6 6.6-.9.1-1.7.1-2.7 0C7.4 18.7 4 17.3 4 12.5V3s3.5-1 8-1zm4.2 6.6v4.5h-2V8.9c0-1-.4-1.5-1.2-1.5s-1.2.5-1.2 1.5v4.5h-2V8.9c0-1-.4-1.5-1.2-1.5s-1.2.5-1.2 1.5v4.5h-2V8.6c0-2 1.1-3.2 3-3.2 1.4 0 2.3.6 2.8 1.6.5-1 1.4-1.6 2.8-1.6 1.9 0 3 1.2 3 3.2z" />
    </svg>
  );
}

type LinkBtnProps = {
  href: string;
  label: string;
  rel?: string;
  className?: string;
  children: React.ReactNode; // icon
};

function LinkBtn({ href, label, rel, className, children }: LinkBtnProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel={rel ?? "noopener noreferrer"}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border transition-colors font-semibold text-base ${className}`}
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
  return (
    <div className="mt-16 flex justify-center gap-4">
      {/* Keep your existing component for email consult CTA */}
      <EmailCTA variant="ghost" />

      {/* Substack: neutral by default; amber on hover */}
      <LinkBtn
        href="https://r3crsvint3llgnz.substack.com/"
        label="Ideas in progress"
        className="border-white/30 text-white/90 hover:bg-amber-400 hover:text-black hover:border-amber-400"
      >
        <SubstackIcon className="w-4 h-4" />
      </LinkBtn>

      {/* Mastodon: neutral by default; sky or amber depending on preference.
          If you want strict palette, use amber hover like Substack. */}
      <LinkBtn
        href="https://hachyderm.io/@r3crsvint3llgnz"
        rel="me noopener noreferrer"
        label="Join the conversation"
        className="border-white/30 text-white/90 hover:bg-amber-400 hover:text-black hover:border-amber-400"
      >
        <MastodonIcon className="w-4 h-4" />
      </LinkBtn>
    </div>
  );
}

