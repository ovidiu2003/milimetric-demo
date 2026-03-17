'use client';

import React, { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Html, Line } from '@react-three/drei';
import { EffectComposer, SSAO, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import Link from 'next/link';
import LivingUnitPanel from '@/components/configurator/LivingUnitPanel';
import { useLivingUnitStore } from '@/store/livingUnitStore';

// Dynamic import for 3D model (avoids SSR)
const LivingUnitModel = dynamic(
  () => import('@/components/configurator/LivingUnitModel'),
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
    fontWeight: 600,
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
        <div style={{ ...labelStyle, borderColor: 'rgba(194,65,12,0.35)' }}>L {widthCm} cm</div>
      </Html>

      <Line points={[[-w / 2 - offset, 0, d / 2 + offset], [-w / 2 - offset, h, d / 2 + offset]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, 0, d / 2 + offset], [-w / 2 - offset, arrowLen, d / 2 + offset + arrowWing]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, 0, d / 2 + offset], [-w / 2 - offset, arrowLen, d / 2 + offset - arrowWing]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, h, d / 2 + offset], [-w / 2 - offset, h - arrowLen, d / 2 + offset + arrowWing]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, h, d / 2 + offset], [-w / 2 - offset, h - arrowLen, d / 2 + offset - arrowWing]]} color={heightColor} lineWidth={1} />
      <Html position={[-w / 2 - offset, h / 2, d / 2 + offset + 0.03]} center sprite>
        <div style={{ ...labelStyle, borderColor: 'rgba(22,101,52,0.35)' }}>H {heightCm} cm</div>
      </Html>

      <Line points={[[w / 2 + offset, yGuide, -d / 2], [w / 2 + offset, yGuide, d / 2]]} color={depthColor} lineWidth={1} />
      <Line points={[[w / 2 + offset, yGuide, -d / 2], [w / 2 + offset + arrowWing, yGuide, -d / 2 + arrowLen]]} color={depthColor} lineWidth={1} />
      <Line points={[[w / 2 + offset, yGuide, -d / 2], [w / 2 + offset - arrowWing, yGuide, -d / 2 + arrowLen]]} color={depthColor} lineWidth={1} />
      <Line points={[[w / 2 + offset, yGuide, d / 2], [w / 2 + offset + arrowWing, yGuide, d / 2 - arrowLen]]} color={depthColor} lineWidth={1} />
      <Line points={[[w / 2 + offset, yGuide, d / 2], [w / 2 + offset - arrowWing, yGuide, d / 2 - arrowLen]]} color={depthColor} lineWidth={1} />
      <Html position={[w / 2 + offset + 0.03, yGuide + 0.02, 0]} center sprite>
        <div style={{ ...labelStyle, borderColor: 'rgba(29,78,216,0.35)' }}>A {depthCm} cm</div>
      </Html>
    </>
  );
}

