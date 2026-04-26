"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import type { RepeatDirection } from "@/types";

const CELL = 20;          // px per cell
const LEFT_MARGIN = 44;   // space for row numbers
const BOTTOM_MARGIN = 28; // space for stitch numbers

// How often to show a number label along each axis
function shouldLabel(n: number, total: number): boolean {
  return n === 1 || n === total || n % 5 === 0;
}

interface RepeatInfo {
  direction: RepeatDirection;
  startCol: number;
  startRow: number;
  width: number;
  height: number;
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  gridData: (string | null)[][],
  rows: number,
  cols: number,
  repeat: RepeatInfo,
  showRepeat: boolean
) {
  ctx.clearRect(0, 0, LEFT_MARGIN + cols * CELL, rows * CELL + BOTTOM_MARGIN);

  // ── Cells ──────────────────────────────────────────
  for (let dataRow = 0; dataRow < rows; dataRow++) {
    const visualRow = rows - 1 - dataRow; // Row 1 at bottom
    for (let col = 0; col < cols; col++) {
      const x = LEFT_MARGIN + col * CELL;
      const y = visualRow * CELL;
      const color = gridData[dataRow]?.[col];

      ctx.fillStyle = color ?? "#F5F0E8";
      ctx.fillRect(x, y, CELL, CELL);

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

  // ── Repeat tile indicator ──────────────────────────
  if (showRepeat) {
    drawRepeatIndicator(ctx, rows, cols, repeat);
  }
}

function drawRepeatIndicator(
  ctx: CanvasRenderingContext2D,
  rows: number,
  cols: number,
  { direction, startCol, startRow, width, height }: RepeatInfo
) {
  // Clamp tile dimensions to what's actually available
  const tileW = Math.min(width, cols - startCol);
  const tileH = Math.min(height, rows - startRow);
  if (tileW <= 0 || tileH <= 0) return;

  // Canvas coordinates for the tile region
  // Data rows are bottom-up: dataRow 0 = visual bottom
  // Tile covers data rows startRow..startRow+tileH-1
  // → visual rows (rows-1-startRow) down to (rows-startRow-tileH)
  const tileVisualTop = (rows - startRow - tileH) * CELL;
  const tileVisualLeft = LEFT_MARGIN + startCol * CELL;
  const tilePixelW = tileW * CELL;
  const tilePixelH = tileH * CELL;

  // What region to frame depends on direction
  let frameX: number, frameY: number, frameW: number, frameH: number;

  if (direction === "width") {
    // Vertical stripe: all rows, just the tile columns
    frameX = tileVisualLeft;
    frameY = 0;
    frameW = tilePixelW;
    frameH = rows * CELL;
  } else if (direction === "height") {
    // Horizontal band: all columns, just the tile rows
    frameX = LEFT_MARGIN;
    frameY = tileVisualTop;
    frameW = cols * CELL;
    frameH = tilePixelH;
  } else {
    // Both: just the tile box
    frameX = tileVisualLeft;
    frameY = tileVisualTop;
    frameW = tilePixelW;
    frameH = tilePixelH;
  }

  // Dim everything outside the framed region
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.18)";

  // Above the frame
  if (frameY > 0) {
    ctx.fillRect(LEFT_MARGIN, 0, cols * CELL, frameY);
  }
  // Below the frame
  const frameBotY = frameY + frameH;
  if (frameBotY < rows * CELL) {
    ctx.fillRect(LEFT_MARGIN, frameBotY, cols * CELL, rows * CELL - frameBotY);
  }
  // Left of frame
  if (frameX > LEFT_MARGIN) {
    ctx.fillRect(LEFT_MARGIN, frameY, frameX - LEFT_MARGIN, frameH);
  }
  // Right of frame
  const frameRightX = frameX + frameW;
  if (frameRightX < LEFT_MARGIN + cols * CELL) {
    ctx.fillRect(frameRightX, frameY, LEFT_MARGIN + cols * CELL - frameRightX, frameH);
  }
  ctx.restore();

  // Dashed plum border around the framed region
  ctx.save();
  ctx.strokeStyle = "#6B2D5B";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.strokeRect(frameX + 1, frameY + 1, frameW - 2, frameH - 2);
  ctx.setLineDash([]);

  // Small label in top-left corner of the frame
  const label =
    direction === "width" ? "↔ tile" :
    direction === "height" ? "↕ tile" : "tile";
  ctx.fillStyle = "#6B2D5B";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(label, frameX + 4, frameY + 4);
  ctx.restore();
}

export default function GridCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isPainting = useRef(false);
  const [scale, setScale] = useState(1);

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
    fillAll,
    fitToView,
    repeatEnabled,
    repeatDirection,
    repeatStartCol,
    repeatStartRow,
    repeatWidth,
    repeatHeight,
  } = useProjectStore();

  const { stitches: cols, rows } = grid;

  const activeColor =
    activeTool === "eraser"
      ? null
      : palette.find((c) => c.id === activeColorId)?.hex ?? null;

  const repeat: RepeatInfo = {
    direction: repeatDirection,
    startCol: repeatStartCol,
    startRow: repeatStartRow,
    width: repeatWidth,
    height: repeatHeight,
  };

  const canvasWidth  = LEFT_MARGIN + cols * CELL;
  const canvasHeight = rows * CELL + BOTTOM_MARGIN;

  // ── Redraw whenever grid or repeat settings change ─
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gridData.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGrid(ctx, gridData, rows, cols, repeat, repeatEnabled);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridData, rows, cols, repeatEnabled, repeatDirection, repeatStartCol, repeatStartRow, repeatWidth, repeatHeight, fitToView]);

  // ── Fit-to-view: observe wrapper size and compute scale ─
  useEffect(() => {
    if (!fitToView) {
      setScale(1);
      return;
    }
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const update = () => {
      const { width, height } = wrapper.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setScale(Math.min(width / canvasWidth, height / canvasHeight));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [fitToView, canvasWidth, canvasHeight]);

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

  const applyTool = useCallback(
    (row: number, col: number) => {
      if (activeTool === "paint" || activeTool === "eraser") {
        if (repeatEnabled) {
          // Restrict painting to the tile region
          const colOk = repeatDirection === "height"
            || (col >= repeatStartCol && col < repeatStartCol + repeatWidth);
          const rowOk = repeatDirection === "width"
            || (row >= repeatStartRow && row < repeatStartRow + repeatHeight);
          if (!colOk || !rowOk) return;
        }
        paintCell(row, col, activeColor);
      } else if (activeTool === "fill-row") {
        if (repeatEnabled) {
          // Constrain to tile column range when direction includes width
          const useColRange = repeatDirection === "width" || repeatDirection === "both";
          const colStart = useColRange ? repeatStartCol : 0;
          const colEnd   = useColRange ? repeatStartCol + repeatWidth : cols;
          fillRow(row, activeColor, colStart, colEnd);
        } else {
          fillRow(row, activeColor);
        }
      } else if (activeTool === "fill-col") {
        if (repeatEnabled) {
          // Constrain to tile row range when direction includes height
          const useRowRange = repeatDirection === "height" || repeatDirection === "both";
          const rowStart = useRowRange ? repeatStartRow : 0;
          const rowEnd   = useRowRange ? repeatStartRow + repeatHeight : rows;
          fillCol(col, activeColor, rowStart, rowEnd);
        } else {
          fillCol(col, activeColor);
        }
      } else if (activeTool === "fill-all") {
        if (repeatEnabled) {
          const colStart = (repeatDirection === "width"  || repeatDirection === "both") ? repeatStartCol : 0;
          const colEnd   = (repeatDirection === "width"  || repeatDirection === "both") ? repeatStartCol + repeatWidth  : cols;
          const rowStart = (repeatDirection === "height" || repeatDirection === "both") ? repeatStartRow : 0;
          const rowEnd   = (repeatDirection === "height" || repeatDirection === "both") ? repeatStartRow + repeatHeight : rows;
          fillAll(activeColor, colStart, colEnd, rowStart, rowEnd);
        } else {
          fillAll(activeColor);
        }
      }
    },
    [activeTool, activeColor, paintCell, fillRow, fillCol, fillAll,
     repeatEnabled, repeatDirection, repeatStartCol, repeatStartRow, repeatWidth, repeatHeight, cols, rows]
  );

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
      if (activeTool === "fill-row" || activeTool === "fill-col" || activeTool === "fill-all") return;
      const cell = getCell(e);
      if (!cell) return;
      applyTool(cell.row, cell.col);
    },
    [activeTool, getCell, applyTool]
  );

  const handleMouseUp = useCallback(() => { isPainting.current = false; }, []);
  const handleMouseLeave = useCallback(() => { isPainting.current = false; }, []);

  const cursorStyle = activeTool === "eraser" ? "cell" : "crosshair";

  if (gridData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-charcoal/30 text-sm">
        Loading grid…
      </div>
    );
  }

  // ── Fit-to-view mode ───────────────────────────────
  if (fitToView) {
    return (
      // Outer div fills the canvas area; ResizeObserver measures it
      <div
        ref={wrapperRef}
        style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* Inner div takes up only the scaled canvas dimensions so flex-centering works */}
        <div style={{ position: "relative", width: canvasWidth * scale, height: canvasHeight * scale, flexShrink: 0 }}>
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              cursor: "default",
            }}
          />
        </div>
      </div>
    );
  }

  // ── Normal (scrollable) mode ───────────────────────
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
