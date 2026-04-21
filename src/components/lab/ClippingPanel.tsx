"use client";

import { useMemo } from "react";
import { useGeometryStore } from "@/store/useGeometryStore";
import { csRegionCode, csRegionLabel, reflectPoint, rotatePoint, translatePoint, applyCombined2D, Point } from "@/lib/transformationUtils";

export function ClippingPanel() {
  const store = useGeometryStore();
  const {
    viewportEnabled, setViewportEnabled,
    viewport, setViewport,
    vertices, mode,
    translationVector, reflectionLine, rotationPivot, rotationAngle,
    dilationCenter, dilationScale, dilationScaleY, combinedAngle, combinedScale, combinedTranslate, combinedOrder,
  } = store;

  const activeVertices = useMemo((): Point[] => {
    if (mode === 'translate') return vertices.map(v => translatePoint(v, translationVector));
    if (mode === 'reflect')   return vertices.map(v => reflectPoint(v, reflectionLine.p1, reflectionLine.p2));
    if (mode === 'rotate')    return vertices.map(v => rotatePoint(v, rotationPivot, rotationAngle));
    if (mode === 'scale')     return vertices.map(v => [dilationCenter[0] + (v[0] - dilationCenter[0]) * dilationScale, dilationCenter[1] + (v[1] - dilationCenter[1]) * dilationScaleY] as Point);
    if (mode === 'combined') {
      return vertices.map((v) =>
        applyCombined2D(v, combinedAngle, combinedScale, combinedTranslate, combinedOrder)
      );
    }
    return vertices;
  }, [vertices, mode, translationVector, reflectionLine, rotationPivot, rotationAngle, dilationCenter, dilationScale, dilationScaleY, combinedAngle, combinedScale, combinedTranslate, combinedOrder]);

  const { xMin, xMax, yMin, yMax } = viewport;

  const handleBound = (key: keyof typeof viewport, raw: string) => {
    const v = parseFloat(raw);
    if (isNaN(v)) return;
    const next = { ...viewport, [key]: v };
    if (next.xMin >= next.xMax) return;
    if (next.yMin >= next.yMax) return;
    setViewport(next);
  };

  const codeColor = (code: number) =>
    code === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";

  return (
    <div className="viz-card p-4">
      {/* Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-ink">Viewport Clipping</h3>
          <p className="text-[10px] text-ink-3 mt-0.5">Cohen-Sutherland algorithm</p>
        </div>
        <button
          onClick={() => setViewportEnabled(!viewportEnabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${viewportEnabled ? 'bg-amber-500' : 'bg-rim'}`}
        >
          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${viewportEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>

      {viewportEnabled && (
        <div className="space-y-4">
          <div className="bg-raised border border-rim rounded-xl p-3">
            <p className="text-[10px] text-amber-600 uppercase tracking-wider mb-2">Viewport bounds</p>
            <div className="grid grid-cols-2 gap-2">
              {([ ['xMin', xMin], ['xMax', xMax], ['yMin', yMin], ['yMax', yMax] ] as [keyof typeof viewport, number][]).map(([k, v]) => (
                <div key={k}>
                  <label className="block text-[10px] text-ink-2 mb-1 font-mono">{k}</label>
                  <input
                    type="number" step={0.5}
                    value={v}
                    onChange={(e) => handleBound(k, e.target.value)}
                    className="w-full bg-panel border border-rim rounded px-2 py-1 text-ink font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-ink-3 mt-2">Drag the amber corner handles on the chart.</p>
          </div>

          <div className="bg-raised border border-rim rounded-xl p-3">
            <p className="text-[10px] text-ink-2 uppercase tracking-wider mb-2">Vertex region codes (TBLR)</p>
            <div className="space-y-1.5">
              {activeVertices.map((v, i) => {
                const code = csRegionCode(v[0], v[1], xMin, xMax, yMin, yMax);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-ink-2 font-mono text-xs">v{i + 1}&apos; ({v[0].toFixed(1)}, {v[1].toFixed(1)})</span>
                    <span className={`font-mono text-xs ${codeColor(code)}`}>{csRegionLabel(code)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
