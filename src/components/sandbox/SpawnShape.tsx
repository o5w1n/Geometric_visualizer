"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { ShapeType, SHAPE_DEFINITIONS, GeoDescriptor } from "@/lib/shapeDefinitions";
import { usePhysicsPositionStore } from "@/store/usePhysicsPositionStore";

interface SpawnShapeProps {
  id: string;
  type: ShapeType;
  spawnPos: [number, number, number];
}

// Build a Three.js BufferGeometry from the descriptor
function buildGeometry(geo: GeoDescriptor): THREE.BufferGeometry {
  switch (geo.kind) {
    case 'box':
      return new THREE.BoxGeometry(...geo.args);
    case 'sphere':
      return new THREE.SphereGeometry(...geo.args);
    case 'cone':
      return new THREE.ConeGeometry(...geo.args);
    case 'cylinder':
      return new THREE.CylinderGeometry(...geo.args);
  }
}

export function SpawnShape({ id, type, spawnPos }: SpawnShapeProps) {
  const def = SHAPE_DEFINITIONS[type];
  const rigidRef = useRef<RapierRigidBody>(null);
  const updatePosition = usePhysicsPositionStore(s => s.updatePosition);
  const removePosition = usePhysicsPositionStore(s => s.removePosition);

  // Report live position every frame
  useFrame(() => {
    if (!rigidRef.current) return;
    const t = rigidRef.current.translation();
    updatePosition(id, [
      Math.round(t.x * 100) / 100,
      Math.round(t.y * 100) / 100,
      Math.round(t.z * 100) / 100,
    ]);
  });

  // Clean up position entry when unmounted
  useEffect(() => {
    return () => removePosition(id);
  }, [id, removePosition]);

  const geometry = buildGeometry(def.geo);
  const color = new THREE.Color(def.color);

  return (
    <RigidBody
      ref={rigidRef}
      position={spawnPos}
      colliders={def.collider}
      restitution={0.55}
      friction={0.7}
      mass={1}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
      </mesh>
    </RigidBody>
  );
}
