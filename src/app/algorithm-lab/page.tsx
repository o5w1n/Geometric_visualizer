import { AlgorithmCanvas } from "@/components/algorithm/AlgorithmCanvas";
import { AlgorithmSidebar } from "@/components/algorithm/AlgorithmSidebar";
import { LabShell, LabMain } from "@/components/shared/LabShell";

export default function AlgorithmLabPage() {
  return (
    <LabShell moduleNumber="03" title="Algorithm Lab" accentDotClassName="bg-violet-500/40">
      <LabMain className="grid grid-cols-1 lg:grid-cols-[1fr_350px]">
        <section className="viz-card relative flex items-center justify-center p-4 overflow-hidden min-h-[50vh] lg:min-h-0">
          <AlgorithmCanvas />
        </section>

        <aside className="viz-card flex flex-col gap-6 overflow-y-auto p-4 sm:p-6">
          <AlgorithmSidebar />
        </aside>
      </LabMain>
    </LabShell>
  );
}
