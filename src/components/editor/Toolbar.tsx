"use client";

import { useProjectStore } from "@/store/projectStore";
import type { Tool } from "@/types";

const TOOLS: { id: Tool; label: string; icon: string; title: string }[] = [
  { id: "paint",    label: "Paint",       icon: "✦", title: "Paint cells" },
  { id: "eraser",   label: "Eraser",      icon: "◻", title: "Erase cells" },
  { id: "fill-row", label: "Fill Row",    icon: "↔", title: "Fill an entire row" },
  { id: "fill-col", label: "Fill Column", icon: "↕", title: "Fill an entire column" },
];

export default function Toolbar() {
  const {
    activeTool,
    setActiveTool,
    history,
    redoStack,
    undo,
    redo,
    clearGrid,
  } = useProjectStore();

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;

  const handleClear = () => {
    if (window.confirm("Clear the entire grid? This can be undone.")) {
      clearGrid();
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-charcoal/10 bg-cream flex-shrink-0 flex-wrap">

      {/* Tool buttons */}
      <div className="flex items-center gap-1 rounded-lg border border-charcoal/10 p-0.5 bg-parchment/60">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            title={tool.title}
            onClick={() => setActiveTool(tool.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTool === tool.id
                ? "bg-white text-plum shadow-sm"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span aria-hidden="true">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-charcoal/10 mx-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
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

      {/* Divider */}
      <div className="w-px h-5 bg-charcoal/10 mx-1" />

      {/* Clear grid */}
      <button
        type="button"
        onClick={handleClear}
        className="px-3 py-1.5 rounded-md text-xs font-medium text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Clear grid
      </button>
    </div>
  );
}
