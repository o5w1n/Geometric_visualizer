"use client";

/**
 * UnfoldSidebar
 * -------------
 * Right panel containing:
 *  1. Shape selector (6 shapes, pill buttons)
 *  2. Unfold slider (0 = assembled, 1 = flat net)
 *  3. Surface-area formula with per-face terms that light up progressively
 *  4. Volume formula (static reference)
 */

import { useGeometryStore } from "@/store/useGeometryStore";
import { KatexRenderer } from "@/components/shared/KatexRenderer";
import {
  SHAPE_NETS,
  UNFOLD_SHAPE_IDS,
  type UnfoldShapeId,
} from "@/lib/shapeNets";

// ── Shape labels & icons ─────────────────────────────────────────────────────

const SHAPE_META: Record<UnfoldShapeId, { icon: string; short: string }> = {
  'cube':        { icon: '■',  short: 'Cube' },
  'rect-prism':  { icon: '⬛', short: 'Rect Prism' },
  'cylinder':    { icon: '⬤', short: 'Cylinder' },
  'cone':        { icon: '▲', short: 'Cone' },
  'tri-prism':   { icon: '△', short: 'Tri Prism' },
  'sq-pyramid':  { icon: '⬡', short: 'Sq Pyramid' },
};

// ── Shape Selector ────────────────────────────────────────────────────────────

function ShapeSelector() {
  const shapeId    = useGeometryStore(s => s.unfoldShapeId) as UnfoldShapeId;
  const setShapeId = useGeometryStore(s => s.setUnfoldShapeId);

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">
        Shape
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {UNFOLD_SHAPE_IDS.map(id => {
          const { icon, short } = SHAPE_META[id];
          const active = id === shapeId;
          const color  = SHAPE_NETS[id].primaryColor;
          return (
            <button
              key={id}
              onClick={() => setShapeId(id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs
                         font-medium transition-all duration-200 cursor-pointer"
              style={
                active
                  ? {
                      backgroundColor: `${color}18`,
                      borderColor: `${color}60`,
                      color,
                    }
                  : undefined
              }
              aria-pressed={active}
            >
              <span style={active ? { color } : {}}>{icon}</span>
              <span className={active ? '' : 'text-ink-2'}>{short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Unfold Slider ─────────────────────────────────────────────────────────────

function UnfoldSlider() {
  const progress    = useGeometryStore(s => s.unfoldProgress);
  const setProgress = useGeometryStore(s => s.setUnfoldProgress);
  const shapeId     = useGeometryStore(s => s.unfoldShapeId) as UnfoldShapeId;
  const color       = SHAPE_NETS[shapeId]?.primaryColor ?? '#ef4444';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">
          Unfold Progress
        </p>
        <span className="font-mono text-[10px] text-ink-3 tabular-nums">
          {(progress * 100).toFixed(0)}%
        </span>
      </div>
      <input
        type="range"
        min={0} max={1} step={0.001}
        value={progress}
        onChange={e => setProgress(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: color }}
        aria-label="Unfold progress"
      />
      <div className="flex justify-between text-[9px] font-mono text-ink-4 select-none">
        <span>assembled</span>
        <span>flat net</span>
      </div>
    </div>
  );
}

// ── SA Formula Panel ──────────────────────────────────────────────────────────

function FormulaPanel() {
  const progress = useGeometryStore(s => s.unfoldProgress);
  const shapeId  = useGeometryStore(s => s.unfoldShapeId) as UnfoldShapeId;
  const def      = SHAPE_NETS[shapeId] ?? SHAPE_NETS['cube'];

  const litFaces = def.faces.filter(f => progress >= f.threshold);
  const litCount = litFaces.length;

  return (
    <div className="space-y-4">
      {/* SA formula row */}
      <div className="bg-raised border border-rim rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">
          Surface area
        </p>

        <div className="text-center">
          <KatexRenderer expression={def.saFormula} />
        </div>

        {/* Per-face term badges */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {def.faces.map((face, i) => {
            const lit = progress >= face.threshold;
            return (
              <span
                key={face.id}
                title={face.label}
                className="inline-flex flex-col items-center px-2.5 py-1.5 rounded-lg
                           border font-mono text-[10px] font-semibold transition-all duration-300"
                style={
                  lit
                    ? {
                        backgroundColor: `${face.color}18`,
                        borderColor: `${face.color}55`,
                        color: face.color,
                        boxShadow: `0 0 6px ${face.color}30`,
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: 'var(--rim)',
                        color: 'var(--ink-4)',
                      }
                }
              >
                <span>{i + 1}</span>
                <span
                  className="text-[8px] font-normal opacity-70 leading-none mt-0.5 tracking-wide"
                >
                  {face.short}
                </span>
              </span>
            );
          })}
        </div>

        {/* Running tally */}
        <div className="pt-2 border-t border-rim flex items-center justify-between">
          <span className="font-mono text-[10px] text-ink-3">
            {litCount} / {def.faces.length} faces revealed
          </span>
          <span
            className="font-mono text-sm font-semibold tabular-nums"
            style={{ color: def.primaryColor }}
          >
            {litCount === def.faces.length ? (
              <KatexRenderer expression={def.saComputed} />
            ) : (
              `${litCount} face${litCount !== 1 ? 's' : ''}`
            )}
          </span>
        </div>
      </div>

      {/* Volume (static) */}
      <div className="bg-raised border border-rim rounded-xl p-4 space-y-2">
        <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">
          Volume
        </p>
        <div className="text-center text-sm">
          <KatexRenderer expression={def.volFormula} />
        </div>
        <div className="text-center text-xs text-ink-2">
          <KatexRenderer expression={def.volComputed} />
        </div>
      </div>
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export function UnfoldSidebar() {
  return (
    <div className="flex flex-col gap-5 p-5 h-full overflow-y-auto">
      <ShapeSelector />
      <UnfoldSlider />
      <FormulaPanel />
    </div>
  );
}
