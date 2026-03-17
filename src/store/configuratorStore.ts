import { create } from 'zustand';
import {
  FurnitureCategory,
  FurnitureConfig,
  CompartmentConfig,
  CompartmentFront,
  BaseType,
  FrontType,
  PriceBreakdown,
  Dimensions,
} from '@/types';
import { getCategoryById } from '@/data/catalog';
import { calculatePrice } from '@/data/pricing';

export type ConfiguratorStep =
  | 'category'
  | 'dimensions'
  | 'compartments'
  | 'fronts'
  | 'material'
  | 'base'
  | 'options'
  | 'summary';

const STEPS_WITH_COMPARTMENTS: ConfiguratorStep[] = [
  'category', 'dimensions', 'compartments', 'fronts', 'material', 'base', 'options', 'summary'
];

const STEPS_TABLE: ConfiguratorStep[] = [
  'category', 'dimensions', 'material', 'options', 'summary'
];

interface ConfiguratorState {
  // Current step
  currentStep: ConfiguratorStep;
  steps: ConfiguratorStep[];

  // Configuration
  config: FurnitureConfig;

  // Computed price
  price: PriceBreakdown;

  // Pending preset from catalog
  pendingPreset: Partial<FurnitureConfig> | null;

  // 3D View
  rotationY: number;
  zoom: number;
  selectedCompartment: { row: number; col: number } | null;
  previewMode: boolean;

  // Actions
  setCategory: (category: FurnitureCategory) => void;
  setDimensions: (dimensions: Partial<Dimensions>) => void;
  setBodyMaterial: (materialId: string) => void;
  setFrontMaterial: (materialId: string) => void;
  setColumns: (columns: number) => void;
  setRows: (colIndex: number, rows: number) => void;
  setColumnWidth: (colIndex: number, width: number) => void;
  setRowHeight: (colIndex: number, rowIndex: number, height: number) => void;
  setFront: (row: number, col: number, frontType: FrontType) => void;
  setAllFronts: (frontType: FrontType) => void;
  setBaseType: (baseType: BaseType) => void;
  setBaseHeight: (height: number) => void;
  toggleBackPanel: () => void;
  toggleOption: (optionId: string) => void;
  setTableShape: (shape: 'dreptunghi' | 'oval' | 'rotund' | 'patrat') => void;
  setTableExtensible: (extensible: boolean) => void;
  setLegStyle: (style: string) => void;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: ConfiguratorStep) => void;

  // 3D View Controls
  setRotation: (y: number) => void;
  setZoom: (zoom: number) => void;
  selectCompartment: (row: number, col: number) => void;
  clearSelection: () => void;
  togglePreviewMode: () => void;

  // Utility
  resetConfig: () => void;
  loadPreset: (preset: Partial<FurnitureConfig>) => void;
  setPendingPreset: (preset: Partial<FurnitureConfig> | null) => void;
  consumePendingPreset: () => void;
}

const defaultCompartments: CompartmentConfig = {
  columns: 3,
  rows: [4, 4, 4],
  columnWidths: [1, 1, 1],
  rowHeights: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
};

const defaultConfig: FurnitureConfig = {
  category: 'biblioteci',
  dimensions: { width: 120, height: 180, depth: 30 },
  bodyMaterialId: 'custom-texture',
  frontMaterialId: 'custom-texture',
  compartments: { ...defaultCompartments },
  fronts: [],
  baseType: 'none',
  baseHeight: 0,
  backPanel: true,
  additionalOptions: [],
};

