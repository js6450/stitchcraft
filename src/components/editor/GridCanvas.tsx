"use client";

import { useRef, useEffect, useCallback } from "react";
import { useProjectStore } from "@/store/projectStore";

const CELL = 20;         // px per cell
const LEFT_MARGIN = 44;  // space for row numbers
const BOTTOM_MARGIN = 28; // space for stitch numbers

// How often to show a number label along each axis
function shouldLabel(n: number, total: number): boolean {
  return n === 1 || n === total || n % 5 === 0;
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  gridData: (string | null)[][],
  rows: number,
  cols: number
) {
  ctx.clearRect(0, 0, LEFT_MARGIN + cols * CELL, rows * CELL + BOTTOM_MARGIN);

  // ── Cells ──────────────────────────────────────────
  for (let dataRow = 0; dataRow < rows; dataRow++) {
    // Row 1 is at the bottom — flip the visual order
    const visualRow = rows - 1 - dataRow;
    for (let col = 0; col < cols; col++) {
      const x = LEFT_MARGIN + col * CELL;
      const y = visualRow * CELL;
      const color = gridData[dataRow]?.[col];

      ctx.fillStyle = color ?? "#F5F0E8";
      ctx.fillRect(x, y, CELL, CELL);

      // Grid lines
      ctx.strokeStyle = "rgba(44,40,37,0.1)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x + 0.25, y + 0.25, CELL - 0.5, CELL - 0.5);
    }
  }

  // ── Row numbers (left margin, bottom-up) ───────────
  ctx.fillStyle = "#2C2825";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let dataRow = 0; dataRow < rows; dataRow++) {
    const rowNum = dataRow + 1;
    if (shouldLabel(rowNum, rows)) {
      const visualRow = rows - 1 - dataRow;
      ctx.fillText(String(rowNum), LEFT_MARGIN - 6, visualRow * CELL + CELL / 2);
    }
  }

  // ── Stitch numbers (bottom margin) ─────────────────
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let col = 0; col < cols; col++) {
    const stitchNum = col + 1;
    if (shouldLabel(stitchNum, cols)) {
      ctx.fillText(
        String(stitchNum),
        LEFT_MARGIN + col * CELL + CELL / 2,
        rows * CELL + 6
      );
    }
  }
}

export default function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPainting = useRef(false);

  const {
    gridData,
    grid,
    activeTool,
    palette,
    activeColorId,
    saveSnapshot,
    paintCell,
    fillRow,
    fillCol,
  } = useProjectStore();

  const { stitches: cols, rows } = grid;

  // Active color hex (null when eraser is active)
  const activeColor =
    activeTool === "eraser"
      ? null
      : palette.find((c) => c.id === activeColorId)?.hex ?? null;

  // ── Redraw whenever gridData changes ───────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gridData.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGrid(ctx, gridData, rows, cols);
  }, [gridData, rows, cols]);

  // ── Canvas sizing ──────────────────────────────────
  const canvasWidth = LEFT_MARGIN + cols * CELL;
  const canvasHeight = rows * CELL + BOTTOM_MARGIN;

  // ── Hit testing ────────────────────────────────────
  const getCell = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < LEFT_MARGIN || y >= rows * CELL) return null;

      const col = Math.floor((x - LEFT_MARGIN) / CELL);
      const visualRow = Math.floor(y / CELL);
      const dataRow = rows - 1 - visualRow;

      if (col < 0 || col >= cols || dataRow < 0 || dataRow >= rows) return null;
      return { row: dataRow, col };
    },
    [rows, cols]
  );

  // ── Apply the active tool to a cell ───────────────
  const applyTool = useCallback(
    (row: number, col: number) => {
      if (activeTool === "paint" || activeTool === "eraser") {
        paintCell(row, col, activeColor);
      } else if (activeTool === "fill-row") {
        fillRow(row, activeColor);
      } else if (activeTool === "fill-col") {
        fillCol(col, activeColor);
      }
    },
    [activeTool, activeColor, paintCell, fillRow, fillCol]
  );

  // ── Mouse handlers ─────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCell(e);
      if (!cell) return;
      saveSnapshot();
      isPainting.current = true;
      applyTool(cell.row, cell.col);
    },
    [getCell, saveSnapshot, applyTool]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isPainting.current) return;
      // Fill tools don't support drag — only paint/eraser do
      if (activeTool === "fill-row" || activeTool === "fill-col") return;
      const cell = getCell(e);
      if (!cell) return;
      applyTool(cell.row, cell.col);
    },
    [activeTool, getCell, applyTool]
  );

  const handleMouseUp = useCallback(() => {
    isPainting.current = false;
  }, []);

  // Release painting if mouse leaves the canvas
  const handleMouseLeave = useCallback(() => {
    isPainting.current = false;
  }, []);

  // Cursor style per tool
  const cursorStyle =
    activeTool === "eraser"
      ? "cell"
      : activeTool === "fill-row" || activeTool === "fill-col"
      ? "crosshair"
      : "crosshair";

  if (gridData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-charcoal/30 text-sm">
        Loading grid…
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ cursor: cursorStyle, display: "block" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
}
