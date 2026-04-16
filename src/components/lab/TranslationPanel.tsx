"use client";

import { useGeometryStore } from "@/store/useGeometryStore";
import { KatexRenderer } from "@/components/shared/KatexRenderer";

export function TranslationPanel() {
  const {
    translationVector,
    setTranslationVector,
    applyTransformation,
  } = useGeometryStore();

  const handleVectorChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value) || 0;
    if (axis === 'x') {
      setTranslationVector([numValue, translationVector[1]]);
    } else {
      setTranslationVector([translationVector[0], numValue]);
    }
  };

  const dx = translationVector[0];
  const dy = translationVector[1];
  const dxStr = dx >= 0 ? `+${dx}` : `${dx}`;
  const dyStr = dy >= 0 ? `+${dy}` : `${dy}`;

  const matrixStr = `$\\begin{bmatrix} 1 & 0 & ${dx} \\\\ 0 & 1 & ${dy} \\\\ 0 & 0 & 1 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} x ${dxStr} \\\\ y ${dyStr} \\\\ 1 \\end{bmatrix}$`;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-ink">Translation</h2>
        <p className="text-ink-2 text-sm mb-4">
          Adjust the vector values to translate the geometric shape across the 2D plane.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-ink-2 mb-1 uppercase tracking-wider">dx (X-Axis)</label>
            <input
              type="number"
              className="w-full bg-raised border border-rim rounded-md px-3 py-2 text-ink focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
              value={translationVector[0]}
              onChange={(e) => handleVectorChange('x', e.target.value)}
              step={0.5}
            />
          </div>
          <div>
            <label className="block text-xs text-ink-2 mb-1 uppercase tracking-wider">dy (Y-Axis)</label>
            <input
              type="number"
              className="w-full bg-raised border border-rim rounded-md px-3 py-2 text-ink focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
              value={translationVector[1]}
              onChange={(e) => handleVectorChange('y', e.target.value)}
              step={0.5}
            />
          </div>
        </div>

        <button
          onClick={applyTransformation}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm cursor-pointer"
        >
          Apply Transformation
        </button>
      </div>

      <div className="mb-8 bg-raised p-4 border border-rim rounded-xl">
        <h3 className="text-sm font-medium text-ink-2 mb-3">Homogeneous Translation Matrix</h3>
        <div className="overflow-x-auto p-2 text-center text-sm">
          <KatexRenderer expression={matrixStr} />
        </div>
      </div>
    </div>
  );
}
