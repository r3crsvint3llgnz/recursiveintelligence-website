"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import R3IMarkFinal from "./R3IMarkFinal";

// React 18 recommended pattern for detecting client-side hydration without setState-in-effect
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function BrandLink() {
  const { resolvedTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
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
