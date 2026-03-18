'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useLivingUnitStore } from '@/store/livingUnitStore';
import { getMaterialById } from '@/data/materials';
import { useTextures } from '@/hooks/useTextures';
import { useTextureStore } from '@/hooks/useTextures';

function HoverAnimatedFront({
  children,
  mode,
  panelWidth,
  hingeSide = -1,
  hingePosition,
}: {
  children: React.ReactNode;
  mode: 'drawer' | 'door';
  panelWidth: number;
  hingeSide?: -1 | 1;
  /** World-space position of the hinge axis (door mode only). */
  hingePosition?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const animatedRef = useRef<THREE.Group>(null);
  const contentRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    const animated = animatedRef.current;
    if (!animated) return;

    const target = hovered ? 1 : 0;
    const speed = 5;
    progressRef.current += (target - progressRef.current) * speed * delta;
    const p = Math.max(0, Math.min(1, progressRef.current));

    animated.position.set(0, 0, 0);
    animated.rotation.set(0, 0, 0);

    if (mode === 'drawer') {
      // Drawer front slides outward.
      const content = contentRef.current;
      if (content) content.position.set(0, 0, 0);
      animated.position.z = p * panelWidth * 0.35;
      return;
    }

    // Door: the outer group (groupRef) sits exactly at the hinge axis.
    // Rotating animatedRef around Y pivots the door around that edge — like a real hinge.
    // hingeSide = -1 → left hinge, door swings CCW (rotation.y negative → +Z)
    // hingeSide =  1 → right hinge, door swings CW (rotation.y positive → +Z)
    const angle = p * (Math.PI / 2);
    animated.rotation.y = hingeSide * angle;
  });

  // ── Door mode: outer group is placed AT the hinge edge in world space. ──────
  if (mode === 'door') {
    return (
      <group
        ref={groupRef}
        position={hingePosition}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <group ref={animatedRef}>
          {/* Shift door so its hinge edge aligns with this group's origin */}
          <group position={[-hingeSide * (panelWidth / 2), 0, 0]}>
            {children}
          </group>
        </group>
      </group>
    );
  }

  // ── Drawer mode (unchanged) ───────────────────────────────────────────────
  return (
    <group
      ref={groupRef}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <group ref={animatedRef}>
        <group ref={contentRef}>{children}</group>
      </group>
    </group>
  );
}

