"use client";

import { useEffect, useRef } from "react";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react";

const CLAMP = 15;
const clamp = (v: number) => Math.max(-CLAMP, Math.min(CLAMP, Math.round(v)));

export function AlgorithmSidebar() {
  const store = useAlgorithmStore();
  const {
    mode, setMode,
    lineX0, lineY0, lineX1, lineY1, setLineParam,
    circleCx, circleCy, circleR, setCircleParam,
    pixels, currentStep,
    isPlaying, setPlaying,
    stepForward, stepBack, reset,
  } = store;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const { currentStep, pixels } = useAlgorithmStore.getState();
        if (currentStep >= pixels.length) {
          useAlgorithmStore.getState().setPlaying(false);
        } else {
          useAlgorithmStore.getState().stepForward();
        }
      }, 120);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const current = pixels[currentStep - 1] ?? null;
  const next = pixels[currentStep] ?? null;
  const done = currentStep >= pixels.length;

  const numInput = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    color: string
  ) => (
    <div>
      <label className={`block text-xs mb-1 uppercase tracking-wider ${color}`}>{label}</label>
      <input
        type="number"
        min={-CLAMP} max={CLAMP} step={1}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="w-full bg-raised border border-rim rounded-md px-3 py-2 text-ink focus:outline-none focus:border-rim font-mono text-sm"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Mode selector */}
      <div>
        <h2 className="text-xl font-semibold mb-1 text-ink">Algorithm</h2>
        <p className="text-ink-2 text-sm mb-4">Select an algorithm and step through the pixel-by-pixel rasterisation.</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode('line')}
            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer ${mode === 'line' ? 'bg-blue-500/20 border-blue-500/60 text-blue-600 dark:text-blue-300' : 'border-rim text-ink-2 hover:border-rim'}`}
          >
            Bresenham Line
          </button>
          <button
            onClick={() => setMode('circle')}
            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer ${mode === 'circle' ? 'bg-purple-500/20 border-purple-500/60 text-purple-600 dark:text-purple-300' : 'border-rim text-ink-2 hover:border-rim'}`}
          >
            Midpoint Circle
          </button>
        </div>
      </div>

      {/* Params */}
      <div className="bg-raised border border-rim rounded-xl p-4">
        <h3 className="text-sm font-medium text-ink-2 mb-3">Parameters</h3>
        {mode === 'line' ? (
          <div className="grid grid-cols-2 gap-3">
            {numInput("x₀", lineX0, (v) => setLineParam('lineX0', v), "text-emerald-600 dark:text-emerald-400")}
            {numInput("y₀", lineY0, (v) => setLineParam('lineY0', v), "text-emerald-600 dark:text-emerald-400")}
            {numInput("x₁", lineX1, (v) => setLineParam('lineX1', v), "text-rose-600 dark:text-rose-400")}
            {numInput("y₁", lineY1, (v) => setLineParam('lineY1', v), "text-rose-600 dark:text-rose-400")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {numInput("cx", circleCx, (v) => setCircleParam('circleCx', v), "text-purple-600 dark:text-purple-400")}
            {numInput("cy", circleCy, (v) => setCircleParam('circleCy', v), "text-purple-600 dark:text-purple-400")}
            <div className="col-span-2">
              {numInput("radius", circleR, (v) => setCircleParam('circleR', Math.max(1, v)), "text-ink-2")}
            </div>
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div>
        <h3 className="text-sm font-medium text-ink-2 mb-3">Playback</h3>
        <div className="flex gap-2 mb-3">
          <button
            onClick={stepBack}
            disabled={currentStep === 0}
            className="flex-1 flex items-center justify-center gap-1 py-2 border border-rim rounded-lg text-ink-2 hover:bg-raised disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm cursor-pointer"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={() => { if (done) reset(); setPlaying(!isPlaying); }}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${isPlaying ? 'bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {isPlaying ? <><Pause size={16} /> Pause</> : done ? <><RotateCcw size={16} /> Replay</> : <><Play size={16} /> Play</>}
          </button>
          <button
            onClick={stepForward}
            disabled={done}
            className="flex-1 flex items-center justify-center gap-1 py-2 border border-rim rounded-lg text-ink-2 hover:bg-raised disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm cursor-pointer"
          >
            Step <ChevronRight size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-rim rounded-full h-1.5 mb-1">
          <div
            className={`h-1.5 rounded-full transition-all duration-100 ${mode === 'line' ? 'bg-blue-500' : 'bg-purple-500'}`}
            style={{ width: pixels.length ? `${(currentStep / pixels.length) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-ink-3 font-mono">
          <span>step {currentStep}</span>
          <span>of {pixels.length}</span>
        </div>
      </div>

      {/* Step detail panel */}
      <div className="bg-raised border border-rim rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-ink-2">Step Inspector</h3>

        {current ? (
          <div className="space-y-2">
            <Row label="Last plotted" value={`(${current.x}, ${current.y})`} />
            <Row label="Decision var (e)" value={String(current.decisionVar)} highlight />
            {current.label && <Row label="Step type" value={current.label} />}
          </div>
        ) : (
          <p className="text-ink-3 text-xs">Press Step or Play to begin.</p>
        )}

        {next && !done && (
          <div className="pt-2 border-t border-rim space-y-2">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider">Next pixel</p>
            <Row label="Coords" value={`(${next.x}, ${next.y})`} />
            <Row label="Decision var (e)" value={String(next.decisionVar)} />
          </div>
        )}

        {done && (
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium pt-1">
            ✓ Algorithm complete — {pixels.length} pixels plotted.
          </p>
        )}
      </div>

      {/* Algorithm description */}
      <div className="bg-raised border border-rim rounded-xl p-4">
        <h3 className="text-sm font-medium text-ink-2 mb-2">How it works</h3>
        {mode === 'line' ? (
          <p className="text-ink-3 text-xs leading-relaxed">
            Bresenham&apos;s line algorithm rasterises a line using only integer arithmetic. It maintains an error term <span className="text-blue-600 dark:text-blue-400 font-mono">e = dx − dy</span> and at each step decides whether to step in x, y, or both based on whether <span className="text-blue-600 dark:text-blue-400 font-mono">2e</span> exceeds the thresholds.
          </p>
        ) : (
          <p className="text-ink-3 text-xs leading-relaxed">
            The midpoint circle algorithm exploits 8-way symmetry. Starting at <span className="text-purple-600 dark:text-purple-400 font-mono">(r, 0)</span>, it tracks a decision parameter <span className="text-purple-600 dark:text-purple-400 font-mono">d = 1 − r</span> to choose between the E and SE pixel at each step, plotting all 8 octants simultaneously.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-ink-3 text-xs">{label}</span>
      <span className={`font-mono text-xs ${highlight ? 'text-amber-600 dark:text-amber-300' : 'text-ink-2'}`}>{value}</span>
    </div>
  );
}
