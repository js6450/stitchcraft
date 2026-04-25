"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";
import type { PaletteColor } from "@/types";

/* ── Individual color row ────────────────────────────── */

interface ColorRowProps {
  color: PaletteColor;
  isActive: boolean;
  canRemove: boolean;
  onSelect: () => void;
  onHexChange: (hex: string) => void;
  onNameChange: (name: string) => void;
  onRemove: () => void;
}

function ColorRow({
  color,
  isActive,
  canRemove,
  onSelect,
  onHexChange,
  onNameChange,
  onRemove,
}: ColorRowProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
        isActive
          ? "border-plum bg-plum/5"
          : "border-charcoal/10 bg-white hover:border-charcoal/20"
      }`}
    >
      {/* Color swatch — click to open native color picker */}
      <button
        type="button"
        onClick={() => pickerRef.current?.click()}
        className="w-10 h-10 rounded-lg flex-shrink-0 border-2 border-white/60 shadow-sm hover:scale-105 transition-transform cursor-pointer"
        style={{ background: color.hex }}
        aria-label={`Change color: ${color.name}`}
      />
      {/* Hidden native color input */}
      <input
        ref={pickerRef}
        type="color"
        value={color.hex}
        onChange={(e) => onHexChange(e.target.value)}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Color name — inline editable */}
      <input
        type="text"
        value={color.name}
        onChange={(e) => onNameChange(e.target.value)}
        onFocus={onSelect}
        placeholder="Color name"
        className="flex-1 bg-transparent text-charcoal text-sm font-medium outline-none placeholder:text-charcoal/30 border-b border-transparent focus:border-charcoal/20 pb-0.5 transition-colors"
        style={{ fontFamily: "var(--font-body)" }}
      />

      {/* Hex value (read-only display) */}
      <span
        className="text-xs text-charcoal/40 font-mono w-16 text-right flex-shrink-0 select-all"
        onClick={() => pickerRef.current?.click()}
        style={{ cursor: "pointer" }}
        title="Click to change color"
      >
        {color.hex.toUpperCase()}
      </span>

      {/* Remove button */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-charcoal/25 hover:text-charcoal/60 transition-colors text-xl leading-none flex-shrink-0 ml-1"
          aria-label={`Remove ${color.name}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */

export default function ColorPaletteSetup() {
  const router = useRouter();
  const {
    settings,
    palette,
    activeColorId,
    addColor,
    removeColor,
    updateColorHex,
    updateColorName,
    setActiveColor,
  } = useProjectStore();

  const handleContinue = () => {
    router.push("/editor");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs font-semibold tracking-widest uppercase text-rose-gold mb-3"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {settings.name}
        </p>
        <h1
          className="text-3xl font-normal text-charcoal tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Color Palette
        </h1>
        <p
          className="mt-2 text-charcoal/50"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Build the palette for your colorwork design. Click a swatch to change
          its color, or rename it to match your yarn.
        </p>
      </div>

      {/* Color list */}
      <div className="space-y-2 mb-4">
        {palette.map((color) => (
          <ColorRow
            key={color.id}
            color={color}
            isActive={color.id === activeColorId}
            canRemove={palette.length > 1}
            onSelect={() => setActiveColor(color.id)}
            onHexChange={(hex) => updateColorHex(color.id, hex)}
            onNameChange={(name) => updateColorName(color.id, name)}
            onRemove={() => removeColor(color.id)}
          />
        ))}
      </div>

      {/* Add color button */}
      {palette.length < 10 && (
        <button
          type="button"
          onClick={addColor}
          className="w-full py-3 rounded-xl border-2 border-dashed border-charcoal/20 text-charcoal/50 text-sm font-medium hover:border-plum/40 hover:text-plum transition-colors"
          style={{ fontFamily: "var(--font-body)" }}
        >
          + Add a color
        </button>
      )}

      {/* Palette preview */}
      <div className="mt-8 mb-10">
        <p
          className="text-xs text-charcoal/40 mb-2 uppercase tracking-wider"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Preview
        </p>
        <div className="flex rounded-xl overflow-hidden h-10 shadow-sm">
          {palette.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => setActiveColor(color.id)}
              className="flex-1 transition-opacity hover:opacity-90"
              style={{ background: color.hex }}
              title={color.name}
              aria-label={`Select ${color.name}`}
            />
          ))}
        </div>
        <div className="flex mt-1.5">
          {palette.map((color) => (
            <p
              key={color.id}
              className="flex-1 text-center text-[10px] text-charcoal/40 truncate px-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {color.name}
            </p>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-charcoal/10">
        <button
          type="button"
          onClick={() => router.push("/design")}
          className="text-sm text-charcoal/50 hover:text-charcoal transition-colors"
          style={{ fontFamily: "var(--font-body)" }}
        >
          ← Back to setup
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="rounded-xl bg-plum px-6 py-3 text-cream text-sm font-medium hover:bg-plum/90 transition-colors"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Start Designing →
        </button>
      </div>
    </div>
  );
}