function Scene() {
  const config = useLivingUnitStore((s) => s.config);
  const floorTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/textures/EGGER_H1367_ST40_Light Natural Casella Oak.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4.5, 4.5);
    texture.anisotropy = 8;
    return texture;
  }, []);
  const wallTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/textures/EGGER_F187_ST9_Dark Grey Chicago Concrete.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.4, 1.5);
    texture.anisotropy = 8;
    return texture;
  }, []);

  // Camera target: center of the unit vertically
  const S = 0.01;
  const depthM = config.depth * S;
  const centerY = (config.suspensionHeight + config.totalHeight) * S / 2;
  const wallFrontZ = -0.58; // wall center -0.64 with thickness 0.12
  const mountGap = 0.008; // 8 mm visual mounting gap
  const furnitureZ = wallFrontZ + depthM / 2 + mountGap;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[3.5, 1.8, 3.5]}
        fov={38}
      />

      {/* Lighting */}
      {/* Low ambient so shadows have contrast */}
      <ambientLight intensity={0.08} color="#ffffff" />
      {/* Sky/ground hemisphere for subtle warm bounce */}
      <hemisphereLight intensity={0.09} color="#ffffff" groundColor="#c4c9cf" />

      {/* Main key light — upper-left, casts crisp shadows over shelves */}
      <directionalLight
        position={[4, 9, 6]}
        intensity={0.78}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.00008}
        shadow-normalBias={0.015}
      />

      {/* Counter fill from opposite side — softer, reveals texture on right panels */}
      <directionalLight position={[-4, 3, 4]} intensity={0.08} color="#ffffff" />

      {/* Top-down overhead spot — casts shadows under each shelf edge */}
      <spotLight
        position={[0, 4.5, 1.5]}
        angle={0.55}
        penumbra={0.6}
        intensity={0.62}
        distance={9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.01}
        color="#ffffff"
      />

      {/* Front accent spot — reveals door & drawer front detail + handle gloss */}
      <spotLight
        position={[1.0, 2.0, 3.2]}
        angle={0.42}
        penumbra={0.55}
        intensity={0.36}
        distance={7}
        castShadow={false}
        color="#ffffff"
      />

      {/* Rim/edge light from back-left — separates unit from background */}
      <spotLight
        position={[-2.5, 3.5, -2.0]}
        angle={0.28}
        penumbra={0.8}
        intensity={0.2}
        distance={8}
        castShadow={false}
        color="#ffffff"
      />

      {/* Under-shelf neutral fill to keep material hue unchanged */}
      <pointLight position={[0, 1.4, 0.6]} intensity={0.03} distance={2.5} color="#ffffff" />
      {/* Room ceiling/fill lights for interior mood */}
      <spotLight
        position={[0, 3.9, -0.2]}
        angle={0.95}
        penumbra={0.72}
        intensity={0.22}
        distance={12}
        castShadow={false}
        color="#f5f7fa"
      />
      <pointLight position={[-2.4, 1.5, -0.45]} intensity={0.12} distance={6} color="#eef2f7" />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Room context (wall + floor) for realistic wall-mounted preview */}
      <mesh position={[0, 1.6, -0.64]} receiveShadow>
        <boxGeometry args={[9, 4.4, 0.12]} />
        <meshStandardMaterial color="#d5d7db" map={wallTexture} roughness={0.97} metalness={0.0} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[9, 0.04, 9]} />
        <meshStandardMaterial
          color="#c8bfae"
          map={floorTexture}
          roughness={0.96}
          metalness={0.0}
          envMapIntensity={0.08}
        />
      </mesh>

      {/* Model */}
      <group position={[0, 0, furnitureZ]}>
        <LivingUnitModel />
        <DimensionGuides
          widthCm={config.totalWidth}
          heightCm={config.totalHeight}
          depthCm={config.depth}
        />
      </group>

      {/* Floor shadow */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.52}
        scale={12}
        blur={1.5}
        far={5}
        color="#2a2018"
      />
      {/* Self-contact shadows (shelf undersides etc.) */}
      <ContactShadows
        position={[0, 0.002, 0.18]}
        opacity={0.28}
        scale={9}
        blur={1.1}
        far={3.2}
        color="#1a1510"
      />

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
        zoomSpeed={0.9}
        minPolarAngle={Math.PI / 5.5}
        maxPolarAngle={Math.PI / 1.95}
        minAzimuthAngle={-Math.PI / 1.8}
        maxAzimuthAngle={Math.PI / 1.8}
        minDistance={1.5}
        maxDistance={9}
        target={[0, centerY, furnitureZ]}
        panSpeed={0.7}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      />

      {/* Post-processing: edge & corner ambient occlusion + AA */}
      <EffectComposer multisampling={0}>
        <SSAO
          blendFunction={BlendFunction.MULTIPLY}
          samples={32}
          radius={0.03}
          intensity={7}
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
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-brand-warm">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-brand-charcoal/50 text-sm">Se încarcă modelul 3D...</p>
      </div>
    </div>
  );
}

export default function CorpLivingSuspendatPage() {
  const config = useLivingUnitStore((s) => s.config);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden bg-brand-warm">
      {/* 3D Canvas — Left */}
      <div className="flex-1 p-3 lg:p-4 min-h-[300px] lg:min-h-0 relative">
        <div className="relative w-full h-full min-h-[400px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
          {/* Dimension labels */}
          <div className="absolute top-3 left-3 z-10 flex items-center space-x-3">
            <div className="glass-panel rounded-lg px-3 py-1.5 text-xs font-medium text-brand-charcoal/60">
              {config.totalWidth} × {config.totalHeight} × {config.depth} cm
            </div>
          </div>

          {/* 3D Canvas */}
          <Suspense fallback={<LoadingFallback />}>
            <Canvas
              shadows
              dpr={[1, 2]}
              gl={{ antialias: true }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.NoToneMapping;
                gl.toneMappingExposure = 0.74;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
                gl.outputColorSpace = THREE.SRGBColorSpace;
              }}
              className="configurator-canvas"
            >
              <Scene />
            </Canvas>
          </Suspense>

          {/* Instructions */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <div className="glass-panel rounded-full px-4 py-1.5 text-xs text-brand-charcoal/50">
              🖱️ Click și trage pentru a roti • Scroll pentru zoom
            </div>
          </div>
        </div>
      </div>

      {/* Panel — Right */}
      <div className="w-full lg:w-[420px] xl:w-[460px] border-t lg:border-t-0 lg:border-l border-brand-beige/50 bg-white overflow-y-auto">
        <div className="p-4 lg:p-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-brand-beige/30">
            <Link href="/configurator" className="text-brand-charcoal/30 hover:text-brand-dark text-sm">
              Configurator
            </Link>
            <span className="text-brand-charcoal/20">/</span>
            <Link href="/configurator/suspendat" className="text-brand-charcoal/30 hover:text-brand-dark text-sm">
              Mobilier Suspendat
            </Link>
            <span className="text-brand-charcoal/20">/</span>
            <span className="text-brand-accent text-sm">Corp Living</span>
          </div>

          <LivingUnitPanel />
        </div>
      </div>
    </div>
  );
}
