import { create } from 'zustand';
import { LivingUnitConfig } from '@/types';
import { getMaterialById } from '@/data/materials';

// ===== STEP TYPES =====
export type LivingUnitStep = 'parameters' | 'materials' | 'summary';

const STEPS: LivingUnitStep[] = ['parameters', 'materials', 'summary'];

// ===== CONSTRAINTS =====
export const LIVING_UNIT_LIMITS = {
  // Corp orizontal
  suspensionHeight: { min: 8, max: 70, step: 0.1 },
  comodaHeight:     { min: 20, max: 40, step: 0.1 },
  comodaWidth:      { min: 80, max: 400, step: 0.1 },
  comodaColumns:    { min: 2, max: 10, step: 1 },
  // Corp vertical
  raftWidth:        { min: 12, max: 60, step: 0.1 },
  dulapWidth:       { min: 30, max: 60, step: 0.1 },
  openShelfCount:   { min: 0, max: 12, step: 1 },
  // General
  totalWidth:       { min: 80, max: 400, step: 0.1 },
  totalHeight:      { min: 180, max: 300, step: 0.1 },
  depth:            { min: 30, max: 50, step: 0.1 },
} as const;

// ===== DEFAULT CONFIG =====
const defaultConfig: LivingUnitConfig = {
  suspensionHeight: 15,
  comodaHeight: 25,
  comodaWidth: 300,
  comodaColumns: 6,
  raftWidth: 20,
  dulapWidth: 60,
  openShelfCount: 4,
  totalWidth: 300,   // auto-calculated
  totalHeight: 260,
  depth: 40,
  mirrored: false,
  bodyMaterialId: 'EGGER_H3730_ST10_Natural Hickory',
  frontMaterialId: 'EGGER_W1100_ST9_Alpine White',
};

/** Recalculates totalWidth from comoda and tower widths */
function recalcTotalWidth(cfg: LivingUnitConfig): number {
  const towerW = cfg.raftWidth + cfg.dulapWidth;
  return Math.max(cfg.comodaWidth, towerW);
}

// ===== PRICE CALCULATION =====
export function calculateLivingUnitPrice(config: LivingUnitConfig) {
  const towerHeight = config.totalHeight - config.suspensionHeight - config.comodaHeight;

  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);
  const bodyMul = bodyMat?.priceMultiplier || 1;
  const frontMul = frontMat?.priceMultiplier || 1;

  // Comoda cost — based on comoda width, height, and depth  
  const comodaCost = config.comodaWidth * config.comodaHeight * 0.05 * bodyMul;

  // Tower structure cost (open shelving + dulap body)
  const towerCost = (config.raftWidth + config.dulapWidth) * towerHeight * 0.07 * bodyMul;

  // Raft shelves cost
  const numShelves = config.openShelfCount;
  const shelvesCost = numShelves * config.raftWidth * config.depth * 0.008 * bodyMul;

  // Dulap front (door) cost
  const dulapFrontCost = config.dulapWidth * towerHeight * 0.04 * frontMul;

  // Comoda fronts (drawers) — uses comodaColumns
  const numDrawers = config.comodaColumns;
  const drawersCost = numDrawers * 45 * bodyMul;

  // Hardware (wall brackets, hinges, handles, soft-close)
  const hardwareCost = 350;

  // Depth factor
  const depthFactor = config.depth / 40; // normalized to default 40cm depth

  const total = (comodaCost + towerCost + shelvesCost + dulapFrontCost + drawersCost + hardwareCost) * depthFactor;

  // Volume discount
  let discountPercent = 0;
  if (total >= 15000) discountPercent = 0.15;
  else if (total >= 10000) discountPercent = 0.12;
  else if (total >= 7500) discountPercent = 0.10;
  else if (total >= 5000) discountPercent = 0.08;
  else if (total >= 3000) discountPercent = 0.05;

  const discount = total * discountPercent;

  return {
    comodaCost: Math.round(comodaCost * depthFactor),
    towerCost: Math.round((towerCost + shelvesCost) * depthFactor),
    frontsCost: Math.round((dulapFrontCost + drawersCost) * depthFactor),
    hardwareCost: Math.round(hardwareCost),
    totalBeforeDiscount: Math.round(total),
    discount: Math.round(discount),
    total: Math.round(total - discount),
  };
}

// ===== STORE =====
interface LivingUnitState {
  config: LivingUnitConfig;
  currentStep: LivingUnitStep;
  steps: LivingUnitStep[];
  price: ReturnType<typeof calculateLivingUnitPrice>;

  // Parameter setters — Corp orizontal
  setSuspensionHeight: (v: number) => void;
  setComodaHeight: (v: number) => void;
  setComodaWidth: (v: number) => void;
  setComodaColumns: (v: number) => void;
  // Parameter setters — Corp vertical
  setRaftWidth: (v: number) => void;
  setDulapWidth: (v: number) => void;
  setOpenShelfCount: (v: number) => void;
  setTotalHeight: (v: number) => void;
  setDepth: (v: number) => void;
  setTotalWidth: (v: number) => void;
  toggleMirror: () => void;
  setBodyMaterial: (id: string) => void;
  setFrontMaterial: (id: string) => void;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: LivingUnitStep) => void;
  resetConfig: () => void;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function calculateComodaColumns(widthCm: number) {
  const minColumnWidth = 30; // 300 mm
  const columns = Math.max(2, Math.floor(widthCm / minColumnWidth));
  return Math.min(columns, LIVING_UNIT_LIMITS.comodaColumns.max);
}

