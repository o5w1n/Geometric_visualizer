"use client";

import React, { useState, useMemo } from "react";
import { useShapeAudio } from "@/lib/useShapeAudio";
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, ReferenceLine 
} from "recharts";
import { useGeometryStore } from "@/store/useGeometryStore";
import { reflectPoint, rotatePoint, translatePoint, cohenSutherlandClip, Point } from "@/lib/transformationUtils";

// Build polygon edge list from vertices
function polyEdges(pts: Point[]): [Point, Point][] {
  return pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

// Custom SVG Overlay for shapes, clipping, and lines
type ChartPoint = { x: number; y: number; type?: string; index?: number };

type OverlayProps = {
  xAxisMap?: { 0?: { scale: (n: number) => number } };
  yAxisMap?: { 0?: { scale: (n: number) => number } };
  ghostData: ChartPoint[];
  activeData: ChartPoint[];
  mode: string | null;
  reflectionLine: { p1: Point; p2: Point };
  viewportEnabled: boolean;
  viewport: { xMin: number; yMin: number; xMax: number; yMax: number };
  originalColor: string;
  transformedColor: string;
};

const VisualsOverlay = (props: OverlayProps) => {
  const { xAxisMap, yAxisMap, ghostData, activeData, mode, reflectionLine,
          viewportEnabled, viewport, originalColor, transformedColor } = props;

  if (!xAxisMap || !yAxisMap) return null;

  const toPx = (x: number, y: number) => ({
    x: xAxisMap[0].scale(x),
    y: yAxisMap[0].scale(y)
  });

  // Convert shape data to SVG point strings
  const ghostPts = ghostData.length >= 3 ? ghostData.map((d) => {
    const px = toPx(d.x, d.y);
    return `${px.x},${px.y}`;
  }).join(' ') : '';

  const activePts = activeData.length >= 3 ? activeData.map((d) => {
    const px = toPx(d.x, d.y);
    return `${px.x},${px.y}`;
  }).join(' ') : '';

  // Reflection mirror line
  let mirrorLine = null;
  if (mode === 'reflect' && reflectionLine.p1 && reflectionLine.p2) {
    const [x1, y1] = reflectionLine.p1;
    const [x2, y2] = reflectionLine.p2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0.0001) {
      const px1 = toPx(x1 - (dx / len) * 30, y1 - (dy / len) * 30);
      const px2 = toPx(x2 + (dx / len) * 30, y2 + (dy / len) * 30);
      mirrorLine = <line x1={px1.x} y1={px1.y} x2={px2.x} y2={px2.y} stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" className="pointer-events-none" />;
    }
  }

  // Cohen-Sutherland clipped edges
  const clippedEdges: React.ReactElement[] = [];
  const outsideEdges: React.ReactElement[] = [];
  if (viewportEnabled && viewport) {
    const { xMin, xMax, yMin, yMax } = viewport;
    const shapeVerts: Point[] = activeData.map((d) => [d.x, d.y] as Point);
    const edges = polyEdges(shapeVerts);

    edges.forEach(([p1, p2], i) => {
      const clipped = cohenSutherlandClip(p1, p2, xMin, xMax, yMin, yMax);
      // Full edge (outside, dimmed)
      const a = toPx(p1[0], p1[1]), b = toPx(p2[0], p2[1]);
      outsideEdges.push(
        <line key={`out-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke={transformedColor} strokeWidth={1.5} strokeOpacity={0.2} strokeDasharray="3 3" />
      );
      // Clipped segment (inside, bright)
      if (clipped) {
        const c = toPx(clipped.p1[0], clipped.p1[1]);
        const d = toPx(clipped.p2[0], clipped.p2[1]);
        clippedEdges.push(
          <line key={`in-${i}`} x1={c.x} y1={c.y} x2={d.x} y2={d.y}
            stroke="#f59e0b" strokeWidth={2.5} />
        );
      }
    });
  }

  // Viewport rectangle
  let viewportRect = null;
  if (viewportEnabled && viewport) {
    const { xMin, xMax, yMin, yMax } = viewport;
    const tl = toPx(xMin, yMax);
    const br = toPx(xMax, yMin);
    viewportRect = (
      <g>
        {/* Dark fill outside viewport using clipPath trick — just draw rect border */}
        <rect x={tl.x} y={tl.y} width={br.x - tl.x} height={br.y - tl.y}
          fill="rgba(245,158,11,0.05)" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 3" />
      </g>
    );
  }

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {/* Ghost Outline */}
      {ghostPts && (
        <polygon points={ghostPts}
          fill={hexToRgba(originalColor, 0.1)} stroke={originalColor} strokeWidth={2} strokeDasharray="4 4" />
      )}

      {/* Active shape — only when not clipping */}
      {activePts && mode !== null && !viewportEnabled && (
        <polygon points={activePts}
          fill={hexToRgba(transformedColor, 0.2)} stroke={transformedColor} strokeWidth={2} />
      )}

      {/* Clipping: dimmed full edges + bright clipped segments */}
      {outsideEdges}
      {clippedEdges}

      {/* Viewport rectangle + handles */}
      {viewportRect}

      {mirrorLine}
    </svg>
  );
};

function project3D(x: number, y: number, z: number, rot: [number, number, number], scale: [number, number, number], translate: [number, number, number]) {
  let px = x * scale[0];
  let py = y * scale[1];
  let pz = z * scale[2];
  const rx = (rot[0] * Math.PI) / 180;
  const ry = (rot[1] * Math.PI) / 180;
  const rz = (rot[2] * Math.PI) / 180;
  const y1 = py * Math.cos(rx) - pz * Math.sin(rx);
  const z1 = py * Math.sin(rx) + pz * Math.cos(rx);
  py = y1; pz = z1;
  const x2 = px * Math.cos(ry) + pz * Math.sin(ry);
  const z2 = -px * Math.sin(ry) + pz * Math.cos(ry);
  px = x2; pz = z2;
  const x3 = px * Math.cos(rz) - py * Math.sin(rz);
  const y3 = px * Math.sin(rz) + py * Math.cos(rz);
  px = x3; py = y3;
  px += translate[0] / 15;
  py += translate[1] / 15;
  pz += translate[2] / 15;
  const depth = 1 / (1 + (pz + 3) * 0.12);
  return { x: px * depth * 2, y: py * depth * 2 };
}

export function TransformChart() {
  const store = useGeometryStore();
  const { originalColor, transformedColor, setOriginalColor, setTransformedColor } = store;
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Custom drag state
  const [draggingItem, setDraggingItem] = useState<{ type: string, index?: number } | null>(null);
  
  // Derive the active transformed shape
  const activeVertices = useMemo(() => {
    if (store.mode === 'translate') {
      return store.vertices.map(v => translatePoint(v, store.translationVector));
    }
    if (store.mode === 'reflect') {
      return store.vertices.map(v => reflectPoint(v, store.reflectionLine.p1, store.reflectionLine.p2));
    }
    if (store.mode === 'rotate') {
      return store.vertices.map(v => rotatePoint(v, store.rotationPivot, store.rotationAngle));
    }
    if (store.mode === 'scale') {
      return store.vertices.map(v => [store.dilationCenter[0] + (v[0] - store.dilationCenter[0]) * store.dilationScale, store.dilationCenter[1] + (v[1] - store.dilationCenter[1]) * store.dilationScaleY] as Point);
    }
    if (store.mode === 'combined') {
      const angleRad = (store.combinedAngle * Math.PI) / 180;
      const sin = Math.sin(angleRad);
      const cos = Math.cos(angleRad);
      return store.vertices.map(([x, y]) => {
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;
        return [rx * store.combinedScale[0] + store.combinedTranslate[0], ry * store.combinedScale[1] + store.combinedTranslate[1]] as Point;
      });
    }
    return store.vertices; // fallback when mode is null
  }, [store]);

  // Play a tone whose pitch maps to the area of the transformed shape
  useShapeAudio(activeVertices, audioEnabled);

  const handleMouseDown = (props: { payload?: { type?: string; index?: number } } | undefined) => {
    if (!props || !props.payload) return;
    const { type, index } = props.payload;
    if (type) {
      setDraggingItem({ type, index });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!draggingItem) return;

    const svgRect = e.currentTarget.getBoundingClientRect();
    const ML = 20, MR = 20, MT = 20, MB = 20;
    const chartWidth = svgRect.width - ML - MR;
    const chartHeight = svgRect.height - MT - MB;
    
    const domainLength = 20;
    const domainMin = -10;
    
    const xPixel = e.clientX - svgRect.left - ML; 
    const yPixel = e.clientY - svgRect.top - MT;  
    
    const xValue = domainMin + (xPixel / chartWidth) * domainLength;
    const yValue = domainMin + ((chartHeight - yPixel) / chartHeight) * domainLength;
    
    const cleanX = Math.max(-10, Math.min(10, Math.round(xValue * 10) / 10));
    const cleanY = Math.max(-10, Math.min(10, Math.round(yValue * 10) / 10));
    const pos: Point = [cleanX, cleanY];

    if (draggingItem.type === 'vertex' && draggingItem.index !== undefined) {
      store.updateVertex(draggingItem.index, pos);
    } else if (draggingItem.type === 'reflect-p1') {
      store.updateReflectionLine('p1', pos);
    } else if (draggingItem.type === 'reflect-p2') {
      store.updateReflectionLine('p2', pos);
    } else if (draggingItem.type === 'pivot') {
      store.setRotationPivot(pos);
    } else if (draggingItem.type === 'center') {
      store.setDilationCenter(pos);
    } else if (draggingItem.type.startsWith('vp-')) {
      const corner = draggingItem.type.slice(3); // 'nw' | 'ne' | 'sw' | 'se'
      const { xMin, xMax, yMin, yMax } = store.viewport;
      const vp = { xMin, xMax, yMin, yMax };
      if (corner === 'nw' || corner === 'sw') vp.xMin = Math.min(cleanX, xMax - 1);
      if (corner === 'ne' || corner === 'se') vp.xMax = Math.max(cleanX, xMin + 1);
      if (corner === 'nw' || corner === 'ne') vp.yMax = Math.max(cleanY, yMin + 1);
      if (corner === 'sw' || corner === 'se') vp.yMin = Math.min(cleanY, yMax - 1);
      store.setViewport(vp);
    }
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };
  
  // Prepare data for recharts scatter layers
  const ghostData = store.mode === "threeD" ? [] : store.vertices.map((v, i) => ({ x: v[0], y: v[1], type: 'vertex', index: i }));
  const activeData = store.mode === "threeD" ? [] : activeVertices.map((v, i) => ({ x: v[0], y: v[1], type: 'active-vertex', index: i }));
  
  const interactablePoints = [];
  if (store.mode === 'reflect') {
    interactablePoints.push({ x: store.reflectionLine.p1[0], y: store.reflectionLine.p1[1], type: 'reflect-p1' });
    interactablePoints.push({ x: store.reflectionLine.p2[0], y: store.reflectionLine.p2[1], type: 'reflect-p2' });
  } else if (store.mode === 'rotate') {
    interactablePoints.push({ x: store.rotationPivot[0], y: store.rotationPivot[1], type: 'pivot' });
  } else if (store.mode === 'scale') {
    interactablePoints.push({ x: store.dilationCenter[0], y: store.dilationCenter[1], type: 'center' });
  }
  if (store.viewportEnabled) {
    const { xMin, xMax, yMin, yMax } = store.viewport;
    interactablePoints.push({ x: xMin, y: yMax, type: 'vp-nw' });
    interactablePoints.push({ x: xMax, y: yMax, type: 'vp-ne' });
    interactablePoints.push({ x: xMin, y: yMin, type: 'vp-sw' });
    interactablePoints.push({ x: xMax, y: yMin, type: 'vp-se' });
  }

  return (
    <div
      className="w-full h-full min-h-[500px] relative flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Chart area grows to fill available space */}
      <div className="relative flex-1 min-h-[420px]">

      {/* Audio toggle */}
      <button
        onClick={() => setAudioEnabled(v => !v)}
        title={audioEnabled ? "Mute shape audio" : "Enable shape audio"}
        className={`absolute top-2 right-2 z-10 px-2 py-1 rounded text-xs font-mono border transition-all ${audioEnabled ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-zinc-900/80 border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
      >
        {audioEnabled ? "♪ ON" : "♪ OFF"}
      </button>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke="#2f4470" strokeOpacity={0.5} strokeDasharray="1 0" />
          
          <XAxis type="number" dataKey="x" name="X axis" domain={[-10, 10]} tickCount={21} stroke="#4c659b" />
          <YAxis type="number" dataKey="y" name="Y axis" domain={[-10, 10]} tickCount={21} stroke="#4c659b" />
          
          <ReferenceLine y={0} stroke="#2e5ca9" strokeWidth={1.3} />
          <ReferenceLine x={0} stroke="#2e5ca9" strokeWidth={1.3} />
          
          {/* Active shape vertices (unclickable visually, just indicator) */}
          {store.mode !== null && store.mode !== "threeD" && (
            <Scatter name="ActiveShape" data={activeData} fill={transformedColor} shape="circle" isAnimationActive={false} pointerEvents="none" />
          )}

          {/* Ghost shape vertices (draggable) */}
          {store.mode !== "threeD" && <Scatter
            name="GhostShape"
            data={ghostData}
            fill={originalColor}
            shape="circle"
            onMouseDown={handleMouseDown}
            isAnimationActive={false}
            className="cursor-pointer"
          />}

          {/* Interactive controls (Pivots, reflection handles) */}
          {store.mode !== "threeD" && <Scatter 
            name="Controls" 
            data={interactablePoints} 
            fill="#f43f5e" 
            shape="star" 
            onMouseDown={handleMouseDown}
            isAnimationActive={false}
            className="cursor-pointer"
          />}
          
          {/* Custom SVG Overlay */}
          {store.mode !== "threeD" && <VisualsOverlay
            ghostData={ghostData}
            activeData={activeData}
            mode={store.mode}
            reflectionLine={store.reflectionLine}
            rotationPivot={store.rotationPivot}
            dilationCenter={store.dilationCenter}
            viewportEnabled={store.viewportEnabled}
            viewport={store.viewport}
            originalColor={originalColor}
            transformedColor={transformedColor}
          />}
          {store.mode === "threeD" && (
            <Scatter
              name="3DView"
              data={(() => {
                const verts = [
                  [-2, -2, -2], [2, -2, -2], [2, 2, -2], [-2, 2, -2],
                  [-2, -2, 2], [2, -2, 2], [2, 2, 2], [-2, 2, 2],
                ] as [number, number, number][];
                const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
                const lines: { x: number; y: number }[] = [];
                edges.forEach(([a, b]) => {
                  const p1 = project3D(...verts[a], store.rotation3D, store.scale3D, store.translation3D);
                  const p2 = project3D(...verts[b], store.rotation3D, store.scale3D, store.translation3D);
                  lines.push({ x: p1.x, y: p1.y }, { x: p2.x, y: p2.y });
                });
                return lines;
              })()}
              fill="#4d7ee5"
              line
              shape="circle"
              isAnimationActive={false}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
      </div>{/* end chart area */}

      {/* Color picker strip */}
      <ColorStrip
        originalColor={originalColor}
        transformedColor={transformedColor}
        onOriginal={setOriginalColor}
        onTransformed={setTransformedColor}
      />
    </div>
  );
}

function ColorStrip({ originalColor, transformedColor, onOriginal, onTransformed }: {
  originalColor: string;
  transformedColor: string;
  onOriginal: (c: string) => void;
  onTransformed: (c: string) => void;
}) {
  const origRgb  = hexToRgb(originalColor);
  const transRgb = hexToRgb(transformedColor);

  return (
    <div className="flex gap-3 px-4 py-3 border-t border-rim bg-panel/60">
      {[
        { label: 'Original', color: originalColor, rgb: origRgb, onChange: onOriginal },
        { label: 'Transformed', color: transformedColor, rgb: transRgb, onChange: onTransformed },
      ].map(({ label, color, rgb, onChange }) => (
        <div key={label} className="flex items-center gap-3 flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
          <label className="relative cursor-pointer shrink-0">
            <div
              className="w-7 h-7 rounded-md border-2 border-zinc-700 shadow-inner"
              style={{ backgroundColor: color }}
            />
            <input
              type="color"
              value={color}
              onChange={e => onChange(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </label>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider leading-none mb-1">{label}</span>
            <span className="font-mono text-xs text-zinc-300 leading-none">
              R <span className="text-zinc-100">{rgb.r}</span>
              &nbsp;G <span className="text-zinc-100">{rgb.g}</span>
              &nbsp;B <span className="text-zinc-100">{rgb.b}</span>
            </span>
          </div>
          <span className="ml-auto font-mono text-[10px] text-zinc-600 shrink-0">{color.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}
