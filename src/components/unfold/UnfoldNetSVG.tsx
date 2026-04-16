"use client";

/**
 * UnfoldNetSVG
 * ------------
 * 2-D SVG net diagram for the currently selected shape.
 * Faces reveal progressively as unfoldProgress crosses each face's threshold.
 */

import { useGeometryStore } from "@/store/useGeometryStore";
import {
  SHAPE_NETS,
  type ShapeFace,
  type UnfoldShapeId,
} from "@/lib/shapeNets";

// ── SVG helpers ──────────────────────────────────────────────────────────────

/** Pixels per net-unit — controls the overall scale of the net diagram. */
const PX = 58;

/** Convert net-unit coords (math Y up) → SVG coords (Y down). */
function toSVG(x: number, y: number, ox: number, oy: number) {
  return [ox + x * PX, oy - y * PX] as [number, number];
}

// ── Per-face SVG element factory ─────────────────────────────────────────────

interface FaceSVGProps {
  face: ShapeFace;
  revealed: boolean;
  ox: number;   // SVG origin x
  oy: number;   // SVG origin y
}

function FaceSVG({ face, revealed, ox, oy }: FaceSVGProps) {
  const [cx, cy] = toSVG(face.svgX, face.svgY, ox, oy);
  const g = face.geo;

  const fill = revealed ? `${face.color}22` : 'transparent';
  const stroke = revealed ? face.color : '#374151';
  const sw = revealed ? 2 : 1;
  const style = { transition: 'fill 0.4s, stroke 0.4s, stroke-width 0.3s' };

  // ── plane ──────────────────────────────────────────────────────────────────
  if (g.kind === 'plane') {
    const w = g.w * PX;
    const h = g.h * PX;
    return (
      <g>
        <rect
          x={cx - w / 2} y={cy - h / 2}
          width={w} height={h} rx={4}
          fill={fill} stroke={stroke} strokeWidth={sw}
          style={style}
        />
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={Math.min(w, h) * 0.28}
          fontWeight="600" fontFamily="ui-monospace, monospace"
          fill={revealed ? face.color : '#6b7280'}
          style={{ transition: 'fill 0.4s' }}
        >
          {face.short}
        </text>
      </g>
    );
  }

  // ── circle ─────────────────────────────────────────────────────────────────
  if (g.kind === 'circle') {
    const r = g.r * PX;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r}
          fill={fill} stroke={stroke} strokeWidth={sw}
          style={style}
        />
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={r * 0.55}
          fontWeight="600" fontFamily="ui-monospace, monospace"
          fill={revealed ? face.color : '#6b7280'}
          style={{ transition: 'fill 0.4s' }}
        >
          {face.short}
        </text>
      </g>
    );
  }

  // ── equilateral triangle ────────────────────────────────────────────────────
  if (g.kind === 'tri-equilateral') {
    const s = g.side * PX;
    const h = (Math.sqrt(3) / 2) * s;
    const cy_off = h / 3; // centroid offset from base
    // Points relative to centroid (SVG Y-down, so flip the y)
    const pts = [
      `${cx - s / 2},${cy + cy_off}`,
      `${cx + s / 2},${cy + cy_off}`,
      `${cx},${cy - (h - cy_off)}`,
    ].join(' ');
    return (
      <g>
        <polygon points={pts}
          fill={fill} stroke={stroke} strokeWidth={sw}
          style={style}
        />
        <text
          x={cx} y={cy + cy_off * 0.3}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={s * 0.18}
          fontWeight="600" fontFamily="ui-monospace, monospace"
          fill={revealed ? face.color : '#6b7280'}
          style={{ transition: 'fill 0.4s' }}
        >
          {face.short}
        </text>
      </g>
    );
  }

  // ── isoceles triangle ───────────────────────────────────────────────────────
  if (g.kind === 'tri-isoceles') {
    const base = g.base * PX;
    const h = g.h * PX;
    const cy_off = h / 3;
    const pts = [
      `${cx - base / 2},${cy + cy_off}`,
      `${cx + base / 2},${cy + cy_off}`,
      `${cx},${cy - (h - cy_off)}`,
    ].join(' ');
    return (
      <g>
        <polygon points={pts}
          fill={fill} stroke={stroke} strokeWidth={sw}
          style={style}
        />
        <text
          x={cx} y={cy + cy_off * 0.3}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={base * 0.18}
          fontWeight="600" fontFamily="ui-monospace, monospace"
          fill={revealed ? face.color : '#6b7280'}
          style={{ transition: 'fill 0.4s' }}
        >
          {face.short}
        </text>
      </g>
    );
  }

  // ── sector (cone lateral) ───────────────────────────────────────────────────
  if (g.kind === 'sector') {
    const r = g.r * PX;
    const half = g.angle / 2;
    // Apex at (cx, cy), opens downward in SVG (so we draw arcs downward)
    const startAngle = Math.PI / 2 - half;  // from right, clockwise in SVG
    const endAngle   = Math.PI / 2 + half;
    const x1 = cx + Math.cos(startAngle) * r;
    const y1 = cy + Math.sin(startAngle) * r;  // SVG Y-down
    const x2 = cx + Math.cos(endAngle) * r;
    const y2 = cy + Math.sin(endAngle) * r;
    const largeArc = g.angle > Math.PI ? 1 : 0;
    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');
    return (
      <g>
        <path d={d}
          fill={fill} stroke={stroke} strokeWidth={sw}
          style={style}
        />
        <text
          x={cx} y={cy + r * 0.45}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={r * 0.22}
          fontWeight="600" fontFamily="ui-monospace, monospace"
          fill={revealed ? face.color : '#6b7280'}
          style={{ transition: 'fill 0.4s' }}
        >
          {face.short}
        </text>
      </g>
    );
  }

  return null;
}

// ── Public component ─────────────────────────────────────────────────────────

export function UnfoldNetSVG() {
  const shapeId = useGeometryStore(s => s.unfoldShapeId) as UnfoldShapeId;
  const progress = useGeometryStore(s => s.unfoldProgress);
  const def = SHAPE_NETS[shapeId] ?? SHAPE_NETS['cube'];

  const { xMin, yMin, xMax, yMax } = def.netBounds;
  const W = (xMax - xMin) * PX;
  const H = (yMax - yMin) * PX;
  // SVG origin: where net-unit (0,0) maps to in pixels
  const ox = -xMin * PX;
  const oy = yMax * PX;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-3">
      {/* Label */}
      <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest select-none">
        {def.label} · net diagram
      </p>

      {/* SVG net */}
      <div className="w-full flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W, maxHeight: '100%', display: 'block' }}
          aria-label={`${def.label} net diagram`}
        >
          {def.faces.map(face => (
            <FaceSVG
              key={face.id}
              face={face}
              revealed={progress >= face.threshold}
              ox={ox}
              oy={oy}
            />
          ))}
        </svg>
      </div>

      {/* Face count */}
      <p className="text-[10px] font-mono text-ink-4 select-none">
        {def.faces.filter(f => progress >= f.threshold).length} / {def.faces.length} faces revealed
      </p>
    </div>
  );
}
