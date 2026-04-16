/**
 * Cube net data — shared between CubeUnfold (R3F) and NetSVG / PhysicsSidebar.
 *
 * Net layout (4 × 3 cross):
 *
 *        [Top]
 *  [L][Front][R][Back]
 *        [Bot]
 *
 * All 3-D "assembled" values are for a unit cube (s = 1) centred at the origin.
 * "Net" values are in the flat (z = 0) plane, with Front at the origin.
 * asmEuler is [x, y, z] in radians (intrinsic XYZ order).
 *
 * animWindow [start, end] controls when each face's per-face progress runs within
 * the global 0-1 slider.  Faces adjacent to Front open first; Back opens last.
 *
 * threshold is used for:
 *   – SVG face fill opacity (face becomes opaque when progress ≥ threshold)
 *   – Formula term highlight (s² term lights up)
 */

const H = Math.PI / 2; // 90°

export interface CubeFaceDef {
  id: 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right';
  label: string;       // full name
  short: string;       // SVG label
  svgCol: number;      // column in the 4×3 SVG grid  (0–3)
  svgRow: number;      // row                          (0–2)

  asmPos: [number, number, number];
  asmEuler: [number, number, number]; // Euler XYZ radians

  netPos: [number, number, number];   // flat net, Front = origin

  animWindow: [number, number]; // [wStart, wEnd] within global progress 0-1
  threshold: number;            // SVG reveal + formula highlight trigger
  color: string;
}

export const CUBE_FACES: CubeFaceDef[] = [
  {
    id: 'front',
    label: 'Front', short: 'F',
    svgCol: 1, svgRow: 1,
    asmPos:  [0,    0,   0.5],  asmEuler: [0,  0,  0],
    netPos:  [0,    0,   0  ],
    animWindow: [0, 1],       // drifts z:0.5→0 gently
    threshold: 0,
    color: '#ef4444',
  },
  {
    id: 'top',
    label: 'Top', short: 'T',
    svgCol: 1, svgRow: 0,
    asmPos:  [0,   0.5,  0  ],  asmEuler: [-H,  0,  0],
    netPos:  [0,   1,    0  ],
    animWindow: [0, 0.65],
    threshold: 0.15,
    color: '#3b82f6',
  },
  {
    id: 'bottom',
    label: 'Bottom', short: 'Bo',
    svgCol: 1, svgRow: 2,
    asmPos:  [0,  -0.5,  0  ],  asmEuler: [ H,  0,  0],
    netPos:  [0,  -1,    0  ],
    animWindow: [0, 0.65],
    threshold: 0.30,
    color: '#10b981',
  },
  {
    id: 'left',
    label: 'Left', short: 'L',
    svgCol: 0, svgRow: 1,
    asmPos:  [-0.5,  0,  0  ],  asmEuler: [0, -H,  0],
    netPos:  [-1,    0,  0  ],
    animWindow: [0, 0.65],
    threshold: 0.45,
    color: '#f59e0b',
  },
  {
    id: 'right',
    label: 'Right', short: 'R',
    svgCol: 2, svgRow: 1,
    asmPos:  [0.5,   0,  0  ],  asmEuler: [0,  H,  0],
    netPos:  [1,     0,  0  ],
    animWindow: [0, 0.65],
    threshold: 0.60,
    color: '#f97316',
  },
  {
    id: 'back',
    label: 'Back', short: 'Ba',
    svgCol: 3, svgRow: 1,
    asmPos:  [0,    0,  -0.5],  asmEuler: [0,  Math.PI,  0],
    netPos:  [2,    0,   0  ],
    animWindow: [0.35, 1.0],  // starts after Right is partly open
    threshold: 0.80,
    color: '#8b5cf6',
  },
];

/**
 * Maps a global progress value to a face-local [0,1] value
 * using the face's animWindow.
 */
export function faceProg(global: number, face: CubeFaceDef): number {
  const [wStart, wEnd] = face.animWindow;
  if (wEnd <= wStart) return 1;
  return Math.max(0, Math.min(1, (global - wStart) / (wEnd - wStart)));
}
