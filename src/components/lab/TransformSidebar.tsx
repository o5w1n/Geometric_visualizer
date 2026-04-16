"use client";

import { useMemo } from "react";
import { useGeometryStore } from "@/store/useGeometryStore";
import { TranslationPanel } from "./TranslationPanel";
import { ReflectionPanel } from "./ReflectionPanel";
import { RotationPanel } from "./RotationPanel";
import { DilationPanel } from "./DilationPanel";
import { reflectPoint, rotatePoint, dilatePoint, translatePoint } from "@/lib/transformationUtils";
import { ArrowRight, Move, FlipHorizontal, RotateCw, Maximize, ArrowLeft, RotateCcw } from "lucide-react";

export function TransformSidebar() {
  const { mode, setMode, resetShape } = useGeometryStore();

  if (mode === null) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-300">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-ink">Select Transformation</h2>
          <p className="text-ink-2 text-sm mb-6">
            Choose a global operator to apply to the geometric active shape.
          </p>

          <div className="space-y-3">
            <button onClick={() => setMode('translate')} className="w-full group flex items-center justify-between p-4 border border-rim rounded-xl bg-raised hover:bg-blue-500/10 hover:border-blue-500/50 transition-all text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/20 text-blue-500"><Move size={18} /></div>
                <span className="font-medium text-ink">Translation</span>
              </div>
              <ArrowRight size={16} className="text-ink-3 group-hover:text-blue-500 transition-colors" />
            </button>

            <button onClick={() => setMode('reflect')} className="w-full group flex items-center justify-between p-4 border border-rim rounded-xl bg-raised hover:bg-rose-500/10 hover:border-rose-500/50 transition-all text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-rose-500/20 text-rose-500"><FlipHorizontal size={18} /></div>
                <span className="font-medium text-ink">Reflection</span>
              </div>
              <ArrowRight size={16} className="text-ink-3 group-hover:text-rose-500 transition-colors" />
            </button>

            <button onClick={() => setMode('rotate')} className="w-full group flex items-center justify-between p-4 border border-rim rounded-xl bg-raised hover:bg-amber-500/10 hover:border-amber-500/50 transition-all text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-amber-500/20 text-amber-600"><RotateCw size={18} /></div>
                <span className="font-medium text-ink">Rotation</span>
              </div>
              <ArrowRight size={16} className="text-ink-3 group-hover:text-amber-600 transition-colors" />
            </button>

            <button onClick={() => setMode('dilate')} className="w-full group flex items-center justify-between p-4 border border-rim rounded-xl bg-raised hover:bg-fuchsia-500/10 hover:border-fuchsia-500/50 transition-all text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-fuchsia-500/20 text-fuchsia-500"><Maximize size={18} /></div>
                <span className="font-medium text-ink">Dilation</span>
              </div>
              <ArrowRight size={16} className="text-ink-3 group-hover:text-fuchsia-500 transition-colors" />
            </button>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-rim">
          <button
            onClick={resetShape}
            className="w-full flex items-center justify-center gap-2 p-3 border border-rim rounded-xl text-ink-2 hover:text-ink hover:border-rim hover:bg-raised transition-all text-sm cursor-pointer"
          >
            <RotateCcw size={14} /> Reset Shape
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={() => setMode(null)}
        className="flex items-center gap-2 text-ink-2 hover:text-ink transition-colors mb-6 text-sm cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Transforms
      </button>

      <div className="flex-1 overflow-y-auto">
        {mode === 'translate' && <TranslationPanel />}
        {mode === 'reflect' && <ReflectionPanel />}
        {mode === 'rotate' && <RotationPanel />}
        {mode === 'dilate' && <DilationPanel />}
      </div>

      <VerticesPanel />
    </div>
  );
}

function VerticesPanel() {
  const store = useGeometryStore();
  const { vertices, mode } = store;

  const transformed = useMemo(() => {
    if (mode === 'translate') return vertices.map(v => translatePoint(v, store.translationVector));
    if (mode === 'reflect') return vertices.map(v => reflectPoint(v, store.reflectionLine.p1, store.reflectionLine.p2));
    if (mode === 'rotate') return vertices.map(v => rotatePoint(v, store.rotationPivot, store.rotationAngle));
    if (mode === 'dilate') return vertices.map(v => dilatePoint(v, store.dilationCenter, store.dilationScale));
    return vertices;
  }, [store, vertices, mode]);

  return (
    <div className="mt-6 pt-6 border-t border-rim space-y-4">
      <div>
        <h3 className="text-xs font-medium text-ink-2 mb-2 uppercase tracking-wider">Original</h3>
        <div className="space-y-1">
          {vertices.map((v, i) => (
            <div key={i} className="flex justify-between items-center bg-raised border border-rim rounded-md px-2 py-1.5">
              <span className="text-ink-3 font-mono text-xs">v{i + 1}</span>
              <span className="text-ink font-mono text-xs">({v[0].toFixed(2)}, {v[1].toFixed(2)})</span>
            </div>
          ))}
        </div>
      </div>

      {mode !== null && (
        <div>
          <h3 className="text-xs font-medium text-blue-500 mb-2 uppercase tracking-wider">Transformed</h3>
          <div className="space-y-1">
            {transformed.map((v, i) => (
              <div key={i} className="flex justify-between items-center bg-blue-500/5 border border-blue-500/20 rounded-md px-2 py-1.5">
                <span className="text-blue-500/60 font-mono text-xs">v{i + 1}&apos;</span>
                <span className="text-blue-600 dark:text-blue-300 font-mono text-xs">({v[0].toFixed(2)}, {v[1].toFixed(2)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-ink-3">Drag vertices on the chart to reposition.</p>
    </div>
  );
}
