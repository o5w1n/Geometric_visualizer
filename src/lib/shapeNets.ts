/**
 * shapeNets.ts
 * Face definitions for all 6 unfoldable shapes.
 * Used by UnfoldScene (3-D R3F) and UnfoldNetSVG (2-D SVG).
 *
 * Coordinate conventions
 * ──────────────────────
 * • "assembled" positions are centred at the origin in 3-D space.
 * • "net" positions are in the flat z = 0 plane, with the primary face
 *   centred at the origin.
 * • asmNormal is the outward-facing unit normal of each face in assembled
 *   state.  The R3F renderer uses THREE.Quaternion.setFromUnitVectors(
 *   Z_AXIS, asmNormal) to orient the plane mesh.
 * • netPos  always has euler = [0,0,0] (all faces flat in XY plane).
 */

export type UnfoldShapeId =
  | 'cube'
  | 'rect-prism'
  | 'cylinder'
  | 'cone'
  | 'tri-prism'
  | 'sq-pyramid';

// ── Geometry types for face meshes ──────────────────────────────────────────

export type FaceGeo =
  | { kind: 'plane'; w: number; h: number }
  | { kind: 'circle'; r: number }
  | { kind: 'tri-equilateral'; side: number }
  | { kind: 'tri-isoceles'; base: number; h: number }
  | { kind: 'sector'; r: number; angle: number };  // apex at origin, opens –Y

// ── Single face ──────────────────────────────────────────────────────────────

export interface ShapeFace {
  id: string;
  label: string;
  short: string;
  color: string;
  geo: FaceGeo;

  /** Outward unit-normal of this face in the assembled 3-D shape. */
  asmNormal: [number, number, number];
  /** Face-centre position in the assembled 3-D shape. */
  asmPos: [number, number, number];

  /** Face-centre position in the flat net (z = 0). */
  netPos: [number, number, number];

  /**
   * SVG face-centre in "net-unit" space (same scale as netPos).
   * The SVG renderer multiplies by px-per-unit to get pixel coords.
   */
  svgX: number;
  svgY: number;

  /** Per-face progress window within the global [0, 1] slider. */
  animWindow: [number, number];
  /** Global progress at which this face's formula term lights up. */
  threshold: number;

  /** KaTeX string for this face's SA contribution, e.g. "s^2". */
  areaLabel: string;
}

// ── Shape definition ─────────────────────────────────────────────────────────

/** Assembled-state geometry used only for the ghost/wireframe overlay. */
export type AssembledGeo =
  | { kind: 'box';       args: [number, number, number] }
  | { kind: 'cylinder';  rTop: number; rBot: number; h: number; seg: number }
  | { kind: 'cone';      r: number;    h: number;    seg: number }
  | { kind: 'tri-prism'; side: number; depth: number }
  | { kind: 'sq-pyramid'; base: number; h: number };

export interface ShapeNetDef {
  id: UnfoldShapeId;
  label: string;
  emoji: string;
  primaryColor: string;

  faces: ShapeFace[];

  saFormula: string;
  saComputed: string;
  volFormula: string;
  volComputed: string;

  /** Net bounding box in "net-unit" space (used to size the SVG viewBox). */
  netBounds: { xMin: number; yMin: number; xMax: number; yMax: number };

