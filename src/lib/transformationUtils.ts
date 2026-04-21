export type Point = [number, number];

/** 2D combined mode: `trs` = rotate → scale → translate; `rst` = scale → rotate → translate */
export type CombinedOrder = "trs" | "rst";

export function applyCombined2D(
  p: Point,
  angleDeg: number,
  scale: Point,
  translate: Point,
  order: CombinedOrder
): Point {
  const angleRad = (angleDeg * Math.PI) / 180;
  const sin = Math.sin(angleRad);
  const cos = Math.cos(angleRad);
  const [sx, sy] = scale;
  const [dx, dy] = translate;
  const [x, y] = p;
  if (order === "trs") {
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return [rx * sx + dx, ry * sy + dy];
  }
  const sxv = x * sx;
  const syv = y * sy;
  const rx = sxv * cos - syv * sin;
  const ry = sxv * sin + syv * cos;
  return [rx + dx, ry + dy];
}

export function reflectPoint(p: Point, lineP1: Point, lineP2: Point): Point {
  const [x, y] = p;
  const [x1, y1] = lineP1;
  const [x2, y2] = lineP2;

  // General line formula: ax + by + c = 0
  const a = y1 - y2;
  const b = x2 - x1;
  const c = x1 * y2 - x2 * y1;

  const denominator = a * a + b * b;
  if (denominator === 0) {
    // P1 and P2 are identical, can't form a line. Return original point.
    return [x, y];
  }

  const factor = -2 * (a * x + b * y + c) / denominator;
  const newX = x + a * factor;
  const newY = y + b * factor;

  return [newX, newY];
}

export function rotatePoint(p: Point, pivot: Point, angleDeg: number): Point {
  const [x, y] = p;
  const [cx, cy] = pivot;
  const angleRad = (angleDeg * Math.PI) / 180;

  const sinTheta = Math.sin(angleRad);
  const cosTheta = Math.cos(angleRad);

  const newX = cx + (x - cx) * cosTheta - (y - cy) * sinTheta;
  const newY = cy + (x - cx) * sinTheta + (y - cy) * cosTheta;

  return [Math.round(newX * 1000) / 1000, Math.round(newY * 1000) / 1000]; // Round to avoid floating point issues
}

export function dilatePoint(p: Point, center: Point, scale: number): Point {
  const [x, y] = p;
  const [cx, cy] = center;

  const newX = cx + scale * (x - cx);
  const newY = cy + scale * (y - cy);

  return [newX, newY];
}

export function translatePoint(p: Point, vector: Point): Point {
  return [p[0] + vector[0], p[1] + vector[1]];
}

// ---------------------------------------------------------------------------
// Cohen-Sutherland line clipping
// ---------------------------------------------------------------------------
const CS_INSIDE = 0;
const CS_LEFT   = 1;
const CS_RIGHT  = 2;
const CS_BOTTOM = 4;
const CS_TOP    = 8;

export function csRegionCode(
  x: number, y: number,
  xMin: number, xMax: number, yMin: number, yMax: number
): number {
  let code = CS_INSIDE;
  if (x < xMin)      code |= CS_LEFT;
  else if (x > xMax) code |= CS_RIGHT;
  if (y < yMin)      code |= CS_BOTTOM;
  else if (y > yMax) code |= CS_TOP;
  return code;
}

export function csRegionLabel(code: number): string {
  if (code === CS_INSIDE) return "0000 (inside)";
  const parts: string[] = [];
  if (code & CS_TOP)    parts.push("T");
  if (code & CS_BOTTOM) parts.push("B");
  if (code & CS_RIGHT)  parts.push("R");
  if (code & CS_LEFT)   parts.push("L");
  return `${code.toString(2).padStart(4, '0')} (${parts.join('')})`;
}

/**
 * Clips segment [p1, p2] against the viewport [xMin,xMax]×[yMin,yMax].
 * Returns the clipped segment or null if fully outside.
 */
export function cohenSutherlandClip(
  p1: Point, p2: Point,
  xMin: number, xMax: number, yMin: number, yMax: number
): { p1: Point; p2: Point } | null {
  let [x0, y0] = p1;
  let [x1, y1] = p2;

  let code0 = csRegionCode(x0, y0, xMin, xMax, yMin, yMax);
  let code1 = csRegionCode(x1, y1, xMin, xMax, yMin, yMax);

  while (true) {
    if (!(code0 | code1)) return { p1: [x0, y0], p2: [x1, y1] }; // both inside
    if (code0 & code1)    return null;                              // trivially outside

    const codeOut = code0 || code1;
    const dx = x1 - x0, dy = y1 - y0;
    let x = 0, y = 0;

    if (codeOut & CS_TOP) {
      x = x0 + dx * (yMax - y0) / dy; y = yMax;
    } else if (codeOut & CS_BOTTOM) {
      x = x0 + dx * (yMin - y0) / dy; y = yMin;
    } else if (codeOut & CS_RIGHT) {
      y = y0 + dy * (xMax - x0) / dx; x = xMax;
    } else {
      y = y0 + dy * (xMin - x0) / dx; x = xMin;
    }

    if (codeOut === code0) {
      x0 = x; y0 = y;
      code0 = csRegionCode(x0, y0, xMin, xMax, yMin, yMax);
    } else {
      x1 = x; y1 = y;
      code1 = csRegionCode(x1, y1, xMin, xMax, yMin, yMax);
    }
  }
}
