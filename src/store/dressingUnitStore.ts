import { create } from 'zustand';
import { DressingUnitConfig, DressingInteriorType, DressingModuleConfig, DressingModuleSection, DressingSectionType, DressingSidePosition, DressingSideLayout } from '@/types';
import { getMaterialById } from '@/data/materials';

// ===== STEP TYPES =====
export type DressingUnitStep = 'size' | 'layout' | 'interior' | 'colors' | 'summary';
const STEPS: DressingUnitStep[] = ['size', 'layout', 'interior', 'colors', 'summary'];

// ===== CONSTRAINTS =====
export const PANEL_T_CM = 1.8;  // grosime panou (corespunde T=1.8cm real)

export const DRESSING_UNIT_LIMITS = {
  moduleCount:          { min: 1, max: 6, step: 1 },
  moduleWidth:          { min: 30, max: 150, step: 0.1 },
  totalModulesWidth:    { min: 30, max: 900, step: 0.1 },  // suma latimilor modulelor (fara biblioteca)
  totalHeight:          { min: 200, max: 280, step: 0.1 },
  depth:                { min: 50, max: 65, step: 0.1 },
  plinthHeight:         { min: 0, max: 15, step: 0.1 },
  topCompartmentHeight: { min: 25, max: 60, step: 0.1 },
  sectionHeight:        { min: 15, max: 240, step: 1 },    // cm — inaltime sectiune (min = drawer minim realist)
  drawerCount:          { min: 1, max: 5, step: 1 },
  sectionShelfCount:    { min: 0, max: 6, step: 1 },
  sideColumns:          { min: 1, max: 3, step: 1 },
  sideColumnWidth:      { min: 20, max: 40, step: 0.1 },
  sideShelfCount:       { min: 3, max: 8, step: 1 },
} as const;

/** Inaltime minima realista per tip de sectiune (cm) */
export const SECTION_MIN_HEIGHT: Record<DressingSectionType, number> = {
  'drawers':           24,   // min 1 sertar util (12cm x 2 spatii)
  'shelves':           20,   // min un compartiment deschis
  'hanging-rod':       60,   // min pt haine scurte (bluze, camasi)
  'shoe-rack':         35,   // min 2 rafturi inclinate
  'pull-out-trouser':  40,   // min 3 bare pantaloni
  'pull-out-basket':   25,   // min 1 cos
  'mirror':            120,  // oglinda utila incepe la 120cm
  'empty':             20,
};

/** Inaltime implicita "nou adaugata" per tip (cm) */
export const SECTION_DEFAULT_HEIGHT: Record<DressingSectionType, number> = {
  'drawers':           45,   // 2 sertare standard
  'shelves':           60,   // 2-3 compartimente
  'hanging-rod':       100,  // haine medii
  'shoe-rack':         70,   // 3 rafturi pantofi
  'pull-out-trouser':  60,   // 4 bare pantaloni
  'pull-out-basket':   50,   // 2 cosuri
  'mirror':            150,  // oglinda full-length
  'empty':             40,
};

export const DRESSING_SIDE_POSITION_OPTIONS: { id: DressingSidePosition; name: string }[] = [
  { id: 'none',  name: 'Fără bibliotecă laterală' },
  { id: 'left',  name: 'Doar pe stânga' },
  { id: 'right', name: 'Doar pe dreapta' },
  { id: 'both',  name: 'Pe ambele părți' },
];

export const DRESSING_SIDE_LAYOUT_OPTIONS: { id: DressingSideLayout; name: string; description: string }[] = [
  { id: 'uniform',   name: 'Uniform',    description: 'Polițe distanțate egal, aspect clasic și ordonat.' },
  { id: 'asimetric', name: 'Asimetric',  description: 'Polițe aranjate în zigzag între coloane, ritm dinamic.' },
  { id: 'galerie',   name: 'Galerie',    description: 'Fiecare coloană are propriul său pattern, ca un display de galerie.' },
  { id: 'vitrina',   name: 'Vitrină',    description: 'Compartiment mare jos pentru decor, spațiere în creștere spre vârf.' },
];

// ===== INTERIOR PRESETS =====
// Toate modulele au usi (structural). hasDoors controleaza doar vizibilitatea in 3D.
export const DRESSING_INTERIOR_OPTIONS: { id: DressingInteriorType; name: string; description: string; allowsDoors: boolean }[] = [
  { id: 'bara-raft',        name: 'Bară haine + raft',             description: 'Bară de haine sus, un raft jos',                 allowsDoors: true  },
  { id: 'rafturi',          name: 'Rafturi multiple',              description: 'Patru rafturi orizontale',                       allowsDoors: true  },
  { id: 'mixt',             name: 'Mixt (bară + sertare)',         description: 'Bară haine sus, două sertare jos',               allowsDoors: true  },
];

// ===== MODULE FUNCTION PRESETS (Tylko-style per-module) =====
// Fiecare preset returneaza sectiunile potrivite pt inaltimea interioara disponibila.
// Pattern: generat dinamic pt a se potrivi exact pe inaltimea reala a modulului.
export interface DressingModulePreset {
  id: string;
  name: string;
  description: string;
  /** Structură schematică pentru thumbnail: [{type, flex}]. Flex = proporția din înălțime. */
  schematic: { type: DressingSectionType; flex: number; shelves?: number; drawers?: number }[];
  build: (interiorHeightCm: number) => DressingModuleSection[];
}

