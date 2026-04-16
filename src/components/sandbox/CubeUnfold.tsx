"use client";

/**
 * CubeUnfold
 * ----------
 * Renders a unit cube as 6 separate PlaneGeometry meshes inside an R3F Canvas.
 * Each face interpolates from its assembled 3-D position/orientation to its
 * flat net position using quaternion SLERP + Vector3 lerp driven by unfoldProgress.
 *
 * Face animation windows are staggered so Top/Bottom/Left/Right open first,
 * then Back unfolds from the right side — mimicking a physical hinge sequence.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGeometryStore } from "@/store/useGeometryStore";
import { CUBE_FACES, faceProg, type CubeFaceDef } from "@/lib/cubeNet";

// Identity quaternion — the target for every face in the net (all face +Z)
const NET_QUAT = new THREE.Quaternion(); // (0, 0, 0, 1)

interface FacePlaneProps {
  face: CubeFaceDef;
  progress: number;
}

function FacePlane({ face, progress }: FacePlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Re-compute transform whenever progress changes via useFrame so it runs
  // inside the render loop, avoiding "update outside canvas" warnings.
  const fp = faceProg(progress, face);

  const asmPos = useMemo(
    () => new THREE.Vector3(...face.asmPos),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [face.id],
  );
  const netPos = useMemo(
    () => new THREE.Vector3(...face.netPos),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [face.id],
  );
  const asmQuatBase = useMemo(
    () =>
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(face.asmEuler[0], face.asmEuler[1], face.asmEuler[2]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [face.id],
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const t = faceProg(
      useGeometryStore.getState().unfoldProgress,
      face,
    );

    // Position lerp
    meshRef.current.position.lerpVectors(asmPos, netPos, t);

    // Quaternion SLERP: assembled → identity (net, all faces +Z)
    meshRef.current.quaternion.slerpQuaternions(asmQuatBase, NET_QUAT, t);
  });

  // Set initial transform synchronously so the mesh renders correctly before
  // the first useFrame tick.
  const initPos = asmPos.clone().lerp(netPos, fp);
  const initQuat = asmQuatBase.clone().slerp(NET_QUAT, fp);

  return (
    <mesh ref={meshRef} position={initPos} quaternion={initQuat}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={face.color}
        side={THREE.DoubleSide}
        roughness={0.35}
        metalness={0.08}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

// ── Edge lines that form the cube wireframe at progress = 0 ──────────────────

function CubeWireframe({ opacity }: { opacity: number }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#ffffff" transparent opacity={opacity * 0.4} />
    </lineSegments>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Drop this inside a Canvas (outside <Physics>).
 * Only visible when selectedShape === 'cube'.
 */
export function CubeUnfold() {
  const { selectedShape, unfoldProgress } = useGeometryStore();

  if (selectedShape !== "cube") return null;

  // Wireframe fades out as unfolding starts
  const wireOpacity = Math.max(0, 1 - unfoldProgress * 4);

  return (
    // Positioned above and to the right to avoid clashing with physics shapes
    <group position={[3.5, 4.5, 0]}>
      {CUBE_FACES.map((face) => (
        <FacePlane key={face.id} face={face} progress={unfoldProgress} />
      ))}
      {wireOpacity > 0 && <CubeWireframe opacity={wireOpacity} />}
    </group>
  );
}
