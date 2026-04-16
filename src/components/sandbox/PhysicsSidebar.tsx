"use client";

import { useGeometryStore } from "@/store/useGeometryStore";
import { usePhysicsPositionStore } from "@/store/usePhysicsPositionStore";
import { SHAPE_DEFINITIONS } from "@/lib/shapeDefinitions";
import { CUBE_FACES } from "@/lib/cubeNet";
import { KatexRenderer } from "@/components/shared/KatexRenderer";
import { NetSVG } from "./NetSVG";
import { Trash2 } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function dist(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  );
}

// ── Cube Net Unfolding Panel ───────────────────────────────────────────────────

function CubeUnfoldPanel() {
  const unfoldProgress = useGeometryStore(s => s.unfoldProgress);
  const setUnfoldProgress = useGeometryStore(s => s.setUnfoldProgress);

  // How many s² terms are currently lit
  const litCount = CUBE_FACES.filter(f => unfoldProgress >= f.threshold).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Net Unfolding</h3>
        <span className="font-mono text-[10px] text-ink-3 tabular-nums">
          {(unfoldProgress * 100).toFixed(0)}%
        </span>
      </div>

      {/* Slider */}
      <div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={unfoldProgress}
          onChange={e => setUnfoldProgress(parseFloat(e.target.value))}
          className="w-full accent-red-500 cursor-pointer"
          aria-label="Cube unfold progress"
        />
        <div className="flex justify-between text-[9px] font-mono text-ink-4 mt-0.5 select-none">
          <span>assembled</span>
          <span>flat net</span>
        </div>
      </div>

      {/* 2-D SVG net */}
      <div className="rounded-xl overflow-hidden border border-rim bg-panel p-3">
        <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider mb-2">
          Cross net · 6 faces
        </p>
        <NetSVG progress={unfoldProgress} />
      </div>

      {/* SA = 6s² with per-face s² highlighting ──────────────────────────── */}
      <div className="bg-raised border border-rim rounded-xl p-4">
        <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider mb-3">
          Surface area formula
        </p>

        {/* Main equation row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-sm text-ink">SA&nbsp;=&nbsp;6s²</span>
          <span className="font-mono text-[10px] text-ink-3">=</span>
          <span className="font-mono text-sm font-semibold" style={{ color: "#ef4444" }}>
            {litCount}
          </span>
          <span className="font-mono text-[10px] text-ink-3">face{litCount !== 1 ? "s" : ""} revealed</span>
        </div>

        {/* Six individual s² terms */}
        <div className="flex flex-wrap gap-1.5">
          {CUBE_FACES.map((face, i) => {
            const lit = unfoldProgress >= face.threshold;
            return (
              <div key={face.id} className="flex items-center gap-0.5">
                {i > 0 && (
                  <span className="font-mono text-[11px] text-ink-4 px-0.5">+</span>
                )}
                <span
                  title={face.label}
                  className="inline-flex flex-col items-center px-2 py-1 rounded-lg
                             font-mono text-xs font-semibold border transition-all duration-300"
                  style={
                    lit
                      ? {
                          backgroundColor: `${face.color}18`,
                          borderColor: `${face.color}60`,
                          color: face.color,
                          boxShadow: `0 0 6px ${face.color}30`,
                        }
                      : {
                          backgroundColor: "transparent",
                          borderColor: "var(--rim)",
                          color: "var(--ink-4)",
                        }
                  }
                >
                  <span>s²</span>
                  <span
                    className="text-[8px] font-normal tracking-wide opacity-70 leading-none mt-0.5"
                  >
                    {face.short}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Running total */}
        <div className="mt-3 pt-3 border-t border-rim flex items-center justify-between">
          <span className="font-mono text-[10px] text-ink-3">
            SA&nbsp;=&nbsp;{litCount}&nbsp;×&nbsp;(1)²
          </span>
          <span className="font-mono text-sm font-semibold text-ink">
            = {litCount} u²
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function PhysicsSidebar() {
  const { selectedShape, spawnedShapes, clearShapes } = useGeometryStore();
  const positions = usePhysicsPositionStore(s => s.positions);
  const def = SHAPE_DEFINITIONS[selectedShape];
  const isCube = selectedShape === "cube";

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">

      {/* ── Cube net-unfolding panel (cube only) ────────────────── */}
      {isCube && (
        <section>
          <CubeUnfoldPanel />
        </section>
      )}

      {/* ── Shape formula card ──────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-ink mb-1">
          <span style={{ color: def.color }}>{def.emoji}</span> {def.label}
        </h2>
        <p className="text-ink-3 text-xs mb-4">
          {def.is3D ? "3D solid — surface area + volume" : "2D flat shape — area"}
        </p>

        {/* Hide the static formula block when the interactive net panel
            already shows the formula to avoid duplication */}
        {!isCube && (
          <div className="bg-raised border border-rim rounded-xl p-4 space-y-4">
            <div>
              <p className="text-[10px] text-ink-3 uppercase tracking-wider mb-2">
                {def.is3D ? "Surface Area" : "Area"}
              </p>
              <div className="text-center text-sm mb-1">
                <KatexRenderer expression={def.areaFormula} />
              </div>
              <div className="text-center text-xs text-ink-2">
                <KatexRenderer expression={def.areaComputed} />
              </div>
            </div>

            {def.is3D && def.volumeFormula && def.volumeComputed && (
              <div className="pt-3 border-t border-rim">
                <p className="text-[10px] text-ink-3 uppercase tracking-wider mb-2">
                  Volume
                </p>
                <div className="text-center text-sm mb-1">
                  <KatexRenderer expression={def.volumeFormula} />
                </div>
                <div className="text-center text-xs text-ink-2">
                  <KatexRenderer expression={def.volumeComputed} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* For cube: show volume only (SA handled interactively above) */}
        {isCube && def.volumeFormula && def.volumeComputed && (
          <div className="bg-raised border border-rim rounded-xl p-4">
            <p className="text-[10px] text-ink-3 uppercase tracking-wider mb-2">
              Volume
            </p>
            <div className="text-center text-sm mb-1">
              <KatexRenderer expression={def.volumeFormula} />
            </div>
            <div className="text-center text-xs text-ink-2">
              <KatexRenderer expression={def.volumeComputed} />
            </div>
          </div>
        )}
      </section>

      {/* ── Live positions ──────────────────────────────────────── */}
      <section className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-ink">
            Live Positions
            <span className="ml-2 text-ink-3 font-mono text-xs">
              ({spawnedShapes.length})
            </span>
          </h3>
          {spawnedShapes.length > 0 && (
            <button
              onClick={clearShapes}
              className="flex items-center gap-1 text-xs text-ink-3 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <Trash2 size={12} /> Clear all
            </button>
          )}
        </div>

        {spawnedShapes.length === 0 ? (
          <p className="text-ink-3 text-xs text-center py-8">
            No shapes spawned yet.<br />Click &quot;Spawn Shape&quot; to add one.
          </p>
        ) : (
          <div className="space-y-2">
            {spawnedShapes.map((shape, i) => {
              const shapeDef = SHAPE_DEFINITIONS[shape.type];
              const pos = positions[shape.id] ?? shape.spawnPos;
              const d = dist(pos, shape.spawnPos);
              const isMoving = d > 0.05;

              return (
                <div
                  key={shape.id}
                  className="bg-raised border border-rim rounded-xl p-3 space-y-2"
                  style={{ borderLeftColor: shapeDef.color, borderLeftWidth: 3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: shapeDef.color }}>
                        {shapeDef.emoji}
                      </span>
                      <span className="text-ink-2 text-xs font-medium">
                        {shapeDef.label} #{i + 1}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isMoving
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "bg-rim text-ink-3"
                      }`}
                    >
                      {isMoving ? "moving" : "resting"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    {(["x", "y", "z"] as const).map((axis, ai) => (
                      <div
                        key={axis}
                        className="bg-panel rounded px-2 py-1 text-center border border-rim"
                      >
                        <p className="text-[9px] text-ink-3 uppercase">{axis}</p>
                        <p className="text-ink font-mono text-xs">
                          {pos[ai].toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-ink-3">
                      Distance from spawn
                    </span>
                    <span className="font-mono text-xs text-ink-2">
                      {d.toFixed(3)} u
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
