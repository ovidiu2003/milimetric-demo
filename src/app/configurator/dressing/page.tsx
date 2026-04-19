'use client';

import React, { Suspense, useMemo, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Html, Line } from '@react-three/drei';
import { EffectComposer, SSAO, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import Link from 'next/link';
import { Maximize2, Minimize2 } from 'lucide-react';
import DressingPanel from '@/components/configurator/DressingPanel';
import { useDressingStore } from '@/store/dressingStore';

// Dynamic import for 3D model (avoids SSR)
const DressingModel = dynamic(
  () => import('@/components/configurator/DressingModel'),
  { ssr: false },
);

function DimensionGuides({ widthCm, heightCm, depthCm }: { widthCm: number; heightCm: number; depthCm: number }) {
  const scale = 0.01;
  const w = widthCm * scale;
  const h = heightCm * scale;
  const d = depthCm * scale;
  const offset = 0.12;
  const yGuide = 0.04;
  const arrowLen = 0.02;
  const arrowWing = 0.01;
  const widthColor = '#c2410c';
  const heightColor = '#166534';
  const depthColor = '#1d4ed8';

  const labelStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(31,41,55,0.2)',
    borderRadius: '6px',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: 400,
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontVariantNumeric: 'tabular-nums',
    color: '#111827',
    whiteSpace: 'nowrap',
  };

  return (
    <>
      <Line points={[[-w / 2, yGuide, d / 2 + offset], [w / 2, yGuide, d / 2 + offset]]} color={widthColor} lineWidth={1} />
      <Line points={[[-w / 2, yGuide, d / 2 + offset], [-w / 2 + arrowLen, yGuide, d / 2 + offset + arrowWing]]} color={widthColor} lineWidth={1} />
      <Line points={[[-w / 2, yGuide, d / 2 + offset], [-w / 2 + arrowLen, yGuide, d / 2 + offset - arrowWing]]} color={widthColor} lineWidth={1} />
      <Line points={[[w / 2, yGuide, d / 2 + offset], [w / 2 - arrowLen, yGuide, d / 2 + offset + arrowWing]]} color={widthColor} lineWidth={1} />
      <Line points={[[w / 2, yGuide, d / 2 + offset], [w / 2 - arrowLen, yGuide, d / 2 + offset - arrowWing]]} color={widthColor} lineWidth={1} />
      <Html position={[0, yGuide + 0.03, d / 2 + offset]} center sprite>
        <div style={{ ...labelStyle, borderColor: 'rgba(194,65,12,0.35)' }}>L {widthCm * 10} mm</div>
      </Html>

      <Line points={[[-w / 2 - offset, 0, d / 2 + offset], [-w / 2 - offset, h, d / 2 + offset]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, 0, d / 2 + offset], [-w / 2 - offset, arrowLen, d / 2 + offset + arrowWing]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, 0, d / 2 + offset], [-w / 2 - offset, arrowLen, d / 2 + offset - arrowWing]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, h, d / 2 + offset], [-w / 2 - offset, h - arrowLen, d / 2 + offset + arrowWing]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, h, d / 2 + offset], [-w / 2 - offset, h - arrowLen, d / 2 + offset - arrowWing]]} color={heightColor} lineWidth={1} />
      <Html position={[-w / 2 - offset, h / 2, d / 2 + offset + 0.03]} center sprite>
        <div style={{ ...labelStyle, borderColor: 'rgba(22,101,52,0.35)' }}>H {heightCm * 10} mm</div>
      </Html>

      <Line points={[[w / 2 + offset, yGuide, -d / 2], [w / 2 + offset, yGuide, d / 2]]} color={depthColor} lineWidth={1} />
      <Line points={[[w / 2 + offset, yGuide, -d / 2], [w / 2 + offset + arrowWing, yGuide, -d / 2 + arrowLen]]} color={depthColor} lineWidth={1} />
      <Line points={[[w / 2 + offset, yGuide, -d / 2], [w / 2 + offset - arrowWing, yGuide, -d / 2 + arrowLen]]} color={depthColor} lineWidth={1} />
      <Line points={[[w / 2 + offset, yGuide, d / 2], [w / 2 + offset + arrowWing, yGuide, d / 2 - arrowLen]]} color={depthColor} lineWidth={1} />
      <Line points={[[w / 2 + offset, yGuide, d / 2], [w / 2 + offset - arrowWing, yGuide, d / 2 - arrowLen]]} color={depthColor} lineWidth={1} />
      <Html position={[w / 2 + offset + 0.03, yGuide + 0.02, 0]} center sprite>
        <div style={{ ...labelStyle, borderColor: 'rgba(29,78,216,0.35)' }}>A {depthCm * 10} mm</div>
      </Html>
    </>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  const config = useDressingStore((s) => s.config);
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

  // Camera target: center of the unit
  const targetY = (config.totalHeight * 0.01) / 2;
  const dist = Math.max(config.totalWidth * 0.01, config.totalHeight * 0.01, config.depth * 0.01) * 1.5;

  return (
    <group>
      {/* Lights */}
      <PerspectiveCamera makeDefault position={[dist, targetY, dist * 1.2]} fov={35} />
      <OrbitControls target={[0, targetY, 0]} minDistance={dist * 0.5} maxDistance={dist * 3} minPolarAngle={0.3} maxPolarAngle={Math.PI - 0.3} />
      <Environment preset="studio" blur={0.5} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />

      {/* Scene */}
      <DressingModel />
      <DimensionGuides widthCm={config.totalWidth} heightCm={config.totalHeight} depthCm={config.depth} />

      {/* Environment */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial map={floorTexture} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, -8]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial map={wallTexture} />
      </mesh>

      <ContactShadows position={[0, -0.05, 0]} scale={10} blur={2.5} far={3} opacity={0.3} />

      {/* Post-processing */}
      {!isMobile && (
        <EffectComposer multisampling={8}>
          <SSAO
            blendFunction={BlendFunction.MULTIPLY}
            samples={32}
            radius={0.03}
            intensity={1}
            luminanceInfluence={0.88}
            bias={0.03}
            resolutionScale={0.75}
            worldDistanceThreshold={1}
            worldDistanceFalloff={0.1}
            worldProximityThreshold={0.0}
            worldProximityFalloff={0.0}
          />
          <SMAA />
        </EffectComposer>
      )}
    </group>
  );
}