export const DRESSING_MODULE_PRESETS: DressingModulePreset[] = [
  // 1. LONG HANG — single long rail (Tylko: "Long Hang")
  {
    id: 'long-hang',
    name: 'Bară lungă',
    description: 'O bară pe toată înălțimea pentru paltoane, rochii, haine lungi.',
    schematic: [{ type: 'hanging-rod', flex: 1 }],
    build: (H) => [{ id: newSectionId(), type: 'hanging-rod', heightCm: Math.max(60, H) }],
  },
  // 2. SHORT HANG + SHELVES (Tylko: "Short Hang + Shelves")
  {
    id: 'short-hang-shelves',
    name: 'Bară scurtă + rafturi',
    description: 'Bară sus pentru cămăși/bluze, rafturi dedesubt pentru textile pliate.',
    schematic: [
      { type: 'hanging-rod', flex: 0.5 },
      { type: 'shelves', flex: 0.5, shelves: 3 },
    ],
    build: (H) => {
      const hang = Math.max(90, Math.round(H * 0.5));
      const shelves = Math.max(40, H - hang);
      return [
        { id: newSectionId(), type: 'shelves', heightCm: shelves, shelfCount: 3 },
        { id: newSectionId(), type: 'hanging-rod', heightCm: hang },
      ];
    },
  },
  // 3. HANG + DRAWERS (Tylko: "Hang + Drawers")
  {
    id: 'hang-drawers',
    name: 'Bară + sertare',
    description: 'Bară de haine sus, set de sertare jos pentru lenjerie și accesorii.',
    schematic: [
      { type: 'hanging-rod', flex: 0.68 },
      { type: 'drawers', flex: 0.32, drawers: 3 },
    ],
    build: (H) => {
      const drawers = Math.min(70, Math.max(50, Math.round(H * 0.32)));
      const hang = Math.max(60, H - drawers);
      return [
        { id: newSectionId(), type: 'drawers', heightCm: drawers, drawerCount: 3 },
        { id: newSectionId(), type: 'hanging-rod', heightCm: hang },
      ];
    },
  },
  // 4. DOUBLE HANG — 2 rails stacked (Tylko: "Double Hang")
  {
    id: 'double-hang',
    name: 'Dublă bară',
    description: 'Două bare suprapuse — dublează capacitatea pentru cămăși, bluze, pantaloni.',
    schematic: [
      { type: 'hanging-rod', flex: 0.5 },
      { type: 'hanging-rod', flex: 0.5 },
    ],
    build: (H) => {
      const half = Math.max(60, Math.round(H / 2));
      return [
        { id: newSectionId(), type: 'hanging-rod', heightCm: half },
        { id: newSectionId(), type: 'hanging-rod', heightCm: Math.max(60, H - half) },
      ];
    },
  },
  // 5. SHELVES ONLY (Tylko: "Shelves")
  {
    id: 'shelves-only',
    name: 'Doar rafturi',
    description: 'Cinci rafturi distanțate egal — pulovere, blugi, textile pliate.',
    schematic: [{ type: 'shelves', flex: 1, shelves: 5 }],
    build: (H) => [{ id: newSectionId(), type: 'shelves', heightCm: Math.max(60, H), shelfCount: 5 }],
  },
  // 6. DRAWERS ONLY (Tylko: "Drawers")
  {
    id: 'drawers-only',
    name: 'Doar sertare',
    description: 'Coloană completă de sertare — ideal pentru lenjerie, accesorii, tricouri.',
    schematic: [{ type: 'drawers', flex: 1, drawers: 5 }],
    build: (H) => [{ id: newSectionId(), type: 'drawers', heightCm: Math.max(80, H), drawerCount: 5 }],
  },
  // 7. SHOES (Tylko: "Shoes") — shoe rack column
  {
    id: 'shoes',
    name: 'Pantofi',
    description: 'Coloană de rafturi înclinate pentru pantofi + raft jos pentru cutii.',
    schematic: [
      { type: 'shoe-rack', flex: 0.75 },
      { type: 'shelves', flex: 0.25, shelves: 0 },
    ],
    build: (H) => {
      const bottom = 40;
      const shoes = Math.max(70, H - bottom);
      return [
        { id: newSectionId(), type: 'shelves', heightCm: bottom, shelfCount: 0 },
        { id: newSectionId(), type: 'shoe-rack', heightCm: shoes, shoeCount: Math.max(3, Math.round(shoes / 25)) },
      ];
    },
  },
  // 8. COMBO / MIX (Tylko: "Combo") — shelves + rod + drawers cu accesorii
  {
    id: 'combo',
    name: 'Combo complet',
    description: 'Rafturi sus, bară la mijloc, sertare jos + suport pantaloni — organizare totală.',
    schematic: [
      { type: 'shelves', flex: 0.22, shelves: 2 },
      { type: 'hanging-rod', flex: 0.4 },
      { type: 'pull-out-trouser', flex: 0.18 },
      { type: 'drawers', flex: 0.2, drawers: 2 },
    ],
    build: (H) => {
      const drawers = 50;
      const trousers = 55;
      const shelves = Math.max(30, Math.round((H - drawers - trousers) * 0.3));
      const hang = Math.max(60, H - drawers - trousers - shelves);
      return [
        { id: newSectionId(), type: 'drawers', heightCm: drawers, drawerCount: 2 },
        { id: newSectionId(), type: 'pull-out-trouser', heightCm: trousers, trouserRodCount: 4 },
        { id: newSectionId(), type: 'hanging-rod', heightCm: hang },
        { id: newSectionId(), type: 'shelves', heightCm: shelves, shelfCount: 2 },
      ];
    },
  },
];

// ===== DEFAULTS =====
let _sectionIdSeq = 1;
function newSectionId(): string {
  _sectionIdSeq += 1;
  return `sec-${Date.now().toString(36)}-${_sectionIdSeq}`;
}

/** Genereaza sectiunile implicite pentru un tip de interior */
export function sectionsForInteriorType(type: DressingInteriorType, interiorHeightCm = 180): DressingModuleSection[] {
  const H = Math.max(60, interiorHeightCm);
  switch (type) {
    case 'rafturi':
      // 1 singura sectiune de shelves ocupand tot spatiul, cu 4 rafturi interioare
      return [
        { id: newSectionId(), type: 'shelves', heightCm: H, shelfCount: 4 },
      ];
    case 'bara-raft':
      // Raft jos (45cm) + bara sus (rest)
      return [
        { id: newSectionId(), type: 'shelves',     heightCm: 45,       shelfCount: 0 },
        { id: newSectionId(), type: 'hanging-rod', heightCm: H - 45 },
      ];
    case 'mixt':
      // Sertare jos (50cm) + bara sus (rest)
      return [
        { id: newSectionId(), type: 'drawers',     heightCm: 50,       drawerCount: 2 },
        { id: newSectionId(), type: 'hanging-rod', heightCm: H - 50 },
      ];
    case 'rafturi-deschise':
    default:
      return [
        { id: newSectionId(), type: 'shelves', heightCm: H, shelfCount: 5 },
      ];
  }
}

function defaultModule(width = 100, interiorType: DressingInteriorType = 'bara-raft', bodyHeightCm = 180): DressingModuleConfig {
  return {
    width,
    interiorType,
    sections: sectionsForInteriorType(interiorType, bodyHeightCm),
    hasDoors: false,  // start cu usile ascunse ca clientul sa vada interiorul
    hasTopCompartment: true,
    topCompartmentHeight: 40,
  };
}

/** Hydreaza sectiuni daca un modul vine fara ele (backward-compat cu presets/persisted state) */
function ensureSections(m: DressingModuleConfig, bodyHeightCm = 180): DressingModuleConfig {
  if (m.sections && m.sections.length > 0) return m;
  return { ...m, sections: sectionsForInteriorType(m.interiorType, bodyHeightCm) };
}

// ===== PRESETS (preconfigurari moderne) =====
export interface DressingPreset {
  id: string;
  name: string;
  description: string;
  modules: DressingModuleConfig[];
  totalHeight: number;
  depth: number;
  plinthHeight: number;
  sideShelves: { position: 'none' | 'left' | 'right' | 'both'; columns: number; columnWidth: number; shelfCount: number; layout: 'uniform' | 'asimetric' | 'galerie' | 'vitrina' };
}