  assembledGeo: AssembledGeo;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Maps global [0,1] progress to a face-local [0,1] using its animWindow. */
export function faceProg(global: number, face: ShapeFace): number {
  const [s, e] = face.animWindow;
  if (e <= s) return 1;
  return Math.max(0, Math.min(1, (global - s) / (e - s)));
}

// Short-hands
const SQ3 = Math.sqrt(3);  // √3

// ── 1. Cube  (s = 1) ─────────────────────────────────────────────────────────
const CUBE: ShapeNetDef = {
  id: 'cube', label: 'Cube', emoji: '■', primaryColor: '#ef4444',
  saFormula: 'SA = 6s^2', saComputed: 'SA = 6(1)^2 = 6\\text{ u}^2',
  volFormula: 'V = s^3',  volComputed: 'V = (1)^3 = 1\\text{ u}^3',
  assembledGeo: { kind: 'box', args: [1, 1, 1] },
  netBounds: { xMin: -1.5, yMin: -1.5, xMax: 2.5, yMax: 1.5 },
  faces: [
    {
      id: 'front', label: 'Front', short: 'F', color: '#ef4444',
      geo: { kind: 'plane', w: 1, h: 1 },
      asmNormal: [0, 0, 1], asmPos: [0, 0, 0.5],
      netPos: [0, 0, 0], svgX: 0, svgY: 0,
      animWindow: [0, 1], threshold: 0, areaLabel: 's^2',
    },
    {
      id: 'top', label: 'Top', short: 'T', color: '#3b82f6',
      geo: { kind: 'plane', w: 1, h: 1 },
      asmNormal: [0, 1, 0], asmPos: [0, 0.5, 0],
      netPos: [0, 1, 0], svgX: 0, svgY: 1,
      animWindow: [0, 0.65], threshold: 0.15, areaLabel: 's^2',
    },
    {
      id: 'bottom', label: 'Bottom', short: 'Bo', color: '#10b981',
      geo: { kind: 'plane', w: 1, h: 1 },
      asmNormal: [0, -1, 0], asmPos: [0, -0.5, 0],
      netPos: [0, -1, 0], svgX: 0, svgY: -1,
      animWindow: [0, 0.65], threshold: 0.30, areaLabel: 's^2',
    },
    {
      id: 'left', label: 'Left', short: 'L', color: '#f59e0b',
      geo: { kind: 'plane', w: 1, h: 1 },
      asmNormal: [-1, 0, 0], asmPos: [-0.5, 0, 0],
      netPos: [-1, 0, 0], svgX: -1, svgY: 0,
      animWindow: [0, 0.65], threshold: 0.45, areaLabel: 's^2',
    },
    {
      id: 'right', label: 'Right', short: 'R', color: '#f97316',
      geo: { kind: 'plane', w: 1, h: 1 },
      asmNormal: [1, 0, 0], asmPos: [0.5, 0, 0],
      netPos: [1, 0, 0], svgX: 1, svgY: 0,
      animWindow: [0, 0.65], threshold: 0.60, areaLabel: 's^2',
    },
    {
      id: 'back', label: 'Back', short: 'Ba', color: '#8b5cf6',
      geo: { kind: 'plane', w: 1, h: 1 },
      asmNormal: [0, 0, -1], asmPos: [0, 0, -0.5],
      netPos: [2, 0, 0], svgX: 2, svgY: 0,
      animWindow: [0.35, 1], threshold: 0.80, areaLabel: 's^2',
    },
  ],
};

// ── 2. Rectangular Prism  (l = 2, d = 1, h = 1.5) ───────────────────────────
// Net cross:      [Top 2×1]
//       [L 1×1.5][Fr 2×1.5][R 1×1.5][Bk 2×1.5]
//                [Bo 2×1]
const RECT_PRISM: ShapeNetDef = {
  id: 'rect-prism', label: 'Rect Prism', emoji: '⬛', primaryColor: '#f97316',
  saFormula: 'SA = 2(lw+lh+wh)',
  saComputed: 'SA = 2(2{\\cdot}1+2{\\cdot}1.5+1{\\cdot}1.5) = 13\\text{ u}^2',
  volFormula: 'V = l \\times w \\times h',
  volComputed: 'V = 2 \\times 1 \\times 1.5 = 3\\text{ u}^3',
  assembledGeo: { kind: 'box', args: [2, 1.5, 1] },
  netBounds: { xMin: -2, yMin: -1.75, xMax: 4, yMax: 1.75 },
  faces: [
    {
      id: 'front', label: 'Front', short: 'Fr', color: '#ef4444',
      geo: { kind: 'plane', w: 2, h: 1.5 },
      asmNormal: [0, 0, 1], asmPos: [0, 0, 0.5],
      netPos: [0, 0, 0], svgX: 0, svgY: 0,
      animWindow: [0, 1], threshold: 0, areaLabel: 'lh',
    },
    {
      id: 'back', label: 'Back', short: 'Bk', color: '#dc2626',
      geo: { kind: 'plane', w: 2, h: 1.5 },
      asmNormal: [0, 0, -1], asmPos: [0, 0, -0.5],
      netPos: [3, 0, 0], svgX: 3, svgY: 0,
      animWindow: [0.35, 1], threshold: 0.80, areaLabel: 'lh',
    },
    {
      id: 'top', label: 'Top', short: 'T', color: '#3b82f6',
      geo: { kind: 'plane', w: 2, h: 1 },
      asmNormal: [0, 1, 0], asmPos: [0, 0.75, 0],
      netPos: [0, 1.25, 0], svgX: 0, svgY: 1.25,
      animWindow: [0, 0.65], threshold: 0.15, areaLabel: 'lw',
    },
    {
      id: 'bottom', label: 'Bottom', short: 'Bo', color: '#1d4ed8',
      geo: { kind: 'plane', w: 2, h: 1 },
      asmNormal: [0, -1, 0], asmPos: [0, -0.75, 0],
      netPos: [0, -1.25, 0], svgX: 0, svgY: -1.25,
      animWindow: [0, 0.65], threshold: 0.30, areaLabel: 'lw',
    },
    {
      id: 'left', label: 'Left', short: 'L', color: '#10b981',
      geo: { kind: 'plane', w: 1, h: 1.5 },
      asmNormal: [-1, 0, 0], asmPos: [-1, 0, 0],
      netPos: [-1.5, 0, 0], svgX: -1.5, svgY: 0,
      animWindow: [0, 0.65], threshold: 0.45, areaLabel: 'wh',
    },
    {
      id: 'right', label: 'Right', short: 'R', color: '#059669',
      geo: { kind: 'plane', w: 1, h: 1.5 },
      asmNormal: [1, 0, 0], asmPos: [1, 0, 0],
      netPos: [1.5, 0, 0], svgX: 1.5, svgY: 0,
      animWindow: [0, 0.65], threshold: 0.60, areaLabel: 'wh',
    },
  ],
};

// ── 3. Cylinder  (r = 0.5, h = 1.4) ─────────────────────────────────────────
// Net:  [Top circle]
//       [Lateral rect π × 1.4]
//       [Bottom circle]
// Circumference = 2πr = π ≈ 3.14
export const CYL_H = 1.4, CYL_R = 0.5;
const CYL_CIRC = Math.PI * 2 * CYL_R;  // ≈ 3.14
const CYLINDER: ShapeNetDef = {
  id: 'cylinder', label: 'Cylinder', emoji: '⬤', primaryColor: '#10b981',
  saFormula: 'SA = 2\\pi r(r+h)',
  saComputed: `SA = 2\\pi(0.5)(0.5+1.4) \\approx 5.97\\text{ u}^2`,
  volFormula: 'V = \\pi r^2 h',
  volComputed: 'V = \\pi(0.5)^2(1.4) \\approx 1.10\\text{ u}^3',
  assembledGeo: { kind: 'cylinder', rTop: CYL_R, rBot: CYL_R, h: CYL_H, seg: 32 },
  netBounds: {
    xMin: -CYL_CIRC / 2 - 0.1,
    yMin: -(CYL_H / 2 + CYL_R + 0.3),
    xMax:  CYL_CIRC / 2 + 0.1,
    yMax:   CYL_H / 2 + CYL_R + 0.3,
  },
  faces: [
    {
      id: 'lateral', label: 'Lateral', short: 'Lat', color: '#10b981',
      geo: { kind: 'plane', w: CYL_CIRC, h: CYL_H },
      asmNormal: [0, 0, 1], asmPos: [0, 0, CYL_R],
      netPos: [0, 0, 0], svgX: 0, svgY: 0,
      animWindow: [0, 1], threshold: 0, areaLabel: '2\\pi r h',
    },
    {
      id: 'top', label: 'Top', short: 'T', color: '#3b82f6',
      geo: { kind: 'circle', r: CYL_R },
      asmNormal: [0, 1, 0], asmPos: [0, CYL_H / 2, 0],
      netPos: [0, CYL_H / 2 + CYL_R, 0],
      svgX: 0, svgY: CYL_H / 2 + CYL_R,
      animWindow: [0, 0.7], threshold: 0.20, areaLabel: '\\pi r^2',
    },
    {
      id: 'bottom', label: 'Bottom', short: 'Bo', color: '#6366f1',
      geo: { kind: 'circle', r: CYL_R },
      asmNormal: [0, -1, 0], asmPos: [0, -CYL_H / 2, 0],
      netPos: [0, -(CYL_H / 2 + CYL_R), 0],
      svgX: 0, svgY: -(CYL_H / 2 + CYL_R),
      animWindow: [0, 0.7], threshold: 0.45, areaLabel: '\\pi r^2',
    },
  ],
};

// ── 4. Cone  (r = 0.5, h = 1.2) ──────────────────────────────────────────────
// slant l = √(r² + h²) ≈ 1.3
// Net: sector (r = l, angle = 2πr/l) + base circle touching arc
export const CONE_R = 0.5, CONE_H = 1.2;
export const CONE_L = Math.sqrt(CONE_R * CONE_R + CONE_H * CONE_H);       // ≈ 1.3
export const CONE_ANGLE = (2 * Math.PI * CONE_R) / CONE_L;                // ≈ 2.42 rad
const CONE: ShapeNetDef = {
  id: 'cone', label: 'Cone', emoji: '▲', primaryColor: '#f59e0b',
  saFormula: 'SA = \\pi r(r + l)',
  saComputed: `SA = \\pi(0.5)(0.5+1.3) \\approx 2.83\\text{ u}^2`,
  volFormula: 'V = \\tfrac{1}{3}\\pi r^2 h',
  volComputed: 'V = \\tfrac{1}{3}\\pi(0.5)^2(1.2) \\approx 0.31\\text{ u}^3',
  assembledGeo: { kind: 'cone', r: CONE_R, h: CONE_H, seg: 32 },
  netBounds: { xMin: -CONE_L - 0.2, yMin: -CONE_L - CONE_R - 0.3, xMax: CONE_L + 0.2, yMax: CONE_R + 0.3 },
  faces: [
    {
      id: 'lateral', label: 'Lateral', short: 'Lat', color: '#f59e0b',
      geo: { kind: 'sector', r: CONE_L, angle: CONE_ANGLE },
      // In assembled state the lateral surface sits over the cone body
      asmNormal: [0, 0.4, 0.9], asmPos: [0, CONE_H * 0.25, CONE_R * 0.7],
      netPos: [0, 0, 0], svgX: 0, svgY: 0,
      animWindow: [0, 1], threshold: 0, areaLabel: '\\pi r l',
    },
    {
      id: 'base', label: 'Base', short: 'Base', color: '#f97316',
      geo: { kind: 'circle', r: CONE_R },
      asmNormal: [0, -1, 0], asmPos: [0, -CONE_H / 2, 0],
      // In net the base circle sits below the sector's arc
      netPos: [0, -(CONE_L + CONE_R), 0],
      svgX: 0, svgY: -(CONE_L + CONE_R),
      animWindow: [0, 0.7], threshold: 0.35, areaLabel: '\\pi r^2',
    },
  ],
};

// ── 5. Triangular Prism  (equilateral side = 1, depth = 1.2) ─────────────────
// Triangle height = √3/2 ≈ 0.866, centroid at 0.289 from base
// Net: [Bo rect 1×1.2][Mid rect 1×1.2][Top rect 1×1.2]
//                     [Front △ above Mid][Back △ below Mid]
const TRI_S = 1.0, TRI_D = 1.2;
const TRI_H = (SQ3 / 2) * TRI_S;           // ≈ 0.866
const TRI_CENTROID_Y = TRI_H / 3;           // ≈ 0.289 (below triangle top? actually below centroid from base)
// Centroid is at 1/3 height from base: y = -TRI_H/3 below triangle centre
// Faces in 3D: prism extends z = ±TRI_D/2
// Triangles:
//   Front  pos=[0,0,0.6],  normal=[0,0,1]
//   Back   pos=[0,0,-0.6], normal=[0,0,-1]
// Rectangles (centred at origin in z):
//   Bottom: centre=(0,-TRI_H/3,0), normal=(0,-1,0)
//   Left:   centre=(-0.25, TRI_H/6,0), normal=(-SQ3/2, 0.5, 0)
//   Right:  centre=(0.25,  TRI_H/6,0), normal=( SQ3/2, 0.5, 0)
// Net layout (all 1×1.2 rects in a row, triangles above/below centre):
//   Left rect  at svgX=-1  (covers x=-1.5 to -0.5)
//   Centre rect at svgX=0  (covers x=-0.5 to 0.5)
//   Right rect  at svgX=1  (covers x=0.5 to 1.5)
//   Front tri   above centre: svgY = 0.6+TRI_CENTROID_Y
//   Back  tri   below centre: svgY = -(0.6+TRI_CENTROID_Y)
const TRI_PRISM: ShapeNetDef = {
  id: 'tri-prism', label: 'Tri Prism', emoji: '△', primaryColor: '#06b6d4',
  saFormula: 'SA = bh + 3(a \\cdot d)',
  saComputed: 'SA = \\tfrac{\\sqrt3}{4}(1)^2 \\times 2 + 3(1)(1.2) \\approx 4.23\\text{ u}^2',
  volFormula: 'V = \\tfrac{\\sqrt3}{4}s^2 \\cdot d',
  volComputed: 'V = \\tfrac{\\sqrt3}{4}(1)^2(1.2) \\approx 0.52\\text{ u}^3',
  assembledGeo: { kind: 'tri-prism', side: TRI_S, depth: TRI_D },
  netBounds: { xMin: -1.7, yMin: -1.5, xMax: 1.7, yMax: 1.5 },
  faces: [
    {
      id: 'bottom-rect', label: 'Bottom', short: 'Bo', color: '#ef4444',
      geo: { kind: 'plane', w: TRI_S, h: TRI_D },
      asmNormal: [0, -1, 0], asmPos: [0, -TRI_H / 3, 0],
      netPos: [0, 0, 0], svgX: 0, svgY: 0,
      animWindow: [0, 1], threshold: 0, areaLabel: 'a \\cdot d',
    },
    {
      id: 'left-rect', label: 'Left face', short: 'L', color: '#3b82f6',
      geo: { kind: 'plane', w: TRI_S, h: TRI_D },
      asmNormal: [-SQ3 / 2, 0.5, 0], asmPos: [-0.25, TRI_H / 6, 0],
      netPos: [-1, 0, 0], svgX: -1, svgY: 0,
      animWindow: [0, 0.65], threshold: 0.20, areaLabel: 'a \\cdot d',
    },
    {
      id: 'right-rect', label: 'Right face', short: 'R', color: '#10b981',
      geo: { kind: 'plane', w: TRI_S, h: TRI_D },
      asmNormal: [SQ3 / 2, 0.5, 0], asmPos: [0.25, TRI_H / 6, 0],
      netPos: [1, 0, 0], svgX: 1, svgY: 0,
      animWindow: [0, 0.65], threshold: 0.40, areaLabel: 'a \\cdot d',
    },
    {
      id: 'front-tri', label: 'Front △', short: 'Fr', color: '#f59e0b',
      geo: { kind: 'tri-equilateral', side: TRI_S },
      asmNormal: [0, 0, 1], asmPos: [0, 0, TRI_D / 2],
      netPos: [0, TRI_D / 2 + TRI_CENTROID_Y, 0],
      svgX: 0, svgY: TRI_D / 2 + TRI_CENTROID_Y,
      animWindow: [0, 0.7], threshold: 0.60, areaLabel: '\\tfrac{\\sqrt3}{4}s^2',
    },
    {
      id: 'back-tri', label: 'Back △', short: 'Bk', color: '#f97316',
      geo: { kind: 'tri-equilateral', side: TRI_S },
      asmNormal: [0, 0, -1], asmPos: [0, 0, -TRI_D / 2],
      netPos: [0, -(TRI_D / 2 + TRI_CENTROID_Y), 0],
      svgX: 0, svgY: -(TRI_D / 2 + TRI_CENTROID_Y),
      animWindow: [0.3, 1], threshold: 0.80, areaLabel: '\\tfrac{\\sqrt3}{4}s^2',
    },
  ],
};

// ── 6. Square Pyramid  (base = 1, h = 1) ─────────────────────────────────────
// Centred: base at y = -0.5, apex at y = 0.5
// Slant height (face height) = √((0.5)² + 1²) = √1.25 ≈ 1.118
// Triangular face normals derived from cross-product; centroid at 1/3 of face height
// Net cross:
//            [Front △]
//  [Left △] [Base □] [Right △]
//            [Back △]
const PYR_B = 1.0, PYR_H = 1.0;
const PYR_SL = Math.sqrt((PYR_B / 2) ** 2 + PYR_H ** 2);   // ≈ 1.118
// Face normal magnitude: outward normals for each triangular face
const PYR_NX = PYR_H / PYR_SL;                             // ≈ 0.894
const PYR_NY = (PYR_B / 2) / PYR_SL;                       // ≈ 0.447
// Triangle face centroid in net: from base edge, 1/3 of face height
const PYR_TRI_CENTROID = PYR_SL / 3;                        // ≈ 0.373
const SQ_PYRAMID: ShapeNetDef = {
  id: 'sq-pyramid', label: 'Sq Pyramid', emoji: '⬡', primaryColor: '#8b5cf6',
  saFormula: 'SA = b^2 + 2b \\cdot l',
  saComputed: `SA = 1 + 2(1)(${PYR_SL.toFixed(3)}) \\approx 3.24\\text{ u}^2`,
  volFormula: 'V = \\tfrac{1}{3}b^2 h',
  volComputed: 'V = \\tfrac{1}{3}(1)^2(1) \\approx 0.33\\text{ u}^3',
  assembledGeo: { kind: 'sq-pyramid', base: PYR_B, h: PYR_H },
  netBounds: {
    xMin: -(PYR_B / 2 + PYR_SL + 0.2),
    yMin: -(PYR_B / 2 + PYR_SL + 0.2),
    xMax:  (PYR_B / 2 + PYR_SL + 0.2),
    yMax:  (PYR_B / 2 + PYR_SL + 0.2),
  },
  faces: [
    {
      id: 'base', label: 'Base', short: 'Base', color: '#8b5cf6',
      geo: { kind: 'plane', w: PYR_B, h: PYR_B },
      asmNormal: [0, -1, 0], asmPos: [0, -0.5, 0],
      netPos: [0, 0, 0], svgX: 0, svgY: 0,
      animWindow: [0, 1], threshold: 0, areaLabel: 'b^2',
    },
    {
      id: 'front', label: 'Front △', short: 'Fr', color: '#ef4444',
      geo: { kind: 'tri-isoceles', base: PYR_B, h: PYR_SL },
      asmNormal: [0, PYR_NY, PYR_NX], asmPos: [0, -1 / 6, 1 / 3],
      netPos: [0, PYR_B / 2 + PYR_TRI_CENTROID, 0],
      svgX: 0, svgY: PYR_B / 2 + PYR_TRI_CENTROID,
      animWindow: [0, 0.65], threshold: 0.20, areaLabel: '\\tfrac{1}{2}b l',
    },
    {
      id: 'back', label: 'Back △', short: 'Bk', color: '#ec4899',
      geo: { kind: 'tri-isoceles', base: PYR_B, h: PYR_SL },
      asmNormal: [0, PYR_NY, -PYR_NX], asmPos: [0, -1 / 6, -1 / 3],
      netPos: [0, -(PYR_B / 2 + PYR_TRI_CENTROID), 0],
      svgX: 0, svgY: -(PYR_B / 2 + PYR_TRI_CENTROID),
      animWindow: [0, 0.65], threshold: 0.40, areaLabel: '\\tfrac{1}{2}b l',
    },
    {
      id: 'left', label: 'Left △', short: 'L', color: '#06b6d4',
      geo: { kind: 'tri-isoceles', base: PYR_B, h: PYR_SL },
      asmNormal: [-PYR_NX, PYR_NY, 0], asmPos: [-1 / 3, -1 / 6, 0],
      netPos: [-(PYR_B / 2 + PYR_TRI_CENTROID), 0, 0],
      svgX: -(PYR_B / 2 + PYR_TRI_CENTROID), svgY: 0,
      animWindow: [0, 0.65], threshold: 0.60, areaLabel: '\\tfrac{1}{2}b l',
    },
    {
      id: 'right', label: 'Right △', short: 'R', color: '#f59e0b',
      geo: { kind: 'tri-isoceles', base: PYR_B, h: PYR_SL },
      asmNormal: [PYR_NX, PYR_NY, 0], asmPos: [1 / 3, -1 / 6, 0],
      netPos: [PYR_B / 2 + PYR_TRI_CENTROID, 0, 0],
      svgX: PYR_B / 2 + PYR_TRI_CENTROID, svgY: 0,
      animWindow: [0.35, 1], threshold: 0.80, areaLabel: '\\tfrac{1}{2}b l',
    },
  ],
};

// ── Registry ─────────────────────────────────────────────────────────────────

export const SHAPE_NETS: Record<UnfoldShapeId, ShapeNetDef> = {
  'cube':        CUBE,
  'rect-prism':  RECT_PRISM,
  'cylinder':    CYLINDER,
  'cone':        CONE,
  'tri-prism':   TRI_PRISM,
  'sq-pyramid':  SQ_PYRAMID,
};

export const UNFOLD_SHAPE_IDS: UnfoldShapeId[] = [
  'cube', 'rect-prism', 'cylinder', 'cone', 'tri-prism', 'sq-pyramid',
];
