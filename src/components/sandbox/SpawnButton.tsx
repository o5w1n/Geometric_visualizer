"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ShapeSelector } from "./ShapeSelector";
import { useGeometryStore } from "@/store/useGeometryStore";
import { SHAPE_DEFINITIONS } from "@/lib/shapeDefinitions";

export function SpawnButton() {
  const [open, setOpen] = useState(false);
  const selectedShape = useGeometryStore(s => s.selectedShape);
  const def = SHAPE_DEFINITIONS[selectedShape];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors select-none cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Spawn Shape
        <span className="opacity-70 font-mono text-[10px]">
          {def.emoji}
        </span>
      </button>

      {open && <ShapeSelector onClose={() => setOpen(false)} />}
    </div>
  );
}
