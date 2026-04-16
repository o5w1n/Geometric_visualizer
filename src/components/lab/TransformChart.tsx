"use client";

import React, { useState, useMemo } from "react";
import { useShapeAudio } from "@/lib/useShapeAudio";
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, ReferenceLine 
} from "recharts";
import { useGeometryStore } from "@/store/useGeometryStore";
import { reflectPoint, rotatePoint, dilatePoint, translatePoint, cohenSutherlandClip, Point } from "@/lib/transformationUtils";

// Build polygon edge list from vertices
function polyEdges(pts: Point[]): [Point, Point][] {
  return pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);
}

// Custom SVG Overlay for shapes, clipping, and lines
const VisualsOverlay = (props: any) => {
  const { xAxisMap, yAxisMap, ghostData, activeData, mode, reflectionLine,
          viewportEnabled, viewport } = props;

  if (!xAxisMap || !yAxisMap) return null;

  const toPx = (x: number, y: number) => ({
    x: xAxisMap[0].scale(x),
    y: yAxisMap[0].scale(y)
  });

  // Convert shape data to SVG point strings
  const ghostPts = ghostData.length >= 3 ? ghostData.map((d: any) => {
    const px = toPx(d.x, d.y);
    return `${px.x},${px.y}`;
  }).join(' ') : '';

  const activePts = activeData.length >= 3 ? activeData.map((d: any) => {
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
  let clippedEdges: React.ReactElement[] = [];
  let outsideEdges: React.ReactElement[] = [];
  if (viewportEnabled && viewport) {
    const { xMin, xMax, yMin, yMax } = viewport;
    const shapeVerts: Point[] = activeData.map((d: any) => [d.x, d.y] as Point);
    const edges = polyEdges(shapeVerts);

    edges.forEach(([p1, p2], i) => {
      const clipped = cohenSutherlandClip(p1, p2, xMin, xMax, yMin, yMax);
      // Full edge (outside, dimmed)
      const a = toPx(p1[0], p1[1]), b = toPx(p2[0], p2[1]);
      outsideEdges.push(
        <line key={`out-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="#3b82f6" strokeWidth={1.5} strokeOpacity={0.2} strokeDasharray="3 3" />
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
          fill="rgba(82,82,91,0.1)" stroke="#71717a" strokeWidth={2} strokeDasharray="4 4" />
      )}

      {/* Active shape — only when not clipping */}
      {activePts && mode !== null && !viewportEnabled && (
        <polygon points={activePts}
          fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth={2} />
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

export function TransformChart() {
  const store = useGeometryStore();
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
    if (store.mode === 'dilate') {
      return store.vertices.map(v => dilatePoint(v, store.dilationCenter, store.dilationScale));
    }
    return store.vertices; // fallback when mode is null
  }, [store]);

  // Play a tone whose pitch maps to the area of the transformed shape
  useShapeAudio(activeVertices, audioEnabled);

  const handleMouseDown = (props: any) => {
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
  const ghostData = store.vertices.map((v, i) => ({ x: v[0], y: v[1], type: 'vertex', index: i }));
  const activeData = activeVertices.map((v, i) => ({ x: v[0], y: v[1], type: 'active-vertex', index: i }));
  
  const interactablePoints = [];
  if (store.mode === 'reflect') {
    interactablePoints.push({ x: store.reflectionLine.p1[0], y: store.reflectionLine.p1[1], type: 'reflect-p1' });
    interactablePoints.push({ x: store.reflectionLine.p2[0], y: store.reflectionLine.p2[1], type: 'reflect-p2' });
  } else if (store.mode === 'rotate') {
    interactablePoints.push({ x: store.rotationPivot[0], y: store.rotationPivot[1], type: 'pivot' });
  } else if (store.mode === 'dilate') {
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
      className="w-full h-full min-h-[500px] relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
          
          <XAxis type="number" dataKey="x" name="X axis" domain={[-10, 10]} tickCount={21} stroke="#52525b" />
          <YAxis type="number" dataKey="y" name="Y axis" domain={[-10, 10]} tickCount={21} stroke="#52525b" />
          
          <ReferenceLine y={0} stroke="#71717a" strokeWidth={1} />
          <ReferenceLine x={0} stroke="#71717a" strokeWidth={1} />
          
          {/* Active shape vertices (unclickable visually, just indicator) */}
          {store.mode !== null && (
            <Scatter name="ActiveShape" data={activeData} fill="#3b82f6" shape="circle" isAnimationActive={false} pointerEvents="none" />
          )}

          {/* Ghost shape vertices (draggable) */}
          {/* Use standard grey circles for ghost points */}
          <Scatter 
            name="GhostShape" 
            data={ghostData} 
            fill="#a1a1aa" 
            shape="circle"
            onMouseDown={handleMouseDown}
            isAnimationActive={false}
            className="cursor-pointer"
          />

          {/* Interactive controls (Pivots, reflection handles) */}
          <Scatter 
            name="Controls" 
            data={interactablePoints} 
            fill="#f43f5e" 
            shape="star" 
            onMouseDown={handleMouseDown}
            isAnimationActive={false}
            className="cursor-pointer"
          />
          
          {/* Custom SVG Overlay */}
          <VisualsOverlay
            ghostData={ghostData}
            activeData={activeData}
            mode={store.mode}
            reflectionLine={store.reflectionLine}
            rotationPivot={store.rotationPivot}
            dilationCenter={store.dilationCenter}
            viewportEnabled={store.viewportEnabled}
            viewport={store.viewport}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
