'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid, PerspectiveCamera } from '@react-three/drei';
import FurnitureModel from './FurnitureModel';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from 'lucide-react';

function Scene() {
  const selectCompartment = useConfiguratorStore((s) => s.selectCompartment);
  const config = useConfiguratorStore((s) => s.config);

  // Center furniture vertically based on its height
  const h = config.dimensions.height * 0.01;
  const yOffset = h / 2;

  return (
    <>
      <PerspectiveCamera makeDefault position={[2, 1.5, 2.5]} fov={40} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.3} />

      {/* Environment */}
      <Environment preset="apartment" />

      {/* Furniture */}
      <group position={[0, yOffset, 0]}>
        <FurnitureModel onClick={(row: number, col: number) => selectCompartment(row, col)} />
      </group>

      {/* Floor */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
      <Grid
        args={[10, 10]}
        position={[0, -0.001, 0]}
        cellSize={0.1}
        cellThickness={0.5}
        cellColor="#d0d0d0"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#a0a0a0"
        fadeDistance={8}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={1}
        maxDistance={8}
        target={[0, yOffset, 0]}
      />
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
        <Canvas shadows className="configurator-canvas">
          <Scene />
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
