"use client";

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

function BlueSkyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
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

function StoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

// Shared button — LCARS pill shape
type LinkBtnProps = {
  href: string;
  label: string;
  rel?: string;
  children: React.ReactNode;
};

function LinkBtn({ href, label, rel, children }: LinkBtnProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-base transition-colors";
  const ghost =
    "bg-transparent text-[color:var(--ri-fg)] ring-1 ring-[color:var(--ri-accent)]/40 hover:ring-[color:var(--ri-accent)] hover:bg-[rgba(255,102,0,0.06)]";

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
  return (
    <div className="mt-16 flex flex-wrap justify-center gap-3">
      <LinkBtn href="mailto:seth.robins@recursiveintelligence.io" label="Email">
        <MailIcon className="w-4 h-4" />
      </LinkBtn>

      <LinkBtn href="https://substack.recursiveintelligence.io" label="Substack">
        <SubstackIcon className="w-4 h-4" />
      </LinkBtn>

      <LinkBtn
        href="https://bsky.app/profile/r3crsvint3llgnz.bsky.social"
        label="Bluesky"
      >
        <BlueSkyIcon className="w-4 h-4" />
      </LinkBtn>

      <LinkBtn
        href="https://github.com/r3crsvint3llgnz/recursive-prompting"
        label="GitHub"
      >
        <GitHubIcon className="w-4 h-4" />
      </LinkBtn>

      <LinkBtn href="https://store.recursiveintelligence.io" label="Store">
        <StoreIcon className="w-4 h-4" />
      </LinkBtn>
    </div>
  );
}
