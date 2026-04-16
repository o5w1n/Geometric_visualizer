export type Pixel = {
  x: number;
  y: number;
  step: number;
  decisionVar: number;
  label?: string; // e.g. "NE" / "E" for Bresenham, octant for circle
};

// ---------------------------------------------------------------------------
// Bresenham's Line Algorithm — generalised for all 8 octants
// Tracks the error/decision variable at every step.
// ---------------------------------------------------------------------------
export function bresenhamLine(
  x0: number, y0: number,
  x1: number, y1: number
): Pixel[] {
  const pixels: Pixel[] = [];
  let step = 0;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (true) {
    pixels.push({ x, y, step: step++, decisionVar: err });

    if (x === x1 && y === y1) break;

    const e2 = 2 * err;
    let label = "";
    if (e2 > -dy) { err -= dy; x += sx; label += "x"; }
    if (e2 < dx)  { err += dx; y += sy; label += "y"; }
    if (!label) label = "xy"; // diagonal step
  }

  return pixels;
}

// ---------------------------------------------------------------------------
// Midpoint Circle Algorithm (Bresenham's circle)
// Plots 8-way symmetry. Tracks decision parameter d at every step.
// ---------------------------------------------------------------------------
export function midpointCircle(
  cx: number, cy: number, r: number
): Pixel[] {
  const pixels: Pixel[] = [];
  let step = 0;

  if (r <= 0) {
    pixels.push({ x: cx, y: cy, step: 0, decisionVar: 0, label: "center" });
    return pixels;
  }

  let x = r;
  let y = 0;
  let d = 1 - r; // initial decision parameter

  const plot8 = (dx: number, dy: number) => {
    const pts: [number, number][] = [
      [cx + dx, cy + dy],
      [cx - dx, cy + dy],
      [cx + dx, cy - dy],
      [cx - dx, cy - dy],
      [cx + dy, cy + dx],
      [cx - dy, cy + dx],
      [cx + dy, cy - dx],
      [cx - dy, cy - dx],
    ];
    // Deduplicate to avoid double-plotting at axis/diagonal intersections
    const seen = new Set<string>();
    for (const [px, py] of pts) {
      const key = `${px},${py}`;
      if (!seen.has(key)) {
        seen.add(key);
        pixels.push({ x: px, y: py, step: step++, decisionVar: d, label: `(${dx},${dy})` });
      }
    }
  };

  while (x >= y) {
    plot8(x, y);
    y++;
    if (d < 0) {
      d += 2 * y + 1;
    } else {
      x--;
      d += 2 * (y - x) + 1;
    }
  }

  return pixels;
}
