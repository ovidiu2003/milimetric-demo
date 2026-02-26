'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import Link from 'next/link';
import LivingUnitPanel from '@/components/configurator/LivingUnitPanel';
import { useLivingUnitStore } from '@/store/livingUnitStore';

// Dynamic import for 3D model (avoids SSR)
const LivingUnitModel = dynamic(
  () => import('@/components/configurator/LivingUnitModel'),
  { ssr: false },
);

function Scene() {
  const config = useLivingUnitStore((s) => s.config);

  // Camera target: center of the unit vertically
  const S = 0.01;
  const centerY = (config.suspensionHeight + config.totalHeight) * S / 2;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[3.5, 1.8, 3.5]}
        fov={38}
      />

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

      {/* Model */}
      <LivingUnitModel />

      {/* Floor shadow */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={12}
        blur={2.5}
        far={5}
      />

      {/* Controls */}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={1.5}
        maxDistance={10}
        target={[0, centerY, 0]}
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
            <Canvas shadows className="configurator-canvas">
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
