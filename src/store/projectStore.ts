"use client";

import { create } from "zustand";
import { YARN_WEIGHTS } from "@/types";
import { calculateGrid, convertDimension } from "@/lib/gauge";
import type {
  ProjectSettings,
  YarnWeight,
  Unit,
  GridDimensions,
  PaletteColor,
  GridData,
  Tool,
  RepeatDirection,
} from "@/types";

/* ── Helpers ──────────────────────────────────────────── */

const DEFAULT_PALETTE: PaletteColor[] = [
  { id: "color-1", name: "Main",     hex: "#C4943A" },
  { id: "color-2", name: "Contrast", hex: "#6B2D5B" },
];

const DEFAULT_YARN_WEIGHT: YarnWeight = "worsted";
const { typicalStitchGauge, typicalRowGauge } = YARN_WEIGHTS[DEFAULT_YARN_WEIGHT];

const DEFAULT_SETTINGS: ProjectSettings = {
  name: "",
  yarnWeight: DEFAULT_YARN_WEIGHT,
  stitchGauge: typicalStitchGauge,
  rowGauge: typicalRowGauge,
  width: 48,
  height: 60,
  unit: "in",
  stitchOverride: null,
  rowOverride: null,
};

function deriveGrid(settings: ProjectSettings): GridDimensions {
  const calculated = calculateGrid(
    settings.width,
    settings.height,
    settings.unit,
    settings.stitchGauge,
    settings.rowGauge
  );
  return {
    stitches: settings.stitchOverride ?? calculated.stitches,
    rows: settings.rowOverride ?? calculated.rows,
  };
}

function createEmptyGrid(rows: number, cols: number): GridData {
  return Array.from({ length: rows }, () => Array<string | null>(cols).fill(null));
}

const MAX_HISTORY = 50;

/* ── Store interface ──────────────────────────────────── */

interface ProjectStore {
  // ── Project setup ──────────────────────────────
  settings: ProjectSettings;
  grid: GridDimensions;
  isSetupComplete: boolean;

  setName: (name: string) => void;
  setYarnWeight: (weight: YarnWeight) => void;
  setStitchGauge: (value: number) => void;
  setRowGauge: (value: number) => void;
  setWidth: (value: number) => void;
  setHeight: (value: number) => void;
  setUnit: (unit: Unit) => void;
  setStitchOverride: (value: number | null) => void;
  setRowOverride: (value: number | null) => void;
  completeSetup: () => void;
  resetSetup: () => void;

  // ── Color palette ───────────────────────────────
  palette: PaletteColor[];
  activeColorId: string;

  addColor: () => void;
  removeColor: (id: string) => void;
  updateColorHex: (id: string, hex: string) => void;
  updateColorName: (id: string, name: string) => void;
  setActiveColor: (id: string) => void;

  // ── Grid editor ─────────────────────────────────
  gridData: GridData;
  history: GridData[];   // undo stack (previous states)
  redoStack: GridData[]; // redo stack (future states)
  activeTool: Tool;

  initGridData: () => void;
  saveSnapshot: () => void;
  paintCell: (row: number, col: number, color: string | null) => void;
  fillRow: (row: number, color: string | null, colStart?: number, colEnd?: number) => void;
  fillCol: (col: number, color: string | null, rowStart?: number, rowEnd?: number) => void;
  fillAll: (color: string | null, colStart?: number, colEnd?: number, rowStart?: number, rowEnd?: number) => void;
  applyColorRemap: (remaps: Record<string, string | null>) => void;
  clearGrid: () => void;
  undo: () => void;
  redo: () => void;
  setActiveTool: (tool: Tool) => void;

  // ── View ─────────────────────────────────────────
  fitToView: boolean;
  setFitToView: (v: boolean) => void;

  // ── Pattern repeat ───────────────────────────────
  repeatEnabled: boolean;
  repeatDirection: RepeatDirection;
  repeatStartCol: number;  // 0-indexed
  repeatStartRow: number;  // 0-indexed
  repeatWidth: number;     // in stitches
  repeatHeight: number;    // in rows

  setRepeatEnabled: (enabled: boolean) => void;
  setRepeatDirection: (d: RepeatDirection) => void;
  setRepeatStartCol: (n: number) => void;
  setRepeatStartRow: (n: number) => void;
  setRepeatWidth: (n: number) => void;
  setRepeatHeight: (n: number) => void;
  applyRepeat: () => void;
}

/* ── Store ────────────────────────────────────────────── */

