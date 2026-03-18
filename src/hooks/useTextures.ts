'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { Material } from '@/types';
import { parseMaterialFromFilename, setDynamicMaterials } from '@/data/materials';

// ─── Zustand store for texture state (works across DOM + R3F reconcilers) ───
interface TextureStore {
  textures: Material[];
  loading: boolean;
  version: number; // increments when textures load, used as useMemo dependency
  _fetched: boolean;
  _load: () => void;
}

export const useTextureStore = create<TextureStore>((set, get) => ({
  textures: [],
  loading: true,
  version: 0,
  _fetched: false,
  _load: () => {
    if (get()._fetched) return;
    set({ _fetched: true });
    fetch('/api/textures')
      .then((res) => res.json())
      .then((data: { textures: string[] }) => {
        const mats = data.textures.map(parseMaterialFromFilename);
        setDynamicMaterials(mats);
        set({ textures: mats, loading: false, version: get().version + 1 });
      })
      .catch(() => {
        set({ loading: false });
      });
  },
}));

// ─── Hook interface (backwards compatible) ──────────────────────────────────
interface UseTexturesResult {
  textures: Material[];
  loading: boolean;
}

export function useTextures(): UseTexturesResult {
  const textures = useTextureStore((s) => s.textures);
  const loading = useTextureStore((s) => s.loading);
  const load = useTextureStore((s) => s._load);

  useEffect(() => { load(); }, [load]);

  return { textures, loading };
}
