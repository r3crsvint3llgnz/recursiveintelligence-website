"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import R3IMarkFinal from "./R3IMarkFinal";
// We need to access the font variable, but we can't import the font object from layout easily if it's not exported or if we are strict.
// However, the font variable is set on the body, so we can just use the class name if we want, OR we can accept it as a prop?
// For simpler implementation, I'll use the CSS variable directly or just hardcode the class if it's available globally. 
// layout.tsx sets the variable: --font-space-grotesk. 
// Tailwind config likely maps 'font-space-grotesk' to that variable if extended properly, OR we use arbitrary class.
// looking at layout.tsx: className={`${spaceGrotesk.variable} font-space-grotesk ...`}
// So `font-space-grotesk` class is available.

export default function BrandLink() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render default state (dark mode compatible or placeholder) to avoid hydration mismatch
    // Defaulting to the text version as it's the base.
    return (
      <Link href="/" className="flex items-center gap-2 font-bold">
        <R3IMarkFinal size={20} />
        <span className="font-space-grotesk tracking-tight text-lg text-[color:var(--ri-fg)] hover:text-[color:var(--ri-accent)] transition-colors">
          RecursiveIntelligence.io
        </span>
      </Link>
    );
  }

  const isLight = resolvedTheme === "light";

  return (
    <Link href="/" className="flex items-center gap-2 font-bold">
      {isLight ? (
        <img 
          src="/r3_cover-light.png" 
          alt="Recursive Intelligence" 
          className="h-8 w-auto object-contain" 
        />
      ) : (
        <>
          <R3IMarkFinal size={20} />
          <span className="font-space-grotesk tracking-tight text-lg text-[color:var(--ri-fg)] hover:text-[color:var(--ri-accent)] transition-colors">
            RecursiveIntelligence.io
          </span>
        </>
      )}
    </Link>
  );
}