export const useProjectStore = create<ProjectStore>((set) => ({

  // ── Project setup ──────────────────────────────
  settings: DEFAULT_SETTINGS,
  grid: deriveGrid(DEFAULT_SETTINGS),
  isSetupComplete: false,

  setName: (name) =>
    set((s) => ({ settings: { ...s.settings, name } })),

  setYarnWeight: (yarnWeight) =>
    set((s) => {
      const { typicalStitchGauge, typicalRowGauge } = YARN_WEIGHTS[yarnWeight];
      const settings = {
        ...s.settings,
        yarnWeight,
        stitchGauge: typicalStitchGauge,
        rowGauge: typicalRowGauge,
        stitchOverride: null,
        rowOverride: null,
      };
      return { settings, grid: deriveGrid(settings) };
    }),

  setStitchGauge: (stitchGauge) =>
    set((s) => {
      const settings = { ...s.settings, stitchGauge, stitchOverride: null };
      return { settings, grid: deriveGrid(settings) };
    }),

  setRowGauge: (rowGauge) =>
    set((s) => {
      const settings = { ...s.settings, rowGauge, rowOverride: null };
      return { settings, grid: deriveGrid(settings) };
    }),

  setWidth: (width) =>
    set((s) => {
      const settings = { ...s.settings, width, stitchOverride: null };
      return { settings, grid: deriveGrid(settings) };
    }),

  setHeight: (height) =>
    set((s) => {
      const settings = { ...s.settings, height, rowOverride: null };
      return { settings, grid: deriveGrid(settings) };
    }),

  setUnit: (unit) =>
    set((s) => {
      const settings = {
        ...s.settings,
        unit,
        width: convertDimension(s.settings.width, s.settings.unit, unit),
        height: convertDimension(s.settings.height, s.settings.unit, unit),
      };
      return { settings, grid: deriveGrid(settings) };
    }),

  setStitchOverride: (value) =>
    set((s) => {
      const settings = { ...s.settings, stitchOverride: value };
      return { settings, grid: deriveGrid(settings) };
    }),

  setRowOverride: (value) =>
    set((s) => {
      const settings = { ...s.settings, rowOverride: value };
      return { settings, grid: deriveGrid(settings) };
    }),

  completeSetup: () => set({ isSetupComplete: true }),

  resetSetup: () =>
    set({
      settings: DEFAULT_SETTINGS,
      grid: deriveGrid(DEFAULT_SETTINGS),
      isSetupComplete: false,
      palette: DEFAULT_PALETTE,
      activeColorId: DEFAULT_PALETTE[0].id,
      gridData: [],
      history: [],
      redoStack: [],
    }),

  // ── Color palette ───────────────────────────────
  palette: DEFAULT_PALETTE,
  activeColorId: DEFAULT_PALETTE[0].id,

  addColor: () =>
    set((s) => {
      const id = `color-${Date.now()}`;
      const newColor: PaletteColor = { id, name: "New Color", hex: "#C4943A" };
      return { palette: [...s.palette, newColor], activeColorId: id };
    }),

  removeColor: (id) =>
    set((s) => {
      if (s.palette.length <= 1) return s;
      const palette = s.palette.filter((c) => c.id !== id);
      const activeColorId =
        s.activeColorId === id ? palette[0].id : s.activeColorId;
      return { palette, activeColorId };
    }),

  updateColorHex: (id, hex) =>
    set((s) => ({
      palette: s.palette.map((c) => (c.id === id ? { ...c, hex } : c)),
    })),

  updateColorName: (id, name) =>
    set((s) => ({
      palette: s.palette.map((c) => (c.id === id ? { ...c, name } : c)),
    })),

  setActiveColor: (id) => set({ activeColorId: id }),

  // ── Grid editor ─────────────────────────────────
  gridData: [],
  history: [],
  redoStack: [],
  activeTool: "paint",

  initGridData: () =>
    set((s) => {
      const { rows, stitches: cols } = s.grid;
      // Don't reinitialize if dimensions already match (preserves painted work)
      if (s.gridData.length === rows && (s.gridData[0]?.length ?? 0) === cols) {
        return s;
      }
      return {
        gridData: createEmptyGrid(rows, cols),
        history: [],
        redoStack: [],
        // Seed repeat defaults to a sensible tile size
        repeatWidth: Math.min(20, cols),
        repeatHeight: Math.min(20, rows),
        repeatStartCol: 0,
        repeatStartRow: 0,
      };
    }),

  // Push a snapshot of the current grid onto the undo stack.
  // Call this on mousedown before any paint action.
  saveSnapshot: () =>
    set((s) => ({
      history: [
        ...s.history.slice(-(MAX_HISTORY - 1)),
        s.gridData.map((r) => [...r]),
      ],
      redoStack: [], // any new action clears redo
    })),

  paintCell: (row, col, color) =>
    set((s) => {
      if (s.gridData[row]?.[col] === color) return s; // no-op
      const gridData = s.gridData.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? color : c)) : r
      );
      return { gridData };
    }),

  fillRow: (row, color, colStart, colEnd) =>
    set((s) => {
      const cols = s.gridData[0]?.length ?? 0;
      const start = colStart ?? 0;
      const end = colEnd ?? cols;
      const snapshot = s.gridData.map((r) => [...r]);
      const gridData = s.gridData.map((r, ri) =>
        ri === row
          ? r.map((c, ci) => (ci >= start && ci < end ? color : c))
          : r
      );
      return {
        gridData,
        history: [...s.history.slice(-(MAX_HISTORY - 1)), snapshot],
        redoStack: [],
      };
    }),

  fillCol: (col, color, rowStart, rowEnd) =>
    set((s) => {
      const rows = s.gridData.length;
      const start = rowStart ?? 0;
      const end = rowEnd ?? rows;
      const snapshot = s.gridData.map((r) => [...r]);
      const gridData = s.gridData.map((r, ri) =>
        ri >= start && ri < end
          ? r.map((c, ci) => (ci === col ? color : c))
          : r
      );
      return {
        gridData,
        history: [...s.history.slice(-(MAX_HISTORY - 1)), snapshot],
        redoStack: [],
      };
    }),

  fillAll: (color, colStart, colEnd, rowStart, rowEnd) =>
    set((s) => {
      const totalRows = s.gridData.length;
      const totalCols = s.gridData[0]?.length ?? 0;
      const cs = colStart ?? 0;
      const ce = colEnd   ?? totalCols;
      const rs = rowStart ?? 0;
      const re = rowEnd   ?? totalRows;
      const snapshot = s.gridData.map((r) => [...r]);
      const gridData = s.gridData.map((r, ri) =>
        ri >= rs && ri < re
          ? r.map((c, ci) => (ci >= cs && ci < ce ? color : c))
          : r
      );
      return {
        gridData,
        history: [...s.history.slice(-(MAX_HISTORY - 1)), snapshot],
        redoStack: [],
      };
    }),

  applyColorRemap: (remaps) =>
    set((s) => {
      if (Object.keys(remaps).length === 0) return s;
      const snapshot = s.gridData.map((r) => [...r]);
      const gridData = s.gridData.map((row) =>
        row.map((cell) => {
          if (cell === null) return null;
          return Object.prototype.hasOwnProperty.call(remaps, cell)
            ? remaps[cell]
            : cell;
        })
      );
      return {
        gridData,
        history: [...s.history.slice(-(MAX_HISTORY - 1)), snapshot],
        redoStack: [],
      };
    }),

  clearGrid: () =>
    set((s) => {
      const { rows, stitches: cols } = s.grid;
      const snapshot = s.gridData.map((r) => [...r]);
      return {
        gridData: createEmptyGrid(rows, cols),
        history: [...s.history.slice(-(MAX_HISTORY - 1)), snapshot],
        redoStack: [],
      };
    }),

  undo: () =>
    set((s) => {
      if (s.history.length === 0) return s;
      const prev = s.history[s.history.length - 1];
      return {
        gridData: prev,
        history: s.history.slice(0, -1),
        redoStack: [s.gridData.map((r) => [...r]), ...s.redoStack.slice(0, MAX_HISTORY - 1)],
      };
    }),

  redo: () =>
    set((s) => {
      if (s.redoStack.length === 0) return s;
      const next = s.redoStack[0];
      return {
        gridData: next,
        history: [...s.history.slice(-(MAX_HISTORY - 1)), s.gridData.map((r) => [...r])],
        redoStack: s.redoStack.slice(1),
      };
    }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  // ── View ─────────────────────────────────────────
  fitToView: false,
  setFitToView: (fitToView) => set({ fitToView }),

  // ── Pattern repeat ───────────────────────────────
  repeatEnabled: false,
  repeatDirection: "width",
  repeatStartCol: 0,
  repeatStartRow: 0,
  repeatWidth: 20,
  repeatHeight: 20,

  setRepeatEnabled: (repeatEnabled) => set({ repeatEnabled }),
  setRepeatDirection: (repeatDirection) => set({ repeatDirection }),
  setRepeatStartCol: (repeatStartCol) => set({ repeatStartCol }),
  setRepeatStartRow: (repeatStartRow) => set({ repeatStartRow }),
  setRepeatWidth: (repeatWidth) => set({ repeatWidth }),
  setRepeatHeight: (repeatHeight) => set({ repeatHeight }),

  applyRepeat: () =>
    set((s) => {
      const { stitches: cols, rows } = s.grid;
      const { repeatDirection, repeatStartCol, repeatStartRow, repeatWidth, repeatHeight } = s;

      const snapshot = s.gridData.map((r) => [...r]);

      const gridData = s.gridData.map((row, ri) =>
        row.map((cell, ci) => {
          const inHorizZone =
            (repeatDirection === "width" || repeatDirection === "both") &&
            ci >= repeatStartCol;
          const inVertZone =
            (repeatDirection === "height" || repeatDirection === "both") &&
            ri >= repeatStartRow;

          // Leave cell untouched if it falls outside the affected zone
          if (!inHorizZone && !inVertZone) return cell;
          if (repeatDirection === "width" && !inHorizZone) return cell;
          if (repeatDirection === "height" && !inVertZone) return cell;

          const tileCol = inHorizZone
            ? repeatStartCol + ((ci - repeatStartCol) % repeatWidth)
            : ci;
          const tileRow = inVertZone
            ? repeatStartRow + ((ri - repeatStartRow) % repeatHeight)
            : ri;

          return s.gridData[tileRow]?.[tileCol] ?? null;
        })
      );

      // Clamp to actual grid bounds just in case
      void cols; void rows;

      return {
        gridData,
        history: [...s.history.slice(-(MAX_HISTORY - 1)), snapshot],
        redoStack: [],
      };
    }),
}));
