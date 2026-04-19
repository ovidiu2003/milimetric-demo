import { create } from 'zustand';
import { DressingUnitConfig, DressingInteriorType, DressingModuleConfig, DressingSidePosition } from '@/types';
import { getMaterialById } from '@/data/materials';

// ===== STEP TYPES =====
export type DressingUnitStep = 'parameters' | 'materials' | 'summary';
const STEPS: DressingUnitStep[] = ['parameters', 'materials', 'summary'];

// ===== CONSTRAINTS =====
export const DRESSING_UNIT_LIMITS = {
  moduleCount:          { min: 1, max: 6, step: 1 },
  moduleWidth:          { min: 40, max: 120, step: 0.1 },
  totalHeight:          { min: 200, max: 280, step: 0.1 },
  depth:                { min: 50, max: 65, step: 0.1 },
  plinthHeight:         { min: 0, max: 15, step: 0.1 },
  topCompartmentHeight: { min: 25, max: 60, step: 0.1 },
  sideColumns:          { min: 1, max: 2, step: 1 },
  sideColumnWidth:      { min: 20, max: 40, step: 0.1 },
  sideShelfCount:       { min: 3, max: 8, step: 1 },
} as const;

export const DRESSING_SIDE_POSITION_OPTIONS: { id: DressingSidePosition; name: string }[] = [
  { id: 'none',  name: 'Fără bibliotecă laterală' },
  { id: 'left',  name: 'Doar pe stânga' },
  { id: 'right', name: 'Doar pe dreapta' },
  { id: 'both',  name: 'Pe ambele părți' },
];

// ===== INTERIOR PRESETS =====
export const DRESSING_INTERIOR_OPTIONS: { id: DressingInteriorType; name: string; description: string; allowsDoors: boolean }[] = [
  { id: 'bara-raft',        name: 'Bară haine + raft',             description: 'Bară de haine sus, un raft jos',                 allowsDoors: true  },
  { id: 'rafturi',          name: 'Rafturi multiple',              description: 'Patru rafturi orizontale',                       allowsDoors: true  },
  { id: 'mixt',             name: 'Mixt (bară + sertare)',         description: 'Bară haine sus, două sertare jos',               allowsDoors: true  },
  { id: 'rafturi-deschise', name: 'Rafturi deschise (bibliotecă)', description: 'Modul deschis, șase rafturi vizibile, fără uși', allowsDoors: false },
];

// ===== DEFAULTS =====
function defaultModule(width = 100, interiorType: DressingInteriorType = 'bara-raft', hasDoors = true): DressingModuleConfig {
  return {
    width,
    interiorType,
    hasDoors: interiorType === 'rafturi-deschise' ? false : hasDoors,
    hasTopCompartment: true,
    topCompartmentHeight: 40,
  };
}

const defaultConfig: DressingUnitConfig = {
  moduleCount: 4,
  modules: [
    defaultModule(100, 'bara-raft', true),
    defaultModule(100, 'rafturi',   true),
    defaultModule(100, 'mixt',      true),
    defaultModule(50,  'rafturi-deschise', false),
  ],
  sideShelves: {
    position: 'none',
    columns: 2,
    columnWidth: 28,
    shelfCount: 5,
  },
  totalWidth: 350,
  totalHeight: 240,
  depth: 60,
  plinthHeight: 8,
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
  const extra = Array.from({ length: count - modules.length }, () => ({ ...template }));
  return [...modules, ...extra];
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

    if (m.hasDoors && m.interiorType !== 'rafturi-deschise') {
      doorModules += 1;
      // Usile merg pe toata inaltimea modulului (corp principal + compartiment superior)
      const fullDoorH = bodyHeight - (m.hasTopCompartment ? 0 : 0); // bodyHeight include deja totul deasupra plintei
      frontsCost += 2 * (m.width / 2) * fullDoorH * 0.04 * frontMul;
    }
  }

  // Biblioteca laterala (side shelves): deschidere in lateral
  // Structura per parte: 2 panouri verticale (fata si spate) + 1 spate la dressing
  //                    + top + bottom + (columns-1) separatoare interioare + rafturi
  let sideShelvesCost = 0;
  const sw = sideShelvesWidth(config);
  if (sw > 0) {
    const s = config.sideShelves;
    const sides = s.position === 'both' ? 2 : 1;
    const libDepth = s.columnWidth;   // cat iese in afara (X)
    const libZ = config.depth;        // adancime pe Z (aliniata cu dressingul)
    // Per parte: 2 pereti (fata + spate) pe toata inaltimea
    sideShelvesCost += sides * 2 * bodyHeight * libDepth * 0.04 * bodyMul;
    // Separatoare interioare (intre coloane): (columns - 1) per parte
    sideShelvesCost += sides * Math.max(0, s.columns - 1) * bodyHeight * libDepth * 0.04 * bodyMul;
    // Top + bottom per parte
    sideShelvesCost += sides * 2 * libZ * libDepth * 0.04 * bodyMul;
    // Spate (catre dressing)
    sideShelvesCost += sides * libZ * bodyHeight * 0.02 * bodyMul;
    // Rafturi: columns coloane × shelfCount rafturi
    const shelfZWidth = libZ / s.columns;
    sideShelvesCost += sides * s.columns * s.shelfCount * shelfZWidth * libDepth * 0.01 * bodyMul;
  }

  const plinthCost = config.plinthHeight > 0 ? config.totalWidth * config.plinthHeight * 0.03 * bodyMul : 0;
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
  setTotalHeight: (v: number) => void;
  setDepth: (v: number) => void;
  setPlinthHeight: (v: number) => void;

  setModuleWidth: (index: number, v: number) => void;
  setModuleInterior: (index: number, type: DressingInteriorType) => void;
  toggleModuleDoors: (index: number) => void;
  toggleModuleTopCompartment: (index: number) => void;
  setModuleTopCompartmentHeight: (index: number, v: number) => void;

  setSideShelvesPosition: (p: DressingSidePosition) => void;
  setSideShelvesColumns: (n: number) => void;
  setSideShelvesColumnWidth: (v: number) => void;
  setSideShelvesShelfCount: (n: number) => void;

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
    const val = clamp(v, DRESSING_UNIT_LIMITS.moduleWidth.min, DRESSING_UNIT_LIMITS.moduleWidth.max);
    updateModule(set, get, index, (m) => ({ ...m, width: val }));
  },

  setModuleInterior: (index, type) => {
    updateModule(set, get, index, (m) => ({
      ...m,
      interiorType: type,
      hasDoors: type === 'rafturi-deschise' ? false : m.hasDoors,
    }));
  },

  toggleModuleDoors: (index) => {
    updateModule(set, get, index, (m) =>
      m.interiorType === 'rafturi-deschise' ? m : { ...m, hasDoors: !m.hasDoors }
    );
  },

  toggleModuleTopCompartment: (index) => {
    updateModule(set, get, index, (m) => ({ ...m, hasTopCompartment: !m.hasTopCompartment }));
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
