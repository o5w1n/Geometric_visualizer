"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera, OrthographicCamera } from "@react-three/drei";

interface CameraRigProps {
  projection: 'perspective' | 'orthographic';
  onMatrixUpdate: (matrix: number[]) => void;
}

// Reads the camera projection matrix every frame and forwards it upward.
function MatrixReader({ onMatrixUpdate }: { onMatrixUpdate: (m: number[]) => void }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.updateProjectionMatrix();
    const m = camera.projectionMatrix.toArray();
    onMatrixUpdate(m);
  });
  return null;
}

export function CameraRig({ projection, onMatrixUpdate }: CameraRigProps) {
  return (
    <>
      {projection === 'perspective' ? (
        <PerspectiveCamera makeDefault position={[5, 8, 10]} fov={50} near={0.1} far={200} />
      ) : (
        <OrthographicCamera makeDefault position={[5, 8, 10]} zoom={45} near={0.1} far={200} />
      )}
      <MatrixReader onMatrixUpdate={onMatrixUpdate} />
    </>
  );
}
