"use client";

import { useProjectStore } from "@/store/projectStore";
import { YARN_WEIGHTS } from "@/types";
import { calculateGrid } from "@/lib/gauge";
import type { YarnWeight, Unit } from "@/types";

export default function ProjectSetup() {
  const {
    settings,
    grid,
    setName,
    setYarnWeight,
    setStitchGauge,
    setRowGauge,
    setWidth,
    setHeight,
    setUnit,
    setStitchOverride,
    setRowOverride,
    completeSetup,
  } = useProjectStore();

  // The calculated values (before any override)
  const calculated = calculateGrid(
    settings.width,
    settings.height,
    settings.unit,
    settings.stitchGauge,
    settings.rowGauge
  );

  const unitLabel = settings.unit === "in" ? "inches" : "cm";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.name.trim()) completeSetup();
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1
          className="text-3xl font-normal text-charcoal tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          New Project
        </h1>
        <p
          className="mt-2 text-charcoal/50"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Tell us about your project and we&apos;ll calculate your grid size.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* Project Name */}
        <section>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Project name
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Living Room Blanket"
            className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-plum focus:border-transparent"
            required
          />
        </section>

        {/* Yarn Weight */}
        <section>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Yarn weight
          </label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {(Object.entries(YARN_WEIGHTS) as [YarnWeight, typeof YARN_WEIGHTS[YarnWeight]][]).map(
              ([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setYarnWeight(key)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                    settings.yarnWeight === key
                      ? "border-plum bg-plum/10 text-plum"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {info.label}
                </button>
              )
            )}
          </div>
        </section>

        {/* Gauge */}
        <section>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-stone-700">
              Your gauge <span className="text-stone-400 font-normal">(from your swatch)</span>
            </label>
            <span className="text-xs text-stone-400">per 4 inches / 10 cm</span>
          </div>
          <p className="text-xs text-stone-400 mb-3">
            Pre-filled with typical values for {YARN_WEIGHTS[settings.yarnWeight].label}. Update with your actual swatch numbers.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Stitches</label>
              <input
                type="number"
                min={1}
                max={60}
                step={0.5}
                value={settings.stitchGauge}
                onChange={(e) => setStitchGauge(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-plum focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Rows</label>
              <input
                type="number"
                min={1}
                max={80}
                step={0.5}
                value={settings.rowGauge}
                onChange={(e) => setRowGauge(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-plum focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Dimensions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-stone-700">
              Finished dimensions
            </label>
            {/* Unit toggle */}
            <div className="flex rounded-lg border border-stone-300 overflow-hidden text-sm">
              {(["in", "cm"] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1 transition-colors ${
                    settings.unit === u
                      ? "bg-stone-800 text-white"
                      : "bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Width ({unitLabel})
              </label>
              <input
                type="number"
                min={1}
                step={0.5}
                value={settings.width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-plum focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">
                Height ({unitLabel})
              </label>
              <input
                type="number"
                min={1}
                step={0.5}
                value={settings.height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-plum focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Calculated Grid — the Phase 1 payoff */}
        <section className="rounded-xl bg-stone-50 border border-stone-200 p-6">
          <h2 className="text-sm font-medium text-stone-700 mb-4">
            Calculated grid size
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-4xl font-bold text-stone-800 tabular-nums">
                {calculated.stitches}
              </div>
              <div className="text-sm text-stone-500 mt-1">stitches wide</div>
              <div className="text-xs text-stone-400 mt-0.5">
                (cast-on count)
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-stone-800 tabular-nums">
                {calculated.rows}
              </div>
              <div className="text-sm text-stone-500 mt-1">rows tall</div>
              <div className="text-xs text-stone-400 mt-0.5">
                (total row count)
              </div>
            </div>
          </div>

          {/* Manual overrides */}
          <div className="mt-5 pt-5 border-t border-stone-200">
            <p className="text-xs text-stone-500 mb-3">
              Want to round to a stitch repeat? Override either count manually:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Stitch override
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder={String(calculated.stitches)}
                  value={settings.stitchOverride ?? ""}
                  onChange={(e) =>
                    setStitchOverride(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 placeholder:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-plum focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">
                  Row override
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder={String(calculated.rows)}
                  value={settings.rowOverride ?? ""}
                  onChange={(e) =>
                    setRowOverride(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 placeholder:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-plum focus:border-transparent"
                />
              </div>
            </div>
            {(settings.stitchOverride !== null || settings.rowOverride !== null) && (
              <p className="text-xs text-plum mt-2">
                Using overridden values:{" "}
                <strong>{grid.stitches} sts × {grid.rows} rows</strong>
              </p>
            )}
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={!settings.name.trim()}
          className="w-full rounded-xl bg-plum px-6 py-3 text-cream font-medium hover:bg-plum/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Open Grid Editor →
        </button>

      </form>
    </div>
  );
}
