import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TransformChart } from "@/components/lab/TransformChart";
import { TransformSidebar } from "@/components/lab/TransformSidebar";
import { ClippingPanel } from "@/components/lab/ClippingPanel";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function TransformationLabPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* ── System header ──────────────────────────────────────── */}
      <header className="flex-none h-11 border-b border-rim-faint bg-base px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.2em] text-ink-4
                       hover:text-ink-2 uppercase transition-colors duration-150
                       flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" />
            Hub
          </Link>
          <span className="w-px h-3 bg-rim" />
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] text-ink-4 tracking-widest select-none">01</span>
            <h1 className="font-sans text-sm font-medium text-ink-2 tracking-tight">
              Transformation Lab
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-2 h-2 rounded-full bg-blue-500/40" />
        </div>
      </header>

      {/* ── Content grid ───────────────────────────────────────── */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_350px] overflow-hidden">
        <section className="bg-grid-pattern relative border-r border-rim-faint p-8 flex items-center justify-center">
          <TransformChart />
        </section>

        <aside className="bg-panel border-t lg:border-t-0 border-rim-faint flex flex-col gap-8 overflow-y-auto p-6">
          <TransformSidebar />
          <ClippingPanel />
        </aside>
      </main>
    </div>
  );
}
