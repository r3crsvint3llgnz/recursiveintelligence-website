export default function RLambdaMark({ boxed = false, size = 24, outline = "white" as "white" | "orange" }: { boxed?: boolean; size?: number; outline?: "white" | "orange" }) {
  const s = size;
  const outlineColor = outline === "orange" ? "var(--ri-accent, #ffaa00)" : "#fff";
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="R plus lambda monogram"
    >
      {/* Optional container */}
      {boxed && (
        <rect x="4" y="4" width="56" height="56" rx="12" fill="none" stroke="#fff" strokeWidth="3" />
      )}

      {/* Geometric R */}
      <rect x="14" y="12" width="10" height="40" rx="2" fill="#fff" />
      <rect x="24" y="12" width="20" height="16" rx="8" fill="#fff" />
      <polygon points="24,32 42,52 34,52 24,40" fill="#fff" />

      {/* Lambda wedge as minimalist outline cutout:
         - Fill with page bg (#000) to "cut" the R on your site (true black bg).
         - Add a 1px outline so the λ edges read. At very small sizes we can drop the outline. */}
      <polygon
        points="36,20 44,32 30,44"
        fill="#000"
        stroke={outlineColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
