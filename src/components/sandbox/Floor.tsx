"use client";

import { RigidBody } from "@react-three/rapier";
import { Grid } from "@react-three/drei";

export function Floor() {
  return (
    <RigidBody type="fixed" friction={2}>
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[100, 1, 100]} />
        <meshStandardMaterial color="#18181b" />
      </mesh>
      
      {/* Visual grid overlay on the floor */}
      <Grid 
        position={[0, 0.01, 0]} 
        args={[100, 100]} 
        cellSize={1} 
        cellThickness={1} 
        cellColor="#27272a" 
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor="#3f3f46" 
        fadeDistance={30} 
        fadeStrength={1} 
        infiniteGrid 
      />
    </RigidBody>
  );
}