export default function DressingConfiguratorPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const canvasClasses = isFullscreen
    ? 'fixed inset-0 z-50'
    : 'relative w-full h-full';

  return (
    <div className="w-full h-screen bg-brand-cream flex flex-col lg:flex-row overflow-hidden">
      {/* Header on mobile */}
      {isMobile && (
        <div className="bg-white border-b border-brand-beige/30 p-4 flex items-center justify-between">
          <Link href="/catalog" className="text-brand-accent hover:text-brand-accent-hover transition-colors text-sm">
            ← Înapoi
          </Link>
          <h1 className="heading-md text-brand-dark">Dressing</h1>
          <div className="w-8" />
        </div>
      )}

      {/* 3D Canvas */}
      <div className={`${isMobile ? 'flex-1' : 'flex-1'} relative min-h-[300px] lg:min-h-0 bg-white`}>
        <Canvas shadows dpr={[1, 2]}>
          <Scene isMobile={isMobile} />
        </Canvas>

        {/* Fullscreen toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white border border-brand-beige/30 rounded-lg transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Control Panel */}
      {!isFullscreen && (
        <div className="w-full lg:w-[420px] xl:w-[480px] border-t lg:border-t-0 lg:border-l border-brand-beige/30 overflow-y-auto">
          <DressingPanel />
        </div>
      )}
    </div>
  );
}
