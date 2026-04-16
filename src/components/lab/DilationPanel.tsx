"use client";

import { useGeometryStore } from "@/store/useGeometryStore";
import { KatexRenderer } from "@/components/shared/KatexRenderer";

export function DilationPanel() {
  const {
    dilationScale,
    setDilationScale,
    applyTransformation,
  } = useGeometryStore();

  const k = dilationScale;
  const matrixStr = `$S(${k}) = \\begin{bmatrix} ${k} & 0 \\\\ 0 & ${k} \\end{bmatrix}, \\quad \\begin{bmatrix} x' \\\\ y' \\end{bmatrix} = \\begin{bmatrix} ${k}x \\\\ ${k}y \\end{bmatrix}$`;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-ink">Dilation</h2>
        <p className="text-ink-2 text-sm mb-4">
          Scale the geometry from the center point.
        </p>

        <div className="mb-2">
          <label className="block text-xs text-ink-2 mb-1 uppercase tracking-wider">Scale Factor (k)</label>
          <input
            type="range"
            min="0.1" max="5" step="0.1"
            className="w-full accent-fuchsia-500"
            value={dilationScale}
            onChange={(e) => setDilationScale(Number(e.target.value))}
          />
        </div>

        <div className="mb-6 flex justify-between items-center bg-raised border border-rim rounded-md px-3 py-2">
          <span className="text-ink-2 text-sm">Factor</span>
          <span className="text-fuchsia-600 dark:text-fuchsia-400 font-mono">x{dilationScale}</span>
        </div>

        <div className="text-xs text-ink-2 mb-4 p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-md">
          Drag the star handle on the chart to relocate the center of dilation.
        </div>

        <button
          onClick={applyTransformation}
          className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm cursor-pointer"
        >
          Apply Transformation
        </button>
      </div>

      <div className="mb-8 bg-raised p-4 border border-rim rounded-xl">
        <h3 className="text-sm font-medium text-ink-2 mb-3">Scaling Matrix</h3>
        <div className="overflow-x-auto p-2 text-center text-sm">
          <KatexRenderer expression={matrixStr} />
        </div>
      </div>
    </div>
  );
}