function recalculatePrice(config: FurnitureConfig): PriceBreakdown {
  return calculatePrice(config);
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  currentStep: 'category',
  steps: STEPS_WITH_COMPARTMENTS,
  config: { ...defaultConfig },
  price: recalculatePrice(defaultConfig),
  pendingPreset: null,
  rotationY: 0,
  zoom: 1,
  selectedCompartment: null,
  previewMode: false,

  setCategory: (category) => {
    const catInfo = getCategoryById(category);
    if (!catInfo) return;

    const isTable = category === 'mese' || category === 'masute-cafea';
    const steps = isTable ? STEPS_TABLE : STEPS_WITH_COMPARTMENTS;

    const newConfig: FurnitureConfig = {
      ...defaultConfig,
      category,
      dimensions: {
        width: catInfo.defaultWidth,
        height: catInfo.defaultHeight,
        depth: catInfo.defaultDepth,
      },
      compartments: isTable
        ? { columns: 1, rows: [1], columnWidths: [1], rowHeights: [[1]] }
        : { ...defaultCompartments },
      tableShape: isTable ? 'dreptunghi' : undefined,
      tableExtensible: isTable ? false : undefined,
    };

    set({
      config: newConfig,
      steps,
      currentStep: 'dimensions',
      price: recalculatePrice(newConfig),
      selectedCompartment: null,
    });
  },

  setDimensions: (dims) => {
    const { config } = get();
    const catInfo = getCategoryById(config.category);
    if (!catInfo) return;

    const newDims = {
      width: Math.min(Math.max(dims.width ?? config.dimensions.width, catInfo.minWidth), catInfo.maxWidth),
      height: Math.min(Math.max(dims.height ?? config.dimensions.height, catInfo.minHeight), catInfo.maxHeight),
      depth: Math.min(Math.max(dims.depth ?? config.dimensions.depth, catInfo.minDepth), catInfo.maxDepth),
    };

    const newConfig = { ...config, dimensions: newDims };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setBodyMaterial: (materialId) => {
    const { config } = get();
    const newConfig = { ...config, bodyMaterialId: materialId };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setFrontMaterial: (materialId) => {
    const { config } = get();
    const newConfig = { ...config, frontMaterialId: materialId };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setColumns: (columns) => {
    const { config } = get();
    const clampedCols = Math.max(1, Math.min(columns, 10));
    const rows = Array(clampedCols).fill(3);
    const columnWidths = Array(clampedCols).fill(1);
    const rowHeights = Array(clampedCols).fill(null).map(() => Array(3).fill(1));

    const newConfig = {
      ...config,
      compartments: { columns: clampedCols, rows, columnWidths, rowHeights },
      fronts: [],
    };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setRows: (colIndex, rowCount) => {
    const { config } = get();
    const rows = [...config.compartments.rows];
    const rowHeights = [...config.compartments.rowHeights];
    const clampedRows = Math.max(1, Math.min(rowCount, 8));
    rows[colIndex] = clampedRows;
    rowHeights[colIndex] = Array(clampedRows).fill(1);

    const newConfig = {
      ...config,
      compartments: { ...config.compartments, rows, rowHeights },
    };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setColumnWidth: (colIndex, width) => {
    const { config } = get();
    const columnWidths = [...config.compartments.columnWidths];
    columnWidths[colIndex] = Math.max(0.5, Math.min(width, 3));

    const newConfig = {
      ...config,
      compartments: { ...config.compartments, columnWidths },
    };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setRowHeight: (colIndex, rowIndex, height) => {
    const { config } = get();
    const rowHeights = config.compartments.rowHeights.map(rh => [...rh]);
    rowHeights[colIndex][rowIndex] = Math.max(0.3, Math.min(height, 3));

    const newConfig = {
      ...config,
      compartments: { ...config.compartments, rowHeights },
    };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setFront: (row, col, frontType) => {
    const { config } = get();
    const existing = config.fronts.filter(f => !(f.row === row && f.col === col));
    if (frontType !== 'none') {
      existing.push({ row, col, frontType, materialId: config.frontMaterialId });
    }
    const newConfig = { ...config, fronts: existing };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setAllFronts: (frontType) => {
    const { config } = get();
    const newFronts: CompartmentFront[] = [];

    if (frontType !== 'none') {
      for (let col = 0; col < config.compartments.columns; col++) {
        for (let row = 0; row < config.compartments.rows[col]; row++) {
          newFronts.push({ row, col, frontType, materialId: config.frontMaterialId });
        }
      }
    }

    const newConfig = { ...config, fronts: newFronts };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setBaseType: (baseType) => {
    const { config } = get();
    const base = { id: baseType } as any;
    const newConfig = { ...config, baseType, baseHeight: base.height || 0 };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setBaseHeight: (height) => {
    const { config } = get();
    const newConfig = { ...config, baseHeight: height };
    set({ config: newConfig });
  },

  toggleBackPanel: () => {
    const { config } = get();
    const newConfig = { ...config, backPanel: !config.backPanel };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  toggleOption: (optionId) => {
    const { config } = get();
    const opts = config.additionalOptions.includes(optionId)
      ? config.additionalOptions.filter(o => o !== optionId)
      : [...config.additionalOptions, optionId];
    const newConfig = { ...config, additionalOptions: opts };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setTableShape: (shape) => {
    const { config } = get();
    const newConfig = { ...config, tableShape: shape };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setTableExtensible: (extensible) => {
    const { config } = get();
    const newConfig = { ...config, tableExtensible: extensible };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  setLegStyle: (style) => {
    const { config } = get();
    const newConfig = { ...config, legStyle: style };
    set({ config: newConfig, price: recalculatePrice(newConfig) });
  },

  // Navigation
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

  goToStep: (step) => {
    set({ currentStep: step });
  },

  // 3D View Controls
  setRotation: (y) => set({ rotationY: y }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(zoom, 3)) }),
  selectCompartment: (row, col) => set({ selectedCompartment: { row, col } }),
  clearSelection: () => set({ selectedCompartment: null }),
  togglePreviewMode: () => set((state) => ({ previewMode: !state.previewMode })),

  // Utility
  resetConfig: () => {
    set({
      currentStep: 'category',
      steps: STEPS_WITH_COMPARTMENTS,
      config: { ...defaultConfig },
      price: recalculatePrice(defaultConfig),
      pendingPreset: null,
      selectedCompartment: null,
      rotationY: 0,
      zoom: 1,
      previewMode: false,
    });
  },

  loadPreset: (preset) => {
    const { config } = get();
    const newConfig = { ...config, ...preset };
    const isTable = newConfig.category === 'mese' || newConfig.category === 'masute-cafea';
    const steps = isTable ? STEPS_TABLE : STEPS_WITH_COMPARTMENTS;
    set({
      config: newConfig,
      steps,
      currentStep: 'summary',
      price: recalculatePrice(newConfig),
      selectedCompartment: null,
    });
  },

  setPendingPreset: (preset) => {
    set({ pendingPreset: preset });
  },

  consumePendingPreset: () => {
    const { pendingPreset } = get();
    if (pendingPreset) {
      get().loadPreset(pendingPreset);
      set({ pendingPreset: null });
    }
  },
}));
