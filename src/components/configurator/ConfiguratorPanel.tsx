'use client';

import React, { useState } from 'react';
import { useConfiguratorStore, ConfiguratorStep } from '@/store/configuratorStore';
import { furnitureCategories, fronts, bases, additionalOptions, getFrontsForCategory, getBasesForCategory } from '@/data/catalog';
import { materialTypes, getBodyMaterials, getFrontMaterials, getMaterialById } from '@/data/materials';
import { useTextures } from '@/hooks/useTextures';
import { formatPrice, getDeliveryEstimate } from '@/data/pricing';
import { FurnitureCategory, FrontType, BaseType, MaterialType } from '@/types';
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Minus, Plus,
  Grid3X3, Columns, Rows, PaintBucket, Footprints, Settings2,
  ShoppingCart, FileText, Truck, RotateCcw, Download
} from 'lucide-react';
import { exportPDF, generatePDFBase64, getPDFFileName } from '@/utils/exportPDF';
import OfferRequestModal from '@/components/configurator/OfferRequestModal';

const stepLabels: Record<ConfiguratorStep, { title: string; icon: React.ReactNode }> = {
  category: { title: 'Tip Mobilier', icon: <Grid3X3 className="w-5 h-5" /> },
  dimensions: { title: 'Dimensiuni', icon: <FileText className="w-5 h-5" /> },
  compartments: { title: 'Compartimente', icon: <Columns className="w-5 h-5" /> },
  fronts: { title: 'Fronturi', icon: <Rows className="w-5 h-5" /> },
  material: { title: 'Materiale', icon: <PaintBucket className="w-5 h-5" /> },
  base: { title: 'Bază', icon: <Footprints className="w-5 h-5" /> },
  options: { title: 'Opțiuni Extra', icon: <Settings2 className="w-5 h-5" /> },
  summary: { title: 'Sumar', icon: <ShoppingCart className="w-5 h-5" /> },
};

// ===== STEP COMPONENTS =====

