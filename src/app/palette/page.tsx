import Link from "next/link";
import ColorPaletteSetup from "@/components/ColorPaletteSetup";
import LogoMark from "@/components/landing/LogoMark";
import { COLORS } from "@/lib/theme";

export const metadata = {
  title: "Color Palette — Stitchcraft",
};

export default function PalettePage() {
  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-charcoal/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline group">
            <LogoMark size={22} color={COLORS.plum} sparkle={COLORS.gold} />
            <span
              className="text-charcoal text-base tracking-wide group-hover:text-plum transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Stitchcraft
            </span>
          </Link>
          {/* Step indicator */}
          <div
            className="flex items-center gap-2 text-xs text-charcoal/40"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="text-charcoal/25">Setup</span>
            <span className="text-charcoal/25">→</span>
            <span className="font-semibold text-plum">Palette</span>
            <span className="text-charcoal/25">→</span>
            <span className="text-charcoal/25">Design</span>
          </div>
        </div>
      </header>

      <ColorPaletteSetup />
    </main>
  );
}
