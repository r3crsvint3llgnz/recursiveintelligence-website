"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Icons (18×18, stroke 1.8) ──────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function AboutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function DispatchesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function BriefsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="16" x2="13" y2="16" />
    </svg>
  );
}
function ReadingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function SupportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function GardenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
function StoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function SubstackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 4h18v3H3V4zm0 5h18v3L12 15 3 12V9zm0 5l9 3 9-3v5H3v-5z" />
    </svg>
  );
}
function BlueSkyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
      <path d="M3.5 7.5l7.6 5.1a3 3 0 0 0 1.8 0l7.6-5.1" />
    </svg>
  );
}

// ─── Nav data ────────────────────────────────────────────────────────────────

type NavItem = {
  href: string;
  label: string;
  Icon: React.FC;
  external?: boolean;
  badge?: boolean;
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { href: "/",             label: "Home",         Icon: HomeIcon       },
      { href: "/about",        label: "About",        Icon: AboutIcon      },
      { href: "/blog",         label: "Dispatches",   Icon: DispatchesIcon },
      { href: "/briefs",       label: "Briefs",       Icon: BriefsIcon,    badge: true },
      { href: "/reading-list", label: "Reading List", Icon: ReadingIcon    },
      { href: "/support",      label: "Support",      Icon: SupportIcon    },
    ],
  },
  {
    label: "// Explore",
    items: [
      { href: "https://recursiveintelligence.xyz",       label: "Garden", Icon: GardenIcon, external: true },
      { href: "https://store.recursiveintelligence.io",  label: "Store",  Icon: StoreIcon,  external: true },
    ],
  },
  {
    label: "// Connect",
    items: [
      { href: "https://substack.recursiveintelligence.io",             label: "Substack", Icon: SubstackIcon, external: true },
      { href: "https://bsky.app/profile/r3crsvint3llgnz.bsky.social", label: "Bluesky",  Icon: BlueSkyIcon,  external: true },
      { href: "https://github.com/r3crsvint3llgnz",                   label: "GitHub",   Icon: GitHubIcon,   external: true },
      { href: "mailto:seth.robins@recursiveintelligence.io",           label: "Email",    Icon: MailIcon,     external: true },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type Props = {
  isExpanded: boolean;
  onToggle: () => void;
};

export default function SideNav({ isExpanded, onToggle }: Props) {
  const path = usePathname();

  return (
    <>
      {/* Mobile scrim */}
      <div
        className={`ri-nav-scrim${isExpanded ? " ri-nav-scrim--visible" : ""} md:hidden`}
        onClick={onToggle}
        aria-hidden="true"
      />

      <nav
        className={`ri-sidenav${isExpanded ? " ri-sidenav--expanded" : ""}`}
        aria-label="Primary navigation"
      >
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.label && (
              <div className="ri-sidenav-section">{section.label}</div>
            )}
            <ul>
              {section.items.map(({ href, label, Icon, external, badge }) => {
                const active =
                  !external &&
                  (href === "/" ? path === "/" : path.startsWith(href));
                const cls = `ri-sidenav-item${active ? " active" : ""}`;
                const content = (
                  <>
                    <Icon />
                    <span>{label}</span>
                    {isExpanded && badge && (
                      <span className="ri-live-badge">live</span>
                    )}
                    {isExpanded && external && (
                      <span aria-hidden="true" style={{ fontSize: "0.6rem", marginLeft: "auto", opacity: 0.4 }}>↗</span>
                    )}
                  </>
                );

                if (external) {
                  const isMailto = href.startsWith("mailto:");
                  return (
                    <li key={href}>
                      <a
                        href={href}
                        {...(!isMailto && { target: "_blank", rel: "noopener noreferrer" })}
                        className={cls}
                        title={label}
                      >
                        {content}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={href}>
                    <Link href={href} className={cls} title={label}>
                      {content}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
