"use client";

import { useGeometryStore } from "@/store/useGeometryStore";
import { KatexRenderer } from "@/components/shared/KatexRenderer";

export function RotationPanel() {
  const {
    rotationAngle,
    setRotationAngle,
    applyTransformation,
  } = useGeometryStore();

  const angleRad = (rotationAngle * Math.PI) / 180;
  const cosVal = Math.round(Math.cos(angleRad) * 1000) / 1000;
  const sinVal = Math.round(Math.sin(angleRad) * 1000) / 1000;
  const negSinVal = Math.round(-Math.sin(angleRad) * 1000) / 1000;

  const formulaStr = `$R(${rotationAngle}^\\circ) = \\begin{bmatrix} ${cosVal} & ${negSinVal} \\\\ ${sinVal} & ${cosVal} \\end{bmatrix}$`;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-ink">Rotation</h2>
        <p className="text-ink-2 text-sm mb-4">
          Rotate the shape around the pink pivot point.
        </p>

        <div className="mb-2">
          <label className="block text-xs text-ink-2 mb-1 uppercase tracking-wider">Angle (Degrees)</label>
          <input
            type="range"
            min="-180" max="180" step="5"
            className="w-full accent-amber-500"
            value={rotationAngle}
            onChange={(e) => setRotationAngle(Number(e.target.value))}
          />
        </div>

        <div className="mb-6 flex justify-between items-center bg-raised border border-rim rounded-md px-3 py-2">
          <span className="text-ink-2 text-sm">&theta;</span>
          <span className="text-amber-600 dark:text-amber-400 font-mono">{rotationAngle}&deg;</span>
        </div>

        <div className="text-xs text-ink-2 mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
          Drag the star handle on the chart to relocate the pivot origin.
        </div>

        <button
          onClick={applyTransformation}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm cursor-pointer"
        >
          Apply Transformation
        </button>
      </div>

      <div className="mb-8 bg-raised p-4 border border-rim rounded-xl">
        <h3 className="text-sm font-medium text-ink-2 mb-1">Rotation Matrix</h3>
        <p className="text-[10px] text-ink-3 mb-3">Numeric values at {rotationAngle}°</p>
        <div className="overflow-x-auto p-2 text-center text-sm">
          <KatexRenderer expression={formulaStr} />
        </div>
      </div>
    </div>
  );
}
