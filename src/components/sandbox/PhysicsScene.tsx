"use client";

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { OrbitControls, Environment } from "@react-three/drei";
import { useGeometryStore } from "@/store/useGeometryStore";
import { Floor } from "./Floor";
import { SpawnShape } from "./SpawnShape";
import { CameraRig } from "./CameraRig";
import { CubeUnfold } from "./CubeUnfold";

export function PhysicsScene() {
  const spawnedShapes = useGeometryStore(s => s.spawnedShapes);
  const [projection, setProjection] = useState<'perspective' | 'orthographic'>('perspective');
  const [matrix, setMatrix] = useState<number[] | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);

  const handleMatrixUpdate = useCallback((m: number[]) => setMatrix(m), []);

  const matrixRows = matrix
    ? [[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15]].map(indices =>
        indices.map(i => matrix[i].toFixed(3))
      )
    : null;

  return (
    <div className="absolute inset-0">
      <Canvas shadows style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#050505"]} />

        <CameraRig projection={projection} onMatrixUpdate={handleMatrixUpdate} />

        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[10, 20, 10]}
          intensity={1.5}
          shadow-mapSize={[1024, 1024]}
        />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Floor />
            {spawnedShapes.map((shape) => (
              <SpawnShape
                key={shape.id}
                id={shape.id}
                type={shape.type}
                spawnPos={shape.spawnPos}
              />
            ))}
          </Physics>

          {/* Cube net-unfolding demo — no physics, floats in scene */}
          <CubeUnfold />
        </Suspense>

        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={2}
          maxDistance={40}
        />
      </Canvas>

      {/* Projection toggle controls */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button
          onClick={() => setShowMatrix(v => !v)}
          title="Toggle projection matrix"
          className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
            showMatrix
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              : 'bg-black/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          [M]
        </button>
        {(['perspective', 'orthographic'] as const).map(p => (
          <button
            key={p}
            onClick={() => setProjection(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              projection === p
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-black/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {p === 'perspective' ? 'PERSP' : 'ORTHO'}
          </button>
        ))}
      </div>

      {/* Projection matrix overlay */}
      {showMatrix && matrixRows && (
        <div className="absolute top-14 right-3 z-10 bg-black/80 border border-zinc-700 rounded-xl p-4 font-mono text-xs text-zinc-300 backdrop-blur-sm">
          <p className="text-[10px] text-emerald-400 uppercase tracking-wider mb-2">
            {projection} projection matrix
          </p>
          <table className="border-collapse">
            <tbody>
              {matrixRows.map((row, r) => (
                <tr key={r}>
                  {row.map((val, c) => (
                    <td
                      key={c}
                      className={`px-2 py-0.5 text-right ${
                        parseFloat(val) === 0 ? 'text-zinc-600' : 'text-zinc-200'
                      }`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Camera hint */}
      <div className="absolute bottom-4 left-4 pointer-events-none text-zinc-600 text-xs font-mono bg-black/40 px-2 py-1 rounded">
        Drag · rotate &nbsp;|&nbsp; Scroll · zoom
      </div>
    </div>
  );
}
