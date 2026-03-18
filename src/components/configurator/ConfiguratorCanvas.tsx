'use client';

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Html, Line } from '@react-three/drei';
import { EffectComposer, SSAO, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import FurnitureModel from './FurnitureModel';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from 'lucide-react';

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
    fontFamily: "'DM Mono', ui-monospace, monospace",
    fontVariantNumeric: 'tabular-nums',
    color: '#111827',
    whiteSpace: 'nowrap',
  };

  return (
    <>
      {/* Width axis */}
      <Line points={[[-w / 2, yGuide, d / 2 + offset], [w / 2, yGuide, d / 2 + offset]]} color={widthColor} lineWidth={1} />
      <Line points={[[-w / 2, yGuide, d / 2 + offset], [-w / 2 + arrowLen, yGuide, d / 2 + offset + arrowWing]]} color={widthColor} lineWidth={1} />
      <Line points={[[-w / 2, yGuide, d / 2 + offset], [-w / 2 + arrowLen, yGuide, d / 2 + offset - arrowWing]]} color={widthColor} lineWidth={1} />
      <Line points={[[w / 2, yGuide, d / 2 + offset], [w / 2 - arrowLen, yGuide, d / 2 + offset + arrowWing]]} color={widthColor} lineWidth={1} />
      <Line points={[[w / 2, yGuide, d / 2 + offset], [w / 2 - arrowLen, yGuide, d / 2 + offset - arrowWing]]} color={widthColor} lineWidth={1} />
      <Html position={[0, yGuide + 0.03, d / 2 + offset]} center sprite>
        <div style={{ ...labelStyle, borderColor: 'rgba(194,65,12,0.35)' }}>L {widthCm * 10} mm</div>
      </Html>

      {/* Height axis */}
      <Line points={[[-w / 2 - offset, 0, d / 2 + offset], [-w / 2 - offset, h, d / 2 + offset]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, 0, d / 2 + offset], [-w / 2 - offset, arrowLen, d / 2 + offset + arrowWing]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, 0, d / 2 + offset], [-w / 2 - offset, arrowLen, d / 2 + offset - arrowWing]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, h, d / 2 + offset], [-w / 2 - offset, h - arrowLen, d / 2 + offset + arrowWing]]} color={heightColor} lineWidth={1} />
      <Line points={[[-w / 2 - offset, h, d / 2 + offset], [-w / 2 - offset, h - arrowLen, d / 2 + offset - arrowWing]]} color={heightColor} lineWidth={1} />
      <Html position={[-w / 2 - offset, h / 2, d / 2 + offset + 0.03]} center sprite>
        <div style={{ ...labelStyle, borderColor: 'rgba(22,101,52,0.35)' }}>H {heightCm * 10} mm</div>
      </Html>

      {/* Depth axis */}
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
  const selectCompartment = useConfiguratorStore((s) => s.selectCompartment);
  const config = useConfiguratorStore((s) => s.config);
  const floorTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/textures/textura_parchet.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
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

  // Center furniture vertically based on its height
  const h = config.dimensions.height * 0.01;
  const d = config.dimensions.depth * 0.01;
  const yOffset = h / 2;
  const wallFrontZ = -0.52; // wall center -0.58 with thickness 0.12
  const mountGap = 0.008; // 8 mm visual mounting gap
  const furnitureZ = wallFrontZ + d / 2 + mountGap;

  return (
    <>
      <PerspectiveCamera makeDefault position={[2.1, 1.6, 2.8]} fov={36} />

      {/* Lighting */}
      {/* Low ambient for contrast */}
      <ambientLight intensity={0.35} color="#ffffff" />
      <hemisphereLight intensity={0.15} color="#ffffff" groundColor="#f0eee8" />
      {/* Main key light with tight shadow frustum */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={0.78}
        castShadow
        shadow-mapSize={isMobile ? [1024, 1024] : [4096, 4096]}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.00008}
        shadow-normalBias={0.015}
      />
      {/* Counter fill */}
      <directionalLight position={[-5, 3, 3]} intensity={0.08} color="#ffffff" />
      {/* Overhead spot — casts crisp shelf-underside shadows */}
      <spotLight
        position={[0, 4.2, 1.2]}
        angle={0.52}
        penumbra={0.6}
        intensity={0.62}
        distance={9}
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.01}
        color="#ffffff"
      />
      {/* Front accent — reveals compartment depth and panel edges */}
      <spotLight
        position={[0.8, 1.8, 3.0]}
        angle={0.44}
        penumbra={0.55}
        intensity={0.36}
        distance={7}
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.01}
        color="#ffffff"
      />
      {/* Rim light from back-left */}
      <spotLight
        position={[-2.5, 3.0, -2.5]}
        angle={0.3}
        penumbra={0.8}
        intensity={0.2}
        distance={8}
        castShadow={false}
        color="#ffffff"
      />
      {/* Back fill — subtle rear rim on body */}
      <directionalLight position={[0, 4, -6]} intensity={0.1} />
      {/* Room ceiling/fill lights for interior realism */}
      <spotLight
        position={[0, 3.8, -0.2]}
        angle={0.95}
        penumbra={0.7}
        intensity={0.2}
        distance={12}
        castShadow={false}
        color="#f5f7fa"
      />
      {/* Environment */}
      <Environment preset="studio" />

      {/* Room context (wall + floor) for realistic placement preview */}
      <mesh position={[0, 1.5, -0.58]} receiveShadow>
        <boxGeometry args={[8, 4, 0.12]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" emissive="#ffffff" emissiveMap={wallTexture} emissiveIntensity={0.55} roughness={1} metalness={0} envMapIntensity={0} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[8, 0.04, 8]} />
        <meshStandardMaterial
          color="#c8bfae"
          map={floorTexture}
          roughness={0.96}
          metalness={0.0}
          envMapIntensity={0.08}
        />
      </mesh>

      {/* Furniture */}
      <group position={[0, yOffset, furnitureZ]}>
        <FurnitureModel onClick={(row: number, col: number) => selectCompartment(row, col)} />
        <DimensionGuides
          widthCm={config.dimensions.width}
          heightCm={config.dimensions.height}
          depthCm={config.dimensions.depth}
        />
      </group>

      {/* Floor */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.5}
        scale={10}
        blur={1.5}
        far={5}
        color="#2a2018"
      />
      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
        zoomSpeed={0.9}
        minPolarAngle={Math.PI / 5.5}
        maxPolarAngle={Math.PI / 1.95}
        minAzimuthAngle={-Math.PI / 1.8}
        maxAzimuthAngle={Math.PI / 1.8}
        minDistance={1.2}
        maxDistance={7.5}
        target={[0, yOffset, furnitureZ]}
        panSpeed={0.7}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      />

      {/* Post-processing: edge & corner ambient occlusion + AA */}
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

export default function ConfiguratorCanvas() {
  const config = useConfiguratorStore((s) => s.config);
  const previewMode = useConfiguratorStore((s) => s.previewMode);
  const togglePreviewMode = useConfiguratorStore((s) => s.togglePreviewMode);
  const { width, height, depth } = config.dimensions;

  // Detect mobile via media query
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
      {/* Dimension labels */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-3">
        <div className="glass-panel rounded-lg px-3 py-1.5 text-xs font-medium text-brand-charcoal/60">
          {width} × {height} × {depth} cm
        </div>
      </div>

      {/* View controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
        {/* Preview mode toggle */}
        <button
          onClick={togglePreviewMode}
          className={`rounded-lg px-3 py-2 flex items-center space-x-2 text-xs font-semibold transition-all shadow-lg ${
            previewMode
              ? 'bg-brand-accent text-white shadow-brand-accent/30'
              : 'glass-panel text-brand-charcoal/60 hover:bg-white'
          }`}
          title={previewMode ? 'Ieși din previzualizare' : 'Previzualizează (hover pe uși)'}
        >
          {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{previewMode ? 'Oprește' : 'Previzualizează'}</span>
        </button>
        <button className="glass-panel rounded-lg p-2 hover:bg-white transition-colors" title="Rotește">
          <RotateCw className="w-4 h-4 text-brand-charcoal/60" />
        </button>
        <button className="glass-panel rounded-lg p-2 hover:bg-white transition-colors" title="Zoom în">
          <ZoomIn className="w-4 h-4 text-brand-charcoal/60" />
        </button>
        <button className="glass-panel rounded-lg p-2 hover:bg-white transition-colors" title="Zoom out">
          <ZoomOut className="w-4 h-4 text-brand-charcoal/60" />
        </button>
        <button className="glass-panel rounded-lg p-2 hover:bg-white transition-colors" title="Resetează">
          <Maximize2 className="w-4 h-4 text-brand-charcoal/60" />
        </button>
      </div>

      {/* 3D Canvas */}
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          gl={{ antialias: !isMobile }}
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

      {/* Instructions */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
        <div className={`rounded-full px-4 py-1.5 text-xs ${
          previewMode
            ? 'bg-brand-accent/90 text-white shadow-lg'
            : 'glass-panel text-brand-charcoal/50'
        }`}>
          {previewMode
            ? '👆 Mod previzualizare activ — treci cu mouse-ul peste uși/sertare pentru a le deschide'
            : '🖱️ Click și trage pentru a roti • Scroll pentru zoom • Click pe compartiment pentru a selecta'}
        </div>
      </div>
    </div>
  );
}
