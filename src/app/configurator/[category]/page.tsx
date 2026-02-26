'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { furnitureCategories } from '@/data/catalog';
import { FurnitureCategory } from '@/types';
import ConfiguratorPanel from '@/components/configurator/ConfiguratorPanel';
import Link from 'next/link';

// Dynamic import for 3D canvas (no SSR)
const ConfiguratorCanvas = dynamic(
  () => import('@/components/configurator/ConfiguratorCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] bg-brand-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-brand-charcoal/50 text-sm">Se încarcă configuratorul 3D...</p>
        </div>
      </div>
    ),
  }
);

export default function ConfiguratorCategoryPage() {
  const params = useParams();
  const category = params?.category as string;
  const setCategory = useConfiguratorStore((s) => s.setCategory);
  const consumePendingPreset = useConfiguratorStore((s) => s.consumePendingPreset);
  const pendingPreset = useConfiguratorStore((s) => s.pendingPreset);
  const config = useConfiguratorStore((s) => s.config);
  const currentStep = useConfiguratorStore((s) => s.currentStep);

  // Validate category and set it, then apply pending preset
  useEffect(() => {
    const validCategories = furnitureCategories.map((c) => c.id);
    if (validCategories.includes(category as FurnitureCategory)) {
      if (config.category !== category || currentStep === 'category') {
        setCategory(category as FurnitureCategory);
      }
    }
  }, [category]);

  // Apply pending preset after category is set
  useEffect(() => {
    if (pendingPreset && config.category === category) {
      consumePendingPreset();
    }
  }, [pendingPreset, config.category, category]);

  const catInfo = furnitureCategories.find((c) => c.id === category);

  if (!catInfo) {
    return (
      <div className="section-container section-padding text-center">
        <h1 className="heading-lg text-brand-dark mb-4">Categorie nevalidă</h1>
        <p className="text-brand-charcoal/50 mb-6">Categoria &quot;{category}&quot; nu a fost găsită.</p>
        <Link href="/configurator" className="btn-primary">
          Înapoi la Configurator
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden bg-brand-warm">
      {/* 3D Canvas - Left side */}
      <div className="flex-1 p-3 lg:p-4 min-h-[300px] lg:min-h-0">
        <ConfiguratorCanvas />
      </div>

      {/* Configuration Panel - Right side */}
      <div className="w-full lg:w-[420px] xl:w-[460px] border-t lg:border-t-0 lg:border-l border-brand-beige/50 bg-white overflow-y-auto">
        <div className="p-4 lg:p-6">
          {/* Category header */}
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-brand-beige/30">
            <Link href="/configurator" className="text-brand-charcoal/30 hover:text-brand-dark text-sm">
              Configurator
            </Link>
            <span className="text-brand-charcoal/20">/</span>
            <span className="text-brand-accent text-sm">{catInfo.name}</span>
          </div>

          <ConfiguratorPanel />
        </div>
      </div>
    </div>
  );
}
