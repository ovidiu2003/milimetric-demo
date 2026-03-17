'use client';

import { useState, useEffect } from 'react';
import { Material } from '@/types';
import { parseMaterialFromFilename, setDynamicMaterials } from '@/data/materials';

interface UseTexturesResult {
  textures: Material[];
  loading: boolean;
}

export function useTextures(): UseTexturesResult {
  const [textures, setTextures] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/textures')
      .then((res) => res.json())
      .then((data: { textures: string[] }) => {
        const mats = data.textures.map(parseMaterialFromFilename);
        setDynamicMaterials(mats);
        setTextures(mats);
      })
      .catch(() => {
        // Keep empty list on error; static fallback materials still available
      })
      .finally(() => setLoading(false));
  }, []);

  return { textures, loading };
}
