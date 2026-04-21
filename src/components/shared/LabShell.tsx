import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

type LabShellProps = {
  moduleNumber: string;
  title: string;
  /** Tailwind classes for the status dot, e.g. `bg-blue-500/40` */
  accentDotClassName?: string;
  children: ReactNode;
};

export function LabShell({
  moduleNumber,
  title,
  accentDotClassName = "bg-blue-500/40",
  children,
}: LabShellProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden lab-app-root">
      <header className="flex-none h-11 border-b border-[var(--lab-header-border)] bg-[var(--lab-header-bg)] px-4 sm:px-6 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.2em] text-ink-4
                       hover:text-ink-2 uppercase transition-colors duration-150
                       flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="w-3 h-3" />
            Hub
          </Link>
          <span className="w-px h-3 bg-rim shrink-0 hidden sm:block" />
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="font-mono text-[10px] text-ink-4 tracking-widest select-none shrink-0">
              {moduleNumber}
            </span>
            <h1 className="font-sans text-sm font-medium text-ink-2 tracking-tight truncate">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <div className={`w-2 h-2 rounded-full ${accentDotClassName}`} />
        </div>
      </header>
      {children}
    </div>
  );
}

type LabMainProps = {
  children: ReactNode;
  className?: string;
};

/** Standard lab content area: padded grid background. */
export function LabMain({ children, className = "" }: LabMainProps) {
  return (
    <main
      className={`flex-1 min-h-0 overflow-hidden p-3 sm:p-4 gap-3 sm:gap-4 bg-[var(--lab-canvas-bg)] ${className}`}
    >
      {children}
    </main>
  );
}
