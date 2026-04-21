"use client";

import { useGeometryStore, type TransformationMode } from "@/store/useGeometryStore";

const modes: { id: TransformationMode; label: string }[] = [
  { id: "translate", label: "Translation" },
  { id: "rotate", label: "Rotation" },
  { id: "scale", label: "Scaling" },
  { id: "combined", label: "Combined" },
  { id: "threeD", label: "3D Transformations" },
];

export function LabModeTabs() {
  const { mode, setMode } = useGeometryStore();
  return (
    <div className="viz-pill-row">
      {modes.map((tab) => (
        <button
          key={tab.label}
          type="button"
          onClick={() => setMode(tab.id)}
          className={`viz-pill px-3 sm:px-4 py-2 text-xs sm:text-sm cursor-pointer shrink-0 whitespace-nowrap ${mode === tab.id ? "viz-pill-active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
