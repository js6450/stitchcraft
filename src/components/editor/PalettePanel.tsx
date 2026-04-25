"use client";

import { useProjectStore } from "@/store/projectStore";

export default function PalettePanel() {
  const { palette, activeColorId, activeTool, setActiveColor } = useProjectStore();

  return (
    <aside className="w-44 flex-shrink-0 border-r border-charcoal/10 bg-cream flex flex-col overflow-y-auto">
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
    </aside>
  );
}