export const DRESSING_PRESETS: DressingPreset[] = [
  {
    id: 'essential-compact',
    name: 'Essential Compact',
    description: 'Trei module echilibrate, design curat, compartimente superioare.',
    modules: [
      { width: 90, interiorType: 'bara-raft', hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 38 },
      { width: 90, interiorType: 'mixt',      hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 38 },
      { width: 90, interiorType: 'rafturi',   hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 38 },
    ],
    totalHeight: 230,
    depth: 58,
    plinthHeight: 8,
    sideShelves: { position: 'none', columns: 2, columnWidth: 28, shelfCount: 5, layout: 'uniform' },
  },
  {
    id: 'minimal-walkin',
    name: 'Minimal Walk-In',
    description: 'Patru module largi, ritmic aranjate, fără compartimente superioare.',
    modules: [
      { width: 100, interiorType: 'bara-raft', hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 40 },
      { width: 100, interiorType: 'mixt',      hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 40 },
      { width: 100, interiorType: 'bara-raft', hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 40 },
      { width: 100, interiorType: 'rafturi',   hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 40 },
    ],
    totalHeight: 240,
    depth: 60,
    plinthHeight: 6,
    sideShelves: { position: 'none', columns: 2, columnWidth: 28, shelfCount: 5, layout: 'uniform' },
  },
  {
    id: 'gallery-open',
    name: 'Gallery Open',
    description: 'Compoziție dinamică cu module mixte pentru un aspect rafinat.',
    modules: [
      { width: 70,  interiorType: 'rafturi',   hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 40 },
      { width: 100, interiorType: 'bara-raft', hasDoors: false, hasTopCompartment: true,  topCompartmentHeight: 40 },
      { width: 100, interiorType: 'mixt',      hasDoors: false, hasTopCompartment: true,  topCompartmentHeight: 40 },
      { width: 70,  interiorType: 'rafturi',   hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 40 },
    ],
    totalHeight: 245,
    depth: 60,
    plinthHeight: 8,
    sideShelves: { position: 'none', columns: 2, columnWidth: 28, shelfCount: 5, layout: 'uniform' },
  },
  {
    id: 'boutique-suite',
    name: 'Boutique Suite',
    description: 'Compoziție premium cu compartimente mari deasupra și bibliotecă laterală.',
    modules: [
      { width: 95,  interiorType: 'mixt',      hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 45 },
      { width: 95,  interiorType: 'bara-raft', hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 45 },
      { width: 95,  interiorType: 'bara-raft', hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 45 },
      { width: 95,  interiorType: 'rafturi',   hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 45 },
    ],
    totalHeight: 260,
    depth: 62,
    plinthHeight: 10,
    sideShelves: { position: 'right', columns: 3, columnWidth: 32, shelfCount: 6, layout: 'galerie' },
  },
  {
    id: 'atelier-wide',
    name: 'Atelier Wide',
    description: 'Cinci module asimetrice cu bibliotecă pe ambele părți pentru un dressing complet.',
    modules: [
      { width: 80,  interiorType: 'rafturi',   hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 42 },
      { width: 110, interiorType: 'bara-raft', hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 42 },
      { width: 110, interiorType: 'mixt',      hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 42 },
      { width: 110, interiorType: 'bara-raft', hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 42 },
      { width: 80,  interiorType: 'rafturi',   hasDoors: false, hasTopCompartment: true, topCompartmentHeight: 42 },
    ],
    totalHeight: 250,
    depth: 60,
    plinthHeight: 8,
    sideShelves: { position: 'both', columns: 2, columnWidth: 30, shelfCount: 5, layout: 'asimetric' },
  },
];

const defaultConfig: DressingUnitConfig = {
  moduleCount: 3,
  modules: DRESSING_PRESETS[0].modules.map((m) => ensureSections({ ...m }, DRESSING_PRESETS[0].totalHeight - DRESSING_PRESETS[0].plinthHeight - (m.hasTopCompartment ? m.topCompartmentHeight : 0))),
  sideShelves: { ...DRESSING_PRESETS[0].sideShelves },
  totalWidth: 270,
  totalHeight: DRESSING_PRESETS[0].totalHeight,
  depth: DRESSING_PRESETS[0].depth,
  plinthHeight: DRESSING_PRESETS[0].plinthHeight,
  bodyMaterialId: 'EGGER_H3730_ST10_Natural Hickory',
  frontMaterialId: 'EGGER_W1100_ST9_Alpine White',
};

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

// ===== SECTION GEOMETRY HELPERS =====

/** Inaltimea utila (cm) in care intra secțiunile unui modul (intre panoul de jos si cel de sus al corpului). */
export function moduleInteriorHeight(cfg: DressingUnitConfig, m: DressingModuleConfig): number {
  const topH = m.hasTopCompartment ? m.topCompartmentHeight : 0;
  return Math.max(40, cfg.totalHeight - cfg.plinthHeight - topH - 2 * PANEL_T_CM);
}

function sumSectionsH(sections: DressingModuleSection[]): number {
  return sections.reduce((s, sec) => s + sec.heightCm, 0);
}

function sectionMinH(sec: DressingModuleSection): number {
  return Math.max(DRESSING_UNIT_LIMITS.sectionHeight.min, SECTION_MIN_HEIGHT[sec.type]);
}

/** Rescaleaza proportional toate sectiunile sa insumeze exact `targetH`, cu respectarea minimelor. */
function normalizeSections(sections: DressingModuleSection[], targetH: number): DressingModuleSection[] {
  if (sections.length === 0) return sections;
  const n = sections.length;
  const target = Math.max(n * DRESSING_UNIT_LIMITS.sectionHeight.min, Math.round(targetH));
  const mins = sections.map(sectionMinH);
  const minSum = mins.reduce((a, b) => a + b, 0);
  if (target <= minSum) {
    // Nu incape — setam totul la min; primul capata restul eventual (capat)
    const r = sections.map((s, i) => ({ ...s, heightCm: mins[i] }));
    // Adjust ultima sectiune ca totalul sa = target (chiar daca < minSum pt siguranta)
    const diff = target - r.reduce((a, s) => a + s.heightCm, 0);
    r[r.length - 1] = { ...r[r.length - 1], heightCm: Math.max(DRESSING_UNIT_LIMITS.sectionHeight.min, r[r.length - 1].heightCm + diff) };
    return r;
  }
  const currentSum = sumSectionsH(sections);
  if (Math.abs(currentSum - target) < 0.5) {
    return sections.map((s) => ({ ...s, heightCm: Math.round(s.heightCm) }));
  }
  // Scaling proportional cu respectarea minimelor
  // Metoda: initial proportional, apoi ajustam iterativ pt min-clamped
  let scaled = sections.map((s, i) => ({ ...s, heightCm: Math.max(mins[i], Math.round((s.heightCm / Math.max(1, currentSum)) * target)) }));
  // Drift correction
  let drift = target - sumSectionsH(scaled);
  let safety = 20;
  while (drift !== 0 && safety-- > 0) {
    // distribuim drift pe sectiunile cu heightCm > min (putem lua) sau pe toate (putem da)
    const candidateIdxs = drift > 0
      ? scaled.map((_, i) => i)   // crestem oriunde
      : scaled.map((_, i) => i).filter((i) => scaled[i].heightCm > mins[i]);
    if (candidateIdxs.length === 0) break;
    const step = drift > 0 ? 1 : -1;
    for (const i of candidateIdxs) {
      if (drift === 0) break;
      const next = scaled[i].heightCm + step;
      if (next < mins[i]) continue;
      scaled[i] = { ...scaled[i], heightCm: next };
      drift -= step;
    }
  }
  return scaled;
}

