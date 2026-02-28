"use client";
import { useState } from "react";
import SideNav from "./SideNav";

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = () => setIsExpanded((v) => !v);

  return (
    <>
      {/* Mobile hamburger — overlaid on top bar left, only shown on mobile */}
      <button
        onClick={toggle}
        className="md:hidden fixed top-0 left-0 z-[51] h-12 w-12 flex items-center justify-center text-[color:var(--ri-muted)] hover:text-[color:var(--ri-fg)] transition-colors"
        aria-label="Open navigation"
      >
        <HamburgerIcon />
      </button>

      <SideNav isExpanded={isExpanded} onToggle={toggle} />

      <div
        className={`ri-layout-content${isExpanded ? " ri-layout-content--expanded" : ""}`}
      >
        {children}
      </div>
    </>
  );
}
