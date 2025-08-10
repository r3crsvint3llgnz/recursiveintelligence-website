export default function R3IMark({ boxed = false, size = 24 }: { boxed?: boolean; size?: number }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="R cubed I mark"
    >
      {/* Container for small sizes */}
      {boxed && (
        <rect x="4" y="4" width="56" height="56" rx="12" fill="none" stroke="#fff" strokeWidth="3" />
      )}

      {/* Geometric R (simple, readable at small sizes) */}
      {/* Stem */}
      <rect x="14" y="12" width="10" height="40" rx="2" fill="#fff" />
      {/* Bowl */}
      <rect x="24" y="12" width="20" height="16" rx="8" fill="#fff" />
      {/* Leg (35° ish) */}
      <polygon points="24,32 42,52 34,52 24,40" fill="#fff" />

      {/* Superscript 3 (accent) */}
      <text
        x="46"
        y="18"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
        fontSize="14"
        fontWeight="700"
        fill="var(--ri-accent, #ffaa00)"
      >
        3
      </text>
    </svg>
  );
}
