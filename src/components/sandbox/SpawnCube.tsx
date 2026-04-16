"use client";

import { RigidBody } from "@react-three/rapier";
import { Box } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

interface SpawnCubeProps {
  position: [number, number, number];
}

export function SpawnCube({ position }: SpawnCubeProps) {
  // Generate a random pleasant color for each cube
  const color = useMemo(() => {
    const hue = Math.random();
    const sat = 0.5 + Math.random() * 0.5;
    const light = 0.4 + Math.random() * 0.4;
    return new THREE.Color().setHSL(hue, sat, light);
  }, []);

  return (
    <RigidBody position={position} colliders="cuboid" restitution={0.6} mass={1}>
      <Box args={[1, 1, 1]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </Box>
    </RigidBody>
  );
}