/** Redistribuie un delta (pozitiv sau negativ) pe sectiunile indicate, respectand minimele. */
function distributeSectionDelta(sections: DressingModuleSection[], skipIdx: number, deltaToAdd: number): DressingModuleSection[] {
  const MAX = DRESSING_UNIT_LIMITS.sectionHeight.max;
  const result = sections.map((s) => ({ ...s }));
  let remaining = deltaToAdd;
  let free = result.map((_, i) => i).filter((i) => i !== skipIdx);
  let safety = 20;
  while (free.length > 0 && Math.abs(remaining) >= 1 && safety-- > 0) {
    const share = remaining / free.length;
    const nextFree: number[] = [];
    let consumed = 0;
    for (const i of free) {
      const min = sectionMinH(result[i]);
      const target = result[i].heightCm + share;
      const clamped = Math.max(min, Math.min(MAX, target));
      consumed += clamped - result[i].heightCm;
      result[i] = { ...result[i], heightCm: Math.round(clamped) };
      if (clamped > min + 0.5 && clamped < MAX - 0.5) nextFree.push(i);
    }
    remaining -= consumed;
    if (nextFree.length === free.length) break;
    free = nextFree;
  }
  return result;
}

/** Asigura ca toate modulele au sectiunile normalizate la moduleInteriorHeight. */
function normalizeAllModuleSections(cfg: DressingUnitConfig): DressingUnitConfig {
  const modules = cfg.modules.map((m) => {
    const target = moduleInteriorHeight(cfg, m);
    let sections = (m.sections && m.sections.length > 0) ? m.sections : sectionsForInteriorType(m.interiorType, target);
    sections = normalizeSections(sections, target);
    return { ...m, sections };
  });
  return { ...cfg, modules };
}

export function sideShelvesWidth(cfg: DressingUnitConfig): number {
  const s = cfg.sideShelves;
  if (s.position === 'none') return 0;
  const sides = s.position === 'both' ? 2 : 1;
  // Biblioteca laterala are deschiderea in lateral: iese din dressing cu columnWidth
  // (indiferent de cate coloane front-spate exista in interior)
  return sides * s.columnWidth;
}

function recalcTotalWidth(cfg: DressingUnitConfig): number {
  const sum = cfg.modules.reduce((acc, m) => acc + m.width, 0) + sideShelvesWidth(cfg);
  return Math.round(sum * 10) / 10;
}

function resizeModules(modules: DressingModuleConfig[], count: number): DressingModuleConfig[] {
  if (modules.length === count) return modules;
  if (modules.length > count) return modules.slice(0, count);
  const template = modules[modules.length - 1] || defaultModule();
  const extra = Array.from({ length: count - modules.length }, () => ({
    ...template,
    // sectiunile trebuie sa aiba id-uri unice — regeneram din preset
    sections: sectionsForInteriorType(template.interiorType, 180),
  }));
  return [...modules, ...extra];
}

/**
 * Distribuie o variatie `deltaToAdd` intre modulele indicate (skipping `skipIdx`),
 * respectand limitele per-modul. Daca unele module ating limitele, restul este
 * preluat iterativ de modulele ramase libere.
 */
function distributeWidthDelta(widths: number[], skipIdx: number, deltaToAdd: number): number[] {
  const MIN = DRESSING_UNIT_LIMITS.moduleWidth.min;
  const MAX = DRESSING_UNIT_LIMITS.moduleWidth.max;
  const result = [...widths];
  let remaining = deltaToAdd;
  let free = result.map((_, i) => i).filter((i) => i !== skipIdx);
  let safety = 10;
  while (free.length > 0 && Math.abs(remaining) > 0.01 && safety-- > 0) {
    const share = remaining / free.length;
    const nextFree: number[] = [];
    let consumed = 0;
    for (const i of free) {
      const target = result[i] + share;
      const clamped = Math.max(MIN, Math.min(MAX, target));
      consumed += clamped - result[i];
      result[i] = clamped;
      if (clamped > MIN + 0.001 && clamped < MAX - 0.001) nextFree.push(i);
    }
    remaining -= consumed;
    if (nextFree.length === free.length) break; // nu mai exista capacitate
    free = nextFree;
  }
  return result.map((w) => Math.round(w * 10) / 10);
}

// ===== PRICE CALCULATION =====
export function calculateDressingUnitPrice(config: DressingUnitConfig) {
  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);
  const bodyMul = bodyMat?.priceMultiplier || 1;
  const frontMul = frontMat?.priceMultiplier || 1;

  const bodyHeight = config.totalHeight - config.plinthHeight;

  let bodyCost = 0;
  let interiorCost = 0;
  let frontsCost = 0;
  let doorModules = 0;
  let topCompartmentCost = 0;

  for (const m of config.modules) {
    bodyCost += (m.width + bodyHeight) * config.depth * 0.06 * bodyMul;

    if (m.hasTopCompartment) {
      // Cutie independenta: 2 laterale + top + bottom + spate
      topCompartmentCost += (2 * m.topCompartmentHeight + 2 * m.width) * config.depth * 0.04 * bodyMul;
      topCompartmentCost += m.width * m.topCompartmentHeight * 0.02 * bodyMul; // spate
    }

    if (m.sections && m.sections.length > 0) {
      // Cost bazat pe sectiuni (mai fidel pt build-your-own)
      const sepCount = Math.max(0, m.sections.length - 1);
      interiorCost += sepCount * m.width * config.depth * 0.008 * bodyMul; // separatoare intre sectiuni
      for (const sec of m.sections) {
        switch (sec.type) {
          case 'shelves': {
            const n = Math.max(0, sec.shelfCount ?? 0);
            interiorCost += n * m.width * config.depth * 0.008 * bodyMul;
            break;
          }
          case 'hanging-rod':
            interiorCost += 60; // bara metalica + suporti
            break;
          case 'drawers': {
            const n = Math.max(1, sec.drawerCount ?? 1);
            interiorCost += n * 80 * bodyMul; // front sertar + glisiere
            break;
          }
          case 'shoe-rack': {
            const n = Math.max(2, sec.shoeCount ?? 3);
            interiorCost += n * m.width * config.depth * 0.012 * bodyMul; // rafturi inclinate + stopper
            break;
          }
          case 'pull-out-trouser': {
            const n = Math.max(2, sec.trouserRodCount ?? 4);
            interiorCost += 120 + n * 12; // sine telescopice + bare metalice
            break;
          }
          case 'pull-out-basket': {
            const n = Math.max(1, sec.basketCount ?? 2);
            interiorCost += n * 95; // cos sarma + glisiere telescopice
            break;
          }
          case 'mirror':
            interiorCost += m.width * sec.heightCm * 0.018 * bodyMul; // panou oglinda argintata
            break;
          case 'empty':
          default:
            break;
        }
      }
    } else {
      switch (m.interiorType) {
        case 'bara-raft':
          interiorCost += m.width * config.depth * 0.008 * bodyMul;
          interiorCost += 60;
          break;
        case 'rafturi':
          interiorCost += 4 * m.width * config.depth * 0.008 * bodyMul;
          break;
        case 'mixt':
          interiorCost += m.width * config.depth * 0.008 * bodyMul;
          interiorCost += 60;
          interiorCost += 2 * 80 * bodyMul;
          break;
        case 'rafturi-deschise':
          interiorCost += 6 * m.width * config.depth * 0.01 * bodyMul;
          break;
      }
    }

    // Toate modulele au usi structural (hasDoors controleaza doar vizibilitatea in 3D)
    doorModules += 1;
    // Usile merg de la podea pana la varf (includ si plinta in fata lor)
    const fullDoorH = config.totalHeight;
    frontsCost += m.width * fullDoorH * 0.04 * frontMul;
  }

  // Biblioteca laterala (side shelves): deschidere in lateral
  // Structura per parte: front (in culoarea frontului, pana la podea) + panou spate (la exterior)
  //                    + spate catre dressing + (columns-1) separatoare interioare + rafturi
  //                    (FARA top/bottom cap)
  let sideShelvesCost = 0;
  let sideFrontCost = 0;
  const sw = sideShelvesWidth(config);
  if (sw > 0) {
    const s = config.sideShelves;
    const sides = s.position === 'both' ? 2 : 1;
    const libDepth = s.columnWidth;   // cat iese in afara (X)
    const libZ = config.depth;        // adancime pe Z (aliniata cu dressingul)
    const libH = config.totalHeight;  // inaltime totala (fara plinta - biblioteca pana la podea)
    // Front - in culoarea frontului, pe toata inaltimea
    sideFrontCost += sides * libH * libDepth * 0.04 * frontMul;
    // Spate individual (panou complet de la podea la top)
    sideShelvesCost += sides * libH * libDepth * 0.04 * bodyMul;
    // Panou lateral intre biblioteca si modul (de la podea la top)
    sideShelvesCost += sides * libH * libZ * 0.04 * bodyMul;
    // Separatoare interioare (intre coloane): (columns - 1) per parte
    sideShelvesCost += sides * Math.max(0, s.columns - 1) * libH * libDepth * 0.04 * bodyMul;
    // Rafturi: columns coloane × shelfCount rafturi
    const shelfZWidth = libZ / s.columns;
    sideShelvesCost += sides * s.columns * s.shelfCount * shelfZWidth * libDepth * 0.01 * bodyMul;
  }
  frontsCost += sideFrontCost;

  const plinthCost = config.plinthHeight > 0 ? (config.totalWidth - sw) * config.plinthHeight * 0.03 * bodyMul : 0;
  const hardwareCost = 250 + 100 * doorModules;

  const depthFactor = config.depth / 60;
  const total = (bodyCost + topCompartmentCost + interiorCost + frontsCost + sideShelvesCost + plinthCost + hardwareCost) * depthFactor;

  let discountPercent = 0;
  if (total >= 15000) discountPercent = 0.15;
  else if (total >= 10000) discountPercent = 0.12;
  else if (total >= 7500) discountPercent = 0.10;
  else if (total >= 5000) discountPercent = 0.08;
  else if (total >= 3000) discountPercent = 0.05;
  const discount = total * discountPercent;

  return {
    bodyCost: Math.round((bodyCost + topCompartmentCost + sideShelvesCost) * depthFactor),
    interiorCost: Math.round(interiorCost * depthFactor),
    frontsCost: Math.round(frontsCost * depthFactor),
    plinthCost: Math.round(plinthCost * depthFactor),
    hardwareCost: Math.round(hardwareCost),
    totalBeforeDiscount: Math.round(total),
    discount: Math.round(discount),
    total: Math.round(total - discount),
  };
}

