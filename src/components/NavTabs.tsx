"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/about",    label: "About" }
];

export default function NavTabs(){
  const path = usePathname();
  return (
    <nav className="flex gap-2">
      {items.map(it=>{
        const active = path === it.href;
        return (
          <Link key={it.href} href={it.href}
            className={
              "rounded-full px-3 py-1.5 border transition-colors " +
              (active
                ? "text-white border-[color:var(--ri-accent)] bg-white/5"
                : "text-gray-400 border-white/10 hover:text-gray-200 hover:bg-white/5")
            }
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
