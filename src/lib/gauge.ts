import type { Unit, GridDimensions } from "@/types";

const INCHES_PER_CM = 1 / 2.54;

/**
 * Convert a dimension to inches for internal calculation.
 * All gauges are stored as stitches/rows per 4 inches.
 */
function toInches(value: number, unit: Unit): number {
  return unit === "cm" ? value * INCHES_PER_CM : value;
}

/**
 * Calculate the grid dimensions from project settings.
 * gauge values are per 4 inches (as is standard in knitting).
 */
export function calculateGrid(
  width: number,
  height: number,
  unit: Unit,
  stitchGauge: number,
  rowGauge: number
): GridDimensions {
  const widthIn = toInches(width, unit);
  const heightIn = toInches(height, unit);

  const stitches = Math.round((widthIn / 4) * stitchGauge);
  const rows = Math.round((heightIn / 4) * rowGauge);

  return { stitches, rows };
}

/**
 * Convert cm ↔ inches for the dimension inputs.
 */
export function convertDimension(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  const raw = from === "cm" ? value * INCHES_PER_CM : value * 2.54;
  return Math.round(raw * 10) / 10; // one decimal place
}
