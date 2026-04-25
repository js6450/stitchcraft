"use client";

import { create } from "zustand";
import { YARN_WEIGHTS } from "@/types";
import { calculateGrid, convertDimension } from "@/lib/gauge";
import type { ProjectSettings, YarnWeight, Unit, GridDimensions, PaletteColor } from "@/types";

const DEFAULT_PALETTE: PaletteColor[] = [
  { id: "color-1", name: "Main",     hex: "#F5F0E8" },
  { id: "color-2", name: "Contrast", hex: "#6B2D5B" },
];

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
}

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
    }),

  // ── Color palette ───────────────────────────────
  palette: DEFAULT_PALETTE,
  activeColorId: DEFAULT_PALETTE[0].id,

  addColor: () =>
    set((s) => {
      const id = `color-${Date.now()}`;
      const newColor: PaletteColor = { id, name: "New Color", hex: "#C4943A" };
      return {
        palette: [...s.palette, newColor],
        activeColorId: id,
      };
    }),

  removeColor: (id) =>
    set((s) => {
      if (s.palette.length <= 1) return s;
      const palette = s.palette.filter((c) => c.id !== id);
      // If removing the active color, fall back to the first remaining color
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
}));
