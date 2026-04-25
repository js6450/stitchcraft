import Link from "next/link";
import LogoMark from "@/components/landing/LogoMark";
import Sparkle from "@/components/landing/Sparkle";
import KnitGrid from "@/components/landing/KnitGrid";
import { COLORS } from "@/lib/theme";

/* ── Data ─────────────────────────────────────────────── */

const features = [
  {
    icon: "◇",
    title: "Gauge Calculator",
    desc: "Enter your yarn weight and swatch numbers — we calculate your exact grid size. No more math on napkins.",
  },
  {
    icon: "▦",
    title: "Grid Editor",
    desc: "Paint your colorwork design stitch by stitch. Fill rows, mirror patterns, undo mistakes.",
  },
  {
    icon: "▣",
    title: "Color Palette",
    desc: "Build your palette with named colors mapped to your favorite yarns. See your design come alive.",
  },
  {
    icon: "◈",
    title: "Print-Ready Export",
    desc: "Generate a beautiful PDF with chart, color legend, materials list, and row-by-row instructions.",
  },
];

const steps = [
  {
    num: "1",
    title: "Set up your project",
    desc: "Name it, pick your yarn weight, enter your gauge, and set your finished dimensions.",
  },
  {
    num: "2",
    title: "Paint your pattern",
    desc: "Use the grid editor to design your colorwork — fill, mirror, and refine until it's perfect.",
  },
  {
    num: "3",
    title: "Make it real",
    desc: "Export a printable pattern sheet with everything you need to start knitting.",
  },
];

/* ── Sub-components ───────────────────────────────────── */

function Nav() {
  return (
    <nav className="flex items-center justify-between px-10 py-5">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <LogoMark size={28} color={COLORS.cream} sparkle={COLORS.gold} />
        <span
          className="text-cream text-lg tracking-wide"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Stitchcraft
        </span>
      </Link>
      <Link
        href="/design"
        className="text-sm font-medium text-cream/60 hover:text-cream transition-colors"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Design a Pattern →
      </Link>
    </nav>
  );
}

function CTAButton({ label = "Design a Pattern", large = false }: { label?: string; large?: boolean }) {
  return (
    <Link
      href="/design"
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-colors bg-gold text-charcoal hover:bg-mustard ${
        large ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"
      }`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {label}
      <Sparkle size={12} color={COLORS.charcoal} />
    </Link>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-parchment p-6">
      <div
        className="text-2xl text-plum mb-3"
        aria-hidden="true"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {icon}
      </div>
      <h3
        className="text-charcoal text-base mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h3>
      <p
        className="text-charcoal/60 text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {desc}
      </p>
    </div>
  );
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5 items-start">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full bg-gold text-charcoal flex items-center justify-center text-base font-semibold"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {num}
      </div>
      <div>
        <h3
          className="text-charcoal text-base mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>
        <p
          className="text-charcoal/55 text-sm leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-charcoal px-10 py-8 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <LogoMark size={20} color={COLORS.cream} sparkle={COLORS.gold} />
        <span
          className="text-cream/70 text-sm tracking-wide"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Stitchcraft
        </span>
      </div>
      <p
        className="text-cream/30 text-xs"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Made for makers.
      </p>
    </footer>
  );
}

/* ── Page ─────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="bg-cream">

      {/* ── Hero (dark charcoal) ──────────────────────── */}
      <div className="bg-charcoal">
        <Nav />
        <div className="px-10 pt-16 pb-24 flex items-center gap-16 max-w-6xl mx-auto">

          {/* Left — copy */}
          <div className="flex-1">
            <p
              className="text-xs font-semibold tracking-widest uppercase text-rose-gold mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Colorwork Pattern Designer
            </p>
            <h1
              className="text-cream text-5xl leading-tight font-normal m-0"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Turn a single strand<br />
              into something <em>magical</em>
            </h1>
            <p
              className="text-cream/55 text-base leading-relaxed mt-6 mb-9 max-w-md"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Design colorwork knitting patterns with a smart grid editor,
              built-in gauge calculator, and beautiful print-ready exports.
            </p>
            <CTAButton label="Design a Pattern" large />
          </div>

          {/* Right — mock editor window */}
          <div className="flex-shrink-0 relative">
            <div
              className="rounded-2xl p-4"
              style={{
                background: COLORS.charcoalLight,
                boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-2 h-2 rounded-full bg-white/15" />
                <div className="w-2 h-2 rounded-full bg-white/15" />
                <div className="w-2 h-2 rounded-full bg-white/15" />
                <span
                  className="ml-auto text-[10px] text-white/30"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  24 × 24 stitches
                </span>
              </div>

              {/* Grid */}
              <div className="rounded-lg overflow-hidden">
                <KnitGrid />
              </div>

              {/* Palette bar */}
              <div className="flex justify-center gap-1.5 mt-3">
                {[
                  { color: COLORS.plum, active: true },
                  { color: COLORS.mustard, active: false },
                  { color: COLORS.roseGold, active: false },
                  { color: COLORS.cream, active: false },
                ].map(({ color, active }, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-md"
                    style={{
                      background: color,
                      border: active
                        ? `2px solid ${COLORS.gold}`
                        : "2px solid transparent",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Decorative sparkles */}
            <Sparkle
              size={16}
              color={COLORS.gold}
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                animation: "floatSpark 3s ease-in-out infinite",
              }}
            />
            <Sparkle
              size={10}
              color={COLORS.mustard}
              style={{
                position: "absolute",
                bottom: 20,
                left: -12,
                animation: "floatSpark 3s ease-in-out 1s infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Features (cream) ─────────────────────────── */}
      <div className="px-10 py-20 max-w-6xl mx-auto">
        <h2
          className="text-charcoal text-3xl font-normal mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Everything you need to design
        </h2>
        <p
          className="text-charcoal/50 text-sm mb-10"
          style={{ fontFamily: "var(--font-body)" }}
        >
          From gauge math to printed pattern — all in one place.
        </p>
        <div className="grid grid-cols-4 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>

      {/* ── How It Works (parchment) ─────────────────── */}
      <div className="bg-parchment">
        <div className="px-10 py-20 max-w-6xl mx-auto">
          <h2
            className="text-charcoal text-3xl font-normal mb-10"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How it works
          </h2>
          <div className="flex flex-col gap-8 max-w-lg">
            {steps.map((s, i) => (
              <StepCard key={i} {...s} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Final CTA (cream) ────────────────────────── */}
      <div className="px-10 py-20 text-center">
        <h2
          className="text-charcoal text-3xl font-normal mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Ready to cast on?
        </h2>
        <p
          className="text-charcoal/50 text-sm mb-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Your next pattern is waiting to be designed.
        </p>
        <CTAButton label="Design a Pattern" large />
      </div>

      <Footer />
    </div>
  );
}
