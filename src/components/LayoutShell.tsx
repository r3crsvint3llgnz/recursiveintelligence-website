"use client";
import { useState, useEffect } from "react";
import SideNav from "./SideNav";

function PanelOpenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M14 9l3 3-3 3" />
    </svg>
  );
}

function PanelCloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M15 15l-3-3 3-3" />
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

  useEffect(() => {
    if (!isExpanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggle();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isExpanded]);

  return (
    <>
      {/* Sidebar panel toggle — always visible, all screen sizes */}
      <button
        onClick={toggle}
        className="fixed top-0 left-0 z-[51] h-12 w-12 flex items-center justify-center text-[color:var(--ri-muted)] hover:text-[color:var(--ri-fg)] transition-colors"
        aria-label={isExpanded ? "Close navigation" : "Open navigation"}
      >
        {isExpanded ? <PanelCloseIcon /> : <PanelOpenIcon />}
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
