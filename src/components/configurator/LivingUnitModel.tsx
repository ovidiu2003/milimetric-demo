'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useLivingUnitStore } from '@/store/livingUnitStore';
import { getMaterialById } from '@/data/materials';

/**
 * 3D model of the suspended living room unit.
 *
 * Structure (front view, tower on right — non-mirrored):
 *
 *                          ┌────┬──────────┐
 *                          │raft│  dulap   │
 *                          │open│  (door)  │
 *                          │    │          │
 *                          │    │          │
 *  ┌───────────────────────┼────┼──────────┤
 *  │       comoda (suspended, full width)  │
 *  └───────────────────────┴────┴──────────┘
 *              ↕ suspension gap
 *  ════════════════════════════════════════
 *                  FLOOR
 */
export default function LivingUnitModel() {
  const groupRef = useRef<THREE.Group>(null);
  const config = useLivingUnitStore((s) => s.config);

  const bodyMaterial = getMaterialById(config.bodyMaterialId);
  const frontMaterial = getMaterialById(config.frontMaterialId);

  const bodyColor = bodyMaterial?.color || '#c9a96e';
  const frontColor = frontMaterial?.color || '#f5f5f5';

  // Scale: cm → Three.js meters
  const S = 0.01;
  const T = 1.8 * S; // panel thickness (1.8 cm)
  const FRONT_GAP = 0.3 * S; // front panel overhang

  const {
    suspensionHeight, comodaHeight, comodaWidth, comodaColumns,
    raftWidth, dulapWidth,
    totalWidth, totalHeight, depth, mirrored,
  } = config;

  const W  = totalWidth * S;   // overall width
  const CW = comodaWidth * S;  // comoda width
  const H  = totalHeight * S;
  const D  = depth * S;
  const SH = suspensionHeight * S;
  const CH = comodaHeight * S;
  const RW = raftWidth * S;
  const DW = dulapWidth * S;
  const TH = H - SH - CH; // tower height
  const TW = RW + DW;     // tower width

  // X center = 0; items are positioned relative to their own widths
  // comoda centers at 0, tower aligns left or right depending on mirror
  const comodaXL = -CW / 2;
  const comodaXR =  CW / 2;

  // Y positions (floor = 0)
  const comodaBotY = SH;
  const comodaMidY = SH + CH / 2;
  const comodaTopY = SH + CH;
  const towerMidY  = comodaTopY + TH / 2;

  // Tower X positions — aligned at the right edge of comoda (or left if mirrored)
  let towerX1: number, towerX2: number;
  if (mirrored) {
    towerX1 = comodaXL;         // tower left = comoda left
    towerX2 = comodaXL + TW;
  } else {
    towerX2 = comodaXR;         // tower right = comoda right
    towerX1 = comodaXR - TW;
  }

  let rX1: number, rX2: number, dX1: number, dX2: number;
  if (mirrored) {
    dX1 = towerX1;         dX2 = towerX1 + DW;
    rX1 = towerX1 + DW;   rX2 = towerX1 + DW + RW;
  } else {
    rX1 = towerX2 - TW;   rX2 = towerX2 - DW;
    dX1 = towerX2 - DW;   dX2 = towerX2;
  }

  const raftMidX  = (rX1 + rX2) / 2;
  const dulapMidX = (dX1 + dX2) / 2;
  const towerMidX = (towerX1 + towerX2) / 2;
  const towerW    = TW;
  const dividerX  = mirrored ? dX2 : rX2; // boundary between raft & dulap

  // ──── Comoda compartments ────
  const numCompartments = comodaColumns;
  const innerW     = CW - 2 * T;
  const compW      = (innerW - (numCompartments - 1) * T) / numCompartments;
  const frontH     = CH - 2 * T - 0.004;
  const frontW     = compW - 0.004;

  // ──── Raft cubes ────
  const numCubes = useMemo(
    () => Math.max(2, Math.min(12, Math.round((totalHeight - suspensionHeight - comodaHeight) / raftWidth))),
    [totalHeight, suspensionHeight, comodaHeight, raftWidth],
  );
  const raftInner = RW - 2 * T;
  const cubeH     = (TH - (numCubes + 1) * T) / numCubes;

  // Handle position for dulap door
  const handleSide = mirrored ? 1 : -1; // handle near raft side

  return (
    <group ref={groupRef}>
      {/* ══════════════════════════════════════════════════
          COMODA (full-width suspended cabinet)
         ══════════════════════════════════════════════════ */}

      {/* Bottom panel */}
      <mesh position={[0, comodaBotY + T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[CW, T, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.35} />
      </mesh>

      {/* Top panel */}
      <mesh position={[0, comodaTopY - T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[CW, T, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.35} />
      </mesh>

      {/* Left side */}
      <mesh position={[comodaXL + T / 2, comodaMidY, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, CH, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.35} />
      </mesh>

      {/* Right side */}
      <mesh position={[comodaXR - T / 2, comodaMidY, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, CH, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.35} />
      </mesh>

      {/* Back panel */}
      <mesh position={[0, comodaMidY, -D / 2 + T / 4]} castShadow receiveShadow>
        <boxGeometry args={[CW, CH, T / 2]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>

      {/* Internal dividers */}
      {Array.from({ length: numCompartments - 1 }, (_, i) => {
        const x = comodaXL + T + (i + 1) * compW + i * T + T / 2;
        return (
          <mesh key={`cdiv-${i}`} position={[x, comodaMidY, 0]} castShadow>
            <boxGeometry args={[T, CH - 2 * T, D - T / 2]} />
            <meshStandardMaterial color={bodyColor} roughness={0.35} />
          </mesh>
        );
      })}

      {/* Drawer fronts */}
      {Array.from({ length: numCompartments }, (_, i) => {
        const x = comodaXL + T + i * (compW + T) + compW / 2;
        return (
          <group key={`cf-${i}`} position={[x, comodaMidY, D / 2 + FRONT_GAP]}>
            {/* Panel */}
            <mesh castShadow>
              <boxGeometry args={[frontW, frontH, T / 2]} />
              <meshStandardMaterial color={bodyColor} roughness={0.25} />
            </mesh>
            {/* Handle bar */}
            <mesh position={[0, 0, T / 3]}>
              <boxGeometry args={[frontW * 0.28, 0.005, 0.009]} />
              <meshStandardMaterial color="#999" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>
        );
      })}

      {/* ══════════════════════════════════════════════════
          TOWER — outer shell
         ══════════════════════════════════════════════════ */}

      {/* Left tower panel */}
      <mesh position={[towerX1 + T / 2, towerMidY, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, TH, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.35} />
      </mesh>

      {/* Right tower panel */}
      <mesh position={[towerX2 - T / 2, towerMidY, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, TH, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.35} />
      </mesh>

      {/* Top tower panel */}
      <mesh position={[towerMidX, H - T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[towerW, T, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.35} />
      </mesh>

      {/* Tower back panel */}
      <mesh position={[towerMidX, towerMidY, -D / 2 + T / 4]} castShadow receiveShadow>
        <boxGeometry args={[towerW, TH, T / 2]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>

      {/* ══════════════════════════════════════════════════
          TOWER — raft / dulap vertical divider
         ══════════════════════════════════════════════════ */}
      <mesh position={[dividerX, towerMidY, 0]} castShadow>
        <boxGeometry args={[T, TH - 2 * T, D - T / 2]} />
        <meshStandardMaterial color={bodyColor} roughness={0.35} />
      </mesh>

      {/* ══════════════════════════════════════════════════
          RAFT DESCHIS — horizontal shelves (open cubes)
         ══════════════════════════════════════════════════ */}
      {Array.from({ length: numCubes - 1 }, (_, i) => {
        const y = comodaTopY + T + (i + 1) * (cubeH + T) - T / 2;
        return (
          <mesh key={`rs-${i}`} position={[raftMidX, y, 0]} castShadow>
            <boxGeometry args={[raftInner, T, D - T]} />
            <meshStandardMaterial color={bodyColor} roughness={0.35} />
          </mesh>
        );
      })}

      {/* ══════════════════════════════════════════════════
          DULAP — front door
         ══════════════════════════════════════════════════ */}
      <group position={[dulapMidX, towerMidY, D / 2 + FRONT_GAP]}>
        {/* Door panel */}
        <mesh castShadow>
          <boxGeometry args={[DW - 2 * T - 0.004, TH - 2 * T - 0.004, T / 2]} />
          <meshStandardMaterial color={frontColor} roughness={0.2} />
        </mesh>
        {/* Vertical door handle — positioned near the raft side */}
        <mesh position={[handleSide * (DW / 2 - T - 0.04), 0, T / 3]}>
          <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
          <meshStandardMaterial color="#999" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* ══════════════════════════════════════════════════
          WALL MOUNT BRACKETS (visual indicators)
         ══════════════════════════════════════════════════ */}
      {[comodaXL + CW * 0.15, 0, comodaXR - CW * 0.15].map((x, i) => (
        <mesh key={`wb-${i}`} position={[x, comodaMidY, -D / 2 - 0.01]}>
          <boxGeometry args={[0.06, 0.02, 0.02]} />
          <meshStandardMaterial color="#777" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Tower top bracket */}
      <mesh position={[towerMidX, towerMidY + TH * 0.3, -D / 2 - 0.01]}>
        <boxGeometry args={[0.06, 0.02, 0.02]} />
        <meshStandardMaterial color="#777" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ══════════════════════════════════════════════════
          FLOOR REFERENCE PLANE (subtle)
         ══════════════════════════════════════════════════ */}
      <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[Math.max(CW, TW) + 0.5, D + 0.5]} />
        <meshStandardMaterial color="#e8e4de" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
