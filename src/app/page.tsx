import ProjectSetup from "@/components/ProjectSetup";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="border-b border-stone-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <span className="text-xl">🧶</span>
          <span className="font-semibold text-stone-800 tracking-tight">
            Knitting Pattern Designer
          </span>
        </div>
      </header>

      <ProjectSetup />
    </main>
  );
}
