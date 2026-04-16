"use client";

import { useGeometryStore, ReflectionMode } from "@/store/useGeometryStore";
import { KatexRenderer } from "@/components/shared/KatexRenderer";

export function ReflectionPanel() {
  const {
    reflectionMode,
    setReflectionMode,
    reflectionLine,
    applyTransformation,
  } = useGeometryStore();

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReflectionMode(e.target.value as ReflectionMode);
  };

  let matrixStr = "";
  let lineLabel = "";
  if (reflectionMode === 'x-axis') {
    matrixStr = `$M_{x} = \\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$`;
    lineLabel = "y = 0";
  } else if (reflectionMode === 'y-axis') {
    matrixStr = `$M_{y} = \\begin{bmatrix} -1 & 0 \\\\ 0 & 1 \\end{bmatrix}$`;
    lineLabel = "x = 0";
  } else if (reflectionMode === 'y=x') {
    matrixStr = `$M_{y=x} = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$`;
    lineLabel = "y = x";
  } else if (reflectionMode === 'y=-x') {
    matrixStr = `$M_{y=-x} = \\begin{bmatrix} 0 & -1 \\\\ -1 & 0 \\end{bmatrix}$`;
    lineLabel = "y = -x";
  } else {
    matrixStr = `$M = \\frac{1}{a^2+b^2}\\begin{bmatrix} b^2-a^2 & -2ab \\\\ -2ab & a^2-b^2 \\end{bmatrix}$`;
    lineLabel = "custom";
  }

  // suppress unused warning — reflectionLine is used indirectly via store
  void reflectionLine;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-ink">Reflection</h2>
        <p className="text-ink-2 text-sm mb-4">
          Reflect the geometric shape across a specified line of symmetry.
        </p>

        <div className="mb-4">
          <label className="block text-xs text-ink-2 mb-1 uppercase tracking-wider">Reflection Line</label>
          <select
            value={reflectionMode}
            onChange={handleModeChange}
            className="w-full bg-raised border border-rim rounded-md px-3 py-2 text-ink focus:outline-none focus:border-rose-500 transition-colors font-mono text-sm"
          >
            <option value="x-axis">X-Axis (y=0)</option>
            <option value="y-axis">Y-Axis (x=0)</option>
            <option value="y=x">Line y=x</option>
            <option value="y=-x">Line y=-x</option>
            <option value="custom">Custom (Drag Handles)</option>
          </select>
        </div>

        {reflectionMode === 'custom' && (
          <div className="text-xs text-ink-2 mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-md">
            Drag the red star handles on the chart to adjust the reflection line P1 and P2 coordinates.
          </div>
        )}

        <button
          onClick={applyTransformation}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm cursor-pointer"
        >
          Apply Transformation
        </button>
      </div>

      <div className="mb-8 bg-raised p-4 border border-rim rounded-xl">
        <h3 className="text-sm font-medium text-ink-2 mb-1">Reflection Matrix</h3>
        <p className="text-[10px] text-ink-3 mb-3">Line: {lineLabel}</p>
        <div className="overflow-x-auto p-2 text-center text-sm">
          <KatexRenderer expression={matrixStr} />
        </div>
      </div>
    </div>
  );
}
