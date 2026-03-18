import { Material, MaterialType } from '@/types';

// Static fallback material (used before dynamic textures load)
export const materials: Material[] = [];

export const materialTypes: { id: MaterialType; name: string; description: string }[] = [
  {
    id: 'pal-melaminat',
    name: 'EGGER / Texturi',
    description: 'Texturi incarcate automat din folderul /public/textures.',
  },
];

// ─── Dynamic texture registry ───────────────────────────────────────────────
// Populated at runtime by useTextures() hook from /api/textures
let dynamicMaterials: Material[] = [];

export function setDynamicMaterials(mats: Material[]): void {
  dynamicMaterials = mats;
}

/**
 * Parse an EGGER-style filename into a Material object.
 *
 * Convention:  EGGER_F206_ST9_Black Pietra Grigia.jpg
 *   id / code: EGGER_F206_ST9_Black Pietra Grigia   (shown in PDF)
 *   name:      Black Pietra Grigia                   (display name - last _-segment)
 */
export function parseMaterialFromFilename(filename: string): Material {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  const parts = withoutExt.split('_');
  // Last underscore-separated segment is the human-readable name
  const name = parts[parts.length - 1].trim() || withoutExt;

  return {
    id: withoutExt,
    name,
    type: 'pal-melaminat',
    color: '#c9a96e',
    textureUrl: `/textures/${encodeURIComponent(filename)}`,
    priceMultiplier: 1,
    description: withoutExt,
    category: 'both',
  };
}

export function getMaterialById(id: string): Material | undefined {
  return (
    dynamicMaterials.find((m) => m.id === id) ||
    materials.find((m) => m.id === id)
  );
}

export function getMaterialsByType(type: MaterialType): Material[] {
  return [
    ...dynamicMaterials.filter((m) => m.type === type),
    ...materials.filter((m) => m.type === type),
  ];
}

export function getBodyMaterials(): Material[] {
  const all = [...dynamicMaterials, ...materials];
  return all.filter((m) => m.category === 'body' || m.category === 'both');
}

export function getFrontMaterials(): Material[] {
  const all = [...dynamicMaterials, ...materials];
  return all.filter((m) => m.category === 'front' || m.category === 'both');
}
