'use client';

import { getDynamicMaterials } from '@/data/materials';
import { Material } from '@/types';

interface UseTexturesResult {
  textures: Material[];
  loading: boolean;
}

/**
 * Returns the list of available texture materials.
 * Materials are pre-loaded synchronously from the static manifest at module init,
 * so they are always available immediately — no async fetch needed.
 */
export function useTextures(): UseTexturesResult {
  return { textures: getDynamicMaterials(), loading: false };
}
