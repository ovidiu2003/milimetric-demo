'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { getMaterialById } from '@/data/materials';
import { useTextures } from '@/hooks/useTextures';

interface FurnitureModelProps {
  onClick?: (row: number, col: number) => void;
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
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.center.set(0.5, 0.5);
  texture.rotation = rotation;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;

  return texture;
}

/** Animated front wrapper — handles hover-to-open for doors/drawers/flaps */
function AnimatedFront({
  children,
  frontType,
  previewMode,
  compWidth,
  compHeight,
}: {
  children: React.ReactNode;
  frontType: string;
  previewMode: boolean;
  compWidth: number;
  compHeight: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const animProgress = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!previewMode) {
      // Smoothly reset when not in preview mode
      if (animProgress.current > 0.001) {
        animProgress.current = Math.max(0, animProgress.current - delta * 3);
        applyAnimation(groupRef.current, frontType, animProgress.current, compWidth, compHeight);
      }
      return;
    }

    const target = hovered ? 1 : 0;
    const speed = 4;
    const diff = target - animProgress.current;
    if (Math.abs(diff) > 0.001) {
      animProgress.current += diff * speed * delta;
      animProgress.current = Math.max(0, Math.min(1, animProgress.current));
    } else {
      animProgress.current = target;
    }

    applyAnimation(groupRef.current, frontType, animProgress.current, compWidth, compHeight);
  });

  function applyAnimation(
    group: THREE.Group,
    type: string,
    progress: number,
    cw: number,
    ch: number
  ) {
    // Reset
    group.position.set(0, 0, 0);
    group.rotation.set(0, 0, 0);

    if (type === 'usa' || type === 'usa-sticla' || type === 'usa-oglinda') {
      // Door swings open around left edge (hinge side)
      const angle = progress * (Math.PI / 2) * 0.8; // ~72° max
      const pivotOffset = cw / 2;
      group.position.x = -pivotOffset * (1 - Math.cos(angle));
      group.position.z = pivotOffset * Math.sin(angle);
      group.rotation.y = -angle;
    } else if (type === 'sertar') {
      // Drawer slides forward
      const slideDistance = cw * 0.6;
      group.position.z = progress * slideDistance;
    } else if (type === 'clapa') {
      // Flap opens upward around top edge
      const angle = progress * (Math.PI / 3); // 60° max
      const pivotOffset = ch / 2;
      group.position.y = pivotOffset * (1 - Math.cos(angle));
      group.position.z = pivotOffset * Math.sin(angle);
      group.rotation.x = angle;
    }
  }

  return (
    <group
      ref={groupRef}
      onPointerEnter={(e) => {
        if (previewMode) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
    </group>
  );
}

export default function FurnitureModel({ onClick }: FurnitureModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const config = useConfiguratorStore((s) => s.config);
  const selectedCompartment = useConfiguratorStore((s) => s.selectedCompartment);
  const previewMode = useConfiguratorStore((s) => s.previewMode);
  useTextures(); // ensure dynamic materials are loaded & trigger re-render

  const bodyMaterial = getMaterialById(config.bodyMaterialId);
  const frontMaterial = getMaterialById(config.frontMaterialId);

  const bodyColor = bodyMaterial?.color || '#f0f0f0';
  const frontColor = frontMaterial?.color || '#f0f0f0';
  const bodyTexture = useMemo(() => {
    if (!bodyMaterial?.textureUrl) return null;
    const texture = new THREE.TextureLoader().load(bodyMaterial.textureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.repeat.set(1, 1);
    return texture;
  }, [bodyMaterial?.textureUrl]);
  const frontTexture = useMemo(() => {
    if (!frontMaterial?.textureUrl) return null;
    const texture = new THREE.TextureLoader().load(frontMaterial.textureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.repeat.set(1, 1);
    return texture;
  }, [frontMaterial?.textureUrl]);
  const bodyMatColor = bodyTexture ? '#ffffff' : bodyColor;
  const frontMatColor = frontTexture ? '#ffffff' : frontColor;
  const unifiedFrontTexture = frontTexture || bodyTexture;
  const unifiedFrontColor = frontTexture ? '#ffffff' : bodyMatColor;
  const horizontalBodyTexture = useMemo(
    () => cloneTextureWithRotation(bodyTexture, Math.PI / 2),
    [bodyTexture]
  );
  const verticalBodyTexture = useMemo(
    () => cloneTextureWithRotation(bodyTexture, 0),
    [bodyTexture]
  );
  const horizontalFrontTexture = useMemo(
    () => cloneTextureWithRotation(unifiedFrontTexture, Math.PI / 2),
    [unifiedFrontTexture]
  );
  const verticalFrontTexture = useMemo(
    () => cloneTextureWithRotation(unifiedFrontTexture, 0),
    [unifiedFrontTexture]
  );

  const { width, height, depth } = config.dimensions;
  const { columns, rows, columnWidths, rowHeights } = config.compartments;

  // Scale to Three.js units (m)
  const scale = 0.01;
  const w = width * scale;
  const h = height * scale;
  const d = depth * scale;
  const thickness = 1.8 * scale; // 1.8cm panels
  const frontOverhang = 0; // fronts flush with body

  const isTable = config.category === 'mese' || config.category === 'masute-cafea';

  const geometry = useMemo(() => {
    if (isTable) return null;

    const totalColWeight = columnWidths.reduce((a, b) => a + b, 0);
    const usableWidth = w - thickness * (columns + 1);
    const colWidths = columnWidths.map((cw) => (cw / totalColWeight) * usableWidth);

    interface CompartmentData {
      x: number;
      y: number;
      cw: number;
      ch: number;
      col: number;
      row: number;
    }

    const compartmentData: CompartmentData[] = [];
    let xOffset = -w / 2 + thickness;

    for (let col = 0; col < columns; col++) {
      const colW = colWidths[col];
      const colRows = rows[col];
      const rowH = rowHeights[col];
      const totalRowWeight = rowH.reduce((a: number, b: number) => a + b, 0);
      const usableHeight = h - thickness * (colRows + 1);

      let yOffset = -h / 2 + thickness;

      for (let row = colRows - 1; row >= 0; row--) {
        const cellH = (rowH[row] / totalRowWeight) * usableHeight;
        compartmentData.push({
          x: xOffset + colW / 2,
          y: yOffset + cellH / 2,
          cw: colW,
          ch: cellH,
          col,
          row,
        });
        yOffset += cellH + thickness;
      }

      xOffset += colW + thickness;
    }

    return { colWidths, compartmentData };
  }, [w, h, columns, rows, columnWidths, rowHeights, thickness, isTable]);

  if (isTable) {
    return (
      <group ref={groupRef}>
        {/* Table top */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, thickness * 2, d]} />
          <meshStandardMaterial color={bodyMatColor} map={horizontalBodyTexture || undefined} roughness={0.3} />
        </mesh>
        {/* Table legs */}
        {[
          [-w / 2 + 0.04, -0.38, -d / 2 + 0.04],
          [w / 2 - 0.04, -0.38, -d / 2 + 0.04],
          [-w / 2 + 0.04, -0.38, d / 2 - 0.04],
          [w / 2 - 0.04, -0.38, d / 2 - 0.04],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <boxGeometry args={[0.05, 0.76, 0.05]} />
            <meshStandardMaterial color={bodyMatColor} map={verticalBodyTexture || undefined} roughness={0.4} />
          </mesh>
        ))}
      </group>
    );
  }

  if (!geometry) return null;

  // Applied fronts: positioned in front of the cabinet body
  const frontZ = d / 2 + frontOverhang + thickness / 2;

  return (
    <group ref={groupRef}>
      {/* Back panel */}
      {config.backPanel && (
        <mesh position={[0, 0, -d / 2 + thickness / 4]} castShadow receiveShadow>
          <boxGeometry args={[w, h, thickness / 2]} />
          <meshStandardMaterial color={bodyMatColor} map={verticalBodyTexture || undefined} roughness={0.5} />
        </mesh>
      )}

      {/* Top panel */}
      <mesh position={[0, h / 2 - thickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, thickness, d]} />
        <meshStandardMaterial color={bodyMatColor} map={horizontalBodyTexture || undefined} roughness={0.4} />
      </mesh>

      {/* Bottom panel */}
      <mesh position={[0, -h / 2 + thickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, thickness, d]} />
        <meshStandardMaterial color={bodyMatColor} map={horizontalBodyTexture || undefined} roughness={0.4} />
      </mesh>

      {/* Left side panel */}
      <mesh position={[-w / 2 + thickness / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, h, d]} />
        <meshStandardMaterial color={bodyMatColor} map={verticalBodyTexture || bodyTexture || undefined} roughness={0.4} />
      </mesh>

      {/* Right side panel */}
      <mesh position={[w / 2 - thickness / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, h, d]} />
        <meshStandardMaterial color={bodyMatColor} map={verticalBodyTexture || bodyTexture || undefined} roughness={0.4} />
      </mesh>

      {/* Vertical dividers */}
      {(() => {
        const dividers: React.ReactNode[] = [];
        let xPos = -w / 2 + thickness;
        for (let i = 0; i < columns - 1; i++) {
          xPos += geometry.colWidths[i];
          dividers.push(
            <mesh key={`vdiv-${i}`} position={[xPos + thickness / 2, 0, 0]} castShadow>
              <boxGeometry args={[thickness, h - thickness * 2, d]} />
              <meshStandardMaterial color={bodyMatColor} map={verticalBodyTexture || undefined} roughness={0.4} />
            </mesh>
          );
          xPos += thickness;
        }
        return dividers;
      })()}

      {/* Horizontal shelves */}
      {(() => {
        const shelves: React.ReactNode[] = [];
        let xOffset = -w / 2 + thickness;
        for (let col = 0; col < columns; col++) {
          const colW = geometry.colWidths[col];
          const colRows = rows[col];
          const rowH = rowHeights[col];
          const totalRowWeight = rowH.reduce((a: number, b: number) => a + b, 0);
          const usableHeight = h - thickness * (colRows + 1);
          let yOffset = -h / 2 + thickness;

          for (let row = colRows - 1; row >= 0; row--) {
            const cellH = (rowH[row] / totalRowWeight) * usableHeight;
            yOffset += cellH;
            if (row > 0) {
              shelves.push(
                <mesh
                  key={`hshelf-${col}-${row}`}
                  position={[xOffset + colW / 2, yOffset + thickness / 2, 0]}
                  castShadow
                >
                  <boxGeometry args={[colW, thickness, d - thickness / 2]} />
                  <meshStandardMaterial color={bodyMatColor} map={horizontalBodyTexture || undefined} roughness={0.4} />
                </mesh>
              );
            }
            yOffset += thickness;
          }
          xOffset += colW + thickness;
        }
        return shelves;
      })()}

      {/* ======= APPLIED FRONTS (doors / drawers / flaps) ======= */}
      {config.fronts.map((front) => {
        const comp = geometry.compartmentData.find(
          (c) => c.col === front.col && c.row === front.row
        );
        if (!comp) return null;

        const isSelected =
          selectedCompartment?.row === front.row && selectedCompartment?.col === front.col;
        const color = isSelected ? '#4a9eff' : frontColor;

        // Full-overlay fronts: each front covers half of surrounding panel thickness
        // so fronts are visually applied, not inset in the opening.
        const reveal = 0.002; // 2mm reveal between adjacent fronts
        const appliedW = comp.cw + thickness - reveal;
        const appliedH = comp.ch + thickness - reveal;

        if (front.frontType === 'sertar') {
          return (
            <AnimatedFront
              key={`front-${front.col}-${front.row}`}
              frontType="sertar"
              previewMode={previewMode}
              compWidth={comp.cw}
              compHeight={comp.ch}
            >
              <group position={[comp.x, comp.y, frontZ]}>
                {/* Drawer front panel */}
                <mesh
                  castShadow
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.(front.row, front.col);
                  }}
                >
                  <boxGeometry args={[appliedW, appliedH, thickness]} />
                  <meshStandardMaterial
                    color={color}
                    map={isSelected ? undefined : (horizontalFrontTexture || undefined)}
                    roughness={0.62}
                    metalness={0.02}
                    envMapIntensity={0.06}
                  />
                  <Edges threshold={15} color="#2a2218" lineWidth={1} />
                </mesh>
              </group>
            </AnimatedFront>
          );
        }

        if (
          front.frontType === 'usa' ||
          front.frontType === 'usa-sticla' ||
          front.frontType === 'usa-oglinda'
        ) {
          const isGlass = front.frontType === 'usa-sticla';
          const isMirror = front.frontType === 'usa-oglinda';

          return (
            <AnimatedFront
              key={`front-${front.col}-${front.row}`}
              frontType={front.frontType}
              previewMode={previewMode}
              compWidth={appliedW}
              compHeight={appliedH}
            >
              <group position={[comp.x, comp.y, frontZ]}>
                {/* Door panel */}
                <mesh
                  castShadow
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.(front.row, front.col);
                  }}
                >
                  <boxGeometry args={[appliedW, appliedH, thickness]} />
                  {isGlass || isMirror ? (
                    <meshStandardMaterial
                      color={isGlass ? '#e8f4f8' : '#c0c8d0'}
                      roughness={isGlass ? 0.1 : 0.05}
                      transparent={isGlass}
                      opacity={isGlass ? 0.35 : 1}
                      metalness={isMirror ? 0.9 : 0}
                    />
                  ) : (
                    <meshStandardMaterial
                      color={isSelected ? '#4a9eff' : unifiedFrontColor}
                      map={isSelected ? undefined : (verticalFrontTexture || undefined)}
                      roughness={0.62}
                      metalness={0.02}
                      envMapIntensity={0.06}
                    />
                  )}
                  <Edges threshold={15} color="#2a2218" lineWidth={1} />
                </mesh>

                {/* Glass door frame edges */}
                {isGlass && (
                  <>
                    <mesh position={[0, appliedH / 2 - 0.009, thickness / 2 + 0.001]}>
                      <boxGeometry args={[appliedW, 0.018, 0.002]} />
                      <meshStandardMaterial color={color} roughness={0.3} />
                    </mesh>
                    <mesh position={[0, -appliedH / 2 + 0.009, thickness / 2 + 0.001]}>
                      <boxGeometry args={[appliedW, 0.018, 0.002]} />
                      <meshStandardMaterial color={color} roughness={0.3} />
                    </mesh>
                    <mesh position={[-appliedW / 2 + 0.009, 0, thickness / 2 + 0.001]}>
                      <boxGeometry args={[0.018, appliedH, 0.002]} />
                      <meshStandardMaterial color={color} roughness={0.3} />
                    </mesh>
                    <mesh position={[appliedW / 2 - 0.009, 0, thickness / 2 + 0.001]}>
                      <boxGeometry args={[0.018, appliedH, 0.002]} />
                      <meshStandardMaterial color={color} roughness={0.3} />
                    </mesh>
                  </>
                )}

              </group>
            </AnimatedFront>
          );
        }

        if (front.frontType === 'clapa') {
          return (
            <AnimatedFront
              key={`front-${front.col}-${front.row}`}
              frontType="clapa"
              previewMode={previewMode}
              compWidth={appliedW}
              compHeight={appliedH}
            >
              <group position={[comp.x, comp.y, frontZ]}>
                <mesh
                  castShadow
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.(front.row, front.col);
                  }}
                >
                  <boxGeometry args={[appliedW, appliedH, thickness]} />
                  <meshStandardMaterial
                    color={color}
                    map={isSelected ? undefined : (horizontalFrontTexture || undefined)}
                    roughness={0.62}
                    metalness={0.02}
                    envMapIntensity={0.06}
                  />
                  <Edges threshold={15} color="#2a2218" lineWidth={1} />
                </mesh>
              </group>
            </AnimatedFront>
          );
        }

        return null;
      })}

      {/* Clickable compartment areas (empty compartments) */}
      {geometry.compartmentData.map((comp) => {
        const hasFront = config.fronts.some(
          (f) => f.col === comp.col && f.row === comp.row
        );
        if (hasFront) return null;

        const isSelected =
          selectedCompartment?.row === comp.row && selectedCompartment?.col === comp.col;

        return (
          <mesh
            key={`comp-${comp.col}-${comp.row}`}
            position={[comp.x, comp.y, d / 2 - thickness]}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(comp.row, comp.col);
            }}
          >
            <planeGeometry args={[comp.cw - 0.004, comp.ch - 0.004]} />
            <meshStandardMaterial
              color={isSelected ? '#4a9eff' : bodyColor}
              transparent
              opacity={isSelected ? 0.3 : 0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* ===== BASE ===== */}
      {config.baseType === 'picioare' && (
        <>
          {[
            [-w / 2 + 0.03, -h / 2 - 0.06, -d / 2 + 0.03],
            [w / 2 - 0.03, -h / 2 - 0.06, -d / 2 + 0.03],
            [-w / 2 + 0.03, -h / 2 - 0.06, d / 2 - 0.03],
            [w / 2 - 0.03, -h / 2 - 0.06, d / 2 - 0.03],
          ].map((pos, i) => (
            <mesh key={`leg-${i}`} position={pos as [number, number, number]} castShadow>
              <cylinderGeometry args={[0.015, 0.012, 0.12, 12]} />
              <meshStandardMaterial color="#666" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </>
      )}

      {config.baseType === 'plinta' && (
        <mesh position={[0, -h / 2 - 0.04, 0]} castShadow>
          <boxGeometry args={[w - 0.02, 0.08, d - 0.02]} />
          <meshStandardMaterial color={bodyMatColor} map={horizontalBodyTexture || undefined} roughness={0.4} />
        </mesh>
      )}

      {config.baseType === 'cadru' && (
        <>
          <mesh position={[0, -h / 2 - 0.075, d / 2 - 0.01]} castShadow>
            <boxGeometry args={[w, 0.03, 0.02]} />
            <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -h / 2 - 0.075, -d / 2 + 0.01]} castShadow>
            <boxGeometry args={[w, 0.03, 0.02]} />
            <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[-w / 2 + 0.01, -h / 2 - 0.075, 0]} castShadow>
            <boxGeometry args={[0.02, 0.03, d]} />
            <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[w / 2 - 0.01, -h / 2 - 0.075, 0]} castShadow>
            <boxGeometry args={[0.02, 0.03, d]} />
            <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
          </mesh>
          {[
            [-w / 2 + 0.01, -h / 2 - 0.12, -d / 2 + 0.01],
            [w / 2 - 0.01, -h / 2 - 0.12, -d / 2 + 0.01],
            [-w / 2 + 0.01, -h / 2 - 0.12, d / 2 - 0.01],
            [w / 2 - 0.01, -h / 2 - 0.12, d / 2 - 0.01],
          ].map((pos, i) => (
            <mesh key={`frameLeg-${i}`} position={pos as [number, number, number]} castShadow>
              <boxGeometry args={[0.02, 0.06, 0.02]} />
              <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
