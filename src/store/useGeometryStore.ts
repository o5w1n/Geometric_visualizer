import { create } from 'zustand';
import { Point, reflectPoint, rotatePoint, dilatePoint, translatePoint } from '@/lib/transformationUtils';
import { ShapeType } from '@/lib/shapeDefinitions';
import { type UnfoldShapeId } from '@/lib/shapeNets';

export type TransformationMode = 'translate' | 'reflect' | 'rotate' | 'scale' | 'combined' | 'threeD' | null;
export type ReflectionMode = 'x-axis' | 'y-axis' | 'y=x' | 'y=-x' | 'custom';
export type CombinedOrder = 'trs' | 'rst';

export interface SpawnedShape {
  id: string;
  type: ShapeType;
  spawnPos: [number, number, number];
}

interface GeometryState {
  // Base representation
  vertices: Point[];

  // Transform Settings
  mode: TransformationMode;

  // Translation
  translationVector: Point;

  // Reflection
  reflectionMode: ReflectionMode;
  reflectionLine: { p1: Point; p2: Point };

  // Rotation
  rotationPivot: Point;
  rotationAngle: number;

  // Dilation
  dilationCenter: Point;
  dilationScale: number;
  dilationScaleY: number;

  // Combined (2D)
  combinedAngle: number;
  combinedScale: Point;
  combinedTranslate: Point;
  combinedOrder: CombinedOrder;

  // 3D transformations
  rotation3D: [number, number, number];
  scale3D: [number, number, number];
  translation3D: [number, number, number];

  // Clipping Viewport
  viewportEnabled: boolean;
  viewport: { xMin: number; yMin: number; xMax: number; yMax: number };

  // Physics Sandbox
  selectedShape: ShapeType;
  spawnedShapes: SpawnedShape[];

  // Net unfolding (shared across all 6 shapes)
  unfoldShapeId: UnfoldShapeId;
  unfoldProgress: number;

  // Shape colors (transformation lab)
  originalColor: string;
  transformedColor: string;

  // Actions
  setMode: (mode: TransformationMode) => void;
  setVertices: (v: Point[]) => void;
  updateVertex: (index: number, pos: Point) => void;
  setOriginalColor: (c: string) => void;
  setTransformedColor: (c: string) => void;

  setTranslationVector: (t: Point) => void;

  setReflectionMode: (mode: ReflectionMode) => void;
  updateReflectionLine: (point: 'p1' | 'p2', pos: Point) => void;

  setRotationPivot: (pos: Point) => void;
  setRotationAngle: (angle: number) => void;

  setDilationCenter: (pos: Point) => void;
  setDilationScale: (scale: number) => void;
  setDilationScaleY: (scale: number) => void;

  setCombinedAngle: (angle: number) => void;
  setCombinedScale: (scale: Point) => void;
  setCombinedTranslate: (translate: Point) => void;
  setCombinedOrder: (order: CombinedOrder) => void;

  setRotation3D: (rotation: [number, number, number]) => void;
  setScale3D: (scale: [number, number, number]) => void;
  setTranslation3D: (translation: [number, number, number]) => void;

  applyTransformation: () => void;
  resetShape: () => void;

  setViewportEnabled: (v: boolean) => void;
  setViewport: (vp: { xMin: number; yMin: number; xMax: number; yMax: number }) => void;

  setUnfoldProgress: (v: number) => void;
  setUnfoldShapeId: (id: UnfoldShapeId) => void;

  setSelectedShape: (s: ShapeType) => void;
  spawnShape: () => void;
  clearShapes: () => void;
}

const DEFAULT_VERTICES: Point[] = [[0, 0], [4, 0], [2, 3]];

