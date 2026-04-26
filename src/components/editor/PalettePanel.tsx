"use client";

import { useMemo, useState } from "react";
import { useProjectStore } from "@/store/projectStore";

export default function PalettePanel() {
  const {
    palette,
    activeColorId,
    activeTool,
    setActiveColor,
    gridData,
    applyColorRemap,
  } = useProjectStore();

  // ── Remap section state ───────────────────────────
  const [remapOpen, setRemapOpen]   = useState(false);
  const [remaps, setRemaps]         = useState<Record<string, string | null>>({});
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  // Unique non-null colors currently painted in the grid
  const usedColors = useMemo(() => {
    const seen = new Set<string>();
    for (const row of gridData) {
      for (const cell of row) {
        if (cell !== null) seen.add(cell);
      }
    }
    return Array.from(seen);
  }, [gridData]);

  const pendingCount = Object.keys(remaps).length;

  const handleApply = () => {
    applyColorRemap(remaps);
    setRemaps({});
    setOpenPicker(null);
  };

  const handleReset = () => {
    setRemaps({});
    setOpenPicker(null);
  };

  const setReplacement = (fromHex: string, toHex: string | null) => {
    setRemaps((prev) => ({ ...prev, [fromHex]: toHex }));
    setOpenPicker(null);
  };

  const clearReplacement = (fromHex: string) => {
    setRemaps((prev) => {
      const next = { ...prev };
      delete next[fromHex];
      return next;
    });
  };

  // Look up a palette name for a hex, falling back to the hex string
  const nameForHex = (hex: string) =>
    palette.find((p) => p.hex.toLowerCase() === hex.toLowerCase())?.name ?? hex;

  return (
    <aside className="w-44 flex-shrink-0 border-r border-charcoal/10 bg-cream flex flex-col overflow-y-auto">

      {/* ── Active palette ─────────────────────────── */}
      <div className="p-4">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest text-charcoal/40 mb-3"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Colors
        </p>

        <div className="space-y-1">
          {palette.map((color) => {
            const isActive = color.id === activeColorId && activeTool !== "eraser";
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => setActiveColor(color.id)}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-plum/10 ring-1 ring-inset ring-plum/20"
                    : "hover:bg-charcoal/5"
                }`}
              >
                <div
                  className="w-6 h-6 rounded flex-shrink-0 border border-charcoal/10 shadow-sm"
                  style={{ background: color.hex }}
                />
                <span
                  className="text-xs text-charcoal truncate leading-tight"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {color.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-charcoal/8 mx-4" />

      {/* ── Remap Colors section ───────────────────── */}
      <div className="p-4">

        {/* Section header / toggle */}
        <button
          type="button"
          onClick={() => { setRemapOpen((v) => !v); setOpenPicker(null); }}
          className="w-full flex items-center justify-between group mb-1"
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest text-charcoal/40 group-hover:text-charcoal/60 transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Remap Colors
          </p>
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            className={`text-charcoal/30 transition-transform ${remapOpen ? "rotate-180" : ""}`}
          >
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {remapOpen && (
          <div className="mt-2 space-y-3">
            {usedColors.length === 0 ? (
              <p className="text-[11px] text-charcoal/35 leading-tight" style={{ fontFamily: "var(--font-body)" }}>
                No colors painted yet.
              </p>
            ) : (
              <>
                {usedColors.map((fromHex) => {
                  const toHex = remaps[fromHex];          // undefined = no change, null = erase
                  const hasPending = fromHex in remaps;
                  // When erase is selected (null), show the canvas background colour
                  const displayTo = !hasPending ? fromHex : (toHex ?? "#F5F0E8");
                  const isPickerOpen = openPicker === fromHex;

                  return (
                    <div key={fromHex}>
                      {/* Color row */}
                      <div className="flex items-center gap-1.5">
                        {/* From swatch */}
                        <div
                          className="w-5 h-5 rounded flex-shrink-0 border border-charcoal/10 shadow-sm"
                          style={{ background: fromHex }}
                        />

                        {/* Arrow */}
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-charcoal/25 flex-shrink-0">
                          <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>

                        {/* To swatch — click to open picker */}
                        <button
                          type="button"
                          onClick={() => setOpenPicker(isPickerOpen ? null : fromHex)}
                          title="Choose replacement color"
                          className={`w-5 h-5 rounded flex-shrink-0 border shadow-sm transition-all ${
                            hasPending
                              ? "border-plum/40 ring-1 ring-plum/25"
                              : "border-charcoal/10 hover:border-charcoal/25"
                          }`}
                          style={{ background: displayTo ?? "#F5F0E8" }}
                        />

                        {/* Color name */}
                        <span
                          className="text-[11px] text-charcoal/55 truncate flex-1 leading-tight"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {nameForHex(fromHex)}
                        </span>

                        {/* Clear pending remap */}
                        {hasPending && (
                          <button
                            type="button"
                            onClick={() => clearReplacement(fromHex)}
                            title="Clear replacement"
                            className="text-charcoal/25 hover:text-charcoal/60 transition-colors flex-shrink-0"
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Inline palette picker */}
                      {isPickerOpen && (
                        <div className="mt-1.5 ml-6 p-1.5 rounded-lg border border-charcoal/10 bg-parchment/60">
                          <p className="text-[9px] text-charcoal/35 mb-1.5 font-medium uppercase tracking-wide" style={{ fontFamily: "var(--font-body)" }}>
                            Replace with
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {/* Palette colors */}
                            {palette.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setReplacement(fromHex, p.hex)}
                                title={p.name}
                                className={`w-6 h-6 rounded border transition-all hover:scale-110 ${
                                  displayTo === p.hex
                                    ? "border-plum/60 ring-1 ring-plum/30 scale-110"
                                    : "border-charcoal/10"
                                }`}
                                style={{ background: p.hex }}
                              />
                            ))}
                            {/* Erase (set to null) */}
                            <button
                              type="button"
                              onClick={() => setReplacement(fromHex, null)}
                              title="Erase (remove color)"
                              className={`w-6 h-6 rounded border transition-all hover:scale-110 flex items-center justify-center ${
                                toHex === null && hasPending
                                  ? "border-plum/60 ring-1 ring-plum/30 scale-110 bg-white"
                                  : "border-charcoal/10 bg-white"
                              }`}
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 2l6 6M8 2l-6 6" stroke="#2C282540" strokeWidth="1.4" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Apply / Reset */}
                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={pendingCount === 0}
                    className="flex-1 py-1.5 rounded-lg bg-plum text-cream text-[11px] font-medium hover:bg-plum/85 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Apply
                  </button>
                  {pendingCount > 0 && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-2 py-1.5 rounded-lg text-[11px] text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
