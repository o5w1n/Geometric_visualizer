/**
 * Lightweight store for live physics positions.
 * Updated every frame from inside R3F via useFrame — kept separate from the
 * main geometry store to avoid unnecessary re-renders in non-physics components.
 */
import { create } from 'zustand';

interface PhysicsPositionState {
  positions: Record<string, [number, number, number]>;
  updatePosition: (id: string, pos: [number, number, number]) => void;
  removePosition: (id: string) => void;
  clearAll: () => void;
}

export const usePhysicsPositionStore = create<PhysicsPositionState>((set) => ({
  positions: {},

  updatePosition: (id, pos) =>
    set((s) => ({ positions: { ...s.positions, [id]: pos } })),

  removePosition: (id) =>
    set((s) => {
      const next = { ...s.positions };
      delete next[id];
      return { positions: next };
    }),

  clearAll: () => set({ positions: {} }),
}));
