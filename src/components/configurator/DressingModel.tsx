'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useDressingStore } from '@/store/dressingStore';
import { getMaterialById } from '@/data/materials';

export default function DressingModel() {
  const config = useDressingStore((s) => s.config);
  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);

  // Parse colors from material or use defaults
  const bodyColor = bodyMat?.color || '#d2b48c';
  const frontColor = frontMat?.color || '#f5f5f5';

  // Scale factor: 1 cm = 0.01 units
  const scale = 0.01;
  const w = config.totalWidth * scale;
  const h = config.totalHeight * scale;
  const d = config.depth * scale;

  // Memoize geometry and materials
  const [bodyGeometry, frontGeometry] = useMemo(() => {
    return [new THREE.BoxGeometry(w, h, d), new THREE.BoxGeometry(w * 0.95, h * 0.95, 0.01)];
  }, [w, h, d]);

  const materials = useMemo(() => {
    return {
      body: new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.1,
        roughness: 0.8,
      }),
      front: new THREE.MeshStandardMaterial({
        color: frontColor,
        metalness: 0.05,
        roughness: 0.7,
      }),
      shelves: new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.1,
        roughness: 0.8,
      }),
    };
  }, [bodyColor, frontColor]);

  return (
    <group>
      {/* Main body */}
      <mesh geometry={bodyGeometry} material={materials.body} position={[0, 0, 0]} castShadow receiveShadow />

      {/* Front panel */}
      <mesh geometry={frontGeometry} material={materials.front} position={[0, 0, d / 2 + 0.002]} castShadow />

      {/* Shelves */}
      {Array.from({ length: config.shelfCount }).map((_, i) => {
        const shelfZ = (config.shelfHeight / 10) * scale;
        const shelfY = -h / 2 + (h / (config.shelfCount + 1)) * (i + 1);
        const shelfGeometry = new THREE.BoxGeometry(w * 0.9, 0.01, d * 0.95);
        return (
          <mesh
            key={`shelf-${i}`}
            geometry={shelfGeometry}
            material={materials.shelves}
            position={[0, shelfY, 0]}
            castShadow
            receiveShadow
          />
        );
      })}

      {/* Clothes racks (simple vertical bars) */}
      {Array.from({ length: config.clothesRackCount }).map((_, i) => {
        const spacing = w / (config.clothesRackCount + 1);
        const xPos = -w / 2 + spacing * (i + 1);
        const rackHeight = (config.clothesRackHeight / 10) * scale;
        const rackGeometry = new THREE.CylinderGeometry(0.005, 0.005, rackHeight, 8);
        return (
          <mesh
            key={`rack-${i}`}
            geometry={rackGeometry}
            material={materials.body}
            position={[xPos, h / 4, 0]}
            castShadow
          />
        );
      })}

      {/* Drawers (simple rectangles) */}
      {Array.from({ length: config.drawerCount }).map((_, i) => {
        const drawerHeight = (config.drawerHeight / 10) * scale;
        const drawerY = -h / 2 + (drawerHeight / 2) + i * drawerHeight * 1.1;
        const drawerGeometry = new THREE.BoxGeometry(w * 0.88, drawerHeight * 0.9, d * 0.6);
        return (
          <mesh
            key={`drawer-${i}`}
            geometry={drawerGeometry}
            material={materials.front}
            position={[0, drawerY, 0]}
            castShadow
            receiveShadow
          />
        );
      })}

      {/* Mirror (if needed) */}
      {config.mirrored && (
        <mesh
          geometry={new THREE.BoxGeometry(w * 0.4, h * 0.6, 0.002)}
          material={
            new THREE.MeshStandardMaterial({
              color: '#e0e0e0',
              metalness: 0.9,
              roughness: 0.1,
            })
          }
          position={[0, 0, d / 2 + 0.003]}
          castShadow
        />
      )}
    </group>
  );
}