export const useLivingUnitStore = create<LivingUnitState>((set, get) => ({
  config: { ...defaultConfig },
  currentStep: 'parameters',
  steps: STEPS,
  price: calculateLivingUnitPrice(defaultConfig),

  // ── Corp orizontal setters ──
  setSuspensionHeight: (v) => {
    const prev = get().config;
    const val = clamp(v, LIVING_UNIT_LIMITS.suspensionHeight.min, LIVING_UNIT_LIMITS.suspensionHeight.max);
    const config = { ...prev, suspensionHeight: val, totalWidth: recalcTotalWidth({ ...prev, suspensionHeight: val }) };
    set({ config, price: calculateLivingUnitPrice(config) });
  },

  setComodaHeight: (v) => {
    const prev = get().config;
    const val = clamp(v, LIVING_UNIT_LIMITS.comodaHeight.min, LIVING_UNIT_LIMITS.comodaHeight.max);
    const config = { ...prev, comodaHeight: val, totalWidth: recalcTotalWidth({ ...prev, comodaHeight: val }) };
    set({ config, price: calculateLivingUnitPrice(config) });
  },

  setComodaWidth: (v) => {
    const prev = get().config;
    const val = clamp(v, LIVING_UNIT_LIMITS.comodaWidth.min, LIVING_UNIT_LIMITS.comodaWidth.max);
    const updated = { ...prev, comodaWidth: val };
    updated.comodaColumns = calculateComodaColumns(val);
    updated.totalWidth = recalcTotalWidth(updated);
    set({ config: updated, price: calculateLivingUnitPrice(updated) });
  },

  setComodaColumns: (v) => {
    const prev = get().config;
    const val = clamp(v, LIVING_UNIT_LIMITS.comodaColumns.min, LIVING_UNIT_LIMITS.comodaColumns.max);
    const config = { ...prev, comodaColumns: val };
    set({ config, price: calculateLivingUnitPrice(config) });
  },

  // ── Corp vertical setters ──
  setRaftWidth: (v) => {
    const prev = get().config;
    const val = clamp(v, LIVING_UNIT_LIMITS.raftWidth.min, LIVING_UNIT_LIMITS.raftWidth.max);
    const updated = { ...prev, raftWidth: val };
    updated.totalWidth = recalcTotalWidth(updated);
    set({ config: updated, price: calculateLivingUnitPrice(updated) });
  },

  setDulapWidth: (v) => {
    const prev = get().config;
    const val = clamp(v, LIVING_UNIT_LIMITS.dulapWidth.min, LIVING_UNIT_LIMITS.dulapWidth.max);
    const updated = { ...prev, dulapWidth: val };
    updated.totalWidth = recalcTotalWidth(updated);
    set({ config: updated, price: calculateLivingUnitPrice(updated) });
  },

  setOpenShelfCount: (v) => {
    const prev = get().config;
    const val = clamp(v, LIVING_UNIT_LIMITS.openShelfCount.min, LIVING_UNIT_LIMITS.openShelfCount.max);
    const config = { ...prev, openShelfCount: val };
    set({ config, price: calculateLivingUnitPrice(config) });
  },

  setTotalHeight: (v) => {
    const prev = get().config;
    const val = clamp(v, LIVING_UNIT_LIMITS.totalHeight.min, LIVING_UNIT_LIMITS.totalHeight.max);
    const minRequired = prev.suspensionHeight + prev.comodaHeight + 40;
    const config = { ...prev, totalHeight: Math.max(val, minRequired) };
    set({ config, price: calculateLivingUnitPrice(config) });
  },

  setDepth: (v) => {
    const config = { ...get().config, depth: clamp(v, LIVING_UNIT_LIMITS.depth.min, LIVING_UNIT_LIMITS.depth.max) };
    set({ config, price: calculateLivingUnitPrice(config) });
  },

  setTotalWidth: (v) => {
    const prev = get().config;
    const val = clamp(v, LIVING_UNIT_LIMITS.totalWidth.min, LIVING_UNIT_LIMITS.totalWidth.max);
    const towerW = prev.raftWidth + prev.dulapWidth;

    const updated = { ...prev };
    if (prev.comodaWidth >= towerW) {
      updated.comodaWidth = val;
      updated.comodaColumns = calculateComodaColumns(val);
    } else {
      const targetDulap = clamp(val - prev.raftWidth, LIVING_UNIT_LIMITS.dulapWidth.min, LIVING_UNIT_LIMITS.dulapWidth.max);
      updated.dulapWidth = targetDulap;
    }

    updated.totalWidth = recalcTotalWidth(updated);
    set({ config: updated, price: calculateLivingUnitPrice(updated) });
  },

  toggleMirror: () => {
    const config = { ...get().config, mirrored: !get().config.mirrored };
    set({ config, price: calculateLivingUnitPrice(config) });
  },

  setBodyMaterial: (id) => {
    const config = { ...get().config, bodyMaterialId: id };
    set({ config, price: calculateLivingUnitPrice(config) });
  },

  setFrontMaterial: (id) => {
    const config = { ...get().config, frontMaterialId: id };
    set({ config, price: calculateLivingUnitPrice(config) });
  },

  // Navigation
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
    set({
      config: { ...defaultConfig },
      currentStep: 'parameters',
      price: calculateLivingUnitPrice(defaultConfig),
    });
  },
}));
