'use client';

import React, { Suspense, useMemo, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Html, Line } from '@react-three/drei';
import { EffectComposer, SSAO, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import Link from 'next/link';
import { Maximize2, Minimize2, Ruler, Eye, EyeOff } from 'lucide-react';
import DressingUnitPanel from '@/components/configurator/DressingUnitPanel';
import { useDressingUnitStore } from '@/store/dressingUnitStore';

const DressingUnitModel = dynamic(
  () => import('@/components/configurator/DressingUnitModel'),
  { ssr: false },
);

function DimensionGuides({ widthCm, heightCm, depthCm }: { widthCm: number; heightCm: number; depthCm: number }) {
  const scale = 0.01;
  const w = widthCm * scale;
  const h = heightCm * scale;
  const d = depthCm * scale;

  // Blueprint stil tehnic
  const INK = '#0f172a';            // cerneală — navy foarte închis
  const EXT_GAP = 0.03;             // spațiu gol între obiect și începutul liniei de extensie
  const OFFSET = 0.18;              // cât de departe de obiect stă linia de cotă
  const TICK = 0.018;               // mărimea serifului (tick la 45°)

  const labelStyle: React.CSSProperties = {
    color: INK,
    fontSize: '10px',
    fontWeight: 600,
    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', Consolas, monospace",
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    padding: '1px 4px',
    background: 'rgba(255,255,255,0.92)',
    borderRadius: 2,
    textShadow: '0 0 2px #fff, 0 0 2px #fff',
    pointerEvents: 'none',
  };

  // Coordonate reper
  const zLine = d / 2 + OFFSET;        // linia de cotă pentru lățime — față
  const xLineL = -w / 2 - OFFSET;      // linia de cotă pentru înălțime — stânga
  const xLineR = w / 2 + OFFSET;       // linia de cotă pentru adâncime — dreapta
  const yBase = 0.001;

  return (
    <>
      {/* ═════ LĂȚIME (față, sus pe sol) ═════ */}
      {/* Linii de extensie (din colțurile obiectului până la linia de cotă) */}
      <Line points={[[-w / 2, yBase, d / 2 + EXT_GAP], [-w / 2, yBase, zLine + TICK]]} color={INK} lineWidth={0.8} />
      <Line points={[[ w / 2, yBase, d / 2 + EXT_GAP], [ w / 2, yBase, zLine + TICK]]} color={INK} lineWidth={0.8} />
      {/* Linia de cotă */}
      <Line points={[[-w / 2, yBase, zLine], [w / 2, yBase, zLine]]} color={INK} lineWidth={1} />
      {/* Serife /  \ la capete */}
      <Line points={[[-w / 2 - TICK, yBase, zLine + TICK], [-w / 2 + TICK, yBase, zLine - TICK]]} color={INK} lineWidth={1} />
      <Line points={[[ w / 2 - TICK, yBase, zLine + TICK], [ w / 2 + TICK, yBase, zLine - TICK]]} color={INK} lineWidth={1} />
      <Html position={[0, yBase, zLine]} center sprite zIndexRange={[100, 0]}>
        <div style={labelStyle}>{Math.round(widthCm * 10)}</div>
      </Html>

      {/* ═════ ÎNĂLȚIME (stânga) ═════ */}
      <Line points={[[-w / 2 - EXT_GAP, 0, d / 2], [xLineL - TICK, 0, d / 2]]} color={INK} lineWidth={0.8} />
      <Line points={[[-w / 2 - EXT_GAP, h, d / 2], [xLineL - TICK, h, d / 2]]} color={INK} lineWidth={0.8} />
      <Line points={[[xLineL, 0, d / 2], [xLineL, h, d / 2]]} color={INK} lineWidth={1} />
      <Line points={[[xLineL - TICK, -TICK, d / 2], [xLineL + TICK, TICK, d / 2]]} color={INK} lineWidth={1} />
      <Line points={[[xLineL - TICK, h - TICK, d / 2], [xLineL + TICK, h + TICK, d / 2]]} color={INK} lineWidth={1} />
      <Html position={[xLineL, h / 2, d / 2]} center sprite zIndexRange={[100, 0]}>
        <div style={labelStyle}>{heightCm * 10}</div>
      </Html>

      {/* ═════ ADÂNCIME (dreapta, orizontal pe sol) ═════ */}
      <Line points={[[w / 2 + EXT_GAP, yBase, -d / 2], [xLineR + TICK, yBase, -d / 2]]} color={INK} lineWidth={0.8} />
      <Line points={[[w / 2 + EXT_GAP, yBase,  d / 2], [xLineR + TICK, yBase,  d / 2]]} color={INK} lineWidth={0.8} />
      <Line points={[[xLineR, yBase, -d / 2], [xLineR, yBase, d / 2]]} color={INK} lineWidth={1} />
      <Line points={[[xLineR - TICK, yBase, -d / 2 - TICK], [xLineR + TICK, yBase, -d / 2 + TICK]]} color={INK} lineWidth={1} />
      <Line points={[[xLineR - TICK, yBase,  d / 2 - TICK], [xLineR + TICK, yBase,  d / 2 + TICK]]} color={INK} lineWidth={1} />
      <Html position={[xLineR, yBase, 0]} center sprite zIndexRange={[100, 0]}>
        <div style={labelStyle}>{Math.round(depthCm * 10)}</div>
      </Html>
    </>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  const config = useDressingUnitStore((s) => s.config);
  const showDimensions = useDressingUnitStore((s) => s.showDimensions);
  const floorTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/textures/textura_parchet.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4.5, 4.5);
    texture.anisotropy = isMobile ? 2 : 8;
    return texture;
  }, [isMobile]);
  const wallTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/textures/textura_perete.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.anisotropy = isMobile ? 2 : 8;
    return texture;
  }, [isMobile]);

  const S = 0.01;
  const depthM = config.depth * S;
  const wallFrontZ = -0.58;
  const furnitureZ = wallFrontZ + depthM / 2 + 0.008;

  return (
    <>
      <PerspectiveCamera makeDefault position={[3.5, 1.8, 3.5]} fov={38} />

      <ambientLight intensity={0.35} color="#ffffff" />
      <hemisphereLight intensity={0.15} color="#ffffff" groundColor="#f0eee8" />
      <directionalLight
        position={[4, 9, 6]} intensity={0.78} castShadow
        shadow-mapSize={isMobile ? [1024, 1024] : [4096, 4096]}
        shadow-camera-far={20}
        shadow-camera-left={-3} shadow-camera-right={3}
        shadow-camera-top={3} shadow-camera-bottom={-3}
        shadow-bias={-0.00008} shadow-normalBias={0.015}
      />
      <directionalLight position={[-4, 3, 4]} intensity={0.08} color="#ffffff" />
      <spotLight
        position={[0, 4.5, 1.5]} angle={0.55} penumbra={0.6}
        intensity={0.62} distance={9}
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
        shadow-bias={-0.0002} shadow-normalBias={0.01}
        color="#ffffff"
      />
      <spotLight
        position={[1.0, 2.0, 3.2]} angle={0.42} penumbra={0.55}
        intensity={0.36} distance={7}
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
        shadow-bias={-0.0002} shadow-normalBias={0.01}
        color="#ffffff"
      />
      <spotLight
        position={[-2.5, 3.5, -2.0]} angle={0.28} penumbra={0.8}
        intensity={0.2} distance={8} castShadow={false} color="#ffffff"
      />
      <pointLight position={[0, 1.4, 0.6]} intensity={0.03} distance={2.5} color="#ffffff" />
      <spotLight
        position={[0, 3.9, -0.2]} angle={0.95} penumbra={0.72}
        intensity={0.22} distance={12} castShadow={false} color="#f5f7fa"
      />
      <Environment preset="studio" />

      <mesh position={[0, 1.6, -0.64]} receiveShadow>
        <boxGeometry args={[9, 4.4, 0.12]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" emissive="#ffffff" emissiveMap={wallTexture} emissiveIntensity={0.55} roughness={1} metalness={0} envMapIntensity={0} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[9, 0.04, 9]} />
        <meshStandardMaterial color="#c8bfae" map={floorTexture} roughness={0.96} metalness={0.0} envMapIntensity={0.08} />
      </mesh>

      <group position={[0, 0, furnitureZ]}>
        <DressingUnitModel />
        {showDimensions && (
          <DimensionGuides
            widthCm={config.totalWidth}
            heightCm={config.totalHeight}
            depthCm={config.depth}
          />
        )}
      </group>

      <ContactShadows position={[0, 0.001, 0]} opacity={0.52} scale={12} blur={1.5} far={5} color="#2a2018" />
      <ContactShadows position={[0, 0.002, 0.18]} opacity={0.28} scale={9} blur={1.1} far={3.2} color="#1a1510" />

      <OrbitControls
        enablePan enableZoom enableRotate enableDamping
        dampingFactor={0.08} rotateSpeed={0.7} zoomSpeed={0.9}
        minPolarAngle={Math.PI / 5.5} maxPolarAngle={Math.PI / 1.95}
        minAzimuthAngle={-Math.PI / 1.8} maxAzimuthAngle={Math.PI / 1.8}
        minDistance={1.5} maxDistance={9}
        target={[0, 1.2, 0]}
        panSpeed={0.7}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      />

      {!isMobile && (
        <EffectComposer multisampling={8}>
          <SSAO
            blendFunction={BlendFunction.MULTIPLY}
            samples={32} radius={0.03} intensity={1}
            luminanceInfluence={0.88} bias={0.03} resolutionScale={0.75}
            worldDistanceThreshold={1} worldDistanceFalloff={0.1}
            worldProximityThreshold={0.0} worldProximityFalloff={0.0}
          />
          <SMAA />
        </EffectComposer>
      )}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f2f0ec] via-[#ece9e4] to-[#e6e3dd]">
      <div className="text-center">
        <div className="w-12 h-12 border-[3px] border-brand-beige/30 border-t-brand-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-charcoal/40 text-[12px] tracking-wide font-medium">Se încărcă modelul 3D...</p>
        <p className="text-brand-charcoal/25 text-[10px] mt-1">Pregătim scena pentru tine</p>
      </div>
    </div>
  );
}