// ===== STORE =====
interface DressingUnitState {
  config: DressingUnitConfig;
  currentStep: DressingUnitStep;
  steps: DressingUnitStep[];
  price: ReturnType<typeof calculateDressingUnitPrice>;

  /** UI-only: secțiunea activă per modul (pentru editor Tylko-like). */
  activeSectionByModule: Record<number, string | null>;
  setActiveSection: (moduleIdx: number, sectionId: string | null) => void;

  /** UI-only: modulul selectat (click în 3D sau expandat în panou). */
  selectedModuleIdx: number | null;
  setSelectedModule: (idx: number | null) => void;

  setModuleCount: (v: number) => void;
  setTotalModulesWidth: (v: number) => void;
  setTotalHeight: (v: number) => void;
  setDepth: (v: number) => void;
  setPlinthHeight: (v: number) => void;

  setModuleWidth: (index: number, v: number) => void;
  setModuleInterior: (index: number, type: DressingInteriorType) => void;
  toggleModuleDoors: (index: number) => void;
  toggleModuleTopCompartment: (index: number) => void;
  setModuleTopCompartmentHeight: (index: number, v: number) => void;

  addModuleSection: (index: number, type: DressingSectionType) => void;
  insertModuleSection: (index: number, position: number, type: DressingSectionType) => void;
  removeModuleSection: (index: number, sectionId: string) => void;
  updateModuleSection: (index: number, sectionId: string, patch: Partial<DressingModuleSection>) => void;
  moveModuleSection: (index: number, sectionId: string, direction: 'up' | 'down') => void;
  /** Redimensionează doar două secțiuni adiacente (drag între ele). `bottomId` primește `newBottomHeight` dacă încape. */
  resizeAdjacentSections: (index: number, topId: string, bottomId: string, newBottomHeight: number) => void;
  /** Copiază secțiunile modulului sursă în toate celelalte module (normalizate la înălțimea lor interioară). */
  copyModuleSectionsToAll: (sourceIndex: number) => void;

  setSideShelvesPosition: (p: DressingSidePosition) => void;
  setSideShelvesColumns: (n: number) => void;
  setSideShelvesColumnWidth: (v: number) => void;
  setSideShelvesShelfCount: (n: number) => void;
  setSideShelvesLayout: (layout: DressingSideLayout) => void;

  applyPreset: (presetId: string) => void;
  /** Aplică un preset de funcție pe un singur modul (Tylko-style). Înlocuiește sectiunile. */
  applyModulePreset: (index: number, presetId: string) => void;
  toggleAllDoors: () => void;

  setBodyMaterial: (id: string) => void;
  setFrontMaterial: (id: string) => void;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: DressingUnitStep) => void;
  resetConfig: () => void;
}

function commit(set: any, config: DressingUnitConfig) {
  const withSections = normalizeAllModuleSections(config);
  const normalized = { ...withSections, totalWidth: recalcTotalWidth(withSections) };
  set({ config: normalized, price: calculateDressingUnitPrice(normalized) });
}

function updateModule(
  set: any,
  get: any,
  index: number,
  updater: (m: DressingModuleConfig) => DressingModuleConfig
) {
  const prev = get().config as DressingUnitConfig;
  if (index < 0 || index >= prev.modules.length) return;
  const modules = prev.modules.map((m, i) => (i === index ? updater(m) : m));
  commit(set, { ...prev, modules });
}

