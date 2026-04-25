"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProjectStore } from "@/store/projectStore";
import LogoMark from "@/components/landing/LogoMark";
import { COLORS } from "@/lib/theme";
import PalettePanel from "./PalettePanel";
import Toolbar from "./Toolbar";
import GridCanvas from "./GridCanvas";

export default function EditorLayout() {
  const { settings, grid, initGridData, undo, redo } = useProjectStore();

  // Initialise grid data on mount (no-op if already the right size)
  useEffect(() => {
    initGridData();
  }, [initGridData]);

  // Keyboard shortcuts: ⌘Z / ⌘⇧Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.key !== "z") return;
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-cream">

      {/* ── Top bar ───────────────────────────────── */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-charcoal/10 flex-shrink-0">
        <Link href="/palette" className="flex items-center gap-2 no-underline group flex-shrink-0">
          <LogoMark size={20} color={COLORS.plum} sparkle={COLORS.gold} />
          <span
            className="text-charcoal text-sm tracking-wide group-hover:text-plum transition-colors hidden sm:inline"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Stitchcraft
          </span>
        </Link>

        <div className="w-px h-4 bg-charcoal/15 flex-shrink-0" />

        {/* Project name + grid size */}
        <div className="flex-1 min-w-0">
          <span
            className="text-sm font-medium text-charcoal truncate block"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {settings.name || "Untitled Project"}
          </span>
          <span
            className="text-[10px] text-charcoal/40"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {grid.stitches} sts × {grid.rows} rows
          </span>
        </div>

        {/* Export placeholder — wired up in Phase 4 */}
        <button
          type="button"
          disabled
          className="ml-auto flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-plum/10 text-plum/50 cursor-not-allowed"
          style={{ fontFamily: "var(--font-body)" }}
          title="Coming in Phase 4"
        >
          Export PDF
        </button>
      </header>

      {/* ── Body ──────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: palette */}
        <PalettePanel />

        {/* Right: toolbar + canvas */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Toolbar />

          {/* Scrollable canvas area */}
          <div className="flex-1 overflow-auto p-6 bg-parchment/40">
            <GridCanvas />
          </div>
        </div>
      </div>
    </div>
  );
}
