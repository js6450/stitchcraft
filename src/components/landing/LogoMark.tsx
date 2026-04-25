// Option A from the Stitchcraft logo explorations:
// Knit V-stitch with a 4-point star sparkle.

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
      {/* V stitch shape */}
      <path
        d="M36 28 L60 88 L84 28"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Four-point sparkle at top right */}
      <g transform="translate(82, 24)">
        <path
          d="M0 -12 C2 -2, 2 -2, 12 0 C2 2, 2 2, 0 12 C-2 2, -2 2, -12 0 C-2 -2, -2 -2, 0 -12Z"
          fill={sparkle}
        />
      </g>
    </svg>
  );
}
