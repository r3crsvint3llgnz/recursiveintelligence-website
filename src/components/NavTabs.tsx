"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/about",   label: "About" },
  { href: "/briefs",  label: "Briefs" },
  { href: "https://store.recursiveintelligence.io", label: "Store", external: true },
  { href: "/support", label: "Support" },
];

export default function NavTabs() {
  const path = usePathname();
  return (
    <nav className="flex gap-2">
      {items.map((it) => {
        const active = !it.external && path === it.href;
        const className =
          "rounded-full px-3 py-1.5 border transition-colors " +
          (active
            ? "text-[color:var(--ri-fg)] border-[color:var(--ri-accent)] dark:bg-white/5 bg-black/5"
            : "text-[color:var(--ri-muted)] border-[color:var(--ri-border)] hover:text-[color:var(--ri-fg)] dark:hover:bg-white/5 hover:bg-black/5");

        if (it.external) {
          return (
            <a
              key={it.href}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {it.label}
            </a>
          );
        }

        return (
          <Link key={it.href} href={it.href} className={className}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