export const useGeometryStore = create<GeometryState>((set) => ({
  vertices: DEFAULT_VERTICES,

  mode: 'translate',

  translationVector: [0, 0],

  reflectionMode: 'y-axis',
  reflectionLine: { p1: [0, -5], p2: [0, 5] },

  rotationPivot: [0, 0],
  rotationAngle: 90,

  dilationCenter: [0, 0],
  dilationScale: 2,
  dilationScaleY: 2,

  combinedAngle: -110,
  combinedScale: [2, 1.7],
  combinedTranslate: [-2.5, 1],
  combinedOrder: 'trs',

  rotation3D: [106, -97, -76],
  scale3D: [0.92, 1.66, 1.66],
  translation3D: [43, 31, -12],

  viewportEnabled: false,
  viewport: { xMin: -5, yMin: -4, xMax: 5, yMax: 4 },

  selectedShape: 'cube',
  spawnedShapes: [],
  unfoldShapeId: 'cube' as UnfoldShapeId,
  unfoldProgress: 0,

  originalColor: '#a1a1aa',
  transformedColor: '#3b82f6',

  setOriginalColor: (c) => set({ originalColor: c }),
  setTransformedColor: (c) => set({ transformedColor: c }),

  setUnfoldProgress: (v) => set({ unfoldProgress: Math.max(0, Math.min(1, v)) }),
  setUnfoldShapeId: (id) => set({ unfoldShapeId: id, unfoldProgress: 0 }),

  setViewportEnabled: (v) => set({ viewportEnabled: v }),
  setViewport: (vp) => set({ viewport: vp }),

  setMode: (mode) => set({ mode }),

  setVertices: (v) => set({ vertices: v }),

  updateVertex: (index, pos) => set((state) => {
    const newVertices = [...state.vertices];
    newVertices[index] = pos;
    return { vertices: newVertices };
  }),

  setTranslationVector: (t) => set({ translationVector: t }),

  setReflectionMode: (mode) => {
    set({ reflectionMode: mode });
    if (mode === 'x-axis') set({ reflectionLine: { p1: [-5, 0], p2: [5, 0] } });
    else if (mode === 'y-axis') set({ reflectionLine: { p1: [0, -5], p2: [0, 5] } });
    else if (mode === 'y=x')   set({ reflectionLine: { p1: [-5, -5], p2: [5, 5] } });
    else if (mode === 'y=-x')  set({ reflectionLine: { p1: [-5, 5], p2: [5, -5] } });
  },

  updateReflectionLine: (point, pos) => set((state) => ({
    reflectionLine: { ...state.reflectionLine, [point]: pos },
    reflectionMode: 'custom',
  })),

  setRotationPivot: (pos) => set({ rotationPivot: pos }),
  setRotationAngle: (angle) => set({ rotationAngle: angle }),

  setDilationCenter: (pos) => set({ dilationCenter: pos }),
  setDilationScale: (scale) => set({ dilationScale: scale }),
  setDilationScaleY: (scale) => set({ dilationScaleY: scale }),

  setCombinedAngle: (angle) => set({ combinedAngle: angle }),
  setCombinedScale: (scale) => set({ combinedScale: scale }),
  setCombinedTranslate: (translate) => set({ combinedTranslate: translate }),
  setCombinedOrder: (order) => set({ combinedOrder: order }),

  setRotation3D: (rotation) => set({ rotation3D: rotation }),
  setScale3D: (scale) => set({ scale3D: scale }),
  setTranslation3D: (translation) => set({ translation3D: translation }),

  applyTransformation: () => set((state) => {
    let newVertices = state.vertices;
    if (state.mode === 'translate') {
      newVertices = state.vertices.map(v => translatePoint(v, state.translationVector));
      return { vertices: newVertices, translationVector: [0, 0] };
    } else if (state.mode === 'reflect') {
      newVertices = state.vertices.map(v => reflectPoint(v, state.reflectionLine.p1, state.reflectionLine.p2));
      return { vertices: newVertices };
    } else if (state.mode === 'rotate') {
      newVertices = state.vertices.map(v => rotatePoint(v, state.rotationPivot, state.rotationAngle));
      return { vertices: newVertices, rotationAngle: 0 };
    } else if (state.mode === 'scale') {
      newVertices = state.vertices.map(v => dilatePoint(v, state.dilationCenter, state.dilationScale));
      return { vertices: newVertices, dilationScale: 1, dilationScaleY: 1 };
    } else if (state.mode === 'combined') {
      const angleRad = (state.combinedAngle * Math.PI) / 180;
      const sin = Math.sin(angleRad);
      const cos = Math.cos(angleRad);
      const [sx, sy] = state.combinedScale;
      const [dx, dy] = state.combinedTranslate;
      newVertices = state.vertices.map(([x, y]) => {
        if (state.combinedOrder === 'trs') {
          const rx = x * cos - y * sin;
          const ry = x * sin + y * cos;
          return [rx * sx + dx, ry * sy + dy] as Point;
        }
        const sxv = x * sx;
        const syv = y * sy;
        const rx = sxv * cos - syv * sin;
        const ry = sxv * sin + syv * cos;
        return [rx + dx, ry + dy] as Point;
      });
      return { vertices: newVertices };
    }
    return { vertices: newVertices };
  }),

  resetShape: () => set({
    vertices: DEFAULT_VERTICES,
    translationVector: [0, 0],
    reflectionMode: 'y-axis',
    reflectionLine: { p1: [0, -5], p2: [0, 5] },
    rotationPivot: [0, 0],
    rotationAngle: 90,
    dilationCenter: [0, 0],
    dilationScale: 2,
    dilationScaleY: 2,
    combinedAngle: -110,
    combinedScale: [2, 1.7],
    combinedTranslate: [-2.5, 1],
    combinedOrder: 'trs',
    rotation3D: [106, -97, -76],
    scale3D: [0.92, 1.66, 1.66],
    translation3D: [43, 31, -12],
  }),

  setSelectedShape: (s) => set({ selectedShape: s }),

  spawnShape: () => set((state) => ({
    spawnedShapes: [
      ...state.spawnedShapes,
      {
        id: Math.random().toString(36).substring(7),
        type: state.selectedShape,
        spawnPos: [
          Math.round((Math.random() * 6 - 3) * 10) / 10,
          6,
          Math.round((Math.random() * 6 - 3) * 10) / 10,
        ],
      },
    ],
  })),

  clearShapes: () => set({ spawnedShapes: [] }),
}));
