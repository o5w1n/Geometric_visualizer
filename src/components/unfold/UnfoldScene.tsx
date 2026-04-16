"use client";

/**
 * UnfoldScene
 * -----------
 * Full-screen R3F canvas showing the selected shape unfolding.
 * No physics — pure geometry animation.
 *
 * Each face mesh animates between its assembled-3D position/orientation
 * and its flat net position using position lerp + quaternion slerp driven
 * by unfoldProgress from the Zustand store (read via getState() inside
 * useFrame so changes don't cause React re-renders).
 *
 * An "assembled ghost" (transparent solid) fades out over the first
 * 20% of progress so the user can see the actual 3D shape at rest.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useGeometryStore } from "@/store/useGeometryStore";
import {
  SHAPE_NETS,
  faceProg,
  type ShapeFace,
  type AssembledGeo,
  type UnfoldShapeId,
} from "@/lib/shapeNets";

// ── Geometry factory ─────────────────────────────────────────────────────────

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const NET_QUAT = new THREE.Quaternion(); // identity — all net faces face +Z

function makeFaceGeometry(face: ShapeFace): THREE.BufferGeometry {
  const g = face.geo;
  if (g.kind === 'plane') return new THREE.PlaneGeometry(g.w, g.h);
  if (g.kind === 'circle') return new THREE.CircleGeometry(g.r, 48);
  if (g.kind === 'sector') {
    // Apex at origin, opens downward (–Y direction)
    const shape = new THREE.Shape();
    const half = g.angle / 2;
    shape.moveTo(0, 0);
    // arc in XY plane: from -half to +half around –Y
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const θ = -half + (g.angle * i) / steps - Math.PI / 2;
      shape.lineTo(Math.cos(θ) * g.r, Math.sin(θ) * g.r);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }
  if (g.kind === 'tri-equilateral') {
    const s = g.side;
    const h = (Math.sqrt(3) / 2) * s;
    const cy = h / 3; // centroid offset from base
    const shape = new THREE.Shape();
    shape.moveTo(-s / 2, -cy);
    shape.lineTo(s / 2, -cy);
    shape.lineTo(0, h - cy);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }
  if (g.kind === 'tri-isoceles') {
    const { base, h } = g;
    // centroid at h/3 from base
    const cy = h / 3;
    const shape = new THREE.Shape();
    shape.moveTo(-base / 2, -cy);
    shape.lineTo(base / 2, -cy);
    shape.lineTo(0, h - cy);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }
  return new THREE.PlaneGeometry(1, 1);
}

// ── Individual face mesh ─────────────────────────────────────────────────────

function FaceMesh({ face, shapeId }: { face: ShapeFace; shapeId: UnfoldShapeId }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const geo = useMemo(() => makeFaceGeometry(face), [face]);

  const asmPos = useMemo(
    () => new THREE.Vector3(...face.asmPos),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [face.id, shapeId],
  );
  const netPos = useMemo(
    () => new THREE.Vector3(...face.netPos),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [face.id, shapeId],
  );
  const asmQuat = useMemo(() => {
    const normal = new THREE.Vector3(...face.asmNormal).normalize();
    // If the normal is anti-parallel to Z_AXIS we need a fallback axis
    if (normal.dot(Z_AXIS) < -0.9999) {
      return new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), Math.PI,
      );
    }
    return new THREE.Quaternion().setFromUnitVectors(Z_AXIS, normal);
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [face.id, shapeId]);

  useFrame(() => {
    if (!meshRef.current) return;
    const global = useGeometryStore.getState().unfoldProgress;
    const t = faceProg(global, face);

    meshRef.current.position.lerpVectors(asmPos, netPos, t);
    meshRef.current.quaternion.slerpQuaternions(asmQuat, NET_QUAT, t);
    // Face meshes fade in over the first 20% of global progress
    const faceAlpha = Math.min(1, global * 6);
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = faceAlpha * 0.92;
  });

  // Initial synchronous position before first frame
  const initPos = asmPos.clone().lerp(netPos, 0);
  const initQuat = asmQuat.clone();

  return (
    <mesh ref={meshRef} position={initPos} quaternion={initQuat} geometry={geo}>
      <meshStandardMaterial
        color={face.color}
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.05}
        transparent
        opacity={0}
      />
    </mesh>
  );
}

// ── Assembled ghost (solid shape fading out at progress = 0) ─────────────────

function AssembledGhost({ geo }: { geo: AssembledGeo }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lineRef = useRef<THREE.LineSegments>(null!);

  const solidGeo = useMemo<THREE.BufferGeometry>(() => {
    if (geo.kind === 'box')
      return new THREE.BoxGeometry(...geo.args);
    if (geo.kind === 'cylinder')
      return new THREE.CylinderGeometry(geo.rTop, geo.rBot, geo.h, geo.seg);
    if (geo.kind === 'cone')
      return new THREE.ConeGeometry(geo.r, geo.h, geo.seg);
    if (geo.kind === 'tri-prism') {
      // CylinderGeometry with 3 segments = triangular prism
      return new THREE.CylinderGeometry(
        geo.side / Math.sqrt(3),
        geo.side / Math.sqrt(3),
        geo.depth, 3,
      );
    }
    if (geo.kind === 'sq-pyramid') {
      // ConeGeometry with 4 segments = square pyramid
      return new THREE.ConeGeometry(
        (geo.base / 2) * Math.sqrt(2),
        geo.h, 4,
      );
    }
    return new THREE.BoxGeometry(1, 1, 1);
  }, [geo]);

  const edgesGeo = useMemo(
    () => new THREE.EdgesGeometry(solidGeo),
    [solidGeo],
  );

  useFrame(() => {
    const p = useGeometryStore.getState().unfoldProgress;
    const alpha = Math.max(0, 1 - p * 6);
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = alpha * 0.18;
    }
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = alpha * 0.55;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={solidGeo}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.18}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments ref={lineRef} geometry={edgesGeo}>
        <lineBasicMaterial color="#aaaaaa" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

// ── Grid floor ───────────────────────────────────────────────────────────────

function GridPlane() {
  return (
    <gridHelper
      args={[20, 20, "#1f2937", "#111827"]}
      position={[0, -2, 0]}
    />
  );
}

// ── Scene inner (lives inside Canvas) ────────────────────────────────────────

function SceneContents() {
  // Read initial shape; updates cause full remount via key prop on Canvas consumer
  const shapeId = useGeometryStore(s => s.unfoldShapeId);
  const def = SHAPE_NETS[shapeId as UnfoldShapeId] ?? SHAPE_NETS['cube'];

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 8]} intensity={1.2} castShadow />
      <Environment preset="city" />

      {/* Ghost of assembled shape */}
      <AssembledGhost geo={def.assembledGeo} />

      {/* Animated face meshes */}
      {def.faces.map(face => (
        <FaceMesh key={`${shapeId}-${face.id}`} face={face} shapeId={shapeId as UnfoldShapeId} />
      ))}

      <GridPlane />

      <OrbitControls
        makeDefault
        minDistance={2}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.85}
      />
    </>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export function UnfoldScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [3, 2.5, 4], fov: 50 }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        <SceneContents />
      </Canvas>

      {/* Hint overlay */}
      <div className="absolute bottom-4 left-4 pointer-events-none
                      text-zinc-600 text-xs font-mono bg-black/40
                      px-2 py-1 rounded">
        Drag · rotate &nbsp;|&nbsp; Scroll · zoom
      </div>
    </div>
  );
}