function CategoryStep() {
  const setCategory = useConfiguratorStore((s) => s.setCategory);

  return (
    <div className="space-y-4">
      <h3 className="heading-sm">Ce tip de mobilier dorești?</h3>
      <p className="text-brand-charcoal/50 text-sm">Alege categoria de mobilier pe care vrei să o configurezi.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {furnitureCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="card-interactive p-4 text-left flex items-start space-x-3 group"
          >
            <span className="text-2xl mt-0.5">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-brand-dark group-hover:text-brand-accent transition-colors">
                {cat.name}
              </h4>
              <p className="text-xs text-brand-charcoal/50 mt-1 line-clamp-2">{cat.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-brand-charcoal/20 group-hover:text-brand-accent transition-colors mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
}

function DimensionsStep() {
  const config = useConfiguratorStore((s) => s.config);
  const setDimensions = useConfiguratorStore((s) => s.setDimensions);

  const catInfo = furnitureCategories.find((c) => c.id === config.category);
  if (!catInfo) return null;

  const dims = [
    { label: 'Lățime', key: 'width' as const, min: catInfo.minWidth, max: catInfo.maxWidth, unit: 'mm' },
    { label: 'Înălțime', key: 'height' as const, min: catInfo.minHeight, max: catInfo.maxHeight, unit: 'mm' },
    { label: 'Adâncime', key: 'depth' as const, min: catInfo.minDepth, max: catInfo.maxDepth, unit: 'mm' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm">Dimensiuni</h3>
        <p className="text-brand-charcoal/50 text-sm mt-1">Setează dimensiunile exacte ale mobilierului.</p>
      </div>

      {dims.map((dim) => (
        <div key={dim.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-brand-charcoal/70">{dim.label}</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDimensions({ [dim.key]: config.dimensions[dim.key] - 1 })}
                className="w-8 h-8 rounded-lg border border-brand-beige/50 flex items-center justify-center hover:bg-brand-warm transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                value={config.dimensions[dim.key] * 10}
                onChange={(e) => setDimensions({ [dim.key]: (parseInt(e.target.value) || dim.min * 10) / 10 })}
                className="w-20 text-center input-field py-1.5 text-sm font-semibold tabular-nums"
                min={dim.min * 10}
                max={dim.max * 10}
              />
              <button
                onClick={() => setDimensions({ [dim.key]: config.dimensions[dim.key] + 1 })}
                className="w-8 h-8 rounded-lg border border-brand-beige/50 flex items-center justify-center hover:bg-brand-warm transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="text-xs text-brand-charcoal/30 w-8">{dim.unit}</span>
            </div>
          </div>
          <input
            type="range"
            min={dim.min * 10}
            max={dim.max * 10}
            value={config.dimensions[dim.key] * 10}
            onChange={(e) => setDimensions({ [dim.key]: parseInt(e.target.value) / 10 })}
            className="w-full h-2 bg-brand-beige rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
          <div className="flex justify-between text-xs text-brand-charcoal/30 tabular-nums">
            <span>{dim.min * 10} mm</span>
            <span>{dim.max * 10} mm</span>
          </div>
        </div>
      ))}

      {/* Table specific options */}
      {(config.category === 'mese' || config.category === 'masute-cafea') && (
        <div className="space-y-4 pt-4 border-t border-brand-beige/30">
          <h4 className="font-medium text-brand-charcoal/70">Formă masă</h4>
          <div className="grid grid-cols-2 gap-2">
            {(['dreptunghi', 'oval', 'rotund', 'patrat'] as const).map((shape) => (
              <button
                key={shape}
                onClick={() => useConfiguratorStore.getState().setTableShape(shape)}
                className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                  config.tableShape === shape
                    ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                    : 'border-brand-beige/50 text-brand-charcoal/60 hover:border-brand-beige'
                }`}
              >
                {shape === 'dreptunghi' ? 'Dreptunghiulară' : shape === 'rotund' ? 'Rotundă' : shape === 'oval' ? 'Ovală' : 'Pătrată'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompartmentsStep() {
  const config = useConfiguratorStore((s) => s.config);
  const setColumns = useConfiguratorStore((s) => s.setColumns);
  const setRows = useConfiguratorStore((s) => s.setRows);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm">Compartimente</h3>
        <p className="text-brand-charcoal/50 text-sm mt-1">Definește structura internă a mobilierului.</p>
      </div>

      {/* Columns */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-brand-charcoal/70">Număr coloane</label>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setColumns(config.compartments.columns - 1)}
            className="w-10 h-10 rounded-lg border border-brand-beige/50 flex items-center justify-center hover:bg-brand-warm transition-colors"
            disabled={config.compartments.columns <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-2xl font-bold text-brand-dark w-12 text-center">
            {config.compartments.columns}
          </span>
          <button
            onClick={() => setColumns(config.compartments.columns + 1)}
            className="w-10 h-10 rounded-lg border border-brand-beige/50 flex items-center justify-center hover:bg-brand-warm transition-colors"
            disabled={config.compartments.columns >= 10}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rows per column */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-brand-charcoal/70">Rânduri per coloană</label>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: config.compartments.columns }, (_, i) => (
            <div key={i} className="p-3 bg-brand-warm rounded-lg">
              <label className="text-xs text-brand-charcoal/50 mb-1 block">Coloana {i + 1}</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRows(i, config.compartments.rows[i] - 1)}
                  className="w-7 h-7 rounded border border-brand-beige/50 flex items-center justify-center hover:bg-white text-xs"
                  disabled={config.compartments.rows[i] <= 1}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-lg font-bold w-6 text-center">{config.compartments.rows[i]}</span>
                <button
                  onClick={() => setRows(i, config.compartments.rows[i] + 1)}
                  className="w-7 h-7 rounded border border-brand-beige/50 flex items-center justify-center hover:bg-white text-xs"
                  disabled={config.compartments.rows[i] >= 8}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual preview */}
      <div className="p-4 bg-brand-warm rounded-xl">
        <label className="text-xs text-brand-charcoal/50 mb-2 block">Previzualizare structură</label>
        <div className="flex gap-1 h-32">
          {Array.from({ length: config.compartments.columns }, (_, col) => (
            <div key={col} className="flex-1 flex flex-col gap-1">
              {Array.from({ length: config.compartments.rows[col] }, (_, row) => (
                <div
                  key={row}
                  className="flex-1 bg-white border border-brand-beige/50 rounded-sm flex items-center justify-center text-[10px] text-brand-charcoal/30"
                >
                  {col + 1},{row + 1}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FrontsStep() {
  const config = useConfiguratorStore((s) => s.config);
  const setFront = useConfiguratorStore((s) => s.setFront);
  const setAllFronts = useConfiguratorStore((s) => s.setAllFronts);
  const selectedCompartment = useConfiguratorStore((s) => s.selectedCompartment);
  const selectCompartment = useConfiguratorStore((s) => s.selectCompartment);

  const availableFronts = getFrontsForCategory(config.category);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm">Fronturi</h3>
        <p className="text-brand-charcoal/50 text-sm mt-1">Alege tipul de front pentru fiecare compartiment.</p>
      </div>

      {/* Quick apply all */}
      <div className="space-y-2">
        <label className="text-xs text-brand-charcoal/50 uppercase tracking-wider">Aplică la toate</label>
        <div className="flex flex-wrap gap-2">
          {availableFronts.map((front) => (
            <button
              key={front.id}
              onClick={() => setAllFronts(front.type)}
              className="px-3 py-2 rounded-lg border border-brand-beige/50 text-sm hover:border-brand-accent hover:text-brand-accent transition-colors flex items-center space-x-1"
            >
              <span>{front.icon}</span>
              <span>{front.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Per-compartment selection */}
      <div className="space-y-2">
        <label className="text-xs text-brand-charcoal/50 uppercase tracking-wider">Pe compartimente</label>
        <p className="text-xs text-brand-charcoal/30">Click pe un compartiment în previzualizarea 3D sau mai jos</p>

        <div className="flex gap-1 max-h-48 overflow-y-auto">
          {Array.from({ length: config.compartments.columns }, (_, col) => (
            <div key={col} className="flex-1 flex flex-col gap-1">
              {Array.from({ length: config.compartments.rows[col] }, (_, row) => {
                const currentFront = config.fronts.find(
                  (f) => f.col === col && f.row === row
                );
                const isSelected = selectedCompartment?.row === row && selectedCompartment?.col === col;

                return (
                  <button
                    key={row}
                    onClick={() => selectCompartment(row, col)}
                    className={`flex-1 min-h-[40px] rounded border-2 text-[10px] transition-all ${
                      isSelected
                        ? 'border-brand-accent bg-brand-accent/10'
                        : 'border-brand-beige/50 hover:border-brand-beige'
                    }`}
                  >
                    {currentFront ? (
                      <span className="text-lg">
                        {availableFronts.find((f) => f.type === currentFront.frontType)?.icon || '⬜'}
                      </span>
                    ) : (
                      <span className="text-brand-charcoal/30">⬜</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected compartment front type */}
      {selectedCompartment && (
        <div className="p-4 bg-brand-accent/5 rounded-xl border border-brand-accent/20 animate-fade-in">
          <label className="text-xs text-brand-accent uppercase tracking-wider font-medium">
            Compartiment ({selectedCompartment.col + 1}, {selectedCompartment.row + 1})
          </label>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {availableFronts.map((front) => {
              const current = config.fronts.find(
                (f) => f.col === selectedCompartment.col && f.row === selectedCompartment.row
              );
              const isActive = current?.frontType === front.type || (!current && front.type === 'none');

              return (
                <button
                  key={front.id}
                  onClick={() => setFront(selectedCompartment.row, selectedCompartment.col, front.type)}
                  className={`p-2 rounded-lg border-2 text-xs font-medium transition-all flex items-center space-x-1 ${
                    isActive
                      ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                      : 'border-brand-beige/50 text-brand-charcoal/60 hover:border-brand-beige'
                  }`}
                >
                  <span>{front.icon}</span>
                  <span>{front.name}</span>
                  {front.pricePerUnit > 0 && (
                    <span className="text-brand-charcoal/30 ml-auto">+{front.pricePerUnit} lei</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialStep() {
  const config = useConfiguratorStore((s) => s.config);
  const setBodyMaterial = useConfiguratorStore((s) => s.setBodyMaterial);
  const setFrontMaterial = useConfiguratorStore((s) => s.setFrontMaterial);

  const [activeTab, setActiveTab] = React.useState<'body' | 'front'>('body');
  // Loads textures from /public/textures/ and registers them in the material registry
  const { loading: texturesLoading } = useTextures();

  const bodyMaterials = getBodyMaterials();
  const frontMaterials = getFrontMaterials();

  const activeMaterials = activeTab === 'body' ? bodyMaterials : frontMaterials;
  const activeMaterialId = activeTab === 'body' ? config.bodyMaterialId : config.frontMaterialId;
  const setMaterial = activeTab === 'body' ? setBodyMaterial : setFrontMaterial;

  // Group by type
  const grouped = materialTypes.map((mt) => ({
    ...mt,
    items: activeMaterials.filter((m) => m.type === mt.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm">Materiale</h3>
        <p className="text-brand-charcoal/50 text-sm mt-1">Alege materialul pentru corp și fronturi.</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-brand-warm p-1">
        <button
          onClick={() => setActiveTab('body')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'body' ? 'bg-white shadow text-brand-dark' : 'text-brand-charcoal/50'
          }`}
        >
          Corp
        </button>
        <button
          onClick={() => setActiveTab('front')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'front' ? 'bg-white shadow text-brand-dark' : 'text-brand-charcoal/50'
          }`}
        >
          Fronturi
        </button>
      </div>

      {/* Materials list by type */}
      {/* Materials list by type */}
      {texturesLoading && (
        <p className="text-xs text-brand-charcoal/40 animate-pulse">Se încarcă texturile...</p>
      )}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {grouped.map((group) => (
          <div key={group.id}>
            <h4 className="text-xs text-brand-charcoal/50 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">
              {group.name}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {group.items.map((mat) => {
                const isActive = mat.id === activeMaterialId;
                return (
                  <button
                    key={mat.id}
                    onClick={() => setMaterial(mat.id)}
                    title={mat.id !== mat.name ? mat.id : undefined}
                    className={`relative p-2 rounded-lg border-2 transition-all group ${
                      isActive
                        ? 'border-brand-accent shadow-md'
                        : 'border-brand-beige/30 hover:border-brand-beige/50'
                    }`}
                  >
                    <div
                      className={`material-swatch w-full h-10 rounded-md ${isActive ? 'active' : ''}`}
                      style={mat.textureUrl
                        ? {
                            backgroundImage: `url(${mat.textureUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : { backgroundColor: mat.color }}
                    />
                    <p className="text-[10px] font-medium mt-1 text-brand-charcoal/70 truncate">{mat.name}</p>
                    {mat.id !== mat.name && (
                      <p className="text-[8px] text-brand-charcoal/35 truncate leading-tight">{mat.id}</p>
                    )}
                    {mat.priceMultiplier > 1.5 && (
                      <span className="absolute -top-1 -right-1 text-[8px] bg-brand-accent text-white px-1 rounded-full">
                        Premium
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-brand-accent rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected material info */}
      {(() => {
        const selected = getMaterialById(activeMaterialId);
        if (!selected) return null;
        return (
          <div className="p-3 bg-brand-warm rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg"
                style={selected.textureUrl
                  ? {
                      backgroundImage: `url(${selected.textureUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: selected.color }}
              />
              <div>
                <p className="text-sm font-semibold">{selected.name}</p>
                {selected.id !== selected.name && (
                  <p className="text-[10px] text-brand-charcoal/50 font-sans break-all">{selected.id}</p>
                )}
                {selected.description && selected.description !== selected.id && (
                  <p className="text-xs text-brand-charcoal/40">{selected.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function BaseStep() {
  const config = useConfiguratorStore((s) => s.config);
  const setBaseType = useConfiguratorStore((s) => s.setBaseType);

  const availableBases = getBasesForCategory(config.category);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm">Tip Bază</h3>
        <p className="text-brand-charcoal/50 text-sm mt-1">Alege cum va sta mobilierul pe podea.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {availableBases.map((base) => {
          const isActive = config.baseType === base.id;
          return (
            <button
              key={base.id}
              onClick={() => setBaseType(base.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all flex items-center space-x-4 ${
                isActive
                  ? 'border-brand-accent bg-brand-accent/5'
                  : 'border-brand-beige/50 hover:border-brand-beige'
              }`}
            >
              <span className="text-2xl">{base.icon}</span>
              <div className="flex-1">
                <h4 className={`font-semibold ${isActive ? 'text-brand-accent' : 'text-brand-dark'}`}>
                  {base.name}
                </h4>
                {base.height > 0 && (
                  <p className="text-xs text-brand-charcoal/50">Înălțime: {base.height * 10} mm</p>
                )}
              </div>
              <div className="text-right">
                {base.priceAdd > 0 ? (
                  <span className="text-sm font-medium text-brand-charcoal/60">+{base.priceAdd} lei</span>
                ) : (
                  <span className="text-sm text-brand-sage font-medium">Inclus</span>
                )}
              </div>
              {isActive && (
                <div className="w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionsStep() {
  const config = useConfiguratorStore((s) => s.config);
  const toggleOption = useConfiguratorStore((s) => s.toggleOption);
  const toggleBackPanel = useConfiguratorStore((s) => s.toggleBackPanel);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm">Opțiuni Suplimentare</h3>
        <p className="text-brand-charcoal/50 text-sm mt-1">Personalizează-ți mobilierul cu opțiuni extra.</p>
      </div>

      {/* Back panel toggle */}
      <button
        onClick={toggleBackPanel}
        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center space-x-4 ${
          config.backPanel
            ? 'border-brand-accent bg-brand-accent/5'
            : 'border-brand-beige/50 hover:border-brand-beige'
        }`}
      >
        <span className="text-2xl">🎨</span>
        <div className="flex-1">
          <h4 className="font-semibold">Panou Spate</h4>
          <p className="text-xs text-brand-charcoal/50">Panou de spate în aceeași culoare cu corpul</p>
        </div>
        <div className={`w-12 h-6 rounded-full transition-all ${
          config.backPanel ? 'bg-brand-accent' : 'bg-brand-beige'
        }`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
            config.backPanel ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'
          }`} />
        </div>
      </button>

      {/* Additional options */}
      <div className="space-y-2">
        {additionalOptions.map((opt) => {
          const isSelected = config.additionalOptions.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center space-x-3 ${
                isSelected
                  ? 'border-brand-accent bg-brand-accent/5'
                  : 'border-brand-beige/50 hover:border-brand-beige'
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{opt.name}</h4>
                <p className="text-xs text-brand-charcoal/50 truncate">{opt.description}</p>
              </div>
              <span className="text-sm font-medium text-brand-charcoal/60 whitespace-nowrap">+{opt.price} lei</span>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isSelected ? 'bg-brand-accent border-brand-accent' : 'border-brand-beige'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryStep() {
  const config = useConfiguratorStore((s) => s.config);
  const price = useConfiguratorStore((s) => s.price);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const bodyMaterial = getMaterialById(config.bodyMaterialId);
  const frontMaterial = getMaterialById(config.frontMaterialId);
  const catInfo = furnitureCategories.find((c) => c.id === config.category);
  const delivery = getDeliveryEstimate(config);

  async function handleOfferSubmit(data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }) {
    setStatusMessage(null);

    const pdfBase64 = generatePDFBase64(config, price);

    const res = await fetch('/api/send-offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        configType: catInfo?.name || config.category,
        pdfBase64,
        pdfFilename: getPDFFileName(config),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || 'Nu am putut trimite oferta. Incearca din nou.');
    }

    setStatusMessage('Cererea a fost trimisa cu succes. Revenim catre tine in cel mai scurt timp.');
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm">Sumar Comandă</h3>
        <p className="text-brand-charcoal/50 text-sm mt-1">Verifică configurația și plasează comanda.</p>
      </div>

      {/* Config Summary */}
      <div className="space-y-3">
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Tip mobilier</span>
          <span className="text-sm font-semibold">{catInfo?.name}</span>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Dimensiuni</span>
          <span className="text-sm font-semibold tabular-nums">
            {config.dimensions.width * 10} × {config.dimensions.height * 10} × {config.dimensions.depth * 10} mm
          </span>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Material corp</span>
          <span className="text-sm font-semibold">{bodyMaterial?.name}</span>
        </div>
        {config.fronts.length > 0 && (
          <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
            <span className="text-sm text-brand-charcoal/60">Material fronturi</span>
            <span className="text-sm font-semibold">{frontMaterial?.name}</span>
          </div>
        )}
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Termen livrare</span>
          <span className="text-sm font-semibold flex items-center space-x-1">
            <Truck className="w-4 h-4 text-brand-charcoal/30" />
            <span>{delivery}</span>
          </span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="border-t border-brand-beige/50 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/50">Corp mobilier</span>
          <span className="tabular-nums">{formatPrice(price.bodyPrice)}</span>
        </div>
        {price.frontPrice > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-brand-charcoal/50">Fronturi</span>
            <span className="tabular-nums">{formatPrice(price.frontPrice)}</span>
          </div>
        )}
        {price.basePrice > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-brand-charcoal/50">Bază</span>
            <span className="tabular-nums">{formatPrice(price.basePrice)}</span>
          </div>
        )}
        {price.backPanelPrice > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-brand-charcoal/50">Panou spate</span>
            <span className="tabular-nums">{formatPrice(price.backPanelPrice)}</span>
          </div>
        )}
        {price.additionalOptionsPrice > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-brand-charcoal/50">Opțiuni extra</span>
            <span className="tabular-nums">{formatPrice(price.additionalOptionsPrice)}</span>
          </div>
        )}

        {price.discount > 0 && (
          <>
            <div className="border-t border-dashed border-brand-beige/30 my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-brand-charcoal/50">Subtotal</span>
              <span className="tabular-nums">{formatPrice(price.totalBeforeDiscount)}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-sage">
              <span>Discount volum</span>
              <span className="tabular-nums">-{formatPrice(price.discount)}</span>
            </div>
          </>
        )}

        <div className="border-t border-brand-beige/50 pt-3 mt-2 flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-[28px] font-bold text-brand-accent leading-none tabular-nums">{formatPrice(price.total)}</span>
        </div>
      </div>

      {/* TVA info */}
      <div className="bg-brand-warm/60 rounded-lg p-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/50">Preț fără TVA</span>
          <span className="font-medium tabular-nums">{formatPrice(price.total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/50">TVA (19%)</span>
          <span className="font-medium tabular-nums">{formatPrice(Math.round(price.total * 0.19))}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-brand-dark border-t border-brand-accent/20 pt-1 mt-1">
          <span>Total cu TVA</span>
          <span className="text-brand-accent tabular-nums">{formatPrice(Math.round(price.total * 1.19))}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => setIsOfferModalOpen(true)}
          className="btn-primary w-full text-center justify-center"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Solicită Ofertă
        </button>
        <button
          onClick={() => exportPDF(config, price)}
          className="btn-secondary w-full text-center justify-center text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportă PDF — Desen Tehnic
        </button>
        {statusMessage && (
          <p className="text-xs text-brand-sage">{statusMessage}</p>
        )}
      </div>

      <OfferRequestModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmit={handleOfferSubmit}
        title="Solicita oferta"
      />
    </div>
  );
}

// ===== MAIN PANEL COMPONENT =====

export default function ConfiguratorPanel() {
  const currentStep = useConfiguratorStore((s) => s.currentStep);
  const steps = useConfiguratorStore((s) => s.steps);
  const nextStep = useConfiguratorStore((s) => s.nextStep);
  const prevStep = useConfiguratorStore((s) => s.prevStep);
  const goToStep = useConfiguratorStore((s) => s.goToStep);
  const price = useConfiguratorStore((s) => s.price);
  const resetConfig = useConfiguratorStore((s) => s.resetConfig);

  const currentStepIndex = steps.indexOf(currentStep);
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  function renderStep() {
    switch (currentStep) {
      case 'category': return <CategoryStep />;
      case 'dimensions': return <DimensionsStep />;
      case 'compartments': return <CompartmentsStep />;
      case 'fronts': return <FrontsStep />;
      case 'material': return <MaterialStep />;
      case 'base': return <BaseStep />;
      case 'options': return <OptionsStep />;
      case 'summary': return <SummaryStep />;
    }
  }

  return (
    <div className="configurator-panel flex flex-col h-full min-h-0">
      {/* ── Horizontal step progress ── */}
      <div className="shrink-0 pt-4 lg:pt-[30px] mb-2">
        <div className="flex items-center">
          {steps.map((step, i) => {
            const meta = stepLabels[step];
            const isActive = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <React.Fragment key={step}>
                {i > 0 && (
                  <div className={`flex-1 h-px transition-colors duration-300 ${
                    i <= currentStepIndex ? 'bg-brand-accent/25' : 'bg-brand-beige/25'
                  }`} />
                )}
                <button
                  onClick={() => currentStep !== 'category' && i <= currentStepIndex && goToStep(step)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand-accent'
                      : isDone
                        ? 'text-brand-charcoal/60 hover:text-brand-charcoal/80'
                        : 'text-brand-charcoal/35 hover:text-brand-charcoal/50'
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-dark text-white shadow-sm'
                      : isDone
                        ? 'bg-brand-dark text-white'
                        : 'bg-brand-beige/25 text-brand-charcoal/35'
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  <span className="text-[11px] hidden sm:inline">{meta.title}</span>
                </button>
              </React.Fragment>
            );
          })}

          <div className="flex-1" />
          <button
            onClick={resetConfig}
            className="text-brand-charcoal/30 hover:text-brand-charcoal/60 hover:bg-[#F5F3EE] transition-all duration-200 p-1.5 rounded-lg active:scale-[0.95]"
            title="Resetează"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Step content (scrollable) ── */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-16 lg:pb-0 -mx-1 px-1">
        {renderStep()}
      </div>

      {/* ── Footer: price + nav ── */}
      {currentStep !== 'category' && (
        <div className="shrink-0 pt-2.5 mt-1 border-t border-brand-beige/15 lg:relative fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none px-4 pb-[env(safe-area-inset-bottom)] lg:px-0 lg:pb-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:shadow-none">
          <div className="flex items-center gap-2 pb-1.5">
            <button
              onClick={prevStep}
              className="py-2.5 px-4 rounded-xl border border-brand-beige/30 bg-white text-brand-charcoal/60 text-[13px] font-medium hover:bg-[#F5F3EE] hover:border-brand-beige/50 hover:shadow-sm transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Înapoi
            </button>
            <div className="flex-1 text-right">
              <span className="text-[10px] text-brand-charcoal/40 block leading-none">estimat</span>
              <span className="text-[16px] font-bold text-brand-accent tabular-nums leading-tight">{formatPrice(price.total)}</span>
            </div>
            {!isLast && (
              <button
                onClick={nextStep}
                className="py-2.5 px-6 rounded-xl bg-brand-dark hover:bg-brand-charcoal text-white text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Continuă
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
