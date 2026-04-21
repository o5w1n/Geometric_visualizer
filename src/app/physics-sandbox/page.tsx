import { UnfoldScene } from "@/components/unfold/UnfoldScene";
import { UnfoldNetSVG } from "@/components/unfold/UnfoldNetSVG";
import { UnfoldSidebar } from "@/components/unfold/UnfoldSidebar";
import { LabShell, LabMain } from "@/components/shared/LabShell";

export default function NetUnfoldingPage() {
  return (
    <LabShell moduleNumber="02" title="Net Unfolding" accentDotClassName="bg-emerald-500/40">
      <LabMain className="grid grid-cols-1 lg:grid-cols-[1fr_320px_300px]">
        <section className="relative min-h-[40vh] lg:min-h-0 viz-card overflow-hidden">
          <UnfoldScene />
        </section>

        <section className="relative min-h-[280px] lg:min-h-0 viz-card overflow-hidden flex items-center justify-center">
          <UnfoldNetSVG />
        </section>

        <aside className="viz-card min-h-0 overflow-y-auto max-h-[50vh] lg:max-h-none">
          <UnfoldSidebar />
        </aside>
      </LabMain>
    </LabShell>
  );
}
