"use client";

import { useRef, useEffect, useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import type { Tool, RepeatDirection } from "@/types";

// Approximate px width of the toolbar row with all labels visible.
// Below this threshold we drop to icon-only mode.
const LABEL_THRESHOLD = 860;

const TOOLS: { id: Tool; label: string; icon: string; title: string }[] = [
  { id: "paint",    label: "Paint",       icon: "✦", title: "Paint cells" },
  { id: "eraser",   label: "Eraser",      icon: "◻", title: "Erase cells" },
  { id: "fill-row", label: "Fill Row",    icon: "↔", title: "Fill an entire row" },
  { id: "fill-col", label: "Fill Column", icon: "↕", title: "Fill an entire column" },
  { id: "fill-all", label: "Fill All",    icon: "■", title: "Fill entire work (or tile in Pattern mode)" },
];

const REPEAT_DIRECTIONS: { id: RepeatDirection; label: string }[] = [
  { id: "width",  label: "Width-wise" },
  { id: "height", label: "Height-wise" },
  { id: "both",   label: "Both" },
];

// Clamp a numeric input value to [min, max]
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function Toolbar() {
  const {
    activeTool,
    setActiveTool,
    history,
    redoStack,
    undo,
    redo,
    clearGrid,
    grid,
    fitToView,
    setFitToView,
    repeatEnabled,
    repeatDirection,
    repeatStartCol,
    repeatStartRow,
    repeatWidth,
    repeatHeight,
    setRepeatEnabled,
    setRepeatDirection,
    setRepeatStartCol,
    setRepeatStartRow,
    setRepeatWidth,
    setRepeatHeight,
    applyRepeat,
  } = useProjectStore();

  const { stitches: cols, rows } = grid;

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;

  const showHoriz = repeatDirection === "width" || repeatDirection === "both";
  const showVert  = repeatDirection === "height" || repeatDirection === "both";

  // Compact mode: hide labels when the toolbar row is too narrow to show them
  const rowRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCompact(entry.contentRect.width < LABEL_THRESHOLD);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleClear = () => {
    if (window.confirm("Clear the entire grid? This can be undone.")) {
      clearGrid();
    }
  };


  return (
    <div className="flex flex-col border-b border-charcoal/10 bg-cream flex-shrink-0">

      {/* ── Row 1: tools + undo/redo + clear ─────────── */}
      <div ref={rowRef} className="flex items-center gap-2 px-4 py-2.5 flex-wrap">

        {/* Tool buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-charcoal/10 p-0.5 bg-parchment/60 flex-shrink-0">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              title={tool.title}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-1.5 ${compact ? "px-2" : "px-3"} py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTool === tool.id
                  ? "bg-white text-plum shadow-sm"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span aria-hidden="true">{tool.icon}</span>
              <span className={compact ? "hidden" : undefined}>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Clear Grid */}
        <button
          type="button"
          onClick={handleClear}
          className={`flex items-center gap-1.5 ${compact ? "px-2" : "px-3"} py-1.5 rounded-md text-xs font-medium text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5 transition-colors flex-shrink-0`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <polyline points="1,3 13,3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M3 3l.75 8.5a1 1 0 001 .9h4.5a1 1 0 001-.9L11 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span className={compact ? "hidden" : undefined}>Clear Grid</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-charcoal/10 mx-1 flex-shrink-0" />

        {/* Create Pattern toggle */}
        <button
          type="button"
          onClick={() => setRepeatEnabled(!repeatEnabled)}
          title={repeatEnabled ? "Switch to freehand mode" : "Define a repeating tile"}
          className={`flex items-center gap-1.5 ${compact ? "px-2" : "px-3"} py-1.5 rounded-md text-xs font-medium transition-colors flex-shrink-0 ${
            repeatEnabled
              ? "bg-plum/10 text-plum ring-1 ring-plum/20"
              : "text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {/* 2×2 tile grid icon — bottom-right tile dashed to suggest repetition */}
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1"   y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="8"   y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="1"   y="8" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="8"   y="8" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 1.2"/>
          </svg>
          <span className={compact ? "hidden" : undefined}>Create Pattern</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-charcoal/10 mx-1 flex-shrink-0" />

        {/* Fit to View toggle */}
        <button
          type="button"
          onClick={() => setFitToView(!fitToView)}
          title={fitToView ? "Back to grid view" : "Fit entire work to screen"}
          className={`flex items-center gap-1.5 ${compact ? "px-2" : "px-3"} py-1.5 rounded-md text-xs font-medium transition-colors flex-shrink-0 ${
            fitToView
              ? "bg-charcoal/8 text-charcoal ring-1 ring-charcoal/15"
              : "text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {fitToView ? (
            /* Compress icon — arrows pointing inward */
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 1v4H1M9 1v4h4M5 13v-4H1M9 13v-4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            /* Expand icon — arrows pointing outward */
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 5V1h4M1 9v4h4M13 5V1H9M13 9v4H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className={compact ? "hidden" : undefined}>Fit to View</span>
        </button>

        {/* Undo / Redo — pinned to the right */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-px h-5 bg-charcoal/10 mr-1" />
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
            className="p-1.5 rounded-md text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Undo"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 7 C3 4.2 5.2 2 8 2 C10.8 2 13 4.2 13 7 C13 9.8 10.8 12 8 12 H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 9.5 L3 7 L6 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (⌘⇧Z)"
            className="p-1.5 rounded-md text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Redo"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 7 C13 4.2 10.8 2 8 2 C5.2 2 3 4.2 3 7 C3 9.8 5.2 12 8 12 H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 9.5 L13 7 L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Row 2: pattern repeat controls (only when repeat is enabled) ── */}
      {repeatEnabled && (
      <div className="flex items-center gap-3 px-4 py-2 border-t border-charcoal/6 bg-parchment/30 flex-wrap">

        {/* "Repeat" label */}
        <span
          className="text-xs font-medium text-charcoal/50 flex-shrink-0"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Pattern
        </span>

        {/* Direction segmented control */}
        <div className="flex items-center gap-0.5 rounded-lg border border-charcoal/10 p-0.5 bg-parchment/60">
          {REPEAT_DIRECTIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setRepeatDirection(d.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                repeatDirection === d.id
                  ? "bg-white text-plum shadow-sm"
                  : "text-charcoal/55 hover:text-charcoal"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Horizontal repeat inputs (width or both) */}
        {showHoriz && (
          <>
            <div className="w-px h-4 bg-charcoal/10" />
            <label
              className="flex items-center gap-1.5 text-xs text-charcoal/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              from st
              <input
                type="number"
                min={1}
                max={cols}
                value={repeatStartCol + 1}
                onChange={(e) =>
                  setRepeatStartCol(clamp(Number(e.target.value) - 1, 0, cols - 1))
                }
                className="w-14 px-1.5 py-0.5 rounded border border-charcoal/15 bg-white text-charcoal text-xs text-center focus:outline-none focus:border-plum/50 transition-colors"
              />
            </label>
            <label
              className="flex items-center gap-1.5 text-xs text-charcoal/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              every
              <input
                type="number"
                min={1}
                max={cols}
                value={repeatWidth}
                onChange={(e) =>
                  setRepeatWidth(clamp(Number(e.target.value), 1, cols))
                }
                className="w-14 px-1.5 py-0.5 rounded border border-charcoal/15 bg-white text-charcoal text-xs text-center focus:outline-none focus:border-plum/50 transition-colors"
              />
              sts
            </label>
          </>
        )}

        {/* Vertical repeat inputs (height or both) */}
        {showVert && (
          <>
            <div className="w-px h-4 bg-charcoal/10" />
            <label
              className="flex items-center gap-1.5 text-xs text-charcoal/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              from row
              <input
                type="number"
                min={1}
                max={rows}
                value={repeatStartRow + 1}
                onChange={(e) =>
                  setRepeatStartRow(clamp(Number(e.target.value) - 1, 0, rows - 1))
                }
                className="w-14 px-1.5 py-0.5 rounded border border-charcoal/15 bg-white text-charcoal text-xs text-center focus:outline-none focus:border-plum/50 transition-colors"
              />
            </label>
            <label
              className="flex items-center gap-1.5 text-xs text-charcoal/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              every
              <input
                type="number"
                min={1}
                max={rows}
                value={repeatHeight}
                onChange={(e) =>
                  setRepeatHeight(clamp(Number(e.target.value), 1, rows))
                }
                className="w-14 px-1.5 py-0.5 rounded border border-charcoal/15 bg-white text-charcoal text-xs text-center focus:outline-none focus:border-plum/50 transition-colors"
              />
              rows
            </label>
          </>
        )}

        {/* Apply button */}
        <button
          type="button"
          onClick={applyRepeat}
          className="ml-auto flex-shrink-0 px-3.5 py-1.5 rounded-lg bg-plum text-cream text-xs font-medium hover:bg-plum/85 active:bg-plum/95 transition-colors shadow-sm"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Apply Pattern
        </button>
      </div>
      )}
    </div>
  );
}
