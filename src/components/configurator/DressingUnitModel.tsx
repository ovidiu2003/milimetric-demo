'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useDressingUnitStore } from '@/store/dressingUnitStore';
import { DressingModuleConfig } from '@/types';
import { getMaterialById } from '@/data/materials';
import { useTextures } from '@/hooks/useTextures';

// ──────────────────────────────────────────────────────────────
// Hover-animated door (opens around a hinge axis)
// ──────────────────────────────────────────────────────────────
function HoverDoor({
  children,
  hingeSide,
  hingePosition,
  panelWidth,
}: {
  children: React.ReactNode;
  hingeSide: -1 | 1;
  hingePosition: [number, number, number];
  panelWidth: number;
}) {
  const animated = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const prog = useRef(0);

  useFrame((_, delta) => {
    if (!animated.current) return;
    const target = hovered ? 1 : 0;
    prog.current += (target - prog.current) * 5 * delta;
    const p = Math.max(0, Math.min(1, prog.current));
    animated.current.rotation.y = hingeSide * p * (Math.PI / 2);
  });

  return (
    <group
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
      <group ref={animated}>
        <group position={[-hingeSide * (panelWidth / 2), 0, 0]}>{children}</group>
      </group>
    </group>
  );
}

// Hover-animated drawer (slides forward)
function HoverDrawer({
  children,
  panelWidth,
}: {
  children: React.ReactNode;
  panelWidth: number;
}) {
  const animated = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const prog = useRef(0);

  useFrame((_, delta) => {
    if (!animated.current) return;
    const target = hovered ? 1 : 0;
    prog.current += (target - prog.current) * 5 * delta;
    const p = Math.max(0, Math.min(1, prog.current));
    animated.current.position.z = p * panelWidth * 0.35;
  });

  return (
    <group
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
      <group ref={animated}>{children}</group>
    </group>
  );
}

