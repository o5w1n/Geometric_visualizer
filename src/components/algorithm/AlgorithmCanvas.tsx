"use client";

import { useEffect, useRef, useState } from "react";
import { useAlgorithmStore } from "@/store/useAlgorithmStore";

const GRID_HALF = 15;       // grid goes from -GRID_HALF to +GRID_HALF
const GRID_CELLS = GRID_HALF * 2 + 1; // 31 cells

export function AlgorithmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [redrawTick, setRedrawTick] = useState(0);
  const store = useAlgorithmStore();
  const { pixels, currentStep, mode } = store;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cellW = W / GRID_CELLS;
    const cellH = H / GRID_CELLS;

    // Helper: convert grid coord to canvas pixel (top-left of cell)
    const toCanvas = (gx: number, gy: number) => ({
      cx: (gx + GRID_HALF) * cellW,
      cy: (GRID_HALF - gy) * cellH, // y-axis flipped
    });

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_CELLS; i++) {
      const x = i * cellW;
      const y = i * cellH;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 1.5;
    const axisX = GRID_HALF * cellW;
    const axisY = GRID_HALF * cellH;
    ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W, axisY); ctx.stroke();

    // Axis labels (every 5)
    ctx.fillStyle = "#52525b";
    ctx.font = `${Math.max(8, cellW * 0.55)}px monospace`;
    ctx.textAlign = "center";
    for (let g = -GRID_HALF; g <= GRID_HALF; g += 5) {
      if (g === 0) continue;
      const { cx } = toCanvas(g, 0);
      const { cy } = toCanvas(0, g);
      ctx.fillText(String(g), cx + cellW / 2, axisY + cellH * 1.3);
      ctx.fillText(String(g), axisX - cellW * 0.3, cy + cellH / 2);
    }

    // Lit pixels (already revealed)
    const revealed = pixels.slice(0, currentStep);
    for (const p of revealed) {
      if (Math.abs(p.x) > GRID_HALF || Math.abs(p.y) > GRID_HALF) continue;
      const { cx, cy } = toCanvas(p.x, p.y);
      ctx.fillStyle = mode === 'line' ? "rgba(59,130,246,0.85)" : "rgba(168,85,247,0.85)";
      ctx.fillRect(cx + 1, cy + 1, cellW - 2, cellH - 2);
    }

    // Current (next-to-be-revealed) pixel — highlight differently
    const next = pixels[currentStep];
    if (next && Math.abs(next.x) <= GRID_HALF && Math.abs(next.y) <= GRID_HALF) {
      const { cx, cy } = toCanvas(next.x, next.y);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(cx + 1, cy + 1, cellW - 2, cellH - 2);
      // Pulse ring
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx + 1, cy + 1, cellW - 2, cellH - 2);
    }

    // For line mode: mark start and end
    if (mode === 'line') {
      const { lineX0, lineY0, lineX1, lineY1 } = store;
      const drawMarker = (gx: number, gy: number, color: string, label: string) => {
        if (Math.abs(gx) > GRID_HALF || Math.abs(gy) > GRID_HALF) return;
        const { cx, cy } = toCanvas(gx, gy);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(cx + 1, cy + 1, cellW - 2, cellH - 2);
        ctx.fillStyle = color;
        ctx.font = `bold ${Math.max(8, cellW * 0.55)}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(label, cx + cellW / 2, cy - 2);
      };
      drawMarker(lineX0, lineY0, "#34d399", "P0");
      drawMarker(lineX1, lineY1, "#f43f5e", "P1");
    }

    // For circle mode: mark center
    if (mode === 'circle') {
      const { circleCx, circleCy } = store;
      if (Math.abs(circleCx) <= GRID_HALF && Math.abs(circleCy) <= GRID_HALF) {
        const { cx, cy } = toCanvas(circleCx, circleCy);
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 2;
        const half = cellW / 2;
        ctx.beginPath();
        ctx.moveTo(cx + half - 4, cy + half);
        ctx.lineTo(cx + half + 4, cy + half);
        ctx.moveTo(cx + half, cy + half - 4);
        ctx.lineTo(cx + half, cy + half + 4);
        ctx.stroke();
      }
    }
  }, [pixels, currentStep, mode, store, redrawTick]);

  // Resize observer so canvas is always square and fills its container
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ro = new ResizeObserver(() => {
      const size = Math.min(container.clientWidth, container.clientHeight);
      if (size > 0) {
        canvas.width = size;
        canvas.height = size;
        setRedrawTick(t => t + 1);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="rounded-xl border border-zinc-800" />
    </div>
  );
}
