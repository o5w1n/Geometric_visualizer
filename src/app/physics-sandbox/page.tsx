import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UnfoldScene } from "@/components/unfold/UnfoldScene";
import { UnfoldNetSVG } from "@/components/unfold/UnfoldNetSVG";
import { UnfoldSidebar } from "@/components/unfold/UnfoldSidebar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function NetUnfoldingPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* ── System header ──────────────────────────────────────── */}
      <header className="flex-none h-11 border-b border-rim-faint bg-base px-6
                         flex items-center justify-between z-20">
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
            <span className="font-mono text-[10px] text-ink-4 tracking-widest select-none">02</span>
            <h1 className="font-sans text-sm font-medium text-ink-2 tracking-tight">
              Net Unfolding
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
        </div>
      </header>

      {/* ── Content: 3-column grid ──────────────────────────────── */}
      {/*  [3D canvas] | [2D net] | [sidebar]                       */}
      <main className="flex-1 min-h-0 grid grid-cols-1
                       lg:grid-cols-[1fr_320px_300px] overflow-hidden p-4 gap-4 bg-[#101113]">

        {/* 3D canvas — always dark */}
        <section className="relative min-h-0 viz-card overflow-hidden">
          <UnfoldScene />
        </section>

        {/* 2D net diagram */}
        <section className="relative min-h-0 viz-card
                            overflow-hidden flex items-center justify-center">
          <UnfoldNetSVG />
        </section>

        {/* Formula sidebar */}
        <aside className="viz-card min-h-0 overflow-y-auto">
          <UnfoldSidebar />
        </aside>
      </main>
    </div>
  );
}
