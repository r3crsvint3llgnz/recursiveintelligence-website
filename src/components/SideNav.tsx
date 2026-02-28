"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
function StoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
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
function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M14 9l3 3-3 3" />
    </svg>
  );
}
function CollapseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M15 15l-3-3 3-3" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/",        label: "Home",    Icon: HomeIcon,    external: false, badge: false },
  { href: "/about",   label: "About",   Icon: AboutIcon,   external: false, badge: false },
  { href: "/briefs",  label: "Briefs",  Icon: BriefsIcon,  external: false, badge: true  },
  { href: "https://store.recursiveintelligence.io", label: "Store", Icon: StoreIcon, external: true, badge: false },
  { href: "/support", label: "Support", Icon: SupportIcon, external: false, badge: false },
] as const;

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
        <button
          onClick={onToggle}
          className="ri-sidenav-toggle"
          aria-label={isExpanded ? "Collapse navigation" : "Expand navigation"}
        >
          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
        </button>

        <ul>
          {NAV_ITEMS.map(({ href, label, Icon, external, badge }) => {
            const active =
              !external &&
              (href === "/" ? path === "/" : path.startsWith(href));
            const className = `ri-sidenav-item${active ? " active" : ""}`;
            const content = (
              <>
                <Icon />
                {isExpanded && <span>{label}</span>}
                {isExpanded && badge && (
                  <span className="ri-live-badge">live</span>
                )}
              </>
            );
            if (external) {
              return (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={label}>
                    {content}
                  </a>
                </li>
              );
            }
            return (
              <li key={href}>
                <Link href={href} className={className} title={label}>
                  {content}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Seam stripe — sibling to nav (NOT child) so overflow:hidden on nav does not clip it.
          Uses position:fixed with explicit left coordinate that transitions with sidebar width. */}
      <div
        className={`ri-sidenav-seam${isExpanded ? " ri-sidenav-seam--expanded" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}
