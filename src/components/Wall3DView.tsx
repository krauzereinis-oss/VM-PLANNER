import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { WallSection } from "../types/domain";

// Same schematic spacing as the 2D Wall View (WallView.tsx), expressed in
// metres instead of pixels so the 3D rig matches it exactly: lines within a
// cluster sit almost touching, with one real gap sized for a garment row
// between the 2.0 and 1.2 lines, and matching floor clearance below 1.0m.
const HEIGHT_LEVELS = [2.2, 2.1, 2.0, 1.2, 1.1, 1.0] as const;
const TOP_MARGIN_M = 0.11;
const TIGHT_GAP_M = 0.1;
const CLUSTER_GAP_M = 0.77;
const BOTTOM_MARGIN_M = 0.77;

const DEPTH_FROM_TOP: Record<number, number> = (() => {
  const d: Record<number, number> = {};
  let cursor = TOP_MARGIN_M;
  HEIGHT_LEVELS.forEach((height, i) => {
    if (i === 0) {
      d[height] = cursor;
    } else {
      const prev = HEIGHT_LEVELS[i - 1];
      cursor += prev - height > 0.5 ? CLUSTER_GAP_M : TIGHT_GAP_M;
      d[height] = cursor;
    }
  });
  return d;
})();

interface Props {
  section: WallSection;
}

export function Wall3DView({ section }: Props) {
  const widthM = section.endMeter - section.startMeter;
  const totalHeight = DEPTH_FROM_TOP[HEIGHT_LEVELS[HEIGHT_LEVELS.length - 1]] + BOTTOM_MARGIN_M;
  const halfW = widthM / 2;
  const halfH = totalHeight / 2;

  const yForHeight = (height: number) => halfH - DEPTH_FROM_TOP[height];

  return (
    <div className="wall-3d">
      <Canvas camera={{ position: [0, 0, widthM * 0.9 + 1.5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 4]} intensity={0.8} />

          {/* Back panel */}
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[widthM, totalHeight, 0.02]} />
            <meshStandardMaterial color="#0c0d10" />
          </mesh>

          {/* Top / bottom borders */}
          <mesh position={[0, halfH, 0]}>
            <boxGeometry args={[widthM, 0.012, 0.04]} />
            <meshStandardMaterial color="#cfd2db" />
          </mesh>
          <mesh position={[0, -halfH, 0]}>
            <boxGeometry args={[widthM, 0.012, 0.04]} />
            <meshStandardMaterial color="#cfd2db" />
          </mesh>

          {/* Height lines (the 6 metal lines) */}
          {HEIGHT_LEVELS.map((height) => (
            <mesh key={height} position={[0, yForHeight(height), 0]}>
              <boxGeometry args={[widthM, 0.01, 0.03]} />
              <meshStandardMaterial color="#aab0c0" />
            </mesh>
          ))}

          {/* Full-meter uprights */}
          {Array.from({ length: Math.floor(widthM) + 1 }).map((_, i) => (
            <mesh key={`m-${i}`} position={[i - halfW, 0, 0.01]}>
              <boxGeometry args={[0.012, totalHeight, 0.03]} />
              <meshStandardMaterial color="#9a9eac" />
            </mesh>
          ))}

          {/* Half-meter dividers, dimmer */}
          {Array.from({ length: Math.floor(widthM * 2) }).map((_, i) => {
            const meterPos = i * 0.5;
            if (Number.isInteger(meterPos)) return null;
            return (
              <mesh key={`h-${i}`} position={[meterPos - halfW, 0, 0.005]}>
                <boxGeometry args={[0.004, totalHeight, 0.02]} />
                <meshStandardMaterial color="#3a3c46" transparent opacity={0.6} />
              </mesh>
            );
          })}

          <OrbitControls enablePan={false} rotateSpeed={0.4} minDistance={1.5} maxDistance={widthM * 3} />
        </Suspense>
      </Canvas>
    </div>
  );
}
