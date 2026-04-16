export type ShapeType =
  | 'square'
  | 'rectangle'
  | 'triangle'
  | 'sphere'
  | 'cube'
  | 'cuboid'
  | 'cylinder';

export const SHAPE_TYPES: ShapeType[] = [
  'square', 'rectangle', 'triangle', 'sphere', 'cube', 'cuboid', 'cylinder',
];

export interface ShapeDefinition {
  label: string;
  emoji: string;
  color: string;       // hex, used for mesh material
  accent: string;      // tailwind class prefix for UI
  collider: 'cuboid' | 'ball' | 'hull';
  is3D: boolean;       // false = 2D flat shape → show area only
  // KaTeX formula strings
  areaFormula: string;
  areaComputed: string;
  volumeFormula?: string;
  volumeComputed?: string;
  // Geometry descriptor consumed by SpawnShape
  geo: GeoDescriptor;
}

export type GeoDescriptor =
  | { kind: 'box';      args: [number, number, number] }
  | { kind: 'sphere';   args: [number, number, number] }
  | { kind: 'cone';     args: [number, number, number] }   // r, h, segments
  | { kind: 'cylinder'; args: [number, number, number, number] }; // rTop, rBot, h, seg

export const SHAPE_DEFINITIONS: Record<ShapeType, ShapeDefinition> = {
  // ── 2-D flat shapes ──────────────────────────────────────────────────────
  square: {
    label: 'Square',
    emoji: '□',
    color: '#3b82f6',
    accent: 'blue',
    collider: 'cuboid',
    is3D: false,
    areaFormula: '$A = s^2$',
    areaComputed: '$A = (1)^2 = 1 \\text{ u}^2$',
    geo: { kind: 'box', args: [1, 0.12, 1] },
  },
  rectangle: {
    label: 'Rectangle',
    emoji: '▬',
    color: '#06b6d4',
    accent: 'cyan',
    collider: 'cuboid',
    is3D: false,
    areaFormula: '$A = l \\times w$',
    areaComputed: '$A = 2 \\times 1 = 2 \\text{ u}^2$',
    geo: { kind: 'box', args: [2, 0.12, 1] },
  },
  triangle: {
    label: 'Triangle',
    emoji: '△',
    color: '#f59e0b',
    accent: 'amber',
    collider: 'hull',
    is3D: false,
    areaFormula: '$A = \\dfrac{\\sqrt{3}}{4} s^2$',
    areaComputed: '$A = \\dfrac{\\sqrt{3}}{4}(1.21)^2 \\approx 0.64 \\text{ u}^2$',
    // flat triangular prism: CylinderGeometry(r, r, h, 3) = equilateral cross-section
    geo: { kind: 'cylinder', args: [0.7, 0.7, 0.12, 3] },
  },
  // ── 3-D solid shapes ─────────────────────────────────────────────────────
  sphere: {
    label: 'Sphere',
    emoji: '●',
    color: '#a855f7',
    accent: 'purple',
    collider: 'ball',
    is3D: true,
    areaFormula: '$A = 4\\pi r^2$',
    areaComputed: '$A = 4\\pi(0.5)^2 \\approx 3.14 \\text{ u}^2$',
    volumeFormula: '$V = \\dfrac{4}{3}\\pi r^3$',
    volumeComputed: '$V = \\dfrac{4}{3}\\pi(0.5)^3 \\approx 0.52 \\text{ u}^3$',
    geo: { kind: 'sphere', args: [0.5, 24, 24] },
  },
  cube: {
    label: 'Cube',
    emoji: '■',
    color: '#ef4444',
    accent: 'red',
    collider: 'cuboid',
    is3D: true,
    areaFormula: '$A = 6s^2$',
    areaComputed: '$A = 6(1)^2 = 6 \\text{ u}^2$',
    volumeFormula: '$V = s^3$',
    volumeComputed: '$V = (1)^3 = 1 \\text{ u}^3$',
    geo: { kind: 'box', args: [1, 1, 1] },
  },
  cuboid: {
    label: 'Cuboid',
    emoji: '⬛',
    color: '#f97316',
    accent: 'orange',
    collider: 'cuboid',
    is3D: true,
    areaFormula: '$A = 2(lw + lh + wh)$',
    areaComputed: '$A = 2(2{\\cdot}1 + 2{\\cdot}1.5 + 1{\\cdot}1.5) = 13 \\text{ u}^2$',
    volumeFormula: '$V = l \\times w \\times h$',
    volumeComputed: '$V = 2 \\times 1 \\times 1.5 = 3 \\text{ u}^3$',
    geo: { kind: 'box', args: [2, 1.5, 1] },
  },
  cylinder: {
    label: 'Cylinder',
    emoji: '⬤',
    color: '#10b981',
    accent: 'emerald',
    collider: 'hull',
    is3D: true,
    areaFormula: '$A = 2\\pi r(r + h)$',
    areaComputed: '$A = 2\\pi(0.45)(0.45+1.4) \\approx 5.24 \\text{ u}^2$',
    volumeFormula: '$V = \\pi r^2 h$',
    volumeComputed: '$V = \\pi(0.45)^2(1.4) \\approx 0.89 \\text{ u}^3$',
    geo: { kind: 'cylinder', args: [0.45, 0.45, 1.4, 24] },
  },
};
