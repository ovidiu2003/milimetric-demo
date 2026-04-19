import { CatalogItem, FurnitureCategory } from '@/types';

export const catalogItems: CatalogItem[] = [
  {
    id: 'sus-004',
    name: 'Corp Living Suspendat',
    category: 'suspendat',
    description:
      'Corp modular suspendat pentru living: comodă orizontală cu sertare, coloană raft deschis cu cuburi și dulap vertical închis. 4 parametri configurabili + oglindire.',
    imageUrl: '/img_corpuri/comoda_living_suspendat.png',
    images: ['/img_corpuri/comoda_living_suspendat.png'],
    basePrice: 3200,
    dimensions: { width: 300, height: 260, depth: 40 },
    material: 'White Casella Oak',
    isCustomizable: true,
    configuratorPath: '/configurator/corp-living-suspendat',
    featured: true,
    deliveryWeeks: '10-14',
    tags: ['living', 'suspendat', 'modular', 'comoda', 'dulap', 'raft', 'tv'],
    configPreset: {
      category: 'suspendat',
      dimensions: { width: 300, height: 260, depth: 40 },
      bodyMaterialId: 'EGGER_H1384_ST40_White Casella Oak',
      frontMaterialId: 'EGGER_H1384_ST40_White Casella Oak',
      baseType: 'suspendat',
      backPanel: true,
    },
  },
  {
    id: 'dre-001',
    name: 'Corp Dressing Modular',
    category: 'dressing',
    description:
      'Dressing modular personalizabil: 1-4 module de 80-120 cm. Fiecare modul cu configurație interioară la alegere (bară haine + raft, rafturi multiple sau mixt cu sertare) și opțiune de uși batante cu mâner vertical.',
    imageUrl: '',
    images: [],
    basePrice: 4200,
    dimensions: { width: 300, height: 240, depth: 60 },
    material: 'Natural Hickory / Alpine White',
    isCustomizable: true,
    configuratorPath: '/configurator/corp-dressing',
    featured: true,
    deliveryWeeks: '8-12',
    tags: ['dressing', 'dulap', 'modular', 'haine', 'bara', 'rafturi', 'sertare', 'usi'],
    configPreset: {
      category: 'dressing',
      dimensions: { width: 300, height: 240, depth: 60 },
      bodyMaterialId: 'EGGER_H3730_ST10_Natural Hickory',
      frontMaterialId: 'EGGER_W1100_ST9_Alpine White',
      baseType: 'plinta',
      backPanel: true,
    },
  },
  {
    id: 'dul-001',
    name: 'Dulap Vertical cu Uși',
    category: 'dulapuri',
    description:
      'Dulap vertical personalizabil cu uși batante, mâner ascuns pe toată înălțimea și compartimente interioare pentru depozitare și haine.',
    imageUrl: '',
    images: [],
    basePrice: 3900,
    dimensions: { width: 150, height: 270, depth: 55 },
    material: 'Alb Mat / Lemn Deschis',
    isCustomizable: true,
    featured: false,
    deliveryWeeks: '10-14',
    tags: ['dulap', 'uși', 'dressing', 'rafturi', 'mâner ascuns', 'vertical'],
    configPreset: {
      category: 'dulapuri',
      dimensions: { width: 150, height: 270, depth: 55 },
      bodyMaterialId: 'EGGER_H1384_ST40_White Casella Oak',
      frontMaterialId: 'EGGER_H1384_ST40_White Casella Oak',
      compartments: {
        columns: 2,
        rows: [1, 1],
        columnWidths: [1, 1],
        rowHeights: [[1], [1]],
      },
      fronts: [
        { row: 0, col: 0, frontType: 'usa', materialId: 'EGGER_H1384_ST40_White Casella Oak' },
        { row: 0, col: 1, frontType: 'usa', materialId: 'EGGER_H1384_ST40_White Casella Oak' },
      ],
      baseType: 'plinta',
      baseHeight: 8,
      backPanel: true,
      additionalOptions: [],
    },
  },
];

export function getCatalogItemsByCategory(category: FurnitureCategory): CatalogItem[] {
  return catalogItems.filter((item) => item.category === category);
}

export function getFeaturedItems(): CatalogItem[] {
  return catalogItems.filter((item) => item.featured);
}
