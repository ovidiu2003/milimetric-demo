import { CatalogItem, FurnitureCategory } from '@/types';

export const catalogItems: CatalogItem[] = [
  {
    id: 'sus-004',
    name: 'Corp Living Suspendat',
    category: 'suspendat',
    description:
      'Corp modular suspendat pentru living: comodă orizontală cu sertare, coloană raft deschis cu cuburi și dulap vertical închis. 4 parametri configurabili + oglindire.',
    imageUrl: '/images/catalog/sus-004.jpg',
    images: ['/images/catalog/sus-004.jpg'],
    basePrice: 3200,
    dimensions: { width: 300, height: 260, depth: 40 },
    material: 'Textura Personalizata',
    isCustomizable: true,
    configuratorPath: '/configurator/corp-living-suspendat',
    featured: true,
    deliveryWeeks: '10-14',
    tags: ['living', 'suspendat', 'modular', 'comoda', 'dulap', 'raft', 'tv'],
    configPreset: {
      category: 'suspendat',
      dimensions: { width: 300, height: 260, depth: 40 },
      bodyMaterialId: 'custom-texture',
      frontMaterialId: 'custom-texture',
      baseType: 'suspendat',
      backPanel: true,
    },
  },
];

export function getCatalogItemsByCategory(category: FurnitureCategory): CatalogItem[] {
  return catalogItems.filter((item) => item.category === category);
}

export function getFeaturedItems(): CatalogItem[] {
  return catalogItems.filter((item) => item.featured);
}
