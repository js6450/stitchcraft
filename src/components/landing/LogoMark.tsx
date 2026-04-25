// Option E from the Stitchcraft logo explorations:
// Two interlocked V-stitches forming a diamond, with a sparkle at the center.

interface LogoMarkProps {
  size?: number;
  color?: string;
  sparkle?: string;
}

export default function LogoMark({
  size = 32,
  color = "#F5F0E8",
  sparkle = "#D4A853",
}: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      {/* Upper V (pointing down) */}
      <path
        d="M34 32 L60 68 L86 32"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lower V (pointing up) — interlocks with upper to form a diamond */}
      <path
        d="M34 88 L60 52 L86 88"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Four-point sparkle at center */}
      <g transform="translate(60, 60)">
        <path
          d="M0 -8 C1 -1, 1 -1, 8 0 C1 1, 1 1, 0 8 C-1 1, -1 1, -8 0 C-1 -1, -1 -1, 0 -8Z"
          fill={sparkle}
        />
      </g>
    </svg>
  );
}
