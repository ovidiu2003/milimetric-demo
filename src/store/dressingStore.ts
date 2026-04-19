import { create } from 'zustand';
import { getMaterialById } from '@/data/materials';

// ===== STEP TYPES =====
export type DressingStep = 'parameters' | 'materials' | 'summary';

const STEPS: DressingStep[] = ['parameters', 'materials', 'summary'];

// ===== CONSTRAINTS =====
export const DRESSING_LIMITS = {
  // Rack de haine
  clothesRackHeight: { min: 80, max: 200, step: 0.1 },
  clothesRackWidth: { min: 30, max: 100, step: 0.1 },
  clothesRackCount: { min: 1, max: 5, step: 1 },
  
  // Prateliere
  shelfCount: { min: 0, max: 10, step: 1 },
  shelfHeight: { min: 15, max: 40, step: 0.1 },
  
  // Sertare
  drawerCount: { min: 0, max: 8, step: 1 },
  drawerHeight: { min: 15, max: 35, step: 0.1 },
  
  // Dimensiuni generale
  totalWidth: { min: 100, max: 600, step: 0.1 },
  totalHeight: { min: 150, max: 300, step: 0.1 },
  depth: { min: 40, max: 70, step: 0.1 },
} as const;

// ===== DEFAULT CONFIG =====
export interface DressingConfig {
  clothesRackHeight: number;
  clothesRackWidth: number;
  clothesRackCount: number;
  shelfCount: number;
  shelfHeight: number;
  drawerCount: number;
  drawerHeight: number;
  totalWidth: number;
  totalHeight: number;
  depth: number;
  mirrored: boolean;
  bodyMaterialId: string;
  frontMaterialId: string;
}

const defaultConfig: DressingConfig = {
  clothesRackHeight: 120,
  clothesRackWidth: 60,
  clothesRackCount: 2,
  shelfCount: 4,
  shelfHeight: 25,
  drawerCount: 3,
  drawerHeight: 20,
  totalWidth: 250,
  totalHeight: 200,
  depth: 60,
  mirrored: false,
  bodyMaterialId: 'EGGER_H3730_ST10_Natural Hickory',
  frontMaterialId: 'EGGER_W1100_ST9_Alpine White',
};

// ===== PRICE CALCULATION =====
function calculateDressingPrice(cfg: DressingConfig): number {
  const basePrice = 500;
  const volumePrice = (cfg.totalWidth * cfg.totalHeight * cfg.depth) * 0.00003;
  
  const rackPrice = cfg.clothesRackCount * 150;
  const shelfPrice = cfg.shelfCount * 80;
  const drawerPrice = cfg.drawerCount * 120;
  
  const totalPrice = basePrice + volumePrice + rackPrice + shelfPrice + drawerPrice;
  
  return Math.round(totalPrice);
}

// ===== STORE =====
interface DressingState {
  currentStep: DressingStep;
  steps: DressingStep[];
  config: DressingConfig;
  price: number;

  // Actions
  setCurrentStep: (step: DressingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetToDefaults: () => void;
  updateConfig: (updates: Partial<DressingConfig>) => void;
  toggleMirror: () => void;
}

export const useDressingStore = create<DressingState>((set, get) => ({
  currentStep: 'parameters',
  steps: STEPS,
  config: defaultConfig,
  price: calculateDressingPrice(defaultConfig),

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep, steps } = get();
    const idx = steps.indexOf(currentStep);
    if (idx < steps.length - 1) {
      set({ currentStep: steps[idx + 1] });
    }
  },

  prevStep: () => {
    const { currentStep, steps } = get();
    const idx = steps.indexOf(currentStep);
    if (idx > 0) {
      set({ currentStep: steps[idx - 1] });
    }
  },

  resetToDefaults: () => {
    set({
      config: defaultConfig,
      price: calculateDressingPrice(defaultConfig),
      currentStep: 'parameters',
    });
  },

  updateConfig: (updates) => {
    set((state) => {
      const newConfig = { ...state.config, ...updates };
      const newPrice = calculateDressingPrice(newConfig);
      return { config: newConfig, price: newPrice };
    });
  },

  toggleMirror: () => {
    set((state) => ({
      config: { ...state.config, mirrored: !state.config.mirrored },
    }));
  },
}));
