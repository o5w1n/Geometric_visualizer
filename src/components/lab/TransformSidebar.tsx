"use client";

import { useMemo } from "react";
import { useGeometryStore } from "@/store/useGeometryStore";
import {
  reflectPoint,
  rotatePoint,
  translatePoint,
  applyCombined2D,
  type Point,
} from "@/lib/transformationUtils";
import {
  affine3DMatrix,
  combinedMatrix2D,
  formatMatrixRows,
  rotationAboutPivotMatrix2D,
  scaleAboutCenterMatrix2D,
  translationMatrix2D,
} from "@/lib/transformMatrices";
import { RotateCcw, Plus, Trash2 } from "lucide-react";

function MatrixBlock({ rows, title }: { rows: string[]; title: string }) {
  return (
    <div>
      <p className="viz-muted uppercase text-[10px] tracking-wider mb-1.5">{title}</p>
      <div className="viz-matrix-block">
        <pre>{rows.join("\n")}</pre>
      </div>
    </div>
  );
}

export function TransformSidebar() {
  const {
    mode,
    resetShape,
    translationVector,
    setTranslationVector,
    rotationAngle,
    setRotationAngle,
    rotationPivot,
    reflectionLine,
    dilationCenter,
    dilationScale,
    dilationScaleY,
    setDilationScale,
    setDilationScaleY,
    combinedAngle,
    setCombinedAngle,
    combinedScale,
    setCombinedScale,
    combinedTranslate,
    setCombinedTranslate,
    combinedOrder,
    setCombinedOrder,
    rotation3D,
    setRotation3D,
    scale3D,
    setScale3D,
    translation3D,
    setTranslation3D,
  } = useGeometryStore();

  const matrix3 = useMemo(() => {
    if (mode === "translate") return formatMatrixRows(translationMatrix2D(translationVector[0], translationVector[1]));
    if (mode === "rotate") return formatMatrixRows(rotationAboutPivotMatrix2D(rotationAngle, rotationPivot));
    if (mode === "scale") return formatMatrixRows(scaleAboutCenterMatrix2D(dilationScale, dilationScaleY, dilationCenter));
    if (mode === "combined") return formatMatrixRows(combinedMatrix2D(combinedAngle, combinedScale, combinedTranslate, combinedOrder));
    if (mode === "threeD") return formatMatrixRows(affine3DMatrix(rotation3D, scale3D, translation3D));
    return [];
  }, [
    mode,
    translationVector,
    rotationAngle,
    rotationPivot,
    dilationCenter,
    dilationScale,
    dilationScaleY,
    combinedAngle,
    combinedScale,
    combinedTranslate,
    combinedOrder,
    rotation3D,
    scale3D,
    translation3D,
  ]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="viz-card p-4 space-y-4">
        {mode === "translate" && (
          <>
            <h3 className="viz-title">Translation</h3>
            <Slider label="dx" value={translationVector[0]} min={-10} max={10} step={0.5} onChange={(v) => setTranslationVector([v, translationVector[1]])} />
            <Slider label="dy" value={translationVector[1]} min={-10} max={10} step={0.5} onChange={(v) => setTranslationVector([translationVector[0], v])} />
            {matrix3.length > 0 && <MatrixBlock title="Homogeneous matrix (3×3)" rows={matrix3} />}
            <p className="viz-formula">
              x&apos; = x {translationVector[0] >= 0 ? "+" : ""}
              {translationVector[0].toFixed(1)}
              <br />
              y&apos; = y {translationVector[1] >= 0 ? "+" : ""}
              {translationVector[1].toFixed(1)}
            </p>
          </>
        )}
        {mode === "reflect" && (
          <>
            <h3 className="viz-title">Reflection</h3>
            <p className="viz-muted">Drag the red control points on the chart to set the mirror line.</p>
            <p className="viz-formula">
              P₁ ({reflectionLine.p1[0].toFixed(1)}, {reflectionLine.p1[1].toFixed(1)}) → P₂ ({reflectionLine.p2[0].toFixed(1)}, {reflectionLine.p2[1].toFixed(1)})
            </p>
          </>
        )}
        {mode === "rotate" && (
          <>
            <h3 className="viz-title">Rotation</h3>
            <Slider label="θ" value={rotationAngle} min={-180} max={180} step={1} suffix="°" onChange={setRotationAngle} />
            {matrix3.length > 0 && <MatrixBlock title="Matrix about pivot (3×3)" rows={matrix3} />}
            <p className="viz-formula">
              x&apos; = cos θ · (x − pₓ) − sin θ · (y − pᵧ) + pₓ
              <br />
              y&apos; = sin θ · (x − pₓ) + cos θ · (y − pᵧ) + pᵧ
            </p>
            <p className="viz-muted">
              Pivot: ({rotationPivot[0].toFixed(1)}, {rotationPivot[1].toFixed(1)})
            </p>
          </>
        )}
        {mode === "scale" && (
          <>
            <h3 className="viz-title">Scaling</h3>
            <Slider label="sx" value={dilationScale} min={-3} max={3} step={0.1} onChange={setDilationScale} />
            <Slider label="sy" value={dilationScaleY} min={-3} max={3} step={0.1} onChange={setDilationScaleY} />
            <MatrixBlock title="Matrix about center (3×3)" rows={matrix3} />
            <p className="viz-muted">
              Center: ({dilationCenter[0].toFixed(1)}, {dilationCenter[1].toFixed(1)})
            </p>
          </>
        )}
        {mode === "combined" && (
          <>
            <h3 className="viz-title">Combined</h3>
            <p className="viz-muted text-[11px] mb-2">Composition order for affine steps (matches live preview).</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCombinedOrder("trs")}
                className={`viz-pill flex-1 py-2 text-xs cursor-pointer ${combinedOrder === "trs" ? "viz-pill-active" : ""}`}
              >
                Rotate → scale → translate
              </button>
              <button
                type="button"
                onClick={() => setCombinedOrder("rst")}
                className={`viz-pill flex-1 py-2 text-xs cursor-pointer ${combinedOrder === "rst" ? "viz-pill-active" : ""}`}
              >
                Scale → rotate → translate
              </button>
            </div>
            <Slider label="θ" value={combinedAngle} min={-180} max={180} step={1} suffix="°" onChange={setCombinedAngle} />
            <Slider label="sx" value={combinedScale[0]} min={-3} max={3} step={0.1} onChange={(v) => setCombinedScale([v, combinedScale[1]])} />
            <Slider label="sy" value={combinedScale[1]} min={-3} max={3} step={0.1} onChange={(v) => setCombinedScale([combinedScale[0], v])} />
            <Slider label="dx" value={combinedTranslate[0]} min={-10} max={10} step={0.5} onChange={(v) => setCombinedTranslate([v, combinedTranslate[1]])} />
            <Slider label="dy" value={combinedTranslate[1]} min={-10} max={10} step={0.5} onChange={(v) => setCombinedTranslate([combinedTranslate[0], v])} />
            <MatrixBlock title="Combined affine (3×3)" rows={matrix3} />
          </>
        )}
        {mode === "threeD" && (
          <>
            <h3 className="viz-title">3D transformations</h3>
            <p className="viz-muted text-[11px] mb-2">Euler rotate (X→Y→Z), then scale and translate — same order as the chart preview.</p>
            <p className="viz-title text-xs pt-1">Rotation (°)</p>
            <Slider label="X" value={rotation3D[0]} min={-180} max={180} step={1} suffix="°" onChange={(v) => setRotation3D([v, rotation3D[1], rotation3D[2]])} />
            <Slider label="Y" value={rotation3D[1]} min={-180} max={180} step={1} suffix="°" onChange={(v) => setRotation3D([rotation3D[0], v, rotation3D[2]])} />
            <Slider label="Z" value={rotation3D[2]} min={-180} max={180} step={1} suffix="°" onChange={(v) => setRotation3D([rotation3D[0], rotation3D[1], v])} />
            <p className="viz-title text-xs pt-2">Scale</p>
            <Slider label="Sx" value={scale3D[0]} min={0.2} max={3} step={0.01} onChange={(v) => setScale3D([v, scale3D[1], scale3D[2]])} />
            <Slider label="Sy" value={scale3D[1]} min={0.2} max={3} step={0.01} onChange={(v) => setScale3D([scale3D[0], v, scale3D[2]])} />
            <Slider label="Sz" value={scale3D[2]} min={0.2} max={3} step={0.01} onChange={(v) => setScale3D([scale3D[0], scale3D[1], v])} />
            <p className="viz-title text-xs pt-2">Translation</p>
            <Slider label="Tx" value={translation3D[0]} min={-80} max={80} step={1} onChange={(v) => setTranslation3D([v, translation3D[1], translation3D[2]])} />
            <Slider label="Ty" value={translation3D[1]} min={-80} max={80} step={1} onChange={(v) => setTranslation3D([translation3D[0], v, translation3D[2]])} />
            <Slider label="Tz" value={translation3D[2]} min={-80} max={80} step={1} onChange={(v) => setTranslation3D([translation3D[0], translation3D[1], v])} />
            <MatrixBlock title="Affine transform (4×4)" rows={matrix3} />
          </>
        )}
      </div>

      <VerticesPanel />
      <button
        type="button"
        onClick={resetShape}
        className="viz-pill w-full py-2.5 flex items-center justify-center gap-2 text-sm cursor-pointer"
      >
        <RotateCcw size={14} />
        Reset shape
      </button>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const shown =
    step >= 1 ? Math.round(value).toString() : value.toFixed(step >= 0.1 ? 1 : 2);
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="viz-muted uppercase text-[11px]">{label}</span>
        <span className="font-semibold text-ink">
          {shown}
          {suffix}
        </span>
      </div>
      <input className="viz-range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function VerticesPanel() {
  const store = useGeometryStore();
  const { vertices, mode, setVertices, updateVertex, combinedOrder } = store;

  const transformed = useMemo(() => {
    if (mode === "translate") return vertices.map((v) => translatePoint(v, store.translationVector));
    if (mode === "reflect") return vertices.map((v) => reflectPoint(v, store.reflectionLine.p1, store.reflectionLine.p2));
    if (mode === "rotate") return vertices.map((v) => rotatePoint(v, store.rotationPivot, store.rotationAngle));
    if (mode === "scale")
      return vertices.map(
        (v) =>
          [
            store.dilationCenter[0] + (v[0] - store.dilationCenter[0]) * store.dilationScale,
            store.dilationCenter[1] + (v[1] - store.dilationCenter[1]) * store.dilationScaleY,
          ] as Point
      );
    if (mode === "combined")
      return vertices.map((v) =>
        applyCombined2D(v, store.combinedAngle, store.combinedScale, store.combinedTranslate, combinedOrder)
      );
    return vertices;
  }, [store, vertices, mode, combinedOrder]);

  function handleCoord(i: number, axis: 0 | 1, raw: string) {
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    const next: Point = [...vertices[i]] as Point;
    next[axis] = n;
    updateVertex(i, next);
  }

  function addVertex() {
    setVertices([...vertices, [0, 0]]);
  }

  function removeVertex(i: number) {
    if (vertices.length <= 3) return;
    setVertices(vertices.filter((_, idx) => idx !== i));
  }

  return (
    <div className="viz-card p-4 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-ink-2 uppercase tracking-wider">Vertices</h3>
          <button
            type="button"
            onClick={addVertex}
            className="flex items-center gap-1 text-[10px] text-ink-3 hover:text-ink transition-colors cursor-pointer"
          >
            <Plus size={10} /> Add
          </button>
        </div>
        <div className="space-y-1">
          {vertices.map((v, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-ink-3 font-mono text-[10px] w-5 shrink-0">v{i + 1}</span>
              <input
                type="number"
                step="0.5"
                defaultValue={v[0]}
                key={`${i}-x-${v[0]}`}
                onChange={(e) => handleCoord(i, 0, e.target.value)}
                className="viz-input flex-1 min-w-0 py-1.5"
              />
              <input
                type="number"
                step="0.5"
                defaultValue={v[1]}
                key={`${i}-y-${v[1]}`}
                onChange={(e) => handleCoord(i, 1, e.target.value)}
                className="viz-input flex-1 min-w-0 py-1.5"
              />
              <button
                type="button"
                onClick={() => removeVertex(i)}
                disabled={vertices.length <= 3}
                className="shrink-0 text-ink-3 hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {mode !== null && mode !== "threeD" && (
        <div>
          <h3 className="text-xs font-medium text-blue-500 mb-2 uppercase tracking-wider">Transformed</h3>
          <div className="space-y-1">
            {transformed.map((v, i) => (
              <div key={i} className="flex justify-between items-center bg-blue-500/5 border border-blue-500/20 rounded-md px-2 py-1.5">
                <span className="text-blue-500/60 font-mono text-xs">v{i + 1}&apos;</span>
                <span className="text-blue-600 dark:text-blue-300 font-mono text-xs">
                  ({v[0].toFixed(2)}, {v[1].toFixed(2)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-ink-3">Edit coordinates or drag points on the chart.</p>
    </div>
  );
}
