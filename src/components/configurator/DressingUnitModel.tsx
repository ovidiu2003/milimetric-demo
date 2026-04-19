'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
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
  useTextures();

  const bodyMaterial = getMaterialById(config.bodyMaterialId);
  const frontMaterial = getMaterialById(config.frontMaterialId);

  const bodyColor = bodyMaterial?.color || '#c9a96e';
  const frontColor = frontMaterial?.color || '#f5f5f5';

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
          bodyMatProps={bodyMatProps}
          bodyMatPropsH={bodyMatPropsH}
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
          bodyMatProps={bodyMatProps}
          bodyMatPropsH={bodyMatPropsH}
          frontMatProps={frontMatProps}
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

  return (
    <group>
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
  // Suma inaltimilor sectiunilor in unitati Three
  const totalSectCm = sections.reduce((s, sec) => s + Math.max(1, sec.heightCm), 0);
  const scale = Math.min(1, innerH / (totalSectCm * S)); // scalam daca depasim (pastram proportiile)
  const effectiveScale = totalSectCm * S <= innerH ? (innerH / (totalSectCm * S)) : scale;
  // Strategie: sectiunile umplu intotdeauna interiorul (proportional), ca sa nu ramana goluri ciudate
  // Daca user-ul vrea gol, adauga sectiune 'empty'

  let cursorY = innerBottomY; // incepem de la baza interiorului
  const nodes: React.ReactNode[] = [];

  sections.forEach((sec, i) => {
    const h = Math.max(1, sec.heightCm) * S * effectiveScale;
    const y0 = cursorY;
    const y1 = y0 + h;
    const yMid = (y0 + y1) / 2;

    // Separator orizontal la partea de sus a sectiunii (exceptand ultima)
    const isLast = i === sections.length - 1;

    switch (sec.type) {
      case 'shelves': {
        const count = Math.max(0, Math.min(6, sec.shelfCount ?? 2));
        if (count > 0) {
          const spacing = h / (count + 1);
          for (let k = 0; k < count; k++) {
            const y = y0 + (k + 1) * spacing;
            nodes.push(
              <mesh key={`${sec.id}-sh-${k}`} position={[innerCenterX, y, 0]} castShadow receiveShadow>
                <boxGeometry args={[innerW, T, D - T]} />
                <meshStandardMaterial {...bodyMatPropsH} />
                <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
              </mesh>
            );
          }
        }
        break;
      }
      case 'hanging-rod': {
        // Bara la ~85% din inaltimea sectiunii
        const barY = y0 + h * 0.85;
        nodes.push(
          <mesh key={`${sec.id}-bar`} position={[innerCenterX, barY, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, innerW, 16]} />
            <meshStandardMaterial color="#b8b8b8" metalness={0.7} roughness={0.3} />
          </mesh>
        );
        break;
      }
      case 'drawers': {
        const dc = Math.max(1, Math.min(5, sec.drawerCount ?? 2));
        const gap = 0.002;
        const drawerH = (h - (dc - 1) * gap) / dc;
        for (let k = 0; k < dc; k++) {
          const dY = y0 + drawerH / 2 + k * (drawerH + gap);
          nodes.push(
            <HoverDrawer key={`${sec.id}-dw-${k}`} panelWidth={innerW}>
              <mesh position={[innerCenterX, dY, D / 2 - T / 2]} castShadow>
                <boxGeometry args={[innerW - 0.01, drawerH - 0.004, T]} />
                <meshStandardMaterial {...frontMatProps} />
                <Edges threshold={15} color="#2a2218" lineWidth={1} />
              </mesh>
              {/* maner metalic orizontal mic */}
              <mesh position={[innerCenterX, dY, D / 2 + T / 2 + 0.003]}>
                <boxGeometry args={[Math.min(0.16, innerW * 0.3), 0.008, 0.006]} />
                <meshStandardMaterial color={HANDLE_COLOR} metalness={0.5} roughness={0.4} />
              </mesh>
            </HoverDrawer>
          );
        }
        break;
      }
      case 'empty':
      default:
        // compartiment gol — fara continut
        break;
    }

    // Separator orizontal (polita) la tranzitia intre sectiuni
    if (!isLast) {
      nodes.push(
        <mesh key={`${sec.id}-sep`} position={[innerCenterX, y1, 0]} castShadow receiveShadow>
          <boxGeometry args={[innerW, T, D - T]} />
          <meshStandardMaterial {...bodyMatPropsH} />
          <Edges threshold={15} color="#3a3228" lineWidth={0.6} />
        </mesh>
      );
    }

    cursorY = y1 + (isLast ? 0 : T);
  });

  return <group>{nodes}</group>;
}

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
  frontMatProps, HANDLE_COLOR,
}: {
  moduleLeftX: number; moduleRightX: number; moduleCenterX: number;
  bodyY0: number; bodyH: number; bodyMidY: number;
  MW: number; D: number; T: number;
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
    return (
      <group>
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
          {/* maner vertical pe partea opusa balamalei - de la baza pana la 1100mm */}
          <mesh position={[doorW / 2 - 0.015, handleCenterY, T / 2 + 0.005]}>
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
  return (
    <group>
      {/* Panou FATA - facade in culoarea frontului (ca usile),
          pozitionat in acelasi plan cu usile dressingului (D/2 + T/2),
          pe toata inaltimea (de la podea la varf, fara plinta) */}
      <mesh position={[centerX, bodyMidY, D / 2 + T / 2]} castShadow receiveShadow>
        <boxGeometry args={[libDepthX, bodyH - 0.004, T]} />
        <meshStandardMaterial {...frontMatProps} />
        <Edges threshold={15} color="#2a2218" lineWidth={1} />
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
