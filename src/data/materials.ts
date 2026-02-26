import { Material, MaterialType } from '@/types';

export const materials: Material[] = [
  // ===== LEMN MASIV (Solid Wood) =====
  {
    id: 'stejar-natural',
    name: 'Stejar Natural',
    type: 'lemn-masiv',
    woodType: 'stejar',
    color: '#c9a96e',
    priceMultiplier: 1.8,
    description: 'Lemn de stejar masiv, finisaj ulei natural. Durabil și elegant.',
    category: 'both',
  },
  {
    id: 'nuc-natural',
    name: 'Nuc Natural',
    type: 'lemn-masiv',
    woodType: 'nuc',
    color: '#5c3a1e',
    priceMultiplier: 2.2,
    description: 'Lemn de nuc masiv, tonuri calde și întunecate. Premium.',
    category: 'both',
  },
  {
    id: 'fag-natural',
    name: 'Fag Natural',
    type: 'lemn-masiv',
    woodType: 'fag',
    color: '#d4b896',
    priceMultiplier: 1.5,
    description: 'Lemn de fag masiv, versatil și rezistent.',
    category: 'both',
  },
  {
    id: 'mesteacan',
    name: 'Mesteacăn',
    type: 'lemn-masiv',
    woodType: 'mesteacan',
    color: '#e8d5b7',
    priceMultiplier: 1.4,
    description: 'Lemn de mesteacăn, deschis la culoare, aspect nordic.',
    category: 'both',
  },
  {
    id: 'frasin-natural',
    name: 'Frasin Natural',
    type: 'lemn-masiv',
    woodType: 'frasin',
    color: '#d2c0a0',
    priceMultiplier: 1.6,
    description: 'Lemn de frasin masiv, textură pronunțată, foarte rezistent.',
    category: 'both',
  },
  {
    id: 'cires',
    name: 'Cireș',
    type: 'lemn-masiv',
    woodType: 'cires',
    color: '#a0522d',
    priceMultiplier: 2.0,
    description: 'Lemn de cireș masiv, tonuri calde roșiatice.',
    category: 'both',
  },
  {
    id: 'pin-natural',
    name: 'Pin Natural',
    type: 'lemn-masiv',
    woodType: 'pin',
    color: '#deb887',
    priceMultiplier: 1.2,
    description: 'Lemn de pin masiv, accesibil, aspect rustic.',
    category: 'both',
  },

  // ===== MDF VOPSIT =====
  {
    id: 'mdf-alb-mat',
    name: 'MDF Alb Mat',
    type: 'mdf-vopsit',
    color: '#f5f5f5',
    priceMultiplier: 1.0,
    description: 'MDF vopsit alb mat, finisaj modern și curat.',
    category: 'both',
  },
  {
    id: 'mdf-alb-lucios',
    name: 'MDF Alb Lucios',
    type: 'mdf-lacuit',
    color: '#ffffff',
    priceMultiplier: 1.3,
    description: 'MDF lăcuit alb lucios, efect oglindă.',
    category: 'both',
  },
  {
    id: 'mdf-negru-mat',
    name: 'MDF Negru Mat',
    type: 'mdf-vopsit',
    color: '#1a1a1a',
    priceMultiplier: 1.1,
    description: 'MDF vopsit negru mat, aspect sofisticat.',
    category: 'both',
  },
  {
    id: 'mdf-gri-mat',
    name: 'MDF Gri Mat',
    type: 'mdf-vopsit',
    color: '#808080',
    priceMultiplier: 1.0,
    description: 'MDF vopsit gri mat, versatil și modern.',
    category: 'both',
  },
  {
    id: 'mdf-antracit',
    name: 'MDF Antracit',
    type: 'mdf-vopsit',
    color: '#3d3d3d',
    priceMultiplier: 1.1,
    description: 'MDF vopsit antracit, elegant și discret.',
    category: 'both',
  },
  {
    id: 'mdf-verde-salvie',
    name: 'MDF Verde Salvie',
    type: 'mdf-vopsit',
    color: '#8a9a5b',
    priceMultiplier: 1.2,
    description: 'MDF vopsit verde salvie, tendință actuală.',
    category: 'front',
  },
  {
    id: 'mdf-albastru-navy',
    name: 'MDF Albastru Navy',
    type: 'mdf-vopsit',
    color: '#1c3d5a',
    priceMultiplier: 1.2,
    description: 'MDF vopsit albastru navy, rafinat.',
    category: 'front',
  },
  {
    id: 'mdf-terracotta',
    name: 'MDF Terracotta',
    type: 'mdf-vopsit',
    color: '#c75b39',
    priceMultiplier: 1.2,
    description: 'MDF vopsit terracotta, cald și pământesc.',
    category: 'front',
  },

  // ===== PAL MELAMINAT =====
  {
    id: 'pal-stejar-deschis',
    name: 'PAL Stejar Deschis',
    type: 'pal-melaminat',
    color: '#d4b896',
    priceMultiplier: 0.7,
    description: 'PAL melaminat decor stejar deschis, raport calitate/preț excellent.',
    category: 'both',
  },
  {
    id: 'pal-stejar-inchis',
    name: 'PAL Stejar Închis',
    type: 'pal-melaminat',
    color: '#8b6c42',
    priceMultiplier: 0.7,
    description: 'PAL melaminat decor stejar închis, clasic.',
    category: 'both',
  },
  {
    id: 'pal-nuc',
    name: 'PAL Nuc',
    type: 'pal-melaminat',
    color: '#6b4226',
    priceMultiplier: 0.7,
    description: 'PAL melaminat decor nuc, elegant și accesibil.',
    category: 'both',
  },
  {
    id: 'pal-alb',
    name: 'PAL Alb',
    type: 'pal-melaminat',
    color: '#f0f0f0',
    priceMultiplier: 0.6,
    description: 'PAL melaminat alb, cel mai accesibil.',
    category: 'both',
  },
  {
    id: 'pal-gri-beton',
    name: 'PAL Gri Beton',
    type: 'pal-melaminat',
    color: '#a0a0a0',
    priceMultiplier: 0.7,
    description: 'PAL melaminat decor beton, industrial.',
    category: 'both',
  },

  // ===== FURNIR =====
  {
    id: 'furnir-stejar',
    name: 'Furnir Stejar',
    type: 'furnir',
    woodType: 'stejar',
    color: '#c9a96e',
    priceMultiplier: 1.4,
    description: 'Furnir natural de stejar pe suport MDF.',
    category: 'both',
  },
  {
    id: 'furnir-nuc',
    name: 'Furnir Nuc',
    type: 'furnir',
    woodType: 'nuc',
    color: '#5c3a1e',
    priceMultiplier: 1.6,
    description: 'Furnir natural de nuc pe suport MDF.',
    category: 'both',
  },
];