export const useDressingUnitStore = create<DressingUnitState>((set, get) => ({
  config: { ...defaultConfig, totalWidth: recalcTotalWidth(defaultConfig) },
  currentStep: 'size',
  steps: STEPS,
  price: calculateDressingUnitPrice(defaultConfig),

  activeSectionByModule: {},
  setActiveSection: (moduleIdx, sectionId) => {
    set((s) => ({
      activeSectionByModule: { ...s.activeSectionByModule, [moduleIdx]: sectionId },
    }));
  },

  selectedModuleIdx: null,
  setSelectedModule: (idx) => set({ selectedModuleIdx: idx }),

  setModuleCount: (v) => {
    const prev = get().config;
    const val = clamp(Math.round(v), DRESSING_UNIT_LIMITS.moduleCount.min, DRESSING_UNIT_LIMITS.moduleCount.max);
    if (val === prev.modules.length) return;
    // Păstrăm totalWidth: redistribuim egal lățimea modulelor pe noul număr.
    const resized = resizeModules(prev.modules, val);
    const sideW = sideShelvesWidth(prev);
    const targetModulesW = Math.max(
      val * DRESSING_UNIT_LIMITS.moduleWidth.min,
      Math.min(val * DRESSING_UNIT_LIMITS.moduleWidth.max, Math.round((prev.totalWidth - sideW) * 10) / 10),
    );
    const each = clamp(
      Math.round((targetModulesW / val) * 10) / 10,
      DRESSING_UNIT_LIMITS.moduleWidth.min,
      DRESSING_UNIT_LIMITS.moduleWidth.max,
    );
    const redistributed = resized.map((m) => ({ ...m, width: each }));
    // Drift correction pe ultimul modul
    const actual = redistributed.reduce((a, m) => a + m.width, 0);
    const drift = Math.round((targetModulesW - actual) * 10) / 10;
    if (Math.abs(drift) >= 0.1 && redistributed.length > 0) {
      const last = redistributed[redistributed.length - 1];
      redistributed[redistributed.length - 1] = {
        ...last,
        width: clamp(
          Math.round((last.width + drift) * 10) / 10,
          DRESSING_UNIT_LIMITS.moduleWidth.min,
          DRESSING_UNIT_LIMITS.moduleWidth.max,
        ),
      };
    }
    commit(set, { ...prev, moduleCount: val, modules: redistributed });
  },

  setTotalModulesWidth: (v) => {
    const prev = get().config;
    const n = prev.modules.length;
    if (n === 0) return;
    // distribuie egal pe fiecare modul, respectand limitele per-modul
    const minTotal = n * DRESSING_UNIT_LIMITS.moduleWidth.min;
    const maxTotal = n * DRESSING_UNIT_LIMITS.moduleWidth.max;
    const total = clamp(v, minTotal, maxTotal);
    const each = Math.round((total / n) * 10) / 10;
    const eachClamped = clamp(each, DRESSING_UNIT_LIMITS.moduleWidth.min, DRESSING_UNIT_LIMITS.moduleWidth.max);
    const modules = prev.modules.map((m) => ({ ...m, width: eachClamped }));
    commit(set, { ...prev, modules });
  },

  setTotalHeight: (v) => {
    const prev = get().config;
    const val = clamp(v, DRESSING_UNIT_LIMITS.totalHeight.min, DRESSING_UNIT_LIMITS.totalHeight.max);
    commit(set, { ...prev, totalHeight: val });
  },

  setDepth: (v) => {
    const prev = get().config;
    const val = clamp(v, DRESSING_UNIT_LIMITS.depth.min, DRESSING_UNIT_LIMITS.depth.max);
    commit(set, { ...prev, depth: val });
  },

  setPlinthHeight: (v) => {
    const prev = get().config;
    const val = clamp(v, DRESSING_UNIT_LIMITS.plinthHeight.min, DRESSING_UNIT_LIMITS.plinthHeight.max);
    commit(set, { ...prev, plinthHeight: val });
  },

  setModuleWidth: (index, v) => {
    const prev = get().config;
    const n = prev.modules.length;
    const MIN = DRESSING_UNIT_LIMITS.moduleWidth.min;
    const MAX = DRESSING_UNIT_LIMITS.moduleWidth.max;
    const requested = clamp(v, MIN, MAX);
    if (n <= 1) {
      updateModule(set, get, index, (m) => ({ ...m, width: requested }));
      return;
    }
    const oldW = prev.modules[index].width;
    const delta = requested - oldW;
    // Cat pot absorbi celelalte module (pastram totalul cat posibil)
    const othersTotal = prev.modules.reduce((s, m, i) => (i === index ? s : s + m.width), 0);
    const minOthers = (n - 1) * MIN;
    const maxOthers = (n - 1) * MAX;
    const absorbablePos = othersTotal - minOthers;  // cat pot scadea ceilalti
    const absorbableNeg = othersTotal - maxOthers;  // cat pot creste ceilalti (<=0)
    // Cat din delta se redistribuie (restul lasam sa afecteze totalul)
    const absorbed = delta > 0 ? Math.min(delta, absorbablePos) : Math.max(delta, absorbableNeg);
    const newVal = Math.round(requested * 10) / 10;
    const widths = prev.modules.map((m) => m.width);
    const distributed = distributeWidthDelta(widths, index, -absorbed);
    distributed[index] = newVal;
    // Corectie drift de rotunjire: totalul trebuie sa fie othersTotal + oldW + (delta - absorbed)
    const targetTotal = Math.round((othersTotal + oldW + (delta - absorbed)) * 10) / 10;
    const actualTotal = distributed.reduce((s, w) => s + w, 0);
    const drift = Math.round((targetTotal - actualTotal) * 10) / 10;
    if (Math.abs(drift) > 0.001) {
      // aplic drift pe primul modul liber (non-index, in interior limite)
      for (let i = 0; i < distributed.length; i++) {
        if (i === index) continue;
        const adj = distributed[i] + drift;
        if (adj >= MIN - 0.001 && adj <= MAX + 0.001) {
          distributed[i] = Math.round(adj * 10) / 10;
          break;
        }
      }
    }
    const modules = prev.modules.map((m, i) => ({ ...m, width: distributed[i] }));
    commit(set, { ...prev, modules });
  },

  setModuleInterior: (index, type) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m) return;
    const interiorH = moduleInteriorHeight(prev, m);
    updateModule(set, get, index, (mm) => ({
      ...mm,
      interiorType: type,
      sections: sectionsForInteriorType(type, interiorH),
    }));
  },

  addModuleSection: (index, type) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m) return;
    const current = m.sections || [];
    const target = moduleInteriorHeight(prev, m);
    const desired = SECTION_DEFAULT_HEIGHT[type];
    const minNew = SECTION_MIN_HEIGHT[type];
    // Cat loc putem elibera din celelalte (total - sum(mins))?
    const currentMinSum = current.reduce((s, sec) => s + sectionMinH(sec), 0);
    const currentSum = sumSectionsH(current);
    const available = Math.max(0, currentSum - currentMinSum); // cat pot da celelalte
    if (available < minNew) return; // nu intra — operatie silentios ignorata
    const newHeight = Math.min(desired, available);

    // Creez sectiunea noua
    const defaults: Record<DressingSectionType, Partial<DressingModuleSection>> = {
      'drawers':          { drawerCount: 2 },
      'shelves':          { shelfCount: 2 },
      'hanging-rod':      {},
      'shoe-rack':        { shoeCount: 3 },
      'pull-out-trouser': { trouserRodCount: 4 },
      'pull-out-basket':  { basketCount: 2 },
      'mirror':           {},
      'empty':            {},
    };
    const newSec: DressingModuleSection = {
      id: newSectionId(),
      type,
      heightCm: newHeight,
      ...defaults[type],
    };
    // Redistribuie -newHeight pe sectiunile existente (proportional)
    const reduced = distributeSectionDelta(current, -1, -newHeight);
    // Insereaza noua sectiune sus (la capatul array-ului = sus vizual)
    const sections = [...reduced, newSec];
    updateModule(set, get, index, (mm) => ({ ...mm, sections }));
  },

  insertModuleSection: (index, position, type) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m) return;
    const current = m.sections || [];
    const desired = SECTION_DEFAULT_HEIGHT[type];
    const minNew = SECTION_MIN_HEIGHT[type];
    const currentMinSum = current.reduce((s, sec) => s + sectionMinH(sec), 0);
    const currentSum = sumSectionsH(current);
    const available = Math.max(0, currentSum - currentMinSum);
    if (available < minNew) return;
    const newHeight = Math.min(desired, available);
    const defaults: Record<DressingSectionType, Partial<DressingModuleSection>> = {
      'drawers':          { drawerCount: 2 },
      'shelves':          { shelfCount: 2 },
      'hanging-rod':      {},
      'shoe-rack':        { shoeCount: 3 },
      'pull-out-trouser': { trouserRodCount: 4 },
      'pull-out-basket':  { basketCount: 2 },
      'mirror':           {},
      'empty':            {},
    };
    const newSec: DressingModuleSection = {
      id: newSectionId(),
      type,
      heightCm: newHeight,
      ...defaults[type],
    };
    const reduced = distributeSectionDelta(current, -1, -newHeight);
    const clampedPos = Math.max(0, Math.min(position, reduced.length));
    const sections = [...reduced.slice(0, clampedPos), newSec, ...reduced.slice(clampedPos)];
    updateModule(set, get, index, (mm) => ({ ...mm, sections }));
    set((s: DressingUnitState) => ({
      activeSectionByModule: { ...s.activeSectionByModule, [index]: newSec.id },
    }));
  },

  resizeAdjacentSections: (index, topId, bottomId, newBottomHeight) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m || !m.sections) return;
    const topIdx = m.sections.findIndex((s) => s.id === topId);
    const botIdx = m.sections.findIndex((s) => s.id === bottomId);
    if (topIdx < 0 || botIdx < 0) return;
    const top = m.sections[topIdx];
    const bot = m.sections[botIdx];
    const minBot = sectionMinH(bot);
    const minTop = sectionMinH(top);
    const pairSum = top.heightCm + bot.heightCm;
    const maxBot = pairSum - minTop;
    const newBot = clamp(Math.round(newBottomHeight), minBot, Math.max(minBot, maxBot));
    const newTop = pairSum - newBot;
    if (newBot === bot.heightCm && newTop === top.heightCm) return;
    const sections = m.sections.map((s, i) => {
      if (i === topIdx) return { ...s, heightCm: newTop };
      if (i === botIdx) return { ...s, heightCm: newBot };
      return s;
    });
    updateModule(set, get, index, (mm) => ({ ...mm, sections }));
  },

  copyModuleSectionsToAll: (sourceIndex) => {
    const prev = get().config;
    const src = prev.modules[sourceIndex];
    if (!src || !src.sections || src.sections.length === 0) return;
    const modules = prev.modules.map((m, i) => {
      if (i === sourceIndex) return m;
      // Copie cu id-uri noi — normalizarea la înălțimea interioară a modulului
      // destinație se aplică automat în commit()
      const cloned = src.sections!.map((s) => ({ ...s, id: newSectionId() }));
      return { ...m, sections: cloned };
    });
    commit(set, { ...prev, modules });
  },

  removeModuleSection: (index, sectionId) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m || !m.sections) return;
    if (m.sections.length <= 1) return; // pastram macar o sectiune
    const removed = m.sections.find((s) => s.id === sectionId);
    if (!removed) return;
    const remaining = m.sections.filter((s) => s.id !== sectionId);
    // Redistribuie inaltimea sectiunii sterse pe celelalte (proportional la cat au deja)
    const sumRem = sumSectionsH(remaining);
    const scaled = remaining.map((s) => ({
      ...s,
      heightCm: Math.round(s.heightCm + (removed.heightCm * (s.heightCm / Math.max(1, sumRem)))),
    }));
    updateModule(set, get, index, (mm) => ({ ...mm, sections: scaled }));
  },

  updateModuleSection: (index, sectionId, patch) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m || !m.sections) return;
    const idx = m.sections.findIndex((s) => s.id === sectionId);
    if (idx < 0) return;
    const current = m.sections[idx];

    // Cazul heightCm: redistribuim delta pe celelalte ca totalul sa se pastreze
    if (patch.heightCm !== undefined) {
      const target = moduleInteriorHeight(prev, m);
      const MIN = sectionMinH(current);
      // maximum = target - suma minimelor celorlalte (ca sa ramana loc pentru ele)
      const othersMin = m.sections.reduce((s, sec, i) => (i === idx ? s : s + sectionMinH(sec)), 0);
      const MAX = Math.min(DRESSING_UNIT_LIMITS.sectionHeight.max, target - othersMin);
      const newH = clamp(Math.round(patch.heightCm), MIN, Math.max(MIN, MAX));
      const delta = newH - current.heightCm;
      if (delta === 0) return;
      // Redistribuim -delta pe celelalte
      const withNew = m.sections.map((s, i) => (i === idx ? { ...s, heightCm: newH } : s));
      const redistributed = distributeSectionDelta(withNew, idx, -delta);
      // Asiguram ca sectiunea tinta are exact newH
      redistributed[idx] = { ...redistributed[idx], heightCm: newH };
      // Drift correction pe prima alta sectiune libera
      const driftTarget = target - sumSectionsH(redistributed);
      if (Math.abs(driftTarget) >= 1) {
        for (let j = 0; j < redistributed.length; j++) {
          if (j === idx) continue;
          const adj = redistributed[j].heightCm + driftTarget;
          const minJ = sectionMinH(redistributed[j]);
          if (adj >= minJ && adj <= DRESSING_UNIT_LIMITS.sectionHeight.max) {
            redistributed[j] = { ...redistributed[j], heightCm: Math.round(adj) };
            break;
          }
        }
      }
      updateModule(set, get, index, (mm) => ({ ...mm, sections: redistributed }));
      return;
    }

    // Alte patch-uri (drawerCount, shelfCount, type): aplicam direct cu validare
    const sections = m.sections.map((s) => {
      if (s.id !== sectionId) return s;
      const merged = { ...s, ...patch } as DressingModuleSection;
      if (merged.type === 'drawers') {
        merged.drawerCount = clamp(Math.round(merged.drawerCount ?? 2), DRESSING_UNIT_LIMITS.drawerCount.min, DRESSING_UNIT_LIMITS.drawerCount.max);
        delete (merged as any).shelfCount;
      } else if (merged.type === 'shelves') {
        merged.shelfCount = clamp(Math.round(merged.shelfCount ?? 2), DRESSING_UNIT_LIMITS.sectionShelfCount.min, DRESSING_UNIT_LIMITS.sectionShelfCount.max);
        delete (merged as any).drawerCount;
      } else {
        delete (merged as any).drawerCount;
        delete (merged as any).shelfCount;
      }
      return merged;
    });
    updateModule(set, get, index, (mm) => ({ ...mm, sections }));
  },

  moveModuleSection: (index, sectionId, direction) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m || !m.sections) return;
    const i = m.sections.findIndex((s) => s.id === sectionId);
    if (i < 0) return;
    const j = direction === 'up' ? i + 1 : i - 1; // bottom-to-top: "up" = index+1
    if (j < 0 || j >= m.sections.length) return;
    const sections = [...m.sections];
    [sections[i], sections[j]] = [sections[j], sections[i]];
    updateModule(set, get, index, (mm) => ({ ...mm, sections }));
  },

  toggleModuleDoors: (index) => {
    updateModule(set, get, index, (m) => ({ ...m, hasDoors: !m.hasDoors }));
  },

  toggleModuleTopCompartment: (index) => {
    // Compartimentul superior este obligatoriu — no-op pastrat pentru compatibilitate
    updateModule(set, get, index, (m) => ({ ...m, hasTopCompartment: true }));
  },

  setModuleTopCompartmentHeight: (index, v) => {
    const val = clamp(v, DRESSING_UNIT_LIMITS.topCompartmentHeight.min, DRESSING_UNIT_LIMITS.topCompartmentHeight.max);
    updateModule(set, get, index, (m) => ({ ...m, topCompartmentHeight: val }));
  },

  setSideShelvesPosition: (p) => {
    const prev = get().config;
    commit(set, { ...prev, sideShelves: { ...prev.sideShelves, position: p } });
  },
  setSideShelvesColumns: (n) => {
    const prev = get().config;
    const val = clamp(Math.round(n), DRESSING_UNIT_LIMITS.sideColumns.min, DRESSING_UNIT_LIMITS.sideColumns.max);
    commit(set, { ...prev, sideShelves: { ...prev.sideShelves, columns: val } });
  },
  setSideShelvesColumnWidth: (v) => {
    const prev = get().config;
    const val = clamp(v, DRESSING_UNIT_LIMITS.sideColumnWidth.min, DRESSING_UNIT_LIMITS.sideColumnWidth.max);
    commit(set, { ...prev, sideShelves: { ...prev.sideShelves, columnWidth: val } });
  },
  setSideShelvesShelfCount: (n) => {
    const prev = get().config;
    const val = clamp(Math.round(n), DRESSING_UNIT_LIMITS.sideShelfCount.min, DRESSING_UNIT_LIMITS.sideShelfCount.max);
    commit(set, { ...prev, sideShelves: { ...prev.sideShelves, shelfCount: val } });
  },
  setSideShelvesLayout: (layout) => {
    const prev = get().config;
    commit(set, { ...prev, sideShelves: { ...prev.sideShelves, layout } });
  },

  applyPreset: (presetId) => {
    const preset = DRESSING_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const prev = get().config;
    // PĂSTRĂM dimensiunile exterioare din pasul 1:
    //   - totalHeight, depth, plinthHeight, bodyMaterial, frontMaterial (neatinse)
    //   - totalWidth (= module + bibliotecă laterală) — EXACT aceeași valoare după preset
    // Importăm din preset doar LAYOUT-ul: număr module, proporții relative module, side shelves.
    const prevTotalWidth = prev.totalWidth;
    // Calculăm câtă lățime ocupă side shelves din PRESET (păstrăm columnWidth preset)
    const presetSideWidth = (() => {
      const s = preset.sideShelves;
      if (s.position === 'none') return 0;
      const sides = s.position === 'both' ? 2 : 1;
      return sides * s.columnWidth;
    })();
    // Lățime disponibilă pentru module după ce scădem biblioteca laterală
    const targetModulesW = Math.max(
      preset.modules.length * DRESSING_UNIT_LIMITS.moduleWidth.min,
      Math.min(
        preset.modules.length * DRESSING_UNIT_LIMITS.moduleWidth.max,
        Math.round((prevTotalWidth - presetSideWidth) * 10) / 10,
      ),
    );
    const presetModulesW = preset.modules.reduce((a, m) => a + m.width, 0) || 1;
    const scale = targetModulesW / presetModulesW;
    const bodyH = prev.totalHeight - prev.plinthHeight;
    const scaledModules = preset.modules.map((m) => {
      const scaledW = clamp(
        Math.round(m.width * scale * 10) / 10,
        DRESSING_UNIT_LIMITS.moduleWidth.min,
        DRESSING_UNIT_LIMITS.moduleWidth.max,
      );
      return ensureSections(
        { ...m, width: scaledW },
        Math.max(80, bodyH - (m.hasTopCompartment ? m.topCompartmentHeight : 0)),
      );
    });
    // Corecție drift pentru a ajunge exact la targetModulesW
    const actualW = scaledModules.reduce((a, m) => a + m.width, 0);
    const drift = Math.round((targetModulesW - actualW) * 10) / 10;
    if (Math.abs(drift) >= 0.1 && scaledModules.length > 0) {
      const last = scaledModules[scaledModules.length - 1];
      scaledModules[scaledModules.length - 1] = {
        ...last,
        width: clamp(
          Math.round((last.width + drift) * 10) / 10,
          DRESSING_UNIT_LIMITS.moduleWidth.min,
          DRESSING_UNIT_LIMITS.moduleWidth.max,
        ),
      };
    }
    commit(set, {
      ...prev,
      moduleCount: preset.modules.length,
      modules: scaledModules,
      sideShelves: { ...preset.sideShelves },
      // NU schimbăm: totalHeight, depth, plinthHeight, bodyMaterialId, frontMaterialId
    });
  },

  applyModulePreset: (index, presetId) => {
    const preset = DRESSING_MODULE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const prev = get().config;
    const m = prev.modules[index];
    if (!m) return;
    const targetH = moduleInteriorHeight(prev, m);
    const rawSections = preset.build(targetH);
    const normalized = normalizeSections(rawSections, targetH);
    const nextModules = prev.modules.map((mm, i) => (i === index ? { ...mm, sections: normalized } : mm));
    commit(set, { ...prev, modules: nextModules });
  },

  toggleAllDoors: () => {
    const prev = get().config;
    const anyWithDoors = prev.modules.some((m) => m.hasDoors);
    const nextState = !anyWithDoors;
    const modules = prev.modules.map((m) => ({ ...m, hasDoors: nextState }));
    commit(set, { ...prev, modules });
  },

  setBodyMaterial: (id) => {
    const prev = get().config;
    commit(set, { ...prev, bodyMaterialId: id });
  },

  setFrontMaterial: (id) => {
    const prev = get().config;
    commit(set, { ...prev, frontMaterialId: id });
  },

  nextStep: () => {
    const { currentStep, steps } = get();
    const idx = steps.indexOf(currentStep);
    if (idx < steps.length - 1) set({ currentStep: steps[idx + 1] });
  },
  prevStep: () => {
    const { currentStep, steps } = get();
    const idx = steps.indexOf(currentStep);
    if (idx > 0) set({ currentStep: steps[idx - 1] });
  },
  goToStep: (step) => set({ currentStep: step }),
  resetConfig: () => {
    const fresh: DressingUnitConfig = {
      ...defaultConfig,
      modules: defaultConfig.modules.map((m) => ({ ...m })),
      sideShelves: { ...defaultConfig.sideShelves },
    };
    set({
      config: { ...fresh, totalWidth: recalcTotalWidth(fresh) },
      currentStep: 'size',
      price: calculateDressingUnitPrice(fresh),
      activeSectionByModule: {},
      selectedModuleIdx: null,
    });
  },
}));
