# Geometric Analyzer — Complete Project Documentation

> **Version:** 0.1.0  
> **Last Updated:** April 19, 2026  
> **Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Three.js · Zustand 5

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Module 01 — Transformation Lab](#4-module-01--transformation-lab)
   - 4.1 [Translation](#41-translation)
   - 4.2 [Reflection](#42-reflection)
   - 4.3 [Rotation](#43-rotation)
   - 4.4 [Dilation](#44-dilation)
   - 4.5 [Cohen-Sutherland Line Clipping](#45-cohen-sutherland-line-clipping)
   - 4.6 [Audio Sonification](#46-audio-sonification)
5. [Module 02 — Net Unfolding](#5-module-02--net-unfolding)
   - 5.1 [Supported 3D Shapes](#51-supported-3d-shapes)
   - 5.2 [Surface Area & Volume Formulas](#52-surface-area--volume-formulas)
   - 5.3 [Unfolding Animation System](#53-unfolding-animation-system)
   - 5.4 [2D SVG Net Diagram](#54-2d-svg-net-diagram)
6. [Module 03 — Algorithm Lab](#6-module-03--algorithm-lab)
   - 6.1 [Bresenham's Line Algorithm](#61-bresenhams-line-algorithm)
   - 6.2 [Midpoint Circle Algorithm](#62-midpoint-circle-algorithm)
7. [State Management](#7-state-management)
8. [Shared Components](#8-shared-components)
9. [Design System](#9-design-system)
10. [Complete Formula Reference](#10-complete-formula-reference)

---

## 1. Project Overview

### Idea & Purpose

The **Geometric Analyzer** is an interactive, web-based computational geometry platform designed for education and exploration. It provides three independent but stylistically unified modules that allow users to visualise, manipulate, and understand core geometric concepts through direct interaction.

The platform bridges the gap between abstract mathematical formulas and tangible visual understanding by letting users:

- **Drag** vertices to see transformations update in real time
- **Scrub** a slider to watch 3D solids unfold into flat nets
- **Step through** rasterisation algorithms pixel by pixel

### Core Philosophy

| Principle | Implementation |
|---|---|
| **Learn by doing** | Every formula is linked to an interactive control |
| **Show the math** | Live KaTeX rendering of matrices and equations |
| **Visual first** | Coordinate grids, 3D scenes, and pixel canvases |
| **Zero friction** | No login, no setup — pure client-side rendering |

---

## 2. Architecture & Tech Stack

### Dependencies

| Package | Purpose |
|---|---|
| `next@16.2.3` | App Router framework (pages, layouts, SSR) |
| `react@19.2.4` | UI rendering |
| `typescript@5` | Type safety |
| `tailwindcss@4` | Utility-first CSS (with CSS custom properties design system) |
| `zustand@5.0.12` | Lightweight global state management |
| `recharts@3.8.1` | 2D scatter chart for the Transformation Lab |
| `three@0.183.2` | 3D rendering engine |
| `@react-three/fiber@9.6.0` | React reconciler for Three.js |
| `@react-three/drei@10.7.7` | Helpers (OrbitControls, Environment, etc.) |
| `@react-three/rapier@2.2.0` | Physics engine (rigid bodies, colliders) |
| `katex@0.16.45` | LaTeX math rendering |
| `lucide-react@1.8.0` | Icon library |

### Rendering Pipeline

```
┌─────────────────────────────────────────────────┐
│                   Next.js App Router            │
│  ┌────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ /      │  │ /physics-  │  │ /algorithm-  │  │
│  │ (Hub)  │  │  sandbox   │  │  lab         │  │
│  └────────┘  └────────────┘  └──────────────┘  │
│       │             │               │           │
│       ▼             ▼               ▼           │
│   Static       R3F Canvas      HTML Canvas      │
│   HTML         + Rapier         (2D Context)    │
│                Physics                          │
│       │             │               │           │
│       └─────────────┼───────────────┘           │
│                     ▼                           │
│              Zustand Stores                     │
│     ┌──────────────┬──────────────┐             │
│     │ useGeometry  │ useAlgorithm │             │
│     │    Store     │    Store     │             │
│     └──────────────┴──────────────┘             │
└─────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
src/
├── app/
│   ├── page.tsx                  # Hub landing page (module index)
│   ├── layout.tsx                # Root layout with ThemeProvider + fonts
│   ├── globals.css               # Design system tokens (CSS custom properties)
│   ├── transformation-lab/
│   │   └── page.tsx              # Module 01 page
│   ├── physics-sandbox/
│   │   └── page.tsx              # Module 02 page (Net Unfolding)
│   └── algorithm-lab/
│       └── page.tsx              # Module 03 page
│
├── components/
│   ├── lab/                      # Transformation Lab components
│   │   ├── TransformChart.tsx    # Recharts scatter chart + SVG overlay
│   │   ├── TransformSidebar.tsx  # Mode selector + vertex panels
│   │   ├── TranslationPanel.tsx  # Translation controls + matrix
│   │   ├── ReflectionPanel.tsx   # Reflection controls + matrix
│   │   ├── RotationPanel.tsx     # Rotation controls + matrix
│   │   ├── DilationPanel.tsx     # Dilation controls + matrix
│   │   └── ClippingPanel.tsx     # Cohen-Sutherland viewport controls
│   │
│   ├── sandbox/                  # Physics Sandbox components (legacy)
│   │   ├── PhysicsScene.tsx      # R3F Canvas + Rapier physics
│   │   ├── PhysicsSidebar.tsx    # Shape info + cube net panel
│   │   ├── SpawnShape.tsx        # Generic shape spawner (physics)
│   │   ├── SpawnCube.tsx         # Cube-specific spawner
│   │   ├── SpawnButton.tsx       # Spawn trigger button
│   │   ├── ShapeSelector.tsx     # Shape picker grid
│   │   ├── Floor.tsx             # Physics ground plane
│   │   ├── CameraRig.tsx        # Perspective/Orthographic camera
│   │   ├── CubeUnfold.tsx        # In-scene cube unfolding demo
│   │   └── NetSVG.tsx            # 2D SVG net for cube only
│   │
│   ├── unfold/                   # Universal Net Unfolding components
│   │   ├── UnfoldScene.tsx       # R3F Canvas — animated 3D unfolding
│   │   ├── UnfoldNetSVG.tsx      # 2D SVG net for all 6 shapes
│   │   └── UnfoldSidebar.tsx     # Shape selector + slider + formulas
│   │
│   └── shared/                   # Cross-module shared components
│       ├── KatexRenderer.tsx     # LaTeX math renderer
│       ├── ThemeProvider.tsx     # Dark/light mode context
│       └── ThemeToggle.tsx       # Theme switch button
│
├── lib/                          # Pure utility functions (no React)
│   ├── transformationUtils.ts    # Translation, reflection, rotation, dilation, clipping
│   ├── algorithmUtils.ts         # Bresenham line, midpoint circle
│   ├── shapeDefinitions.ts       # 2D/3D shape metadata + formulas
│   ├── shapeNets.ts              # Net face data for 6 unfoldable shapes
│   ├── cubeNet.ts                # Legacy cube-only net data
│   ├── spawnAudio.ts             # Spawn sound effect (Web Audio API)
│   └── useShapeAudio.ts          # Area-to-frequency sonification hook
│
└── store/                        # Zustand state stores
    ├── useGeometryStore.ts       # Main store (transforms, shapes, unfold)
    ├── useAlgorithmStore.ts      # Algorithm Lab state
    └── usePhysicsPositionStore.ts # Live R3F position tracking
```

---

## 4. Module 01 — Transformation Lab

**Route:** `/transformation-lab`  
**Layout:** Sidebar (left, 360px) + Recharts scatter chart (right, fills remaining space)  
**Coordinate System:** Cartesian [-10, 10] × [-10, 10] with grid lines at each integer

### How It Works

The user starts with a **default triangle** at vertices `(0,0)`, `(4,0)`, `(2,3)`. They select a transformation mode from four options, adjust parameters, and see the result in real time on the scatter chart. The **original shape** is rendered as a dashed grey "ghost" polygon, while the **transformed shape** is rendered as a solid blue polygon.

All vertices are **draggable** via mouse interaction on the chart. Control handles (reflection line endpoints, rotation pivot, dilation center) are rendered as red star markers and are also draggable.

Clicking **"Apply Transformation"** bakes the current transformation into the base vertices (replacing the original with the transformed result) and resets the transform parameters to identity.

---

### 4.1 Translation

**File:** `TranslationPanel.tsx`  
**Utility:** `translatePoint()` in `transformationUtils.ts`

#### Concept

Translation shifts every point of a shape by a constant displacement vector `(dx, dy)`. It is the simplest rigid-body transformation — it preserves shape, size, and orientation.

#### Formula

For a point `P(x, y)` and translation vector `T(dx, dy)`:

```
P' = P + T
x' = x + dx
y' = y + dy
```

#### Homogeneous Matrix Representation

The panel renders this matrix live via KaTeX, with `dx` and `dy` updating dynamically:

```
┌ 1  0  dx ┐   ┌ x ┐   ┌ x + dx ┐
│ 0  1  dy │ × │ y │ = │ y + dy │
└ 0  0  1  ┘   └ 1 ┘   └   1    ┘
```

#### Implementation

```typescript
export function translatePoint(p: Point, vector: Point): Point {
  return [p[0] + vector[0], p[1] + vector[1]];
}
```

#### UI Controls

- Two number inputs: `dx` (X-Axis) and `dy` (Y-Axis), step = 0.5
- "Apply Transformation" button commits the translation
- Live KaTeX matrix display with current `dx`, `dy` values substituted

---

### 4.2 Reflection

**File:** `ReflectionPanel.tsx`  
**Utility:** `reflectPoint()` in `transformationUtils.ts`

#### Concept

Reflection produces a mirror image of a shape across a line of symmetry. The line of reflection acts as a perpendicular bisector between each original point and its image.

#### Preset Reflection Lines

| Mode | Line | Matrix |
|---|---|---|
| X-Axis | `y = 0` | `[[1, 0], [0, -1]]` |
| Y-Axis | `x = 0` | `[[-1, 0], [0, 1]]` |
| `y = x` | 45° diagonal | `[[0, 1], [1, 0]]` |
| `y = -x` | -45° diagonal | `[[0, -1], [-1, 0]]` |
| Custom | Any two-point line | General reflection formula |

#### General Reflection Formula (Custom Line)

For a line defined by two points `P₁(x₁, y₁)` and `P₂(x₂, y₂)`, the line is first converted to general form `ax + by + c = 0`:

```
a = y₁ - y₂
b = x₂ - x₁
c = x₁·y₂ - x₂·y₁
```

The reflected point is then computed as:

```
factor = -2(ax + by + c) / (a² + b²)
x' = x + a · factor
y' = y + b · factor
```

#### General Reflection Matrix (displayed for custom mode)

```
M = 1/(a² + b²) × ┌ b² - a²    -2ab  ┐
                    └  -2ab    a² - b² ┘
```

Where `a` and `b` are the direction components of the line of reflection.

#### Implementation

```typescript
export function reflectPoint(p: Point, lineP1: Point, lineP2: Point): Point {
  const [x, y] = p;
  const [x1, y1] = lineP1;
  const [x2, y2] = lineP2;

  const a = y1 - y2;
  const b = x2 - x1;
  const c = x1 * y2 - x2 * y1;

  const denominator = a * a + b * b;
  if (denominator === 0) return [x, y]; // degenerate

  const factor = -2 * (a * x + b * y + c) / denominator;
  return [x + a * factor, y + b * factor];
}
```

#### UI Controls

- Dropdown selector for preset lines or custom mode
- In custom mode: draggable star handles on the chart define the mirror line
- The mirror line is rendered as a dashed red line extending across the full chart
- Live KaTeX matrix display changes based on selected mode

---

### 4.3 Rotation

**File:** `RotationPanel.tsx`  
**Utility:** `rotatePoint()` in `transformationUtils.ts`

#### Concept

Rotation turns every point of a shape around a fixed pivot point by a specified angle. It is a rigid-body transformation that preserves shape and size but changes orientation.

#### Formula

For a point `P(x, y)`, pivot `C(cx, cy)`, and angle `θ` (in degrees, converted to radians):

```
θ_rad = θ × π / 180

x' = cx + (x - cx)·cos(θ) - (y - cy)·sin(θ)
y' = cy + (x - cx)·sin(θ) + (y - cy)·cos(θ)
```

#### Rotation Matrix (displayed with live numeric values)

```
R(θ°) = ┌ cos(θ)  -sin(θ) ┐
         └ sin(θ)   cos(θ) ┘
```

For example, at θ = 90°: `R(90°) = [[0, -1], [1, 0]]`

#### Implementation

```typescript
export function rotatePoint(p: Point, pivot: Point, angleDeg: number): Point {
  const [x, y] = p;
  const [cx, cy] = pivot;
  const angleRad = (angleDeg * Math.PI) / 180;

  const sinTheta = Math.sin(angleRad);
  const cosTheta = Math.cos(angleRad);

  const newX = cx + (x - cx) * cosTheta - (y - cy) * sinTheta;
  const newY = cy + (x - cx) * sinTheta + (y - cy) * cosTheta;

  return [Math.round(newX * 1000) / 1000, Math.round(newY * 1000) / 1000];
}
```

> **Note:** Results are rounded to 3 decimal places to avoid floating-point display artefacts.

#### UI Controls

- Range slider: -180° to +180°, step = 5°
- Angle display badge showing current θ value
- Draggable star handle for pivot point on the chart
- Live KaTeX matrix with computed cos/sin values

---

### 4.4 Dilation

**File:** `DilationPanel.tsx`  
**Utility:** `dilatePoint()` in `transformationUtils.ts`

#### Concept

Dilation (scaling) enlarges or shrinks a shape relative to a fixed center point by a scale factor `k`. When `k > 1`, the shape enlarges; when `0 < k < 1`, it shrinks; when `k < 0`, it inverts.

#### Formula

For a point `P(x, y)`, center `C(cx, cy)`, and scale factor `k`:

```
x' = cx + k · (x - cx)
y' = cy + k · (y - cy)
```

#### Scaling Matrix

```
S(k) = ┌ k  0 ┐     ┌ x' ┐   ┌ k·x ┐
        └ 0  k ┘  ,  └ y' ┘ = └ k·y ┘
```

(When the center of dilation is the origin; otherwise, translate-scale-translate is applied.)

#### Implementation

```typescript
export function dilatePoint(p: Point, center: Point, scale: number): Point {
  const [x, y] = p;
  const [cx, cy] = center;
  return [cx + scale * (x - cx), cy + scale * (y - cy)];
}
```

#### UI Controls

- Range slider: k = 0.1 to 5.0, step = 0.1
- Scale factor display badge
- Draggable star handle for dilation center
- Live KaTeX matrix display

---

### 4.5 Cohen-Sutherland Line Clipping

**File:** `ClippingPanel.tsx`  
**Utility:** `cohenSutherlandClip()`, `csRegionCode()`, `csRegionLabel()` in `transformationUtils.ts`

#### Concept

The Cohen-Sutherland algorithm is a line-clipping algorithm that determines which portions of a line segment lie inside a rectangular viewport (clipping window). It is a fundamental algorithm in computer graphics.

#### How It Works

1. **Region Code Assignment:** Each endpoint of the line is assigned a 4-bit binary code `TBRL` (Top, Bottom, Right, Left) based on its position relative to the viewport:

```
Bit 3 (T): point is above the viewport  (y > yMax)
Bit 2 (B): point is below the viewport  (y < yMin)
Bit 1 (R): point is right of the viewport (x > xMax)
Bit 0 (L): point is left of the viewport  (x < xMin)
```

Code `0000` means the point is **inside** the viewport.

2. **Trivial Accept/Reject:**
   - If both codes are `0000` → both endpoints inside → **accept** entire line
   - If bitwise AND of both codes is non-zero → both endpoints on the same outside region → **reject** entire line

3. **Clipping:** If neither trivial case applies, the algorithm clips the line at a viewport boundary, computes the new intersection point, and repeats.

#### Intersection Formulas

When clipping against a boundary, the intersection point is computed using parametric line equations:

```
Clipping against top boundary (y = yMax):
  x_intersect = x₀ + dx · (yMax - y₀) / dy

Clipping against bottom boundary (y = yMin):
  x_intersect = x₀ + dx · (yMin - y₀) / dy

Clipping against right boundary (x = xMax):
  y_intersect = y₀ + dy · (xMax - x₀) / dx

Clipping against left boundary (x = xMin):
  y_intersect = y₀ + dy · (xMin - x₀) / dx
```

#### Visualisation

- **Viewport rectangle:** Rendered as an amber dashed rectangle on the chart
- **Full edges (outside):** Rendered as dimmed dashed blue lines (opacity 0.2)
- **Clipped segments (inside):** Rendered as bright amber lines (width 2.5)
- **Corner handles:** Four draggable amber handles let the user resize the viewport
- **Region codes:** Displayed per-vertex in the sidebar as 4-bit binary with labels (e.g., `0101 (BR)`)

#### Implementation

```typescript
export function csRegionCode(
  x: number, y: number,
  xMin: number, xMax: number, yMin: number, yMax: number
): number {
  let code = 0;           // CS_INSIDE
  if (x < xMin)      code |= 1;  // CS_LEFT
  else if (x > xMax) code |= 2;  // CS_RIGHT
  if (y < yMin)      code |= 4;  // CS_BOTTOM
  else if (y > yMax) code |= 8;  // CS_TOP
  return code;
}
```

#### UI Controls

- Toggle switch to enable/disable viewport clipping
- Four number inputs for `xMin`, `xMax`, `yMin`, `yMax`
- Draggable corner handles on the chart (NW, NE, SW, SE)
- Per-vertex region code display with colour coding (green = inside, red = outside)

---

### 4.6 Audio Sonification

**File:** `useShapeAudio.ts`

#### Concept

The shape area is mapped to an audible frequency, providing an alternative sensory channel for understanding geometric changes. As the shape grows larger, the tone pitch increases.

#### Shoelace Formula (Polygon Area)

Used to compute the area of the polygon formed by the transformed vertices:

```
A = ½ |Σᵢ (xᵢ · yᵢ₊₁ - xᵢ₊₁ · yᵢ)|
```

Where the sum wraps around (the last vertex connects back to the first).

#### Area-to-Frequency Mapping

```
Area range:      0.1 — 200 u²
Frequency range: 130 — 1200 Hz

t = ln(area / 0.1) / ln(200 / 0.1)    (logarithmic mapping)
frequency = 130 + t × (1200 - 130)
```

The logarithmic scale ensures perceptually uniform pitch changes across the full area range.

#### Audio Implementation

- Uses the **Web Audio API** with `OscillatorNode` (sine wave)
- 80ms debounce to prevent rapid-fire tones during dragging
- Quick attack (20ms) and exponential decay (350ms) envelope
- Toggle button in the chart corner: `♪ ON` / `♪ OFF`

---

## 5. Module 02 — Net Unfolding

**Route:** `/physics-sandbox`  
**Layout:** 3-column grid — [3D Canvas] | [2D SVG Net] | [Sidebar]

### Purpose

This module lets users select a 3D solid, then drag a slider to smoothly unfold it into its flat net. Each face of the solid peels off independently, and the sidebar formula highlights individual face-area terms as they are revealed.

---

### 5.1 Supported 3D Shapes

| ID | Label | Faces | Geometry |
|---|---|---|---|
| `cube` | Cube | 6 squares | `s = 1` |
| `rect-prism` | Rectangular Prism | 6 rectangles | `l=2, w=1, h=1.5` |
| `cylinder` | Cylinder | 2 circles + 1 rect | `r=0.5, h=1.4` |
| `cone` | Cone | 1 circle + 1 sector | `r=0.5, h=1.2` |
| `tri-prism` | Triangular Prism | 2 triangles + 3 rects | `side=1, depth=1.2` |
| `sq-pyramid` | Square Pyramid | 1 square + 4 triangles | `base=1, h=1` |

Each shape is defined in `shapeNets.ts` with complete data for:
- Assembled 3D positions and normals
- Flat net positions
- SVG coordinates
- Per-face animation windows and thresholds
- KaTeX area contribution labels
- Per-face colours

---

### 5.2 Surface Area & Volume Formulas

#### Cube (s = 1)

| Property | Formula | Computed |
|---|---|---|
| Surface Area | `SA = 6s²` | `SA = 6(1)² = 6 u²` |
| Volume | `V = s³` | `V = (1)³ = 1 u³` |

#### Rectangular Prism (l = 2, w = 1, h = 1.5)

| Property | Formula | Computed |
|---|---|---|
| Surface Area | `SA = 2(lw + lh + wh)` | `SA = 2(2·1 + 2·1.5 + 1·1.5) = 13 u²` |
| Volume | `V = l × w × h` | `V = 2 × 1 × 1.5 = 3 u³` |

#### Cylinder (r = 0.5, h = 1.4)

| Property | Formula | Computed |
|---|---|---|
| Surface Area | `SA = 2πr(r + h)` | `SA = 2π(0.5)(0.5 + 1.4) ≈ 5.97 u²` |
| Volume | `V = πr²h` | `V = π(0.5)²(1.4) ≈ 1.10 u³` |

**Net decomposition:**
- Lateral face: rectangle of width `2πr ≈ 3.14` and height `h = 1.4` → area = `2πrh`
- Top circle: `πr²`
- Bottom circle: `πr²`

#### Cone (r = 0.5, h = 1.2)

| Property | Formula | Computed |
|---|---|---|
| Slant height | `l = √(r² + h²)` | `l = √(0.25 + 1.44) ≈ 1.3` |
| Surface Area | `SA = πr(r + l)` | `SA = π(0.5)(0.5 + 1.3) ≈ 2.83 u²` |
| Volume | `V = ⅓πr²h` | `V = ⅓π(0.5)²(1.2) ≈ 0.31 u³` |

**Net decomposition:**
- Lateral face: circular sector with radius `l` and arc angle `θ = 2πr/l ≈ 2.42 rad` → area = `πrl`
- Base circle: `πr²`

#### Triangular Prism (equilateral side = 1, depth = 1.2)

| Property | Formula | Computed |
|---|---|---|
| Triangle height | `h_tri = (√3/2)·s` | `h_tri ≈ 0.866` |
| Surface Area | `SA = (√3/4)s² × 2 + 3(s·d)` | `SA ≈ 0.866 + 3.6 ≈ 4.23 u²` |
| Volume | `V = (√3/4)s²·d` | `V = (√3/4)(1)²(1.2) ≈ 0.52 u³` |

**Net decomposition:**
- 3 rectangular faces: each `s × d = 1 × 1.2` → area = `s·d` each
- 2 equilateral triangles: `(√3/4)s²` each

#### Square Pyramid (base = 1, h = 1)

| Property | Formula | Computed |
|---|---|---|
| Slant height | `l = √((b/2)² + h²)` | `l = √(0.25 + 1) ≈ 1.118` |
| Surface Area | `SA = b² + 2bl` | `SA = 1 + 2(1)(1.118) ≈ 3.24 u²` |
| Volume | `V = ⅓b²h` | `V = ⅓(1)²(1) ≈ 0.33 u³` |

**Net decomposition:**
- Base square: `b²`
- 4 isoceles triangles: `½bl` each

---

### 5.3 Unfolding Animation System

**File:** `UnfoldScene.tsx`

#### 3D Animation Pipeline

The unfolding is driven by a single global `unfoldProgress` value (`0` = assembled, `1` = flat net).

Each face has an `animWindow: [start, end]` defining when that face's local animation runs within the global progress. The local face progress is computed as:

```
faceProg(global, face) = clamp((global - start) / (end - start), 0, 1)
```

For each frame (`useFrame`), every face mesh:

1. **Position:** `mesh.position = lerp(assembledPos, netPos, faceProg)`
2. **Orientation:** `mesh.quaternion = slerp(assembledQuat, identityQuat, faceProg)`

The assembled quaternion is derived from the face's outward unit normal:

```
assembledQuat = Quaternion.setFromUnitVectors(Z_AXIS, faceNormal)
```

#### Assembled Ghost

A transparent wireframe of the fully assembled shape fades out over the first ~17% of progress (`alpha = max(0, 1 - progress × 6)`), giving the user a visual reference of the original solid.

#### Face Reveal Thresholds

Each face has a `threshold` value. When `unfoldProgress >= threshold`, that face's formula term lights up in the sidebar. Thresholds are staggered to create a sequential reveal effect:

| Cube Face | Threshold |
|---|---|
| Front | 0.00 |
| Top | 0.15 |
| Bottom | 0.30 |
| Left | 0.45 |
| Right | 0.60 |
| Back | 0.80 |

---

### 5.4 2D SVG Net Diagram

**File:** `UnfoldNetSVG.tsx`

A purely 2D representation of the net rendered as SVG. Each face is drawn at its `svgX`, `svgY` coordinate with the appropriate geometry (rectangle, circle, triangle, or sector). Faces fade in as the slider crosses their threshold, synchronised with the 3D view.

The SVG viewBox is derived from each shape's `netBounds: { xMin, yMin, xMax, yMax }` with padding.

---

## 6. Module 03 — Algorithm Lab

**Route:** `/algorithm-lab`  
**Layout:** Sidebar (left, 360px) + HTML Canvas pixel grid (right, square, fills space)  
**Grid:** 31 × 31 cells, coords from -15 to +15

### Purpose

Step-by-step visualisation of two fundamental computer graphics rasterisation algorithms. Users can set parameters, then step through (or auto-play) the algorithm watching pixels light up one at a time, with the decision variable displayed at each step.

---

### 6.1 Bresenham's Line Algorithm

**File:** `algorithmUtils.ts` → `bresenhamLine()`

#### Concept

Bresenham's line algorithm determines which pixels should be lit to approximate a straight line between two grid points, using **only integer arithmetic** (no floating-point division). It is the standard algorithm used in rasterised graphics.

#### Algorithm (Generalised for all 8 octants)

```
Input: (x₀, y₀) → (x₁, y₁) in integer grid coordinates

dx = |x₁ - x₀|
dy = |y₁ - y₀|
sx = x₀ < x₁ ? 1 : -1    (x step direction)
sy = y₀ < y₁ ? 1 : -1    (y step direction)
err = dx - dy              (initial error/decision variable)

Loop:
  1. Plot pixel at (x, y)
  2. If (x, y) = (x₁, y₁) → done
  3. e2 = 2 × err
  4. If e2 > -dy: err -= dy; x += sx    (step in x)
  5. If e2 <  dx: err += dx; y += sy    (step in y)
  Repeat
```

#### Key Formula — Decision Variable

The error term `err` accumulates the deviation from the true line. At each step:

```
e2 = 2 × err

If e2 > -dy  →  step in X direction (err -= dy)
If e2 <  dx  →  step in Y direction (err += dx)
If both      →  diagonal step
```

#### Implementation

```typescript
export function bresenhamLine(x0, y0, x1, y1): Pixel[] {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    pixels.push({ x, y, step, decisionVar: err });
    if (x === x1 && y === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 <  dx) { err += dx; y += sy; }
  }
}
```

#### UI

- Endpoints `P₀(x₀, y₀)` in green, `P₁(x₁, y₁)` in red
- Plotted pixels in blue (`rgba(59,130,246,0.85)`)
- Next pixel highlighted in amber
- Step inspector shows: last plotted coords, decision variable, step type (x/y/diagonal)

---

### 6.2 Midpoint Circle Algorithm

**File:** `algorithmUtils.ts` → `midpointCircle()`

#### Concept

The midpoint circle algorithm (also called Bresenham's circle algorithm) exploits **8-way symmetry** to rasterise a circle. It computes only the pixels in the first octant (from `(r, 0)` to the 45° diagonal) and mirrors them to all 8 octants simultaneously.

#### Algorithm

```
Input: center (cx, cy), radius r

x = r, y = 0
d = 1 - r        (initial decision parameter)

While x >= y:
  1. Plot 8 symmetric pixels:
     (cx±x, cy±y) and (cx±y, cy±x)
  2. y++
  3. If d < 0:
       d += 2y + 1           (choose E pixel — stay at same x)
     Else:
       x--
       d += 2(y - x) + 1     (choose SE pixel — decrement x)
```

#### Key Formula — Decision Parameter

The decision parameter `d` determines whether the midpoint between two candidate pixels lies inside or outside the circle:

```
Initial:  d = 1 - r

If d < 0 (midpoint inside circle):
  d_new = d + 2y + 1                → choose East pixel

If d ≥ 0 (midpoint outside circle):
  d_new = d + 2(y - x) + 1          → choose South-East pixel
```

This is derived from the implicit circle equation `F(x,y) = x² + y² - r²` evaluated at the midpoint.

#### 8-Way Symmetry Points

For each computed point `(dx, dy)` relative to center, plot:

```
(cx + dx, cy + dy)    (cx - dx, cy + dy)
(cx + dx, cy - dy)    (cx - dx, cy - dy)
(cx + dy, cy + dx)    (cx - dy, cy + dx)
(cx + dy, cy - dx)    (cx - dy, cy - dx)
```

Deduplication is applied to avoid double-plotting at axis/diagonal intersections.

#### Implementation

```typescript
export function midpointCircle(cx, cy, r): Pixel[] {
  let x = r, y = 0;
  let d = 1 - r;

  while (x >= y) {
    plot8(x, y);  // plots all 8 symmetric points
    y++;
    if (d < 0) {
      d += 2 * y + 1;
    } else {
      x--;
      d += 2 * (y - x) + 1;
    }
  }
}
```

#### UI

- Centre marked with a purple crosshair
- Plotted pixels in purple (`rgba(168,85,247,0.85)`)
- Next pixel highlighted in amber
- Step inspector shows: last plotted coords, decision variable `d`, octant label

---

## 7. State Management

All application state is managed by three **Zustand** stores:

### `useGeometryStore` (Main Store)

| State Slice | Type | Purpose |
|---|---|---|
| `vertices` | `Point[]` | Base polygon vertices (mutable via drag or apply) |
| `mode` | `'translate'\|'reflect'\|'rotate'\|'dilate'\|null` | Active transformation |
| `translationVector` | `Point` | `[dx, dy]` displacement |
| `reflectionMode` | `ReflectionMode` | Preset or custom mirror line |
| `reflectionLine` | `{p1: Point, p2: Point}` | Two-point line definition |
| `rotationPivot` | `Point` | Centre of rotation |
| `rotationAngle` | `number` | Degrees (-180 to 180) |
| `dilationCenter` | `Point` | Centre of dilation |
| `dilationScale` | `number` | Scale factor k |
| `viewportEnabled` | `boolean` | Toggle for clipping mode |
| `viewport` | `{xMin,yMin,xMax,yMax}` | Clipping window bounds |
| `unfoldShapeId` | `UnfoldShapeId` | Selected 3D shape for unfolding |
| `unfoldProgress` | `number` | 0–1 unfold slider value |
| `selectedShape` | `ShapeType` | Shape for physics spawning |
| `spawnedShapes` | `SpawnedShape[]` | Active physics objects |

### `useAlgorithmStore`

| State Slice | Type | Purpose |
|---|---|---|
| `mode` | `'line'\|'circle'` | Active algorithm |
| `lineX0, lineY0, lineX1, lineY1` | `number` | Line endpoints |
| `circleCx, circleCy, circleR` | `number` | Circle parameters |
| `pixels` | `Pixel[]` | Full computed pixel sequence |
| `currentStep` | `number` | How many pixels are revealed |
| `isPlaying` | `boolean` | Auto-play state |

Pixels are **recomputed eagerly** whenever parameters change. The `currentStep` index simply controls how many of the precomputed pixels are rendered.

### `usePhysicsPositionStore`

A lightweight store updated every frame from inside R3F's `useFrame` loop. Kept separate to avoid re-rendering non-physics components.

| State | Purpose |
|---|---|
| `positions: Record<string, [x,y,z]>` | Live world position of each spawned shape |

---

## 8. Shared Components

### KatexRenderer

**File:** `components/shared/KatexRenderer.tsx`

Renders LaTeX math strings using the KaTeX library. Accepts an `expression` prop (string with `$...$` delimiters) and outputs formatted HTML.

Used ubiquitously across all modules for:
- Transformation matrices
- Surface area and volume formulas
- Computed numeric results

### ThemeProvider + ThemeToggle

**Files:** `ThemeProvider.tsx`, `ThemeToggle.tsx`

Provides dark/light mode support via a React context. The theme class is applied to the `<html>` element and persisted to `localStorage`. All colours in the app use CSS custom properties defined in `globals.css` that swap between themes.

---

## 9. Design System

**File:** `globals.css`

The project uses a custom **CSS custom property design system** with semantic naming:

### Colour Tokens

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--base` | White | `#09090b` | Page background |
| `--raised` | Light grey | `#18181b` | Card/panel surface |
| `--panel` | Near-white | `#0f0f11` | Sidebar backgrounds |
| `--ink` | Near-black | `#fafafa` | Primary text |
| `--ink-2` | Medium grey | `#a1a1aa` | Secondary text |
| `--ink-3` | Light grey | `#71717a` | Tertiary text |
| `--ink-4` | Very light | `#52525b` | Quaternary text |
| `--rim` | Border grey | `#27272a` | Borders/dividers |
| `--rim-faint` | Faint border | `#1c1c1e` | Subtle dividers |

### Typography

- **Sans-serif:** Inter (via `next/font/google`)
- **Monospace:** JetBrains Mono (via `next/font/google`)
- System strip text: `10px`, tracking `0.25em`, uppercase
- Hero title: `clamp(2.8rem, 7.5vw, 7.5rem)`, tracking `-0.04em`

### Visual Style

- **Swiss design** influence: strict grid-based layouts, ample whitespace
- **Dot grid** background pattern on the hub page
- **Three-column accent palette:** Blue (Module 01), Emerald (Module 02), Violet (Module 03)
- **Hover effects:** Ghost number reveals, accent colour transitions, arrow nudge
- **Module cards:** Gap-px Swiss grid with left accent border

---

## 10. Complete Formula Reference

### Coordinate Transformations

| Transform | Formula | Matrix |
|---|---|---|
| Translation | `P' = P + T` | `[[1,0,dx],[0,1,dy],[0,0,1]]` (homogeneous) |
| Reflection (x-axis) | `(x, -y)` | `[[1,0],[0,-1]]` |
| Reflection (y-axis) | `(-x, y)` | `[[-1,0],[0,1]]` |
| Reflection (y=x) | `(y, x)` | `[[0,1],[1,0]]` |
| Reflection (y=-x) | `(-y, -x)` | `[[0,-1],[-1,0]]` |
| Reflection (general) | `P' = P + factor·n` | `1/(a²+b²) × [[b²-a²,-2ab],[-2ab,a²-b²]]` |
| Rotation | `P' = R(θ)·(P-C) + C` | `[[cosθ,-sinθ],[sinθ,cosθ]]` |
| Dilation | `P' = C + k·(P-C)` | `[[k,0],[0,k]]` |

### Area & Volume

| Shape | Area/SA | Volume |
|---|---|---|
| Square | `A = s²` | — |
| Rectangle | `A = l × w` | — |
| Equilateral Triangle | `A = (√3/4)s²` | — |
| Sphere | `SA = 4πr²` | `V = (4/3)πr³` |
| Cube | `SA = 6s²` | `V = s³` |
| Cuboid | `SA = 2(lw + lh + wh)` | `V = l × w × h` |
| Cylinder | `SA = 2πr(r + h)` | `V = πr²h` |
| Cone | `SA = πr(r + l)` | `V = (1/3)πr²h` |
| Triangular Prism | `SA = (√3/2)s² + 3sd` | `V = (√3/4)s²d` |
| Square Pyramid | `SA = b² + 2bl` | `V = (1/3)b²h` |

### Rasterisation Algorithms

| Algorithm | Key Variable | Update Rules |
|---|---|---|
| Bresenham Line | `err = dx - dy` | If `2err > -dy`: step X, `err -= dy`; If `2err < dx`: step Y, `err += dx` |
| Midpoint Circle | `d = 1 - r` | If `d < 0`: `d += 2y + 1`; If `d ≥ 0`: `d += 2(y-x) + 1`, `x--` |

### Cohen-Sutherland

| Region Code Bit | Meaning | Condition |
|---|---|---|
| Bit 0 (L) | Left of viewport | `x < xMin` |
| Bit 1 (R) | Right of viewport | `x > xMax` |
| Bit 2 (B) | Below viewport | `y < yMin` |
| Bit 3 (T) | Above viewport | `y > yMax` |

### Audio Sonification

| Parameter | Value |
|---|---|
| Area input range | 0.1 – 200 u² |
| Frequency output range | 130 – 1200 Hz |
| Mapping function | Logarithmic: `f = 130 + ln(A/0.1)/ln(2000) × 1070` |
| Waveform | Sine |
| Attack | 20ms linear ramp |
| Decay | 350ms exponential ramp |
| Debounce | 80ms |

---

*End of documentation.*