export const materialTypes: { id: MaterialType; name: string; description: string }[] = [
  {
    id: 'lemn-masiv',
    name: 'Lemn Masiv',
    description: 'Lemn natural masiv, durabil și elegant. Cea mai premium opțiune.',
  },
  {
    id: 'mdf-vopsit',
    name: 'MDF Vopsit',
    description: 'MDF vopsit în diverse culori, finisaj mat uniform.',
  },
  {
    id: 'mdf-lacuit',
    name: 'MDF Lăcuit',
    description: 'MDF lăcuit lucios, efect premium.',
  },
  {
    id: 'pal-melaminat',
    name: 'PAL Melaminat',
    description: 'PAL melaminat cu diverse decoruri, raport calitate-preț excelent.',
  },
  {
    id: 'furnir',
    name: 'Furnir Natural',
    description: 'Furnir natural pe suport MDF, aspectul lemnului masiv la preț accesibil.',
  },
];

export function getMaterialById(id: string): Material | undefined {
  return materials.find(m => m.id === id);
}

export function getMaterialsByType(type: MaterialType): Material[] {
  return materials.filter(m => m.type === type);
}

export function getBodyMaterials(): Material[] {
  return materials.filter(m => m.category === 'body' || m.category === 'both');
}

export function getFrontMaterials(): Material[] {
  return materials.filter(m => m.category === 'front' || m.category === 'both');
}
