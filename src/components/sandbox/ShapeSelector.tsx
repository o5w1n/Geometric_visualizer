"use client";

import { useEffect, useRef } from "react";
import { useGeometryStore } from "@/store/useGeometryStore";
import { SHAPE_TYPES, SHAPE_DEFINITIONS, ShapeType } from "@/lib/shapeDefinitions";
import { playSpawnSound } from "@/lib/spawnAudio";

interface ShapeSelectorProps {
  onClose: () => void;
}

export function ShapeSelector({ onClose }: ShapeSelectorProps) {
  const { selectedShape, setSelectedShape, spawnShape } = useGeometryStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSpawn = (type: ShapeType) => {
    setSelectedShape(type);
    spawnShape();
    playSpawnSound();
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50 w-80 bg-panel border border-rim rounded-2xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <p className="text-xs text-ink-3 uppercase tracking-wider mb-3 font-medium">
        Select a shape to spawn
      </p>

      <div className="grid grid-cols-2 gap-2">
        {SHAPE_TYPES.map((type) => {
          const def = SHAPE_DEFINITIONS[type];
          const isSelected = selectedShape === type;
          return (
            <button
              key={type}
              onClick={() => handleSpawn(type)}
              className={`group relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "border-rim bg-raised"
                  : "border-rim hover:border-rim hover:bg-raised"
              }`}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 font-bold"
                style={{ backgroundColor: `${def.color}22`, color: def.color }}
              >
                {def.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-ink text-sm font-medium leading-tight">{def.label}</p>
                <p className="text-ink-3 text-[10px] mt-0.5">
                  {def.is3D ? "3D solid" : "2D flat"}
                </p>
              </div>
              {isSelected && (
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: def.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-rim flex items-center justify-between">
        <p className="text-[10px] text-ink-3">
          Click a shape to spawn it instantly
        </p>
        <button
          onClick={onClose}
          className="text-xs text-ink-3 hover:text-ink transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
