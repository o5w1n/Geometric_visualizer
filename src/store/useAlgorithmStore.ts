import { create } from 'zustand';
import { bresenhamLine, midpointCircle, Pixel } from '@/lib/algorithmUtils';

export type AlgoMode = 'line' | 'circle';

interface AlgorithmState {
  mode: AlgoMode;

  // Line params
  lineX0: number;
  lineY0: number;
  lineX1: number;
  lineY1: number;

  // Circle params
  circleCx: number;
  circleCy: number;
  circleR: number;

  // Step-through state
  pixels: Pixel[];       // full computed sequence
  currentStep: number;   // how many pixels are revealed (0 = none)
  isPlaying: boolean;

  // Actions
  setMode: (m: AlgoMode) => void;
  setLineParam: (key: 'lineX0' | 'lineY0' | 'lineX1' | 'lineY1', v: number) => void;
  setCircleParam: (key: 'circleCx' | 'circleCy' | 'circleR', v: number) => void;
  recompute: () => void;
  stepForward: () => void;
  stepBack: () => void;
  setPlaying: (v: boolean) => void;
  reset: () => void;
}

const DEFAULT_LINE = { lineX0: -6, lineY0: -4, lineX1: 7, lineY1: 5 };
const DEFAULT_CIRCLE = { circleCx: 0, circleCy: 0, circleR: 6 };

function computePixels(state: Pick<AlgorithmState, 'mode' | 'lineX0' | 'lineY0' | 'lineX1' | 'lineY1' | 'circleCx' | 'circleCy' | 'circleR'>): Pixel[] {
  if (state.mode === 'line') {
    return bresenhamLine(state.lineX0, state.lineY0, state.lineX1, state.lineY1);
  }
  return midpointCircle(state.circleCx, state.circleCy, state.circleR);
}

export const useAlgorithmStore = create<AlgorithmState>((set, get) => ({
  mode: 'line',

  ...DEFAULT_LINE,
  ...DEFAULT_CIRCLE,

  pixels: computePixels({ mode: 'line', ...DEFAULT_LINE, ...DEFAULT_CIRCLE }),
  currentStep: 0,
  isPlaying: false,

  setMode: (mode) => {
    const s = get();
    const pixels = computePixels({ ...s, mode });
    set({ mode, pixels, currentStep: 0, isPlaying: false });
  },

  setLineParam: (key, v) => {
    const s = get();
    const next = { ...s, [key]: v };
    const pixels = computePixels(next);
    set({ [key]: v, pixels, currentStep: 0, isPlaying: false });
  },

  setCircleParam: (key, v) => {
    const s = get();
    const next = { ...s, [key]: v };
    const pixels = computePixels(next);
    set({ [key]: v, pixels, currentStep: 0, isPlaying: false });
  },

  recompute: () => {
    const s = get();
    const pixels = computePixels(s);
    set({ pixels, currentStep: 0 });
  },

  stepForward: () => {
    const { currentStep, pixels } = get();
    if (currentStep < pixels.length) set({ currentStep: currentStep + 1 });
  },

  stepBack: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },

  setPlaying: (isPlaying) => set({ isPlaying }),

  reset: () => set({ currentStep: 0, isPlaying: false }),
}));
