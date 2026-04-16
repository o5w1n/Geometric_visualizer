import Link from "next/link";
import { ArrowUpRight, Hexagon, Box, Grid2X2 } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

type Accent = "blue" | "emerald" | "violet";

const modules: {
  number: string;
  href: string;
  title: string;
  description: string;
  accent: Accent;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    number: "01",
    href: "/transformation-lab",
    title: "Transformation Lab",
    description:
      "Interactive 2D coordinate system. Apply translation vectors, edit vertices via drag-and-drop, and explore homogeneous matrices with live KaTeX rendering.",
    accent: "blue",
    Icon: Hexagon,
  },
  {
    number: "02",
    href: "/physics-sandbox",
    title: "Net Unfolding",
    description:
      "Select any 3D solid and drag the slider to watch its faces unfold into a flat net. Each face term in the surface area formula lights up as it reveals.",
    accent: "emerald",
    Icon: Box,
  },
  {
    number: "03",
    href: "/algorithm-lab",
    title: "Algorithm Lab",
    description:
      "Step-through rasterisation on a pixel grid. Visualise Bresenham's line algorithm and the midpoint circle algorithm with live decision variable inspection.",
    accent: "violet",
    Icon: Grid2X2,
  },
];

const accentClasses: Record<
  Accent,
  {
    title: string; icon: string; iconBase: string;
    bar: string; barBase: string;
    cta: string; ghost: string; border: string;
  }
> = {
  blue: {
    title:    "group-hover:text-blue-500",
    icon:     "group-hover:text-blue-500",
    iconBase: "text-blue-400/60",
    bar:      "group-hover:bg-blue-500",
    barBase:  "bg-blue-400/30",
    cta:      "group-hover:text-blue-500",
    ghost:    "text-blue-100/0 group-hover:text-blue-100 dark:group-hover:text-blue-950",
    border:   "border-l-blue-400/40 group-hover:border-l-blue-500",
  },
  emerald: {
    title:    "group-hover:text-emerald-600",
    icon:     "group-hover:text-emerald-500",
    iconBase: "text-emerald-500/60",
    bar:      "group-hover:bg-emerald-500",
    barBase:  "bg-emerald-400/30",
    cta:      "group-hover:text-emerald-600",
    ghost:    "text-emerald-100/0 group-hover:text-emerald-100 dark:group-hover:text-emerald-950",
    border:   "border-l-emerald-400/40 group-hover:border-l-emerald-500",
  },
  violet: {
    title:    "group-hover:text-violet-600",
    icon:     "group-hover:text-violet-500",
    iconBase: "text-violet-500/60",
    bar:      "group-hover:bg-violet-500",
    barBase:  "bg-violet-400/30",
    cta:      "group-hover:text-violet-600",
    ghost:    "text-violet-100/0 group-hover:text-violet-100 dark:group-hover:text-violet-950",
    border:   "border-l-violet-400/40 group-hover:border-l-violet-500",
  },
};

export default function HubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-base bg-dot-grid">

      {/* ── System strip ─────────────────────────────────────────── */}
      <div className="flex-none border-b border-rim-faint px-6 md:px-14 py-3 flex items-center justify-between bg-base/90 backdrop-blur-sm">
        <span className="font-mono text-[10px] tracking-[0.25em] text-ink-4 uppercase select-none">
          Geometric Analyzer
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-ink-4 select-none">2026 — 04</span>
          <ThemeToggle />
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-6 md:px-14 pt-20 pb-12 max-w-screen-xl mx-auto w-full">

        <div className="mb-16">
          <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-ink-3 uppercase mb-10 select-none">
            Experimental environment — computational geometry
          </p>

          <h1 className="font-sans text-[clamp(2.8rem,7.5vw,7.5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-ink mb-8">
            Geometry,
            <br />
            <span className="text-ink-3">examined.</span>
          </h1>

          <p className="font-mono text-ink font-semibold text-sm max-w-sm leading-relaxed">
            Three independent modules.
            <br />
            One coherent system.
          </p>
        </div>

        {/* ── Hairline rule ──────────────────────────────────────── */}
        <div className="w-full h-px bg-rim-faint mb-12" />

        {/* ── Module grid — gap-px Swiss grid ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 bg-rim-faint gap-px border border-rim-faint">
          {modules.map(({ number, href, title, description, accent, Icon }) => {
            const a = accentClasses[accent];
            return (
              <Link
                key={number}
                href={href}
                className={`group relative flex flex-col bg-base p-8 overflow-hidden
                           border-l-2 transition-all duration-200 hover:bg-raised
                           cursor-pointer ${a.border}`}
              >
                {/* Ghost number — sweeps in on hover */}
                <span
                  className={`
                    absolute -bottom-4 right-3 font-sans font-bold leading-none
                    text-[7rem] select-none pointer-events-none
                    transition-colors duration-300 ${a.ghost}
                  `}
                >
                  {number}
                </span>

                {/* Top accent bar — always present, brightens on hover */}
                <div
                  className={`
                    absolute top-0 left-0 right-0 h-[2px]
                    transition-colors duration-200 ${a.barBase} ${a.bar}
                  `}
                />

                {/* Number + icon */}
                <div className="flex items-start justify-between mb-12 relative z-10">
                  <span className="font-mono text-[10px] font-bold text-ink-3 tracking-widest">
                    {number}
                  </span>
                  <Icon
                    className={`w-4 h-4 transition-colors duration-200 ${a.iconBase} ${a.icon}`}
                  />
                </div>

                {/* Title */}
                <h2
                  className={`
                    font-sans text-xl font-semibold text-ink mb-3
                    leading-tight transition-colors duration-200 ${a.title} relative z-10
                  `}
                >
                  {title}
                </h2>

                {/* Description */}
                <p className="font-mono text-ink-2 font-medium text-xs leading-relaxed flex-1 mb-8 relative z-10">
                  {description}
                </p>

                {/* CTA */}
                <div
                  className={`
                    flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest
                    uppercase text-ink-2 transition-colors duration-200 ${a.cta}
                    relative z-10
                  `}
                >
                  Enter
                  <ArrowUpRight
                    className="w-3 h-3 transition-transform duration-200
                               group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Footer strip ──────────────────────────────────────── */}
        <div className="mt-14 flex items-center justify-between">
          <span className="font-mono text-[9px] font-semibold tracking-widest text-ink-3 uppercase select-none">
            Next.js · React Three Fiber · KaTeX
          </span>
          <span className="font-mono text-[9px] font-semibold text-ink-3 select-none">
            3 modules
          </span>
        </div>
      </div>
    </div>
  );
}
