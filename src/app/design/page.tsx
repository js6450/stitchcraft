import Link from "next/link";
import ProjectSetup from "@/components/ProjectSetup";
import LogoMark from "@/components/landing/LogoMark";
import { COLORS } from "@/lib/theme";

export const metadata = {
  title: "New Project — Stitchcraft",
};

export default function DesignPage() {
  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-charcoal/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 no-underline group">
            <LogoMark size={22} color={COLORS.plum} sparkle={COLORS.gold} />
            <span
              className="text-charcoal text-base tracking-wide group-hover:text-plum transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Stitchcraft
            </span>
          </Link>
        </div>
      </header>

      <ProjectSetup />
    </main>
  );
}
