export type YarnWeight =
  | "fingering"
  | "sport"
  | "dk"
  | "worsted"
  | "aran"
  | "bulky"
  | "super-bulky";

export type Unit = "in" | "cm";

export interface YarnWeightInfo {
  label: string;
  typicalStitchGauge: number; // stitches per 4 inches
  typicalRowGauge: number;    // rows per 4 inches
}

export const YARN_WEIGHTS: Record<YarnWeight, YarnWeightInfo> = {
  fingering:    { label: "Fingering",    typicalStitchGauge: 28, typicalRowGauge: 36 },
  sport:        { label: "Sport",        typicalStitchGauge: 24, typicalRowGauge: 32 },
  dk:           { label: "DK",           typicalStitchGauge: 22, typicalRowGauge: 28 },
  worsted:      { label: "Worsted",      typicalStitchGauge: 18, typicalRowGauge: 24 },
  aran:         { label: "Aran",         typicalStitchGauge: 16, typicalRowGauge: 22 },
  bulky:        { label: "Bulky",        typicalStitchGauge: 14, typicalRowGauge: 18 },
  "super-bulky":{ label: "Super Bulky",  typicalStitchGauge: 10, typicalRowGauge: 14 },
};

export interface ProjectSettings {
  name: string;
  yarnWeight: YarnWeight;
  stitchGauge: number;  // stitches per 4 inches (always stored in inches)
  rowGauge: number;     // rows per 4 inches (always stored in inches)
  width: number;        // in current display unit
  height: number;       // in current display unit
  unit: Unit;
  stitchOverride: number | null;
  rowOverride: number | null;
}

export interface GridDimensions {
  stitches: number;
  rows: number;
}

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}
