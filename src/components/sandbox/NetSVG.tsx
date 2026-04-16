"use client";

/**
 * NetSVG
 * ------
 * 2-D cross-net diagram for the unit cube.
 *
 * Layout (4 columns × 3 rows, each cell = cellSize px):
 *
 *        col0  col1   col2   col3
 * row0         [Top]
 * row1  [Left][Front][Right][Back]
 * row2         [Bot]
 *
 * Each face fades from "ghost" to "filled" as unfoldProgress crosses the
 * face's threshold.  Fold-edges between adjacent faces are shown as dashed
 * lines that become solid when both faces are revealed.
 */

import { CUBE_FACES } from "@/lib/cubeNet";

interface NetSVGProps {
  progress: number;
  /** px per grid cell — default 54 */
  cellSize?: number;
}

// Pairs of face IDs that share a fold-edge, plus the edge's SVG coordinates
const FOLD_EDGES = [
  { a: "front", b: "top",    x1: 1, y1: 1, x2: 2, y2: 1 },
  { a: "front", b: "bottom", x1: 1, y1: 2, x2: 2, y2: 2 },
  { a: "front", b: "left",   x1: 1, y1: 1, x2: 1, y2: 2 },
  { a: "front", b: "right",  x1: 2, y1: 1, x2: 2, y2: 2 },
  { a: "right", b: "back",   x1: 3, y1: 1, x2: 3, y2: 2 },
] as const;

export function NetSVG({ progress, cellSize = 54 }: NetSVGProps) {
  const W = 4 * cellSize;
  const H = 3 * cellSize;

  const thresholdMap = Object.fromEntries(
    CUBE_FACES.map((f) => [f.id, f.threshold]),
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: "block" }}
      aria-label="Cube cross-net diagram"
    >
      {/* ── Fold-edge lines ─────────────────────────────────── */}
      {FOLD_EDGES.map(({ a, b, x1, y1, x2, y2 }) => {
        const bothRevealed =
          progress >= thresholdMap[a] && progress >= thresholdMap[b];
        return (
          <line
            key={`${a}-${b}`}
            x1={x1 * cellSize}
            y1={y1 * cellSize}
            x2={x2 * cellSize}
            y2={y2 * cellSize}
            stroke={bothRevealed ? "#6366f1" : "#d1d5db"}
            strokeWidth={bothRevealed ? 2 : 1}
            strokeDasharray={bothRevealed ? "none" : "4 3"}
            style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
          />
        );
      })}

      {/* ── Face cells ──────────────────────────────────────── */}
      {CUBE_FACES.map((face) => {
        const revealed = progress >= face.threshold;
        const x = face.svgCol * cellSize;
        const y = face.svgRow * cellSize;
        const pad = 3;

        return (
          <g key={face.id} style={{ transition: "opacity 0.3s" }}>
            {/* Fill */}
            <rect
              x={x + pad}
              y={y + pad}
              width={cellSize - pad * 2}
              height={cellSize - pad * 2}
              rx={5}
              fill={revealed ? `${face.color}28` : "transparent"}
              stroke={revealed ? face.color : "#d1d5db"}
              strokeWidth={revealed ? 2 : 1}
              style={{ transition: "fill 0.4s, stroke 0.4s, stroke-width 0.3s" }}
            />

            {/* Face-color dot */}
            {revealed && (
              <circle
                cx={x + cellSize - 10}
                cy={y + 10}
                r={3.5}
                fill={face.color}
              />
            )}

            {/* Short label */}
            <text
              x={x + cellSize / 2}
              y={y + cellSize / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={cellSize * 0.24}
              fontWeight="600"
              fontFamily="ui-monospace, monospace"
              fill={revealed ? face.color : "#9ca3af"}
              style={{ transition: "fill 0.4s" }}
            >
              {face.short}
            </text>

            {/* "s²" label underneath */}
            <text
              x={x + cellSize / 2}
              y={y + cellSize / 2 + cellSize * 0.22}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={cellSize * 0.18}
              fontFamily="ui-monospace, monospace"
              fill={revealed ? face.color : "#c4c9d1"}
              opacity={revealed ? 0.7 : 0.4}
              style={{ transition: "fill 0.4s, opacity 0.4s" }}
            >
              s²
            </text>
          </g>
        );
      })}
    </svg>
  );
}
