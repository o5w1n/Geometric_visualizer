import { TransformChart } from "@/components/lab/TransformChart";
import { TransformSidebar } from "@/components/lab/TransformSidebar";
import { ClippingPanel } from "@/components/lab/ClippingPanel";
import { LabModeTabs } from "@/components/shared/LabModeTabs";
import { LabShell, LabMain } from "@/components/shared/LabShell";

export default function TransformationLabPage() {
  return (
    <LabShell moduleNumber="01" title="Transformation Lab" accentDotClassName="bg-blue-500/40">
      <LabMain className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        <section className="viz-card p-3 sm:p-4 flex flex-col min-h-[50vh] lg:min-h-0">
          <LabModeTabs />
          <div className="pt-3 flex-1 min-h-0">
            <TransformChart />
          </div>
        </section>

        <aside className="min-h-0 overflow-y-auto pr-0 sm:pr-1 space-y-3 sm:space-y-4">
          <TransformSidebar />
          <ClippingPanel />
        </aside>
      </LabMain>
    </LabShell>
  );
}
