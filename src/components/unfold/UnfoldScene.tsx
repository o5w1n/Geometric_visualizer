"use client";

/**
 * UnfoldScene — R3F canvas with no physics.
 *
 * Shapes with only flat faces (cube, rect-prism, tri-prism, sq-pyramid):
 *   Each face is a FaceMesh that lerps position + slerpQuaternions between
 *   assembled-3D and flat-net states driven by unfoldProgress.
 *
 * Cylinder lateral surface:
 *   Replaced by CylinderLateral — 8 rectangular strips arranged in a ring
 *   that unroll into a flat row, giving a real "unrolling" animation.
 *
 * Cone lateral surface:
 *   Replaced by ConeLateral — 8 strips on the cone surface that unfold
 *   into the flat sector using a full rotation-matrix assembled quaternion.
 *
 * AssembledGhost is wireframe-only (no solid mesh) to avoid z-fighting
 * black artifacts on opaque materials.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useGeometryStore } from "@/store/useGeometryStore";
import {
  SHAPE_NETS,
  faceProg,
  CYL_H, CYL_R,
  CONE_H, CONE_R, CONE_L, CONE_ANGLE,
  type ShapeFace,
  type AssembledGeo,
  type UnfoldShapeId,
} from "@/lib/shapeNets";

// ── Constants ─────────────────────────────────────────────────────────────────

const Z_AXIS  = new THREE.Vector3(0, 0, 1);
const NET_QUAT = new THREE.Quaternion(); // identity

// ── Geometry factory for data-driven faces ───────────────────────────────────

function makeFaceGeometry(face: ShapeFace): THREE.BufferGeometry {
  const g = face.geo;
  if (g.kind === 'plane')  return new THREE.PlaneGeometry(g.w, g.h);
  if (g.kind === 'circle') return new THREE.CircleGeometry(g.r, 48);
  if (g.kind === 'sector') {
    const shape = new THREE.Shape();
    const half  = g.angle / 2;
    shape.moveTo(0, 0);
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const θ = -half + (g.angle * i) / steps - Math.PI / 2;
      shape.lineTo(Math.cos(θ) * g.r, Math.sin(θ) * g.r);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }
  if (g.kind === 'tri-equilateral') {
    const s = g.side, h = (Math.sqrt(3) / 2) * s, cy = h / 3;
    const shape = new THREE.Shape();
    shape.moveTo(-s / 2, -cy);
    shape.lineTo( s / 2, -cy);
    shape.lineTo(0,  h - cy);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }
  if (g.kind === 'tri-isoceles') {
    const { base, h } = g, cy = h / 3;
    const shape = new THREE.Shape();
    shape.moveTo(-base / 2, -cy);
    shape.lineTo( base / 2, -cy);
    shape.lineTo(0,  h - cy);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }
  return new THREE.PlaneGeometry(1, 1);
}

// ── Single data-driven face mesh ─────────────────────────────────────────────

function FaceMesh({ face, shapeId }: { face: ShapeFace; shapeId: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => makeFaceGeometry(face), [face]);

  const asmPos = useMemo(() => new THREE.Vector3(...face.asmPos),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [face.id, shapeId]);
  const netPos = useMemo(() => new THREE.Vector3(...face.netPos),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [face.id, shapeId]);
  const asmQuat = useMemo(() => {
    const n = new THREE.Vector3(...face.asmNormal).normalize();
    if (n.dot(Z_AXIS) < -0.9999)
      return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    return new THREE.Quaternion().setFromUnitVectors(Z_AXIS, n);
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [face.id, shapeId]);

  useFrame(() => {
    if (!meshRef.current) return;
    const global = useGeometryStore.getState().unfoldProgress;
    const t      = faceProg(global, face);
    meshRef.current.position.lerpVectors(asmPos, netPos, t);
    meshRef.current.quaternion.slerpQuaternions(asmQuat, NET_QUAT, t);
    (meshRef.current.material as THREE.MeshStandardMaterial).opacity =
      Math.min(1, global * 5) * 0.92;
  });

  return (
    <mesh ref={meshRef} position={asmPos.clone()} quaternion={asmQuat.clone()} geometry={geo}>
      <meshStandardMaterial color={face.color} side={THREE.DoubleSide}
        roughness={0.3} metalness={0.05} transparent opacity={0} />
    </mesh>
  );
}

// ── Cylinder lateral: 8 strips that unroll ────────────────────────────────────

const CYL_N          = 8;
const CYL_STRIP_W    = (2 * Math.PI * CYL_R) / CYL_N;  // arc width per strip

// Pre-compute all strip transform data once (module scope, never changes)
const _cylStrips = (() => {
  const out = [];
  for (let i = 0; i < CYL_N; i++) {
    const θ   = (i / CYL_N) * 2 * Math.PI;
    const cos = Math.cos(θ), sin = Math.sin(θ);
    const asmPos  = new THREE.Vector3(CYL_R * cos, 0, CYL_R * sin);
    const outward = new THREE.Vector3(cos, 0, sin);
    const asmQuat = new THREE.Quaternion().setFromUnitVectors(Z_AXIS, outward);
    // Net: strips lay flat side-by-side along X, centred on 0
    const netPos  = new THREE.Vector3((-CYL_N / 2 + i + 0.5) * CYL_STRIP_W, 0, 0);
    out.push({ asmPos, asmQuat, netPos });
  }
  return out;
})();

function CylinderLateral() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const geo  = useMemo(() => new THREE.PlaneGeometry(CYL_STRIP_W * 0.98, CYL_H), []);

  useFrame(() => {
    const p     = useGeometryStore.getState().unfoldProgress;
    const alpha = Math.min(1, p * 5) * 0.92;
    for (let i = 0; i < CYL_N; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      const { asmPos, asmQuat, netPos } = _cylStrips[i];
      mesh.position.lerpVectors(asmPos, netPos, p);
      mesh.quaternion.slerpQuaternions(asmQuat, NET_QUAT, p);
      (mesh.material as THREE.MeshStandardMaterial).opacity = alpha;
    }
  });

  return (
    <>
      {_cylStrips.map(({ asmPos, asmQuat }, i) => (
        <mesh key={i}
          ref={el => { refs.current[i] = el; }}
          position={asmPos.clone()} quaternion={asmQuat.clone()}
          geometry={geo}>
          <meshStandardMaterial color="#10b981" side={THREE.DoubleSide}
            roughness={0.3} metalness={0.05} transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
}

// ── Cone lateral: 8 strips on the cone surface that unfold ────────────────────

const CONE_N = 8;
const CONE_STRIP_ARC = (2 * Math.PI * CONE_R) / CONE_N; // arc-width per strip

const _coneStrips = (() => {
  const Cr_Cl = CONE_R / CONE_L;
  const Ch_Cl = CONE_H / CONE_L;
  const out   = [];

  for (let i = 0; i < CONE_N; i++) {
    const θ   = (i / CONE_N) * 2 * Math.PI;
    const cos = Math.cos(θ), sin = Math.sin(θ);

    // Assembled centre = midpoint from apex→base-ring-point
    const asmPos = new THREE.Vector3(CONE_R / 2 * cos, 0, CONE_R / 2 * sin);

    // Assembled rotation matrix (columns = right, up-along-strip, outward-normal)
    // right   = tangent to base circle at θ
    // up      = unit direction from base to apex
    // normal  = up × right (outward cone surface normal)
    const m = new THREE.Matrix4().set(
      -sin,         -Cr_Cl * cos,  Ch_Cl * cos,  0,
       0,            Ch_Cl,         Cr_Cl,         0,
       cos,          -Cr_Cl * sin,  Ch_Cl * sin,  0,
       0,             0,            0,             1,
    );
    const asmQuat = new THREE.Quaternion().setFromRotationMatrix(m);

    // Net: strip i in the flat sector, apex at world origin, arc opens –Y
    // α_i = angle from –Y axis (sector half-angle range)
    const α    = -CONE_ANGLE / 2 + (i + 0.5) * CONE_ANGLE / CONE_N;
    // Strip centre is at CONE_L/2 from apex, in direction [sin α, –cos α]
    const netPos = new THREE.Vector3(
      CONE_L / 2 * Math.sin(α),
      -CONE_L / 2 * Math.cos(α),
      0,
    );
    // Net rotation: strip is flat, its local +Y points radially outward from apex
    const netQuat = new THREE.Quaternion().setFromAxisAngle(Z_AXIS, α);

    out.push({ asmPos, asmQuat, netPos, netQuat });
  }
  return out;
})();

function ConeLateral() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  // thin rectangle approximating each cone strip
  const geo  = useMemo(() => new THREE.PlaneGeometry(CONE_STRIP_ARC * 0.95, CONE_L), []);

  useFrame(() => {
    const p     = useGeometryStore.getState().unfoldProgress;
    const alpha = Math.min(1, p * 5) * 0.92;
    for (let i = 0; i < CONE_N; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      const { asmPos, asmQuat, netPos, netQuat } = _coneStrips[i];
      mesh.position.lerpVectors(asmPos, netPos, p);
      mesh.quaternion.slerpQuaternions(asmQuat, netQuat, p);
      (mesh.material as THREE.MeshStandardMaterial).opacity = alpha;
    }
  });

  return (
    <>
      {_coneStrips.map(({ asmPos, asmQuat }, i) => (
        <mesh key={i}
          ref={el => { refs.current[i] = el; }}
          position={asmPos.clone()} quaternion={asmQuat.clone()}
          geometry={geo}>
          <meshStandardMaterial color="#f59e0b" side={THREE.DoubleSide}
            roughness={0.3} metalness={0.05} transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
}

// ── Wireframe-only ghost (no solid mesh → no z-fighting black patches) ────────

function AssembledGhost({ geo }: { geo: AssembledGeo }) {
  const lineRef = useRef<THREE.LineSegments>(null!);

  const solidGeo = useMemo<THREE.BufferGeometry>(() => {
    if (geo.kind === 'box')      return new THREE.BoxGeometry(...geo.args);
    if (geo.kind === 'cylinder') return new THREE.CylinderGeometry(geo.rTop, geo.rBot, geo.h, geo.seg);
    if (geo.kind === 'cone')     return new THREE.ConeGeometry(geo.r, geo.h, geo.seg);
    if (geo.kind === 'tri-prism')
      return new THREE.CylinderGeometry(geo.side / Math.sqrt(3), geo.side / Math.sqrt(3), geo.depth, 3);
    if (geo.kind === 'sq-pyramid')
      return new THREE.ConeGeometry((geo.base / 2) * Math.sqrt(2), geo.h, 4);
    return new THREE.BoxGeometry(1, 1, 1);
  }, [geo]);

  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(solidGeo), [solidGeo]);

  useFrame(() => {
    if (!lineRef.current) return;
    const p     = useGeometryStore.getState().unfoldProgress;
    const alpha = Math.max(0, 1 - p * 5);
    (lineRef.current.material as THREE.LineBasicMaterial).opacity = alpha * 0.6;
  });

  return (
    <lineSegments ref={lineRef} geometry={edgesGeo}>
      <lineBasicMaterial color="#888888" transparent opacity={0.6} />
    </lineSegments>
  );
}

// ── Scene contents ────────────────────────────────────────────────────────────

function SceneContents() {
  const shapeId = useGeometryStore(s => s.unfoldShapeId) as UnfoldShapeId;
  const def     = SHAPE_NETS[shapeId] ?? SHAPE_NETS['cube'];

  // For cylinder/cone we replace the lateral face with strip-based components.
  const isSpecialLateral = shapeId === 'cylinder' || shapeId === 'cone';
  const facesToRender    = isSpecialLateral
    ? def.faces.filter(f => f.id !== 'lateral')
    : def.faces;

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 12, 8]} intensity={1.2} castShadow />
      <Environment preset="city" />

      <AssembledGhost geo={def.assembledGeo} />

      {facesToRender.map(face => (
        <FaceMesh key={`${shapeId}-${face.id}`} face={face} shapeId={shapeId} />
      ))}

      {shapeId === 'cylinder' && <CylinderLateral />}
      {shapeId === 'cone'     && <ConeLateral />}

      <gridHelper args={[20, 20, "#1f2937", "#111827"]} position={[0, -2, 0]} />

      <OrbitControls makeDefault minDistance={2} maxDistance={20}
        maxPolarAngle={Math.PI * 0.85} />
    </>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export function UnfoldScene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [3, 2.5, 4], fov: 50 }} shadows
        style={{ width: '100%', height: '100%' }}>
        <SceneContents />
      </Canvas>
      <div className="absolute bottom-4 left-4 pointer-events-none
                      text-zinc-600 text-xs font-mono bg-black/40 px-2 py-1 rounded">
        Drag · rotate &nbsp;|&nbsp; Scroll · zoom
      </div>
    </div>
  );
}