export default function CorpDressingPage() {
  const config = useDressingUnitStore((s) => s.config);
  const showDimensions = useDressingUnitStore((s) => s.showDimensions);
  const toggleShowDimensions = useDressingUnitStore((s) => s.toggleShowDimensions);
  const toggleAllDoors = useDressingUnitStore((s) => s.toggleAllDoors);
  const anyDoors = config.modules.some((m) => m.hasDoors);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState('100dvh');

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const measure = () => {
      if (containerRef.current) {
        const top = containerRef.current.getBoundingClientRect().top;
        setContainerHeight(`calc(100dvh - ${top}px)`);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('resize', measure);
    };
  }, []);

  const toggleExpand = useCallback(() => setIsCanvasExpanded((v) => !v), []);

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight }}
      className="pt-[env(safe-area-inset-top)] flex flex-col items-center overflow-hidden bg-[#F5F3EE]"
    >
      <div className="hidden lg:flex items-center gap-1.5 w-[80vw] px-1 pb-2 text-[12px] text-brand-charcoal/45">
        <Link href="/catalog" className="hover:text-brand-accent transition-colors">Catalog</Link>
        <span>/</span>
        <Link href="/catalog?categorie=dressing" className="hover:text-brand-accent transition-colors">Dressing</Link>
        <span>/</span>
        <span className="text-brand-accent font-medium">Corp Dressing Modular</span>
      </div>

      <div className="w-full h-full lg:w-[80vw] lg:h-[75vh] lg:rounded-2xl lg:shadow-2xl lg:border lg:border-brand-beige/30 lg:overflow-hidden flex flex-col lg:flex-row">
        <div
          className={`relative transition-all duration-300 ease-out shrink-0 ${
            isMobile ? 'h-[35dvh]' : isCanvasExpanded ? 'flex-1' : 'lg:flex-[3]'
          } lg:h-auto`}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f2f0ec] via-[#ece9e4] to-[#e6e3dd] lg:m-2.5 lg:rounded-xl overflow-hidden">
              <div className="absolute top-2.5 left-2.5 lg:top-3 lg:left-3 z-10 flex items-center gap-2">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 lg:px-3.5 lg:py-2 shadow-lg border border-white/40 transition-all duration-200">
                  <div className="flex items-center gap-1.5 text-[10px] lg:text-[11px] font-semibold text-brand-charcoal/65 tabular-nums">
                    <span className="text-brand-charcoal/35">L</span><span>{Math.round(config.totalWidth)}</span>
                    <span className="text-brand-charcoal/20">×</span>
                    <span className="text-brand-charcoal/35">H</span><span>{config.totalHeight}</span>
                    <span className="text-brand-charcoal/20">×</span>
                    <span className="text-brand-charcoal/35">A</span><span>{config.depth}</span>
                    <span className="text-brand-charcoal/35 text-[9px] lg:text-[10px] font-normal">cm</span>
                  </div>
                </div>
                <button
                  onClick={toggleShowDimensions}
                  title={showDimensions ? 'Ascunde dimensiunile' : 'Afișează dimensiunile'}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 lg:px-3 lg:py-2 shadow-lg border transition-all duration-200 backdrop-blur-xl text-[10px] lg:text-[11px] font-semibold ${
                    showDimensions
                      ? 'bg-brand-accent text-white border-brand-accent/60 hover:bg-brand-accent/90'
                      : 'bg-white/70 text-brand-charcoal/65 border-white/40 hover:bg-white/90'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Dimensiuni</span>
                </button>
                <button
                  onClick={toggleAllDoors}
                  title={anyDoors ? 'Ascunde fronturile' : 'Afi\u0219eaz\u0103 fronturile'}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 lg:px-3 lg:py-2 shadow-lg border transition-all duration-200 backdrop-blur-xl text-[10px] lg:text-[11px] font-semibold ${
                    anyDoors
                      ? 'bg-brand-accent text-white border-brand-accent/60 hover:bg-brand-accent/90'
                      : 'bg-white/70 text-brand-charcoal/65 border-white/40 hover:bg-white/90'
                  }`}
                >
                  {anyDoors ? <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <EyeOff className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
                  <span className="hidden sm:inline">Fronturi</span>
                </button>
              </div>

              <button
                onClick={toggleExpand}
                className="hidden lg:flex absolute top-3 right-3 z-10 w-9 h-9 bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/40 items-center justify-center text-brand-charcoal/40 hover:text-brand-charcoal/70 hover:bg-white/90 transition-all duration-200"
                title={isCanvasExpanded ? 'Micșorează' : 'Mărește'}
              >
                {isCanvasExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <Suspense fallback={<LoadingFallback />}>
                <Canvas
                  shadows
                  dpr={isMobile ? [1, 1.5] : [1, 2]}
                  gl={{ antialias: true }}
                  onCreated={({ gl }) => {
                    gl.toneMapping = THREE.NoToneMapping;
                    gl.toneMappingExposure = 0.74;
                    gl.shadowMap.type = THREE.PCFSoftShadowMap;
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                  }}
                  className="configurator-canvas"
                >
                  <Scene isMobile={isMobile} />
                </Canvas>
              </Suspense>

              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 hidden lg:block">
                <div className="bg-white/50 backdrop-blur-xl rounded-full px-4 py-1.5 text-[11px] text-brand-charcoal/35 border border-white/30 shadow-sm">
                  �️ Click și trage pentru a roti • Click pe un modul pentru a-l edita
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex flex-col transition-all duration-300 ease-out ${
            isMobile
              ? 'flex-1 min-h-0 border-t border-brand-beige/20'
              : isCanvasExpanded ? 'lg:flex-[1]' : 'lg:flex-[1.2]'
          } bg-white lg:border-l border-brand-beige/30`}
        >
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 flex flex-col overflow-hidden px-4 pb-3 lg:px-4 lg:pb-3">
              <DressingUnitPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
