"use client";

import { useEffect, useRef } from "react";
import { Point } from "./transformationUtils";

// Compute signed area of a polygon (Shoelace formula)
function polygonArea(pts: Point[]): number {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

// Map area to a frequency in Hz (range: ~130 Hz to ~1200 Hz)
function areaToFrequency(area: number): number {
  const minArea = 0.1;
  const maxArea = 200;
  const minFreq = 130;
  const maxFreq = 1200;
  const clamped = Math.max(minArea, Math.min(maxArea, area));
  const t = Math.log(clamped / minArea) / Math.log(maxArea / minArea);
  return minFreq + t * (maxFreq - minFreq);
}

/**
 * Plays a short tone whose pitch maps to the area of the given polygon.
 * Call whenever the transformed shape changes.
 */
export function useShapeAudio(vertices: Point[], enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || vertices.length < 3) return;

    // Debounce — only play after 80 ms of no changes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const area = polygonArea(vertices);
      const freq = areaToFrequency(area);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }, 80);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [vertices, enabled]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);
}