function cloneTextureWithRotation(
  source: THREE.Texture | null,
  rotation: number
): THREE.Texture | null {
  if (!source) return null;

  const texture = source.clone();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.center.set(0.5, 0.5);
  texture.rotation = rotation;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;

  return texture;
}

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
  useTextures(); // trigger texture loading
  const textureVersion = useTextureStore((s) => s.version); // re-render when textures load

  const bodyMaterial = getMaterialById(config.bodyMaterialId);
  const frontMaterial = getMaterialById(config.frontMaterialId);

  const bodyColor = bodyMaterial?.color || '#c9a96e';
  const frontColor = frontMaterial?.color || '#f5f5f5';
  const bodyTexture = useMemo(() => {
    if (!bodyMaterial?.textureUrl) return null;
    const texture = new THREE.TextureLoader().load(bodyMaterial.textureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.repeat.set(1, 1);
    return texture;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyMaterial?.textureUrl, textureVersion]);
  const frontTexture = useMemo(() => {
    if (!frontMaterial?.textureUrl) return null;
    const texture = new THREE.TextureLoader().load(frontMaterial.textureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.repeat.set(1, 1);
    return texture;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontMaterial?.textureUrl, textureVersion]);
  const horizontalBodyTexture = useMemo(
    () => cloneTextureWithRotation(bodyTexture, Math.PI / 2),
    [bodyTexture]
  );
  const verticalBodyTexture = useMemo(
    () => cloneTextureWithRotation(bodyTexture, 0),
    [bodyTexture]
  );
  const unifiedFrontTexture = frontTexture || bodyTexture;
  const horizontalFrontTexture = useMemo(
    () => cloneTextureWithRotation(unifiedFrontTexture, Math.PI / 2),
    [unifiedFrontTexture]
  );
  const verticalFrontTexture = useMemo(
    () => cloneTextureWithRotation(unifiedFrontTexture, 0),
    [unifiedFrontTexture]
  );
  const unifiedBodyColor = bodyTexture ? '#ffffff' : bodyColor;
  const unifiedFrontColor = frontTexture ? '#ffffff' : unifiedBodyColor;

  // Scale: cm → Three.js meters
  const S = 0.01;
  const T = 1.8 * S; // panel thickness (1.8 cm)
  const FRONT_GAP = 0; // fronts flush with body
  const FRONT_JOINT_GAP = 2.0 * S; // small reveal between adjacent fronts
  const TOP_FRONT_OVERHANG = 1.0 * S; // top panel extends forward to cover front edge

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
  const TW = RW + DW;     // tower width

  // X center = 0; items are positioned relative to their own widths
  // comoda centers at 0, tower aligns left or right depending on mirror
  const comodaXL = -CW / 2;
  const comodaXR =  CW / 2;

  // Y positions (floor = 0)
  const comodaBotY = SH;
  const comodaMidY = SH + CH / 2;
  const comodaTopY = SH + CH;
  const towerBaseY = comodaTopY + T; // tower sits on top of the countertop
  const TH = H - SH - CH - T;       // tower height (above the blat)
  const towerMidY  = towerBaseY + TH / 2;

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
  const raftInnerSideX = mirrored ? rX1 + T / 2 : rX2 - T / 2;
  const dulapInnerSideX = mirrored ? dX2 - T / 2 : dX1 + T / 2;
  const openRaftLeftInnerX = rX1 + T;
  const openRaftRightInnerX = rX2 - T;
  const openRaftMidX = (openRaftLeftInnerX + openRaftRightInnerX) / 2;
  const openRaftShelfW = openRaftRightInnerX - openRaftLeftInnerX;

  // ──── Comoda compartments ────
  const numCompartments = comodaColumns;
  const moduleW    = CW / numCompartments;
  const moduleInnerW = moduleW - 2 * T;
  // Keep the top panel visible above fronts: fronts sit below the top plate.
  const frontH     = CH - T; // leave gap for countertop to avoid z-fighting
  const frontW     = moduleW - FRONT_JOINT_GAP;
  const comodaBackH = CH - 2 * T;
  const raftTopW = RW;
  const dulapTopW = DW;
  const raftBackW = RW - 2 * T;
  const dulapBackW = DW - 2 * T;
  const towerBackH = TH - T;

  // ──── Raft cubes / shelves ────
  const numShelves = Math.max(0, config.openShelfCount);
  const numCubes = numShelves + 1;
  const cubeH     = (TH - (numCubes + 1) * T) / numCubes;

  return (
    <group ref={groupRef}>
      {/* ══════════════════════════════════════════════════
          COMODA (full-width suspended cabinet)
         ══════════════════════════════════════════════════ */}

      {/* Common countertop above all horizontal modules */}
      <mesh position={[0, comodaTopY + T / 2, TOP_FRONT_OVERHANG / 2]} castShadow receiveShadow>
        <boxGeometry args={[CW, T, D + TOP_FRONT_OVERHANG]} />
        <meshStandardMaterial color={unifiedBodyColor} map={horizontalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Segmented comoda modules (each with individual side panels) */}
      {Array.from({ length: numCompartments }, (_, i) => {
        const mx = comodaXL + moduleW * i + moduleW / 2;
        return (
          <group key={`cm-${i}`}>
            <mesh position={[mx, comodaBotY + T / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[moduleInnerW, T, D]} />
              <meshStandardMaterial color={unifiedBodyColor} map={horizontalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
              <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
            </mesh>
            <mesh position={[mx, comodaTopY - T / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[moduleInnerW, T, D]} />
              <meshStandardMaterial color={unifiedBodyColor} map={horizontalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
              <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
            </mesh>
            <mesh position={[mx - moduleW / 2 + T / 2, comodaMidY, 0]} castShadow receiveShadow>
              <boxGeometry args={[T, CH, D]} />
              <meshStandardMaterial color={unifiedBodyColor} map={verticalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
              <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
            </mesh>
            <mesh position={[mx + moduleW / 2 - T / 2, comodaMidY, 0]} castShadow receiveShadow>
              <boxGeometry args={[T, CH, D]} />
              <meshStandardMaterial color={unifiedBodyColor} map={verticalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
              <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
            </mesh>
            <mesh position={[mx, comodaMidY, -D / 2 + T / 4]} castShadow receiveShadow>
              <boxGeometry args={[moduleInnerW, comodaBackH, T / 2]} />
              <meshStandardMaterial color={unifiedBodyColor} map={verticalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
            </mesh>
          </group>
        );
      })}

      {/* Drawer fronts */}
      {Array.from({ length: numCompartments }, (_, i) => {
        const x = comodaXL + moduleW * i + moduleW / 2;
        return (
          <HoverAnimatedFront key={`cf-${i}`} mode="drawer" panelWidth={frontW}>
            <group position={[x, comodaMidY - T / 2, D / 2 + TOP_FRONT_OVERHANG - T / 2]}>
              {/* Panel */}
              <mesh castShadow>
                <boxGeometry args={[frontW, frontH, T]} />
                <meshStandardMaterial
                  color={unifiedFrontColor}
                  map={horizontalFrontTexture || undefined}
                  roughness={0.62} metalness={0.02} envMapIntensity={0.06}
                />
                <Edges threshold={15} color="#2a2218" lineWidth={1} />
              </mesh>
            </group>
          </HoverAnimatedFront>
        );
      })}

      {/* ══════════════════════════════════════════════════
          TOWER — outer shell
         ══════════════════════════════════════════════════ */}

      {/* Left tower panel */}
      <mesh position={[towerX1 + T / 2, towerMidY, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, TH, D]} />
        <meshStandardMaterial color={unifiedBodyColor} map={verticalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Right tower panel */}
      <mesh position={[towerX2 - T / 2, towerMidY, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, TH, D]} />
        <meshStandardMaterial color={unifiedBodyColor} map={verticalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Top panel - open shelf module */}
      <mesh position={[raftMidX, H - T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[raftTopW, T, D]} />
        <meshStandardMaterial color={unifiedBodyColor} map={horizontalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Bottom panel - open shelf module */}
      <mesh position={[raftMidX, towerBaseY + T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[raftBackW, T, D]} />
        <meshStandardMaterial color={unifiedBodyColor} map={horizontalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Top panel - closed cabinet module */}
      <mesh position={[dulapMidX, H - T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[dulapTopW, T, D]} />
        <meshStandardMaterial color={unifiedBodyColor} map={horizontalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Bottom panel - closed cabinet module */}
      <mesh position={[dulapMidX, towerBaseY + T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[dulapBackW, T, D]} />
        <meshStandardMaterial color={unifiedBodyColor} map={horizontalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Back panel - open shelf module */}
      <mesh position={[raftMidX, towerMidY - T / 2, -D / 2 + T / 4]} castShadow receiveShadow>
        <boxGeometry args={[raftBackW, towerBackH, T / 2]} />
        <meshStandardMaterial color={unifiedBodyColor} map={verticalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Back panel - closed cabinet module */}
      <mesh position={[dulapMidX, towerMidY - T / 2, -D / 2 + T / 4]} castShadow receiveShadow>
        <boxGeometry args={[dulapBackW, towerBackH, T / 2]} />
        <meshStandardMaterial color={unifiedBodyColor} map={verticalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Inner side - open shelf module */}
      <mesh position={[raftInnerSideX, towerMidY - T / 2, 0]} castShadow>
        <boxGeometry args={[T, TH - T, D - T / 2]} />
        <meshStandardMaterial color={unifiedBodyColor} map={verticalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Inner side - closed cabinet module */}
      <mesh position={[dulapInnerSideX, towerMidY - T / 2, 0]} castShadow>
        <boxGeometry args={[T, TH - T, D - T / 2]} />
        <meshStandardMaterial color={unifiedBodyColor} map={verticalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* ══════════════════════════════════════════════════
          RAFT DESCHIS — horizontal shelves (open cubes)
         ══════════════════════════════════════════════════ */}
      {Array.from({ length: numShelves }, (_, i) => {
        const y = towerBaseY + T + (i + 1) * (cubeH + T) - T / 2;
        return (
          <mesh key={`rs-${i}`} position={[openRaftMidX, y, 0]} castShadow>
            <boxGeometry args={[openRaftShelfW, T, D - T]} />
            <meshStandardMaterial color={unifiedBodyColor} map={horizontalBodyTexture || undefined} roughness={0.62} metalness={0.02} envMapIntensity={0.06} />
            <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
          </mesh>
        );
      })}

      {/* ══════════════════════════════════════════════════
          DULAP — front door (hinged)
         ══════════════════════════════════════════════════
         hingePosition places the outer group at the physical hinge edge
         so that Y-axis rotation produces a realistic balama effect.
         non-mirrored: hinge on left outer edge (dX1)
         mirrored:     hinge on right outer edge (dX2)           */}
      <HoverAnimatedFront
        mode="door"
        panelWidth={DW}
        hingeSide={mirrored ? 1 : -1}
        hingePosition={[mirrored ? dX2 : dX1, towerMidY, D / 2 + TOP_FRONT_OVERHANG - T / 2]}
      >
        {/* Door panel — covers full tower height including bottom */}
        <mesh castShadow>
          <boxGeometry args={[DW - FRONT_JOINT_GAP, TH, T]} />
          <meshStandardMaterial
            color={unifiedFrontColor}
            map={verticalFrontTexture || undefined}
            roughness={0.62} metalness={0.02} envMapIntensity={0.06}
          />
          <Edges threshold={15} color="#2a2218" lineWidth={1} />
        </mesh>
      </HoverAnimatedFront>

      {/* ══════════════════════════════════════════════════
          WALL MOUNT BRACKETS (visual indicators)
         ══════════════════════════════════════════════════ */}
      {[comodaXL + CW * 0.15, 0, comodaXR - CW * 0.15].map((x, i) => (
        <mesh key={`wb-${i}`} position={[x, comodaMidY, -D / 2 - 0.01]} castShadow>
          <boxGeometry args={[0.06, 0.02, 0.02]} />
          <meshStandardMaterial color="#777" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Tower top bracket */}
      <mesh position={[towerMidX, towerMidY + TH * 0.3, -D / 2 - 0.01]} castShadow>
        <boxGeometry args={[0.06, 0.02, 0.02]} />
        <meshStandardMaterial color="#777" metalness={0.8} roughness={0.2} />
      </mesh>

    </group>
  );
}
