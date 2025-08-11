"use client";
import EmailCTA from "./EmailCTA";

export default function FooterCTA() {
  return (
    <div className="mt-16 flex justify-center gap-4">
      <EmailCTA variant="ghost" />
      <a
        href="https://r3crsvint3llgnz.substack.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 rounded-md border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black transition-colors font-semibold text-base"
        style={{ textDecoration: "none" }}
      >
        Substack
      </a>
    </div>
  );
}