function cloneTextureWithRotation(source: THREE.Texture | null, rotation: number): THREE.Texture | null {
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
 * Dressing module — floor-standing wardrobe made of N identical modules.
 * Each module is a closed box with its own interior layout + optional doors (2 per module).
 *
 *   ┌──────┬──────┬──────┐
 *   │ mod0 │ mod1 │ mod2 │   (each 80-120 cm wide)
 *   │      │      │      │
 *   └──────┴──────┴──────┘
 *   ════════ plinta ════════
 */
export default function DressingUnitModel() {
  const groupRef = useRef<THREE.Group>(null);
  const config = useDressingUnitStore((s) => s.config);
  const showDimensions = useDressingUnitStore((s) => s.showDimensions);
  useTextures();

  const bodyMaterial = getMaterialById(config.bodyMaterialId);
  const frontMaterial = getMaterialById(config.frontMaterialId);
  const sideMaterial = getMaterialById(config.sideMaterialId);

  const bodyColor = bodyMaterial?.color || '#c9a96e';
  const frontColor = frontMaterial?.color || '#f5f5f5';
  const sideColor = sideMaterial?.color || bodyColor;

  const bodyTexture = useMemo(() => {
    if (!bodyMaterial?.textureUrl) return null;
    const t = new THREE.TextureLoader().load(bodyMaterial.textureUrl);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.repeat.set(1, 1);
    return t;
  }, [bodyMaterial?.textureUrl]);

  const frontTexture = useMemo(() => {
    if (!frontMaterial?.textureUrl) return null;
    const t = new THREE.TextureLoader().load(frontMaterial.textureUrl);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.repeat.set(1, 1);
    return t;
  }, [frontMaterial?.textureUrl]);

  const horizontalBodyTexture = useMemo(() => cloneTextureWithRotation(bodyTexture, Math.PI / 2), [bodyTexture]);
  const verticalBodyTexture   = useMemo(() => cloneTextureWithRotation(bodyTexture, 0), [bodyTexture]);
  const unifiedFrontTexture = frontTexture || bodyTexture;
  const verticalFrontTexture = useMemo(() => cloneTextureWithRotation(unifiedFrontTexture, 0), [unifiedFrontTexture]);
  const horizontalFrontTexture = useMemo(() => cloneTextureWithRotation(unifiedFrontTexture, Math.PI / 2), [unifiedFrontTexture]);

  // Textura pentru biblioteca laterala (material separat)
  const sideTexture = useMemo(() => {
    if (!sideMaterial?.textureUrl) return null;
    const t = new THREE.TextureLoader().load(sideMaterial.textureUrl);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.repeat.set(1, 1);
    return t;
  }, [sideMaterial?.textureUrl]);
  const horizontalSideTexture = useMemo(() => cloneTextureWithRotation(sideTexture, Math.PI / 2), [sideTexture]);
  const verticalSideTexture   = useMemo(() => cloneTextureWithRotation(sideTexture, 0), [sideTexture]);
  const unifiedSideColor = sideTexture ? '#ffffff' : sideColor;

  const unifiedBodyColor  = bodyTexture ? '#ffffff' : bodyColor;
  const unifiedFrontColor = frontTexture ? '#ffffff' : (bodyTexture ? '#ffffff' : frontColor);

  // Scale + constants
  const S = 0.01;
  const T = 1.8 * S;   // panel thickness
  const H  = config.totalHeight * S;
  const D  = config.depth * S;
  const PL = config.plinthHeight * S;
  const N  = config.moduleCount;

  // Compute per-module widths + cumulative X positions
  const moduleWidths = config.modules.map((m) => m.width * S);
  const modulesW = moduleWidths.reduce((a, b) => a + b, 0);

  // Side shelves dimensions
  const sideCfg = config.sideShelves;
  const hasLeftSide  = sideCfg.position === 'left'  || sideCfg.position === 'both';
  const hasRightSide = sideCfg.position === 'right' || sideCfg.position === 'both';
  // Biblioteca laterala iese in afara cu columnWidth (indiferent de cate coloane are pe Z)
  const sideUnitWidth = sideCfg.columnWidth * S;
  const leftSideW  = hasLeftSide  ? sideUnitWidth : 0;
  const rightSideW = hasRightSide ? sideUnitWidth : 0;

  const totalW = modulesW + leftSideW + rightSideW;
  const fullLeftX = -totalW / 2;
  const modulesLeftX = fullLeftX + leftSideW;

  const moduleStarts: number[] = [];
  {
    let acc = modulesLeftX;
    for (const w of moduleWidths) {
      moduleStarts.push(acc);
      acc += w;
    }
  }
  const modulesRightX = modulesLeftX + modulesW;

  const bodyY0 = PL;             // body starts above plinth
  const bodyTotalH = H - PL;     // available height above plinth
  // Note: per-module body heights depend on whether the module has a top compartment

  const HANDLE_COLOR = '#2a2218';
  const bodyMatProps = {
    color: unifiedBodyColor,
    map: verticalBodyTexture || undefined,
    roughness: 0.62,
    metalness: 0.02,
    envMapIntensity: 0.06,
  };
  const bodyMatPropsH = {
    ...bodyMatProps,
    map: horizontalBodyTexture || undefined,
  };
  const frontMatProps = {
    color: unifiedFrontColor,
    map: verticalFrontTexture || undefined,
    roughness: 0.62,
    metalness: 0.02,
    envMapIntensity: 0.06,
  };
  // Material biblioteca laterala (doar structura)
  const sideMatProps = {
    color: unifiedSideColor,
    map: verticalSideTexture || undefined,
    roughness: 0.62,
    metalness: 0.02,
    envMapIntensity: 0.06,
  };
  const sideMatPropsH = {
    ...sideMatProps,
    map: horizontalSideTexture || undefined,
  };

  return (
    <group ref={groupRef}>
      {/* ═══════════ PLINTA (doar sub module, nu sub biblioteca laterala) ═══════════ */}
      {PL > 0 && (
        <mesh position={[modulesLeftX + modulesW / 2, PL / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[modulesW - 0.04, PL, D - 0.06]} />
          <meshStandardMaterial {...frontMatProps} />
        </mesh>
      )}

      {/* ═══════════ MODULES (fiecare modul e o cutie independenta) ═══════════ */}
      {Array.from({ length: N }, (_, i) => {
        const moduleLeftX = moduleStarts[i];
        const MW = moduleWidths[i];
        const moduleRightX = moduleLeftX + MW;
        const moduleCenterX = (moduleLeftX + moduleRightX) / 2;
        const module: DressingModuleConfig = config.modules[i] || {
          width: 100,
          interiorType: 'bara-raft',
          hasDoors: true,
          hasTopCompartment: false,
          topCompartmentHeight: 40,
        };
        const topCompH = module.hasTopCompartment ? module.topCompartmentHeight * S : 0;
        const mainBodyH = bodyTotalH - topCompH;
        const mainBodyMidY = bodyY0 + mainBodyH / 2;
        return (
          <ModuleGroup
            key={`mod-${i}`}
            index={i}
            module={module}
            moduleLeftX={moduleLeftX}
            moduleRightX={moduleRightX}
            moduleCenterX={moduleCenterX}
            bodyY0={bodyY0}
            bodyH={mainBodyH}
            bodyMidY={mainBodyMidY}
            topCompH={topCompH}
            MW={MW}
            D={D}
            T={T}
            includeLeftPanel={true}
            bodyMatProps={bodyMatProps}
            bodyMatPropsH={bodyMatPropsH}
            frontMatProps={frontMatProps}
            horizontalBodyTexture={horizontalBodyTexture}
            verticalBodyTexture={verticalBodyTexture}
            verticalFrontTexture={verticalFrontTexture}
            horizontalFrontTexture={horizontalFrontTexture}
            unifiedBodyColor={unifiedBodyColor}
            unifiedFrontColor={unifiedFrontColor}
            HANDLE_COLOR={HANDLE_COLOR}
          />
        );
      })}

      {/* ═══════════ BIBLIOTECA LATERALA (side shelves, deschidere in lateral, FARA plinta) ═══════════ */}
      {hasLeftSide && (
        <SideShelvesGroup
          startX={fullLeftX}
          side="left"
          columns={sideCfg.columns}
          columnWidth={sideCfg.columnWidth * S}
          shelfCount={sideCfg.shelfCount}
          layout={sideCfg.layout}
          bodyY0={0}
          bodyH={H}
          D={D}
          T={T}
          bodyMatProps={sideMatProps}
          bodyMatPropsH={sideMatPropsH}
          frontMatProps={frontMatProps}
        />
      )}
      {hasRightSide && (
        <SideShelvesGroup
          startX={modulesRightX}
          side="right"
          columns={sideCfg.columns}
          columnWidth={sideCfg.columnWidth * S}
          shelfCount={sideCfg.shelfCount}
          layout={sideCfg.layout}
          bodyY0={0}
          bodyH={H}
          D={D}
          T={T}
          bodyMatProps={sideMatProps}
          bodyMatPropsH={sideMatPropsH}
          frontMatProps={frontMatProps}
        />
      )}

      {/* ═══════════ DIMENSIUNI — overlay la cerere ═══════════ */}
      {showDimensions && (
        <DimensionsOverlay
          config={config}
          S={S}
          T={T}
          H={H}
          D={D}
          PL={PL}
          fullLeftX={fullLeftX}
          modulesLeftX={modulesLeftX}
          modulesRightX={modulesRightX}
          modulesW={modulesW}
          leftSideW={leftSideW}
          rightSideW={rightSideW}
          moduleStarts={moduleStarts}
          moduleWidths={moduleWidths}
          bodyY0={bodyY0}
          bodyTotalH={bodyTotalH}
        />
      )}
    </group>
  );
}

// ──────────────────────────────────────────────────────────────
// A single module: outer shell + interior + optional doors
// ──────────────────────────────────────────────────────────────
interface ModuleProps {
  index: number;
  module: DressingModuleConfig;
  moduleLeftX: number;
  moduleRightX: number;
  moduleCenterX: number;
  bodyY0: number;
  bodyH: number;      // inaltimea corpului principal (fara plinta si fara compartiment sus)
  bodyMidY: number;
  topCompH: number;   // inaltimea compartimentului superior (0 daca nu exista)
  MW: number;
  D: number;
  T: number;
  includeLeftPanel: boolean;
  bodyMatProps: any;
  bodyMatPropsH: any;
  frontMatProps: any;
  horizontalBodyTexture: THREE.Texture | null;
  verticalBodyTexture: THREE.Texture | null;
  verticalFrontTexture: THREE.Texture | null;
  horizontalFrontTexture: THREE.Texture | null;
  unifiedBodyColor: string;
  unifiedFrontColor: string;
  HANDLE_COLOR: string;
}

function ModuleGroup(props: ModuleProps) {
  const {
    module, moduleLeftX, moduleRightX, moduleCenterX,
    bodyY0, bodyH, bodyMidY, topCompH, MW, D, T,
    includeLeftPanel,
    bodyMatProps, bodyMatPropsH, frontMatProps,
    HANDLE_COLOR,
  } = props;

  const selectedIdx = useDressingUnitStore((s) => s.selectedModuleIdx);
  const setSelected = useDressingUnitStore((s) => s.setSelectedModule);
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedIdx === props.index;
  const isActive = isSelected || hovered;

  const innerLeftX = moduleLeftX + T;
  const innerRightX = moduleRightX - T;
  const innerW = innerRightX - innerLeftX;
  const innerCenterX = (innerLeftX + innerRightX) / 2;
  const innerBottomY = bodyY0 + T;
  const innerTopY = bodyY0 + bodyH - T;
  const innerH = innerTopY - innerBottomY;
  const hasTop = topCompH > 0;
  const hasDoors = module.hasDoors;

  // Corpul principal ocupa [bodyY0, bodyY0+bodyH]
  // Compartimentul superior (cutie independenta) sta DEASUPRA corpului principal:
  //   [bodyY0+bodyH, bodyY0+bodyH+topCompH]
  const mainTopY = bodyY0 + bodyH;         // capatul superior al corpului principal
  const topCompBottomY = mainTopY;         // baza compartimentului superior
  const fullTopY = topCompBottomY + topCompH; // capatul absolut al modulului
  const topCompMidY = topCompBottomY + topCompH / 2;

  // Bounding box total al modulului (pentru hit-test si overlay selection)
  const moduleBoxH = bodyH + topCompH;
  const moduleBoxMidY = bodyY0 + moduleBoxH / 2;

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(isSelected ? null : props.index);
      }}
    >
      {/* Hit-test box invizibil — acopera tot modulul pentru click/hover fiabil */}
      <mesh position={[moduleCenterX, moduleBoxMidY, 0]} visible={false}>
        <boxGeometry args={[MW, moduleBoxH, D * 1.02]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Overlay de selectie / hover — outline luminos */}
      {isActive && (
        <mesh position={[moduleCenterX, moduleBoxMidY, 0]}>
          <boxGeometry args={[MW + 0.008, moduleBoxH + 0.008, D + 0.008]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges
            threshold={1}
            color={isSelected ? '#d4a664' : '#e8c88a'}
            lineWidth={isSelected ? 2.2 : 1.4}
          />
        </mesh>
      )}

      {/* Badge cu numarul modulului (vizibil pe hover sau selectat) */}
      {isActive && (
        <Html
          position={[moduleCenterX, fullTopY + 0.08, D / 2]}
          center
          sprite
          zIndexRange={[100, 0]}
          pointerEvents="none"
        >
          <div
            style={{
              background: isSelected ? '#b48c50' : 'rgba(180,140,80,0.85)',
              color: '#fff',
              borderRadius: 999,
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 10px rgba(180,140,80,0.35)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {isSelected ? '✓ ' : ''}Modul {props.index + 1}
          </div>
        </Html>
      )}
      {/* ═══ CORPUL PRINCIPAL ═══ */}
      {/* Laterala stanga — doar corp principal */}
      {includeLeftPanel && (
        <mesh position={[moduleLeftX + T / 2, bodyMidY, 0]} castShadow receiveShadow>
          <boxGeometry args={[T, bodyH, D]} />
          <meshStandardMaterial {...bodyMatProps} />
          <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
        </mesh>
      )}

      {/* Laterala dreapta — doar corp principal */}
      <mesh position={[moduleRightX - T / 2, bodyMidY, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, bodyH, D]} />
        <meshStandardMaterial {...bodyMatProps} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Top corp principal */}
      <mesh position={[moduleCenterX, mainTopY - T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[MW - 2 * T, T, D]} />
        <meshStandardMaterial {...bodyMatPropsH} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Bottom corp principal */}
      <mesh position={[moduleCenterX, bodyY0 + T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[MW - 2 * T, T, D]} />
        <meshStandardMaterial {...bodyMatPropsH} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* Spate corp principal */}
      <mesh position={[moduleCenterX, bodyMidY, -D / 2 + T / 4]} castShadow receiveShadow>
        <boxGeometry args={[MW - 2 * T, bodyH - 2 * T, T / 2]} />
        <meshStandardMaterial {...bodyMatProps} />
      </mesh>

      {/* ═══ COMPARTIMENT SUPERIOR (cutie independenta) ═══ */}
      {hasTop && (
        <>
          {/* Laterala stanga compartiment sus */}
          {includeLeftPanel && (
            <mesh position={[moduleLeftX + T / 2, topCompMidY, 0]} castShadow receiveShadow>
              <boxGeometry args={[T, topCompH, D]} />
              <meshStandardMaterial {...bodyMatProps} />
              <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
            </mesh>
          )}

          {/* Laterala dreapta compartiment sus */}
          <mesh position={[moduleRightX - T / 2, topCompMidY, 0]} castShadow receiveShadow>
            <boxGeometry args={[T, topCompH, D]} />
            <meshStandardMaterial {...bodyMatProps} />
            <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
          </mesh>

          {/* Bottom compartiment sus (sta deasupra top-ului corpului principal -> double-line vizibila) */}
          <mesh position={[moduleCenterX, topCompBottomY + T / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[MW - 2 * T, T, D]} />
            <meshStandardMaterial {...bodyMatPropsH} />
            <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
          </mesh>

          {/* Top compartiment sus */}
          <mesh position={[moduleCenterX, fullTopY - T / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[MW - 2 * T, T, D]} />
            <meshStandardMaterial {...bodyMatPropsH} />
            <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
          </mesh>

          {/* Spate compartiment sus */}
          <mesh position={[moduleCenterX, topCompMidY, -D / 2 + T / 4]} castShadow receiveShadow>
            <boxGeometry args={[MW - 2 * T, topCompH - 2 * T, T / 2]} />
            <meshStandardMaterial {...bodyMatProps} />
          </mesh>
        </>
      )}

      {/* Interior — main body */}
      <ModuleInterior
        type={module.interiorType}
        sections={module.sections}
        innerLeftX={innerLeftX}
        innerRightX={innerRightX}
        innerCenterX={innerCenterX}
        innerBottomY={innerBottomY}
        innerTopY={innerTopY}
        innerW={innerW}
        innerH={innerH}
        D={D}
        T={T}
        bodyMatProps={bodyMatProps}
        bodyMatPropsH={bodyMatPropsH}
        frontMatProps={frontMatProps}
        HANDLE_COLOR={HANDLE_COLOR}
      />

      {/* Usi pe toata inaltimea modulului (de la podea pana la varf, acoperind si plinta) */}
      {hasDoors && (() => {
        const fullDoorsH = bodyH + topCompH + bodyY0; // include plinta
        const fullDoorsStart = 0;                      // de la podea
        const fullDoorsMidY = fullDoorsStart + fullDoorsH / 2;
        return (
          <ModuleDoors
            moduleLeftX={moduleLeftX}
            moduleRightX={moduleRightX}
            moduleCenterX={moduleCenterX}
            bodyY0={fullDoorsStart}
            bodyH={fullDoorsH}
            bodyMidY={fullDoorsMidY}
            MW={MW}
            D={D}
            T={T}
            moduleIndex={props.index}
            frontMatProps={frontMatProps}
            HANDLE_COLOR={HANDLE_COLOR}
          />
        );
      })()}
    </group>
  );
}

// ──────────────────────────────────────────────────────────────
// Interior layouts — based on sections (stacked bottom-to-top)
// Sectiunile sunt in cm. Storul garanteaza: sum(heightCm) = interiorHeight.
// Randerul foloseste inaltimi reale — fara scalare "magica".
// ──────────────────────────────────────────────────────────────
function ModuleInterior({
  type, sections, innerLeftX, innerRightX, innerCenterX, innerBottomY, innerTopY,
  innerW, innerH, D, T,
  bodyMatProps, bodyMatPropsH, frontMatProps, HANDLE_COLOR,
}: {
  type: 'bara-raft' | 'rafturi' | 'mixt' | 'rafturi-deschise';
  sections?: import('@/types').DressingModuleSection[];
  innerLeftX: number; innerRightX: number; innerCenterX: number;
  innerBottomY: number; innerTopY: number;
  innerW: number; innerH: number;
  D: number; T: number;
  bodyMatProps: any; bodyMatPropsH: any; frontMatProps: any;
  HANDLE_COLOR: string;
}) {
  // Fallback la prezentarea veche daca modulul nu are sectiuni
  if (!sections || sections.length === 0) {
    return (
      <LegacyModuleInterior
        type={type}
        innerCenterX={innerCenterX}
        innerBottomY={innerBottomY}
        innerW={innerW} innerH={innerH}
        D={D} T={T}
        bodyMatPropsH={bodyMatPropsH}
        frontMatProps={frontMatProps}
      />
    );
  }

  const S = 0.01;
  // Daca modulul contine sertare, polita are aceeasi adancime ca sertarele + 10mm in fata (iese cu 10mm peste frontul sertarului).
  // Sertarele sunt retrase 80mm fata de frontul corpului => polita retrasa 70mm.
  const hasDrawers = sections.some((s) => s.type === 'drawers');
  const SHELF_FRONT_INSET = hasDrawers ? 0.07 : 0; // 70mm retras = 80mm sertar - 10mm
  const shelfZMin = -D / 2 + T / 2;                 // spate (la fel ca inainte)
  const shelfZMax = D / 2 - T / 2 - SHELF_FRONT_INSET;
  const shelfDepth = shelfZMax - shelfZMin;
  const shelfCenterZ = (shelfZMin + shelfZMax) / 2;
  // Calculam pozitiile reale (cu separatoare de grosime T intre sectiuni)
  // Daca suma sectiunilor + separatoare != innerH, scalam fin pt compensare
  const totalSectM = sections.reduce((s, sec) => s + sec.heightCm * S, 0);
  const separatorsCount = sections.length - 1;
  const separatorsTotal = separatorsCount * T;
  const requestedTotal = totalSectM + separatorsTotal;
  // Factor de corectie (ar trebui sa fie ~1, mic delta din rotunjirea cm -> m)
  const fitScale = requestedTotal > 0 ? innerH / requestedTotal : 1;

  let cursorY = innerBottomY;
  const nodes: React.ReactNode[] = [];

  sections.forEach((sec, i) => {
    const h = Math.max(0.01, sec.heightCm * S * fitScale);
    const y0 = cursorY;
    const y1 = y0 + h;
    const yMid = (y0 + y1) / 2;
    const isLast = i === sections.length - 1;

    switch (sec.type) {
      case 'shelves': {
        const count = Math.max(0, Math.min(6, sec.shelfCount ?? 0));
        if (count > 0) {
          const spacing = h / (count + 1);
          for (let k = 0; k < count; k++) {
            const y = y0 + (k + 1) * spacing;
            nodes.push(
              <mesh key={`${sec.id}-sh-${k}`} position={[innerCenterX, y, shelfCenterZ]} castShadow receiveShadow>
                <boxGeometry args={[innerW, T, shelfDepth]} />
                <meshStandardMaterial {...bodyMatPropsH} />
                <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
              </mesh>
            );
          }
        }
        break;
      }
      case 'hanging-rod': {
        // Bara metalica aproape de tavanul sectiunii (real-life: ~4cm sub panou)
        const barY = y1 - 0.04; // 4cm sub panou
        // Suporti laterali (flanse metalice mici pe laterale)
        nodes.push(
          <group key={`${sec.id}-bar`}>
            <mesh position={[innerCenterX, barY, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, innerW - 0.01, 20]} />
              <meshStandardMaterial color="#c2c4c8" metalness={0.8} roughness={0.25} />
            </mesh>
            {/* Flanse */}
            <mesh position={[innerLeftOf(innerCenterX, innerW) + 0.005, barY, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.01, 16]} />
              <meshStandardMaterial color="#9ca0a6" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[innerRightOf(innerCenterX, innerW) - 0.005, barY, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.01, 16]} />
              <meshStandardMaterial color="#9ca0a6" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        );
        break;
      }
      case 'drawers': {
        const dc = Math.max(1, Math.min(5, sec.drawerCount ?? 2));
        const gap = 0.03;                     // 30mm gap intre sertare (fara maner — clientul apuca frontul)
        const FRONT_INSET = 0.08;             // 80mm retras fata de frontul corpului
        const frontZ = D / 2 - T / 2 - FRONT_INSET;
        // Daca urmeaza alta sectiune deasupra, lasam 30mm gap intre ultimul sertar si polita/panoul de sus
        const topGap = isLast ? 0 : 0.03;
        const usableH = Math.max(0.02, h - topGap);
        const drawerH = (usableH - (dc - 1) * gap) / dc;
        for (let k = 0; k < dc; k++) {
          const dY = y0 + drawerH / 2 + k * (drawerH + gap);
          nodes.push(
            <HoverDrawer key={`${sec.id}-dw-${k}`} panelWidth={innerW}>
              {/* Frontul sertarului — retras 80mm in interior pentru prindere ergonomica */}
              <mesh position={[innerCenterX, dY, frontZ]} castShadow>
                <boxGeometry args={[innerW - 0.004, drawerH - 0.002, T]} />
                <meshStandardMaterial {...frontMatProps} />
                <Edges threshold={15} color="#2a2218" lineWidth={1} />
              </mesh>
              {/* Cutia sertarului — in spatele frontului */}
              <mesh position={[innerCenterX, dY - drawerH * 0.05, frontZ - (D - 0.04) / 2 - T / 2]} castShadow receiveShadow>
                <boxGeometry args={[innerW - 0.02, drawerH * 0.85, D - 0.04 - FRONT_INSET]} />
                <meshStandardMaterial color="#e4dbc8" roughness={0.8} metalness={0.05} />
              </mesh>
            </HoverDrawer>
          );
        }
        break;
      }
      case 'shoe-rack': {
        // Rafturi inclinate pentru pantofi — 2-4 bucati, la ~15deg
        const n = Math.max(2, Math.min(6, sec.shoeCount ?? 3));
        const tilt = -15 * Math.PI / 180;
        const slotH = h / n;
        for (let k = 0; k < n; k++) {
          const y = y0 + (k + 0.5) * slotH;
          nodes.push(
            <mesh key={`${sec.id}-shoe-${k}`} position={[innerCenterX, y, 0]} rotation={[tilt, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[innerW, T * 0.7, D * 0.7]} />
              <meshStandardMaterial {...bodyMatPropsH} />
              <Edges threshold={15} color="#3a3228" lineWidth={0.5} />
            </mesh>
          );
          // bordura inferioara (stopper pantofi)
          nodes.push(
            <mesh key={`${sec.id}-shoe-lip-${k}`} position={[innerCenterX, y - slotH * 0.35, D * 0.22]} castShadow>
              <boxGeometry args={[innerW - 0.01, 0.015, 0.008]} />
              <meshStandardMaterial color="#9ca0a6" metalness={0.5} roughness={0.4} />
            </mesh>
          );
        }
        break;
      }
      case 'pull-out-trouser': {
        // Rama extensibila + bare orizontale pentru pantaloni
        const n = Math.max(2, Math.min(6, sec.trouserRodCount ?? 4));
        const pad = 0.03;
        // 2 sine laterale (rama)
        nodes.push(
          <mesh key={`${sec.id}-tr-rail-L`} position={[innerCenterX - innerW / 2 + 0.012, (y0 + y1) / 2, 0]} castShadow>
            <boxGeometry args={[0.012, h - pad, D * 0.6]} />
            <meshStandardMaterial color="#9ca0a6" metalness={0.7} roughness={0.3} />
          </mesh>
        );
        nodes.push(
          <mesh key={`${sec.id}-tr-rail-R`} position={[innerCenterX + innerW / 2 - 0.012, (y0 + y1) / 2, 0]} castShadow>
            <boxGeometry args={[0.012, h - pad, D * 0.6]} />
            <meshStandardMaterial color="#9ca0a6" metalness={0.7} roughness={0.3} />
          </mesh>
        );
        // barele de agatare pantaloni
        for (let k = 0; k < n; k++) {
          const y = y0 + (pad / 2) + ((h - pad) * (k + 0.5)) / n;
          nodes.push(
            <mesh key={`${sec.id}-tr-${k}`} position={[innerCenterX, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, innerW - 0.04, 16]} />
              <meshStandardMaterial color="#c2c4c8" metalness={0.8} roughness={0.25} />
            </mesh>
          );
        }
        break;
      }
      case 'pull-out-basket': {
        // Cosuri de sarma extensibile
        const n = Math.max(1, Math.min(4, sec.basketCount ?? 2));
        const gap = 0.01;
        const basketH = (h - (n - 1) * gap) / n;
        for (let k = 0; k < n; k++) {
          const bY = y0 + basketH / 2 + k * (basketH + gap);
          // rama cos
          nodes.push(
            <mesh key={`${sec.id}-bk-${k}`} position={[innerCenterX, bY, 0]} castShadow>
              <boxGeometry args={[innerW - 0.02, basketH * 0.85, D - 0.05]} />
              <meshStandardMaterial color="#d6d8da" metalness={0.4} roughness={0.5} transparent opacity={0.35} />
              <Edges threshold={15} color="#6a6e74" lineWidth={1} />
            </mesh>
          );
          // maner frontal
          nodes.push(
            <mesh key={`${sec.id}-bk-hd-${k}`} position={[innerCenterX, bY, D / 2 - 0.02]}>
              <boxGeometry args={[Math.min(0.16, innerW * 0.3), 0.008, 0.006]} />
              <meshStandardMaterial color={HANDLE_COLOR} metalness={0.55} roughness={0.35} />
            </mesh>
          );
        }
        break;
      }
      case 'mirror': {
        // Panou oglinda lipit de peretele din spate
        nodes.push(
          <mesh key={`${sec.id}-mirror`} position={[innerCenterX, (y0 + y1) / 2, -D / 2 + T / 2 + 0.002]} castShadow receiveShadow>
            <boxGeometry args={[innerW - 0.02, Math.max(0.02, h - 0.04), 0.005]} />
            <meshStandardMaterial color="#e4ecf4" metalness={0.95} roughness={0.05} envMapIntensity={1.2} />
            <Edges threshold={15} color="#6a6e74" lineWidth={0.6} />
          </mesh>
        );
        break;
      }
      case 'empty':
      default:
        break;
    }

    // Separator intre sectiuni (panou orizontal) — nu si sub ultima.
    // Daca sectiunea curenta este de sertare, panoul de deasupra se retrage la nivel cu fronturile sertarelor (80mm).
    if (!isLast) {
      const isAboveDrawers = sec.type === 'drawers';
      const sepFrontInset = isAboveDrawers ? 0.06 : 0; // 60mm retras = sertar(80mm) - 20mm in exterior
      const sepZMin = -D / 2 + T / 2;
      const sepZMax = D / 2 - T / 2 - sepFrontInset;
      const sepDepth = sepZMax - sepZMin;
      const sepCenterZ = (sepZMin + sepZMax) / 2;
      nodes.push(
        <mesh key={`${sec.id}-sep`} position={[innerCenterX, y1 + T / 2, sepCenterZ]} castShadow receiveShadow>
          <boxGeometry args={[innerW, T, sepDepth]} />
          <meshStandardMaterial {...bodyMatPropsH} />
          <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
        </mesh>
      );
    }

    cursorY = y1 + (isLast ? 0 : T);
  });

  return <group>{nodes}</group>;
}

// Helpers pentru flansele barelor (calcul rapid al extremelor interioare)
function innerLeftOf(cx: number, w: number)  { return cx - w / 2; }
function innerRightOf(cx: number, w: number) { return cx + w / 2; }

// Vechiul renderer (folosit ca fallback pt module fara sectiuni definite)
function LegacyModuleInterior({
  type, innerCenterX, innerBottomY,
  innerW, innerH, D, T,
  bodyMatPropsH, frontMatProps,
}: {
  type: 'bara-raft' | 'rafturi' | 'mixt' | 'rafturi-deschise';
  innerCenterX: number; innerBottomY: number;
  innerW: number; innerH: number;
  D: number; T: number;
  bodyMatPropsH: any; frontMatProps: any;
}) {
  if (type === 'rafturi-deschise') {
    // Modul deschis tip biblioteca — 6 rafturi vizibile, fara spate vizibil la fronturi
    const shelves = 6;
    const spacing = innerH / (shelves + 1);
    return (
      <group>
        {Array.from({ length: shelves }, (_, i) => {
          const y = innerBottomY + (i + 1) * spacing;
          return (
            <mesh key={`sh-${i}`} position={[innerCenterX, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[innerW, T, D - T]} />
              <meshStandardMaterial {...bodyMatPropsH} />
              <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (type === 'rafturi') {
    // 4 horizontal shelves evenly spaced
    const shelves = 4;
    const spacing = innerH / (shelves + 1);
    return (
      <group>
        {Array.from({ length: shelves }, (_, i) => {
          const y = innerBottomY + (i + 1) * spacing;
          return (
            <mesh key={`sh-${i}`} position={[innerCenterX, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[innerW, T, D - T]} />
              <meshStandardMaterial {...bodyMatPropsH} />
              <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (type === 'bara-raft') {
    // bottom shelf at ~25% height, hanging bar at ~88% height
    const shelfY = innerBottomY + innerH * 0.25;
    const barY = innerBottomY + innerH * 0.88;
    return (
      <group>
        <mesh position={[innerCenterX, shelfY, 0]} castShadow receiveShadow>
          <boxGeometry args={[innerW, T, D - T]} />
          <meshStandardMaterial {...bodyMatPropsH} />
          <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
        </mesh>
        {/* hanging bar */}
        <mesh position={[innerCenterX, barY, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, innerW, 16]} />
          <meshStandardMaterial color="#b8b8b8" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  // mixt: 2 drawers bottom (each ~18 cm high), middle shelf, hanging bar above
  const drawerH = 0.18;
  const drawer1Y = innerBottomY + drawerH / 2;
  const drawer2Y = innerBottomY + drawerH + T + drawerH / 2;
  const midShelfY = innerBottomY + 2 * drawerH + 2 * T;
  const barY = innerBottomY + innerH * 0.92;
  return (
    <group>
      {/* Shelf above drawers */}
      <mesh position={[innerCenterX, midShelfY, 0]} castShadow receiveShadow>
        <boxGeometry args={[innerW, T, D - T]} />
        <meshStandardMaterial {...bodyMatPropsH} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>
      {/* Hanging bar */}
      <mesh position={[innerCenterX, barY, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, innerW, 16]} />
        <meshStandardMaterial color="#b8b8b8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Drawer 1 front */}
      <HoverDrawer panelWidth={innerW}>
        <mesh position={[innerCenterX, drawer1Y, D / 2 - T / 2]} castShadow>
          <boxGeometry args={[innerW - 0.01, drawerH, T]} />
          <meshStandardMaterial {...frontMatProps} />
          <Edges threshold={15} color="#2a2218" lineWidth={1} />
        </mesh>
      </HoverDrawer>
      {/* Drawer 2 front */}
      <HoverDrawer panelWidth={innerW}>
        <mesh position={[innerCenterX, drawer2Y, D / 2 - T / 2]} castShadow>
          <boxGeometry args={[innerW - 0.01, drawerH, T]} />
          <meshStandardMaterial {...frontMatProps} />
          <Edges threshold={15} color="#2a2218" lineWidth={1} />
        </mesh>
      </HoverDrawer>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────
// Two doors per module with vertical handles
// ──────────────────────────────────────────────────────────────
function ModuleDoors({
  moduleLeftX, moduleRightX, moduleCenterX,
  bodyY0, bodyH, bodyMidY,
  MW, D, T,
  moduleIndex,
  frontMatProps, HANDLE_COLOR,
}: {
  moduleLeftX: number; moduleRightX: number; moduleCenterX: number;
  bodyY0: number; bodyH: number; bodyMidY: number;
  MW: number; D: number; T: number;
  moduleIndex: number;
  frontMatProps: any; HANDLE_COLOR: string;
}) {
  const doorH = bodyH - 0.004;
  const doorZ = D / 2 + T / 2;
  // Manerul: incepe de la partea de jos a frontului, pana la inaltimea de 1100mm
  const HANDLE_TOP_Y = 1.10;                            // 1100mm de la podea (in Three units, S=0.01)
  const handleBottomLocal = -doorH / 2;                 // partea de jos a usii (local)
  const handleTopLocal = Math.min(doorH / 2, HANDLE_TOP_Y - bodyMidY);
  const handleH = handleTopLocal - handleBottomLocal;
  const handleCenterY = (handleBottomLocal + handleTopLocal) / 2;
  // Sub 60cm (0.60 in Three.js units cu S=0.01) = o singura usa
  const SINGLE_DOOR_THRESHOLD = 0.60;
  const singleDoor = MW < SINGLE_DOOR_THRESHOLD;

  if (singleDoor) {
    const doorW = MW - 0.004; // o singura usa, lasa cate 2mm la fiecare capat
    // Module adiacente se deschid in parti opuse: par (0,2,4) → hinge stg, impar (1,3,5) → hinge dr
    const hingeOnLeft = moduleIndex % 2 === 0;
    const hingeSide: -1 | 1 = hingeOnLeft ? -1 : 1;
    const hingeX = hingeOnLeft ? moduleLeftX + 0.001 : moduleRightX - 0.001;
    const handleX = hingeOnLeft ? doorW / 2 - 0.015 : -doorW / 2 + 0.015;
    return (
      <group>
        <HoverDoor
          hingeSide={hingeSide}
          hingePosition={[hingeX, bodyMidY, doorZ]}
          panelWidth={doorW}
        >
          <mesh castShadow>
            <boxGeometry args={[doorW, doorH, T]} />
            <meshStandardMaterial {...frontMatProps} />
            <Edges threshold={15} color="#2a2218" lineWidth={1} />
          </mesh>
          {/* maner vertical pe partea opusa balamalei - de la baza pana la 1100mm */}
          <mesh position={[handleX, handleCenterY, T / 2 + 0.005]}>
            <boxGeometry args={[0.005, handleH, 0.01]} />
            <meshStandardMaterial color={HANDLE_COLOR} metalness={0.4} roughness={0.45} />
          </mesh>
        </HoverDoor>
      </group>
    );
  }

  const doorW = MW / 2 - 0.002; // 2mm gap intre usi

  return (
    <group>
      {/* Left door — hinge on left edge of module, handle on inner side */}
      <HoverDoor
        hingeSide={-1}
        hingePosition={[moduleLeftX + 0.001, bodyMidY, doorZ]}
        panelWidth={doorW}
      >
        <mesh castShadow>
          <boxGeometry args={[doorW, doorH, T]} />
          <meshStandardMaterial {...frontMatProps} />
          <Edges threshold={15} color="#2a2218" lineWidth={1} />
        </mesh>
        {/* maner vertical pe marginea interioara - de la baza pana la 1100mm */}
        <mesh position={[doorW / 2 - 0.015, handleCenterY, T / 2 + 0.005]}>
          <boxGeometry args={[0.005, handleH, 0.01]} />
          <meshStandardMaterial color={HANDLE_COLOR} metalness={0.4} roughness={0.45} />
        </mesh>
      </HoverDoor>

      {/* Right door — hinge on right edge of module, handle on inner side */}
      <HoverDoor
        hingeSide={1}
        hingePosition={[moduleRightX - 0.001, bodyMidY, doorZ]}
        panelWidth={doorW}
      >
        <mesh castShadow>
          <boxGeometry args={[doorW, doorH, T]} />
          <meshStandardMaterial {...frontMatProps} />
          <Edges threshold={15} color="#2a2218" lineWidth={1} />
        </mesh>
        {/* maner vertical pe marginea interioara - de la baza pana la 1100mm */}
        <mesh position={[-doorW / 2 + 0.015, handleCenterY, T / 2 + 0.005]}>
          <boxGeometry args={[0.005, handleH, 0.01]} />
          <meshStandardMaterial color={HANDLE_COLOR} metalness={0.4} roughness={0.45} />
        </mesh>
      </HoverDoor>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────
// Side shelves extension (biblioteca laterala, deschidere in lateral)
// Structura: cutie lipita de lateralul dressingului, cu:
//  - Panou fata si panou spate (pe axa Z = ±D/2)
//  - Panou spate catre dressing (subtire)
//  - Top + bottom cap
//  - Separatoare verticale intre coloane (pe axa Z)
//  - Rafturi orizontale in fiecare coloana
// Deschiderea este pe axa X, spre exterior (stanga sau dreapta)
// ──────────────────────────────────────────────────────────────

/**
 * Calculeaza pozitiile rafturilor (ca fractii 0..1 intre innerBottom si innerTop)
 * pentru diverse layout-uri estetice. Respecta intotdeauna `n` = shelfCount.
 */
function shelfFractions(
  layout: 'uniform' | 'asimetric' | 'galerie' | 'vitrina',
  col: number,
  _cols: number,
  n: number
): number[] {
  const safeN = Math.max(1, Math.floor(n));
  if (layout === 'uniform') {
    return Array.from({ length: safeN }, (_, i) => (i + 1) / (safeN + 1));
  }
  if (layout === 'asimetric') {
    // Coloane pare: rafturi mai dese in partea de sus (ease-out)
    // Coloane impare: rafturi mai dese in partea de jos (ease-in)
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 1.8);
    const easeIn  = (t: number) => Math.pow(t, 1.8);
    const fn = col % 2 === 0 ? easeOut : easeIn;
    return Array.from({ length: safeN }, (_, i) => fn((i + 1) / (safeN + 1)));
  }
  if (layout === 'galerie') {
    // Pattern asimetric: alternanta de offset per raft, diferit per coloana
    // Baza uniforma + offset sinusoidal in functie de coloana si index
    const phase = (col % 3) * (Math.PI / 2.5);
    return Array.from({ length: safeN }, (_, i) => {
      const base = (i + 1) / (safeN + 1);
      const wave = Math.sin(i * 1.3 + phase) * 0.06;
      return Math.max(0.05, Math.min(0.95, base + wave));
    }).sort((a, b) => a - b);
  }
  if (layout === 'vitrina') {
    // Compartiment mare jos (~35%), apoi spatieri descrescatoare spre top
    if (safeN === 1) return [0.4];
    const bottom = 0.32;
    const remaining = 1 - bottom;
    const res: number[] = [bottom];
    let acc = bottom;
    // distribuim restul de (safeN-1) rafturi cu spatieri descrescatoare
    // gap_i = k * r^i, suma = remaining - margin
    const margin = 0.05;
    const target = remaining - margin;
    const rRatio = 0.82;
    // Suma serie geometrica: k * (1 - r^(n-1)) / (1 - r) = target
    const nGaps = safeN - 1;
    const sumR = (1 - Math.pow(rRatio, nGaps)) / (1 - rRatio);
    const k = target / sumR;
    for (let i = 0; i < nGaps; i++) {
      acc += k * Math.pow(rRatio, i);
      res.push(Math.min(0.95, acc));
    }
    return res;
  }
  return Array.from({ length: safeN }, (_, i) => (i + 1) / (safeN + 1));
}

function SideShelvesGroup({
  startX, side, columns, columnWidth, shelfCount,
  bodyY0, bodyH, D, T,
  bodyMatProps, bodyMatPropsH, frontMatProps,
  layout = 'uniform',
}: {
  startX: number;
  side: 'left' | 'right';
  columns: number;
  columnWidth: number;   // X-depth (cat iese biblioteca in afara)
  shelfCount: number;
  bodyY0: number;
  bodyH: number;
  D: number;
  T: number;
  bodyMatProps: any;
  bodyMatPropsH: any;
  frontMatProps: any;
  layout?: 'uniform' | 'asimetric' | 'galerie' | 'vitrina';
}) {
  const libDepthX = columnWidth;
  const centerX = startX + libDepthX / 2;
  const bodyMidY = bodyY0 + bodyH / 2;
  const topY = bodyY0 + bodyH;
  const backZ = -D / 2;

  // Separatoare interioare intre coloane: la pozitii Z = backZ + i*(D/columns), i=1..columns-1
  const zStep = D / columns;
  const separatorZs: number[] = [];
  for (let i = 1; i < columns; i++) separatorZs.push(backZ + i * zStep);

  // Rafturi per coloana
  const shelves: React.ReactNode[] = [];
  for (let c = 0; c < columns; c++) {
    // Prima coloana: incepe de la spate (+T pentru spatele bibliotecii)
    // Ultima coloana: se intinde pana la frontul bibliotecii (D/2 + T/2, dar fara sa intre in el)
    const colZMin = c === 0 ? backZ + T : backZ + c * zStep + T / 2;
    const colZMax = c === columns - 1 ? D / 2 + T / 2 - 0.002 : backZ + (c + 1) * zStep - T / 2;
    const innerZW = colZMax - colZMin;
    const innerCenterZ = (colZMin + colZMax) / 2;
    const innerBottomY = bodyY0 + T;
    const innerTopY = topY - T;
    const innerH = innerTopY - innerBottomY;
    // Raftul se extinde pe toata latimea bibliotecii (cu mic offset de siguranta)
    const shelfInnerW = libDepthX - T;
    const shelfCenterX = centerX;

    const fractions = shelfFractions(layout, c, columns, shelfCount);
    fractions.forEach((f, s) => {
      const sy = innerBottomY + innerH * f;
      shelves.push(
        <mesh
          key={`side-shelf-${c}-${s}`}
          position={[shelfCenterX, sy, innerCenterZ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[shelfInnerW, T, innerZW]} />
          <meshStandardMaterial {...bodyMatPropsH} />
          <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
        </mesh>
      );
    });
  }
  // Facade frontala: o singura placa in culoarea frontului, iar imediat in spate (suprapusa)
  // o placa identica in culoarea bibliotecii/corp.
  const frontFacadeZ = D / 2 + T / 2;          // placa din fata (culoare front)
  const backFacadeZ  = D / 2 - T / 2;          // placa suprapusa in spate (culoare corp)
  return (
    <group>
      {/* Panou FATA (vizibil) - culoarea frontului, la fel ca usile */}
      <mesh position={[centerX, bodyMidY, frontFacadeZ]} castShadow receiveShadow>
        <boxGeometry args={[libDepthX, bodyH - 0.004, T]} />
        <meshStandardMaterial {...frontMatProps} />
        <Edges threshold={15} color="#2a2218" lineWidth={1} />
      </mesh>
      {/* Panou suprapus in spatele fatadei - culoarea bibliotecii (corp), aceeasi dimensiune */}
      <mesh position={[centerX, bodyMidY, backFacadeZ]} castShadow receiveShadow>
        <boxGeometry args={[libDepthX, bodyH - 0.004, T]} />
        <meshStandardMaterial {...bodyMatProps} />
        <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
      </mesh>

      {/* SPATE individual al bibliotecii - panou complet de la podea la top,
          pozitionat la capatul din spate (Z = -D/2) */}
      {(() => {
        const backH = bodyY0 + bodyH;  // de la podea (Y=0) pana la top
        const backMidY = backH / 2;
        return (
          <mesh position={[centerX, backMidY, backZ + T / 2]} castShadow receiveShadow>
            <boxGeometry args={[libDepthX, backH, T]} />
            <meshStandardMaterial {...bodyMatProps} />
            <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
          </mesh>
        );
      })()}

      {/* PANOU LATERAL pe partea unde biblioteca se lipeste de modul -
          perete vertical individual, de la podea la top */}
      {(() => {
        const panelH = bodyY0 + bodyH;
        const panelMidY = panelH / 2;
        // Partea interioara: pentru 'left' = fata dreapta (X mare); pentru 'right' = fata stanga (X mic)
        const innerX = side === 'left' ? startX + libDepthX - T / 2 : startX + T / 2;
        return (
          <mesh position={[innerX, panelMidY, 0]} castShadow receiveShadow>
            <boxGeometry args={[T, panelH, D]} />
            <meshStandardMaterial {...bodyMatProps} />
            <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
          </mesh>
        );
      })()}



      {/* Separatoare verticale intre coloane (pe Z) */}
      {separatorZs.map((z, i) => (
        <mesh key={`sep-${i}`} position={[centerX, bodyMidY, z]} castShadow receiveShadow>
          <boxGeometry args={[libDepthX, bodyH, T]} />
          <meshStandardMaterial {...bodyMatProps} />
          <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
        </mesh>
      ))}

      {/* Rafturi */}
      {shelves}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// DimensionsOverlay — cotare tehnică stil schiță tâmplar
// ═══════════════════════════════════════════════════════════════════════════
const DIM_INK = '#0f172a';

function DimLabel({
  text,
  position,
  rotate = false,
}: {
  text: string;
  position: [number, number, number];
  rotate?: boolean;
}) {
  return (
    <Html position={position} center sprite zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          color: DIM_INK,
          fontSize: 9,
          fontWeight: 600,
          fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace",
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
          padding: '0 3px',
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 1,
          textShadow: '0 0 2px #fff, 0 0 2px #fff',
          transform: rotate ? 'rotate(-90deg)' : undefined,
        }}
      >
        {text}
      </div>
    </Html>
  );
}

function DimSeg({
  from,
  to,
  width = 1,
  dashed = false,
}: {
  from: [number, number, number];
  to: [number, number, number];
  width?: number;
  dashed?: boolean;
}) {
  const line = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...from),
      new THREE.Vector3(...to),
    ]);
    const mat = dashed
      ? new THREE.LineDashedMaterial({ color: DIM_INK, dashSize: 0.015, gapSize: 0.012, linewidth: width, depthTest: false })
      : new THREE.LineBasicMaterial({ color: DIM_INK, linewidth: width, depthTest: false });
    const l = new THREE.Line(geom, mat);
    if (dashed) l.computeLineDistances();
    l.renderOrder = 999;
    return l;
  }, [from, to, width, dashed]);
  return <primitive object={line} />;
}

interface DimensionsOverlayProps {
  config: ReturnType<typeof useDressingUnitStore.getState>['config'];
  S: number;
  T: number;
  H: number;
  D: number;
  PL: number;
  fullLeftX: number;
  modulesLeftX: number;
  modulesRightX: number;
  modulesW: number;
  leftSideW: number;
  rightSideW: number;
  moduleStarts: number[];
  moduleWidths: number[];
  bodyY0: number;
  bodyTotalH: number;
}

function DimensionsOverlay(p: DimensionsOverlayProps) {
  const {
    config, S, T, D, fullLeftX, modulesLeftX, modulesRightX, modulesW,
    leftSideW, rightSideW, moduleStarts, moduleWidths, bodyY0, bodyTotalH,
  } = p;

  const zFront = D / 2;
  const zDim = zFront + 0.11;   // linia de cotă (lățimi) în față
  const zExtGap = 0.02;         // spațiu gol înainte de extensie
  const TICK = 0.014;           // mărimea serifului
  const yGround = 0.003;        // puțin deasupra podelei pt. linia de lățimi

  // Linia chain pentru LĂȚIMI — toți modulii + bibliotecile laterale, cu serife la fiecare granicță
  // Colectăm pozițiile X ale granițelor (start de la fullLeft, apoi după bibl. stg., apoi după fiecare modul, apoi după bibl. dr.)
  const boundaries: { x: number; label?: string }[] = [];
  let accX = fullLeftX;
  if (leftSideW > 0) {
    boundaries.push({ x: accX, label: undefined });
    accX += leftSideW;
    boundaries.push({ x: accX });
    // segment anterior primește label
    boundaries[boundaries.length - 2].label = `${Math.round(config.sideShelves.columnWidth * 10)}`;
  } else {
    boundaries.push({ x: accX });
  }
  moduleWidths.forEach((mw) => {
    accX += mw;
    boundaries.push({ x: accX, label: undefined });
  });
  if (rightSideW > 0) {
    accX += rightSideW;
    boundaries.push({ x: accX });
    boundaries[boundaries.length - 2].label = `${Math.round(config.sideShelves.columnWidth * 10)}`;
  }
  // Atribuie label lățime pentru fiecare segment de modul
  // Indexul primului modul în boundaries: 1 dacă leftSide e 0, 2 dacă leftSide există? (după primul push avem 1 el., apoi +1 bibl → 2 el., apoi modul1 → 3 el.)
  {
    const startIdx = leftSideW > 0 ? 2 : 1;
    moduleWidths.forEach((mw, i) => {
      boundaries[startIdx + i - 1].label = `${Math.round(mw / S * 10)}`;
    });
  }

  return (
    <group renderOrder={999}>
      {/* ═════ LINIA DE COTĂ — LĂȚIMI (jos, în față) ═════ */}
      {/* Linia continuă */}
      <DimSeg from={[fullLeftX, yGround, zDim]} to={[fullLeftX + modulesW + leftSideW + rightSideW, yGround, zDim]} />
      {/* Extensii + serife la fiecare graniță */}
      {boundaries.map((b, i) => (
        <group key={`bx-${i}`}>
          {/* Linia de extensie (dashed) din podea până sub linia de cotă */}
          <DimSeg
            from={[b.x, yGround, zFront + zExtGap]}
            to={[b.x, yGround, zDim + TICK]}
            dashed
          />
          {/* Serif la 45° pe linia de cotă */}
          <DimSeg
            from={[b.x - TICK, yGround, zDim + TICK]}
            to={[b.x + TICK, yGround, zDim - TICK]}
          />
        </group>
      ))}
      {/* Numere între serife */}
      {boundaries.map((b, i) => {
        if (!b.label || i + 1 >= boundaries.length) return null;
        const next = boundaries[i + 1];
        const midX = (b.x + next.x) / 2;
        return <DimLabel key={`wlbl-${i}`} text={b.label} position={[midX, yGround, zDim]} />;
      })}

      {/* ═════ COTARE ÎNĂLȚIMI — pe fața frontală a fiecărui modul ═════ */}
      {config.modules.map((m, i) => {
        const mx = moduleStarts[i];
        const mw = moduleWidths[i];

        const topCompH = m.hasTopCompartment ? m.topCompartmentHeight * S : 0;
        const mainH = bodyTotalH - topCompH;
        const innerBottom = bodyY0 + T;
        const innerTop = bodyY0 + mainH - T;

        // Chain vertical pe front, aproape de panoul drept al modulului (dar în interior, încă vizibil)
        const xDim = mx + mw - 0.015;
        const zF = zFront + 0.002;

        // Seriile verticale
        const sections = m.sections || [];
        const totalSecCm = sections.reduce((a, s) => a + s.heightCm, 0) || 1;
        const verticalBoundaries: number[] = [innerBottom];
        let accY = innerBottom;
        const segLabels: { yMid: number; label: string }[] = [];
        sections.forEach((sec) => {
          const segH = (sec.heightCm / totalSecCm) * (innerTop - innerBottom);
          const y1 = accY + segH;
          verticalBoundaries.push(y1);
          segLabels.push({ yMid: (accY + y1) / 2, label: `${sec.heightCm * 10}` });
          accY = y1;
        });

        return (
          <group key={`dim-${i}`}>
            {/* Linia de cotă verticală */}
            <DimSeg from={[xDim, innerBottom, zF]} to={[xDim, innerTop, zF]} />
            {/* Extensii + serife la fiecare graniță */}
            {verticalBoundaries.map((y, j) => (
              <group key={`vy-${i}-${j}`}>
                {/* Serif 45° */}
                <DimSeg
                  from={[xDim - TICK, y - TICK, zF]}
                  to={[xDim + TICK, y + TICK, zF]}
                />
              </group>
            ))}
            {/* Etichete între serife (înălțimea secțiunii) */}
            {segLabels.map((s, j) => (
              <DimLabel key={`vlbl-${i}-${j}`} text={s.label} position={[xDim - 0.025, s.yMid, zF]} />
            ))}

            {/* Compartiment superior (chain separat deasupra) */}
            {m.hasTopCompartment && topCompH > 0 && (
              <group>
                <DimSeg from={[xDim, bodyY0 + mainH, zF]} to={[xDim, bodyY0 + mainH + topCompH, zF]} />
                <DimSeg from={[xDim - TICK, bodyY0 + mainH - TICK, zF]} to={[xDim + TICK, bodyY0 + mainH + TICK, zF]} />
                <DimSeg from={[xDim - TICK, bodyY0 + mainH + topCompH - TICK, zF]} to={[xDim + TICK, bodyY0 + mainH + topCompH + TICK, zF]} />
                <DimLabel
                  text={`${m.topCompartmentHeight * 10}`}
                  position={[xDim - 0.025, bodyY0 + mainH + topCompH / 2, zF]}
                />
              </group>
            )}
          </group>
        );
      })}

      {/* ═════ COTĂ PLINTĂ (sub modul, pe stânga jos) ═════ */}
      {config.plinthHeight > 0 && (
        <group>
          <DimSeg
            from={[modulesLeftX + 0.02, 0, zFront + 0.015]}
            to={[modulesLeftX + 0.02, config.plinthHeight * S, zFront + 0.015]}
          />
          <DimSeg
            from={[modulesLeftX + 0.02 - TICK, -TICK, zFront + 0.015]}
            to={[modulesLeftX + 0.02 + TICK, TICK, zFront + 0.015]}
          />
          <DimSeg
            from={[modulesLeftX + 0.02 - TICK, config.plinthHeight * S - TICK, zFront + 0.015]}
            to={[modulesLeftX + 0.02 + TICK, config.plinthHeight * S + TICK, zFront + 0.015]}
          />
          <DimLabel
            text={`${config.plinthHeight * 10}`}
            position={[modulesLeftX + 0.04, (config.plinthHeight * S) / 2, zFront + 0.015]}
          />
        </group>
      )}
    </group>
  );
}
