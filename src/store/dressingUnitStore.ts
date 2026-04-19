import { create } from 'zustand';
import { DressingUnitConfig, DressingInteriorType, DressingModuleConfig, DressingModuleSection, DressingSectionType, DressingSidePosition, DressingSideLayout } from '@/types';
import { getMaterialById } from '@/data/materials';

// ===== STEP TYPES =====
export type DressingUnitStep = 'parameters' | 'materials' | 'summary';
const STEPS: DressingUnitStep[] = ['parameters', 'materials', 'summary'];

// ===== CONSTRAINTS =====
export const DRESSING_UNIT_LIMITS = {
  moduleCount:          { min: 1, max: 6, step: 1 },
  moduleWidth:          { min: 30, max: 150, step: 0.1 },
  totalModulesWidth:    { min: 30, max: 900, step: 0.1 },  // suma latimilor modulelor (fara biblioteca)
  totalHeight:          { min: 200, max: 280, step: 0.1 },
  depth:                { min: 50, max: 65, step: 0.1 },
  plinthHeight:         { min: 0, max: 15, step: 0.1 },
  topCompartmentHeight: { min: 25, max: 60, step: 0.1 },
  sectionHeight:        { min: 20, max: 220, step: 1 },   // cm — inaltime sectiune in modul
  drawerCount:          { min: 1, max: 5, step: 1 },
  sectionShelfCount:    { min: 0, max: 6, step: 1 },
  sideColumns:          { min: 1, max: 3, step: 1 },
  sideColumnWidth:      { min: 20, max: 40, step: 0.1 },
  sideShelfCount:       { min: 3, max: 8, step: 1 },
} as const;

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

// ===== DEFAULTS =====
let _sectionIdSeq = 1;
function newSectionId(): string {
  _sectionIdSeq += 1;
  return `sec-${Date.now().toString(36)}-${_sectionIdSeq}`;
}

/** Genereaza sectiunile implicite pentru un tip de interior */
export function sectionsForInteriorType(type: DressingInteriorType, bodyHeightCm = 180): DressingModuleSection[] {
  switch (type) {
    case 'rafturi':
      // 5 compartimente egale separate de 4 rafturi: o singura sectiune de shelves cu 4 rafturi interioare
      return [
        { id: newSectionId(), type: 'shelves', heightCm: bodyHeightCm, shelfCount: 4 },
      ];
    case 'bara-raft':
      // Raft jos (45cm) + bara sus (rest)
      return [
        { id: newSectionId(), type: 'shelves',     heightCm: 45,  shelfCount: 0 },
        { id: newSectionId(), type: 'hanging-rod', heightCm: Math.max(60, bodyHeightCm - 45) },
      ];
    case 'mixt':
      // Sertare jos (50cm) + raft intermediar implicit + bara sus
      return [
        { id: newSectionId(), type: 'drawers',     heightCm: 50,  drawerCount: 2 },
        { id: newSectionId(), type: 'hanging-rod', heightCm: Math.max(60, bodyHeightCm - 50) },
      ];
    case 'rafturi-deschise':
    default:
      return [
        { id: newSectionId(), type: 'shelves', heightCm: bodyHeightCm, shelfCount: 5 },
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
  removeModuleSection: (index: number, sectionId: string) => void;
  updateModuleSection: (index: number, sectionId: string, patch: Partial<DressingModuleSection>) => void;
  moveModuleSection: (index: number, sectionId: string, direction: 'up' | 'down') => void;

  setSideShelvesPosition: (p: DressingSidePosition) => void;
  setSideShelvesColumns: (n: number) => void;
  setSideShelvesColumnWidth: (v: number) => void;
  setSideShelvesShelfCount: (n: number) => void;
  setSideShelvesLayout: (layout: DressingSideLayout) => void;

  applyPreset: (presetId: string) => void;
  toggleAllDoors: () => void;

  setBodyMaterial: (id: string) => void;
  setFrontMaterial: (id: string) => void;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: DressingUnitStep) => void;
  resetConfig: () => void;
}

function commit(set: any, config: DressingUnitConfig) {
  const normalized = { ...config, totalWidth: recalcTotalWidth(config) };
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
  currentStep: 'parameters',
  steps: STEPS,
  price: calculateDressingUnitPrice(defaultConfig),

  setModuleCount: (v) => {
    const prev = get().config;
    const val = clamp(Math.round(v), DRESSING_UNIT_LIMITS.moduleCount.min, DRESSING_UNIT_LIMITS.moduleCount.max);
    commit(set, { ...prev, moduleCount: val, modules: resizeModules(prev.modules, val) });
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
    const bodyH = prev.totalHeight - prev.plinthHeight - (m.hasTopCompartment ? m.topCompartmentHeight : 0);
    updateModule(set, get, index, (mm) => ({
      ...mm,
      interiorType: type,
      sections: sectionsForInteriorType(type, Math.max(80, bodyH)),
    }));
  },

  addModuleSection: (index, type) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m) return;
    const sections = m.sections ? [...m.sections] : [];
    const defaults: Record<DressingSectionType, Partial<DressingModuleSection>> = {
      'drawers':     { heightCm: 45, drawerCount: 2 },
      'shelves':     { heightCm: 80, shelfCount: 2 },
      'hanging-rod': { heightCm: 110 },
      'empty':       { heightCm: 40 },
    };
    const base = defaults[type];
    sections.push({ id: newSectionId(), type, heightCm: 40, ...base } as DressingModuleSection);
    updateModule(set, get, index, (mm) => ({ ...mm, sections }));
  },

  removeModuleSection: (index, sectionId) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m || !m.sections) return;
    if (m.sections.length <= 1) return; // pastram macar o sectiune
    const sections = m.sections.filter((s) => s.id !== sectionId);
    updateModule(set, get, index, (mm) => ({ ...mm, sections }));
  },

  updateModuleSection: (index, sectionId, patch) => {
    const prev = get().config;
    const m = prev.modules[index];
    if (!m || !m.sections) return;
    const sections = m.sections.map((s) => {
      if (s.id !== sectionId) return s;
      const merged = { ...s, ...patch } as DressingModuleSection;
      // validari per tip
      if (merged.type === 'drawers') {
        merged.drawerCount = clamp(Math.round(merged.drawerCount ?? 2), DRESSING_UNIT_LIMITS.drawerCount.min, DRESSING_UNIT_LIMITS.drawerCount.max);
      }
      if (merged.type === 'shelves') {
        merged.shelfCount = clamp(Math.round(merged.shelfCount ?? 2), DRESSING_UNIT_LIMITS.sectionShelfCount.min, DRESSING_UNIT_LIMITS.sectionShelfCount.max);
      }
      merged.heightCm = clamp(Math.round(merged.heightCm), DRESSING_UNIT_LIMITS.sectionHeight.min, DRESSING_UNIT_LIMITS.sectionHeight.max);
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
    const bodyH = preset.totalHeight - preset.plinthHeight;
    commit(set, {
      ...prev,
      moduleCount: preset.modules.length,
      modules: preset.modules.map((m) => ensureSections(
        { ...m },
        Math.max(80, bodyH - (m.hasTopCompartment ? m.topCompartmentHeight : 0)),
      )),
      sideShelves: { ...preset.sideShelves },
      totalHeight: preset.totalHeight,
      depth: preset.depth,
      plinthHeight: preset.plinthHeight,
    });
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
      currentStep: 'parameters',
      price: calculateDressingUnitPrice(fresh),
    });
  },
}));
