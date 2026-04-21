import type { CombinedOrder, Point } from "@/lib/transformationUtils";

const R = (n: number) => {
  const x = Math.round(n * 1000) / 1000;
  if (Object.is(x, -0)) return 0;
  return x;
};

/** 3×3 homogeneous matrices for 2D (row-major for display). */
export function translationMatrix2D(dx: number, dy: number): number[][] {
  return [
    [1, 0, R(dx)],
    [0, 1, R(dy)],
    [0, 0, 1],
  ];
}

export function rotationMatrix2D(angleDeg: number): number[][] {
  const rad = (angleDeg * Math.PI) / 180;
  const c = R(Math.cos(rad));
  const s = R(Math.sin(rad));
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
}

export function scaleMatrix2D(sx: number, sy: number): number[][] {
  return [
    [R(sx), 0, 0],
    [0, R(sy), 0],
    [0, 0, 1],
  ];
}

function mat3Multiply(a: number[][], b: number[][]): number[][] {
  const out = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++) out[i][j] += a[i][k] * b[k][j];
  return out.map((row) => row.map(R));
}

function translationToPivot(cx: number, cy: number): number[][] {
  return translationMatrix2D(cx, cy);
}

function translationFromPivot(cx: number, cy: number): number[][] {
  return translationMatrix2D(-cx, -cy);
}

/** Rotation about pivot (matches `rotatePoint` semantics). */
export function rotationAboutPivotMatrix2D(angleDeg: number, pivot: Point): number[][] {
  const [cx, cy] = pivot;
  return mat3Multiply(
    translationToPivot(cx, cy),
    mat3Multiply(rotationMatrix2D(angleDeg), translationFromPivot(cx, cy))
  );
}

/** Non-uniform scale about center (matches chart dilation). */
export function scaleAboutCenterMatrix2D(sx: number, sy: number, center: Point): number[][] {
  const [cx, cy] = center;
  return mat3Multiply(
    translationToPivot(cx, cy),
    mat3Multiply(scaleMatrix2D(sx, sy), translationFromPivot(cx, cy))
  );
}

/**
 * Combined affine on ℝ² (origin-centered rotate/scale, then translate) — same as `applyCombined2D`.
 * Matrix: T_translate * S_scale * R_rotate for `trs`; T * R * S for `rst`.
 */
export function combinedMatrix2D(
  angleDeg: number,
  scale: Point,
  translate: Point,
  order: CombinedOrder
): number[][] {
  const Rm = rotationMatrix2D(angleDeg);
  const Sm = scaleMatrix2D(scale[0], scale[1]);
  const [dx, dy] = translate;
  const Tm = translationMatrix2D(dx, dy);
  if (order === "trs") return mat3Multiply(Tm, mat3Multiply(Sm, Rm));
  return mat3Multiply(Tm, mat3Multiply(Rm, Sm));
}

function mat4Identity(): number[][] {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

function mat4Multiply(a: number[][], b: number[][]): number[][] {
  const out = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      for (let k = 0; k < 4; k++) out[i][j] += a[i][k] * b[k][j];
  return out.map((row) => row.map(R));
}

function translation4(tx: number, ty: number, tz: number): number[][] {
  const m = mat4Identity();
  m[0][3] = R(tx);
  m[1][3] = R(ty);
  m[2][3] = R(tz);
  return m;
}

function scale4(sx: number, sy: number, sz: number): number[][] {
  return [
    [R(sx), 0, 0, 0],
    [0, R(sy), 0, 0],
    [0, 0, R(sz), 0],
    [0, 0, 0, 1],
  ];
}

function rotX4(deg: number): number[][] {
  const rad = (deg * Math.PI) / 180;
  const c = R(Math.cos(rad));
  const s = R(Math.sin(rad));
  return [
    [1, 0, 0, 0],
    [0, c, -s, 0],
    [0, s, c, 0],
    [0, 0, 0, 1],
  ];
}

function rotY4(deg: number): number[][] {
  const rad = (deg * Math.PI) / 180;
  const c = R(Math.cos(rad));
  const s = R(Math.sin(rad));
  return [
    [c, 0, s, 0],
    [0, 1, 0, 0],
    [-s, 0, c, 0],
    [0, 0, 0, 1],
  ];
}

function rotZ4(deg: number): number[][] {
  const rad = (deg * Math.PI) / 180;
  const c = R(Math.cos(rad));
  const s = R(Math.sin(rad));
  return [
    [c, -s, 0, 0],
    [s, c, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

/** Matches `TransformChart` `project3D`: scale → Rx → Ry → Rz → translate (full slider values). */
export function affine3DMatrix(
  rotationDeg: [number, number, number],
  scale: [number, number, number],
  translation: [number, number, number]
): number[][] {
  const [rx, ry, rz] = rotationDeg;
  const [sx, sy, sz] = scale;
  const [tx, ty, tz] = translation;
  const T = translation4(tx, ty, tz);
  const Rtotal = mat4Multiply(rotZ4(rz), mat4Multiply(rotY4(ry), rotX4(rx)));
  const S = scale4(sx, sy, sz);
  return mat4Multiply(T, mat4Multiply(Rtotal, S));
}

export function formatMatrixRows(m: number[][], digits = 2): string[] {
  const f = (x: number) =>
    x.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
  return m.map((row) => row.map(f).join(" "));
}
