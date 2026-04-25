import { COLORS } from "@/lib/theme";

// 24×24 colorwork grid rendered as an SVG.
// Pattern: diamond motifs tiling on a 12-unit repeat —
// mustard center dot → cream diamond body → roseGold outline → plum background.
// Corner accent dots in gold.

const COLS = 24;
const ROWS = 24;
const CELL = 10; // px per cell → 240×240 SVG

function getCellColor(row: number, col: number): string {
  const tr = row % 12;
  const tc = col % 12;

  // Gold corner dots where tiles meet
  if (tr === 0 && tc === 0) return COLORS.gold;

  // Manhattan distance from tile center (6, 6)
  const dist = Math.abs(tr - 6) + Math.abs(tc - 6);

  if (dist === 0) return COLORS.mustard;   // center dot
  if (dist <= 3)  return COLORS.cream;     // diamond body
  if (dist === 4) return COLORS.roseGold;  // diamond outline
  return COLORS.plum;                      // background
}

export default function KnitGrid() {
  const cells: { row: number; col: number; color: string }[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({ row: r, col: c, color: getCellColor(r, c) });
    }
  }

  return (
    <svg
      width={COLS * CELL}
      height={ROWS * CELL}
      viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
      aria-label="Sample colorwork pattern preview"
      role="img"
    >
      {cells.map(({ row, col, color }) => (
        <rect
          key={`${row}-${col}`}
          x={col * CELL}
          y={row * CELL}
          width={CELL}
          height={CELL}
          fill={color}
        />
      ))}
    </svg>
  );
}
