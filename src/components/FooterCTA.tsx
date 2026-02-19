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
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 4h18v3H3V4zm0 5h18v3L12 15 3 12V9zm0 5l9 3 9-3v5H3v-5z" />
    </svg>
  );
}

function MastodonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c4.5 0 8 1 8 1v9.5c0 4.8-3.3 6.2-6.6 6.6-.9.1-1.7.1-2.7 0C7.4 18.7 4 17.3 4 12.5V3s3.5-1 8-1zm4.2 6.6v4.5h-2V8.9c0-1-.4-1.5-1.2-1.5s-1.2.5-1.2 1.5v4.5h-2V8.9c0-1-.4-1.5-1.2-1.5s-1.2.5-1.2 1.5v4.5h-2V8.6c0-2 1.1-3.2 3-3.2 1.4 0 2.3.6 2.8 1.6.5-1 1.4-1.6 2.8-1.6 1.9 0 3 1.2 3 3.2z" />
    </svg>
  );
}

function LinktreeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.51 6.11l4.74-4.74 2.12 2.12-4.74 4.74h6.52v3H15.6l4.74 4.74-2.12 2.12-6.22-6.22-6.22 6.22-2.12-2.12L8.4 11.23H1.85v-3h6.52L3.63 3.49l2.12-2.12 4.74 4.74V0h3v6.11zM10.51 13.23v10.77h3V13.23h-3z" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

// Shared button
type LinkBtnProps = {
  href: string;
  label: string;
  rel?: string;
  children: React.ReactNode;
};

function LinkBtn({ href, label, rel, children }: LinkBtnProps) {
  const base =
    "inline-flex items-center gap-2 rounded-md px-4 py-2 font-semibold text-base transition-colors ri-accent-ring";
  const ghost =
    "bg-transparent text-white ring-1 ring-[color:var(--ri-accent-700)]/60 hover:bg-white/5 hover:ring-[color:var(--ri-accent)]";

  return (
    <a
      href={href}
      target="_blank"
      rel={rel ?? "noopener noreferrer"}
      className={`${base} ${ghost}`}
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
    <div className="mt-16 flex flex-wrap justify-center gap-3">
      <LinkBtn href={emailHref} label="Email">
        <MailIcon className="w-4 h-4" />
      </LinkBtn>

      <LinkBtn href="https://recursiveintelligence.substack.com" label="Substack">
        <SubstackIcon className="w-4 h-4" />
      </LinkBtn>

      <LinkBtn
        href="https://hachyderm.io/@r3crsvint3llgnz"
        rel="me noopener noreferrer"
        label="Mastodon"
      >
        <MastodonIcon className="w-4 h-4" />
      </LinkBtn>

      <LinkBtn
        href="https://github.com/r3crsvint3llgnz/recursive-prompting"
        label="GitHub"
      >
        <GitHubIcon className="w-4 h-4" />
      </LinkBtn>

      <LinkBtn href="https://linktr.ee/r3crsvint3llgnz" label="Linktree">
        <LinktreeIcon className="w-4 h-4" />
      </LinkBtn>
    </div>
  );
}
