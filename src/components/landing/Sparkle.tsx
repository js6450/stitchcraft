// Reusable 4-point star sparkle — used as a decorative accent throughout
// the landing page. Matches the star shape in the LogoMark.

interface SparkleProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function Sparkle({
  size = 16,
  color = "#D4A853",
  style,
  className,
}: SparkleProps) {
  const r = size / 2;
  // Scale the bezier control points proportionally from the 12px viewBox radius
  const scale = r / 12;
  const c = 2 * scale; // inner control point (~2 at size 12)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-r} ${-r} ${size} ${size}`}
      fill="none"
      aria-hidden="true"
      style={style}
      className={className}
    >
      <path
        d={`M0 ${-r} C${c} ${-c}, ${c} ${-c}, ${r} 0 C${c} ${c}, ${c} ${c}, 0 ${r} C${-c} ${c}, ${-c} ${c}, ${-r} 0 C${-c} ${-c}, ${-c} ${-c}, 0 ${-r}Z`}
        fill={color}
      />
    </svg>
  );
}
