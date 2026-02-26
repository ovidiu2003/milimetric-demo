'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Minus, Plus,
  FlipHorizontal, RotateCcw, ShoppingCart, Download,
  Ruler, PaintBucket, FileText, Truck,
} from 'lucide-react';
import { useLivingUnitStore, LIVING_UNIT_LIMITS, LivingUnitStep } from '@/store/livingUnitStore';
import { materials, materialTypes, getBodyMaterials, getFrontMaterials, getMaterialById } from '@/data/materials';

const stepMeta: Record<LivingUnitStep, { title: string; icon: React.ReactNode }> = {
  parameters: { title: 'Parametri', icon: <Ruler className="w-5 h-5" /> },
  materials:  { title: 'Materiale', icon: <PaintBucket className="w-5 h-5" /> },
  summary:    { title: 'Sumar',     icon: <ShoppingCart className="w-5 h-5" /> },
};

// ── helpers ──
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency', currency: 'RON',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);
}

// ──────────────────────────────────────────────
// Slider + number input row
// ──────────────────────────────────────────────
function ParamSlider({
  label, value, min, max, step, unit, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-brand-charcoal/70">{label}</label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onChange(value - step)}
            className="w-8 h-8 rounded-lg border border-brand-beige/50 flex items-center justify-center hover:bg-brand-warm transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || min)}
            className="w-20 text-center input-field py-1.5 text-sm font-semibold"
            min={min} max={max} step={step}
          />
          <button
            onClick={() => onChange(value + step)}
            className="w-8 h-8 rounded-lg border border-brand-beige/50 flex items-center justify-center hover:bg-brand-warm transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
          <span className="text-xs text-brand-charcoal/30 w-8">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-brand-beige rounded-lg appearance-none cursor-pointer accent-brand-accent"
      />
      <div className="flex justify-between text-xs text-brand-charcoal/30">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// STEP 1: Parameters
// ──────────────────────────────────────────────
function ParametersStep() {
  const c = useLivingUnitStore((s) => s.config);
  const {
    setSuspensionHeight, setComodaHeight, setComodaWidth, setComodaColumns,
    setRaftWidth, setDulapWidth,
    setTotalHeight, setDepth,
    toggleMirror,
  } = useLivingUnitStore();

  const towerHeight = c.totalHeight - c.suspensionHeight - c.comodaHeight;
  const [activeTab, setActiveTab] = useState<'orizontal' | 'vertical'>('orizontal');
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm">Parametri Corp Living</h3>
        <p className="text-brand-charcoal/50 text-sm mt-1">
          Configurează dimensiunile corpului orizontal (comodă) și corpului vertical (turn).
        </p>
      </div>

      {/* ── Switch tabs ── */}
      <div className="flex rounded-lg bg-brand-warm p-1">
        <button
          onClick={() => setActiveTab('orizontal')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === 'orizontal'
              ? 'bg-white shadow text-brand-dark'
              : 'text-brand-charcoal/50 hover:text-brand-charcoal/70'
          }`}
        >
          Corp Orizontal
        </button>
        <button
          onClick={() => setActiveTab('vertical')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === 'vertical'
              ? 'bg-white shadow text-brand-dark'
              : 'text-brand-charcoal/50 hover:text-brand-charcoal/70'
          }`}
        >
          Corp Vertical
        </button>
      </div>

      {/* ── CORP ORIZONTAL (comoda) ── */}
      {activeTab === 'orizontal' && (
        <div className="space-y-5">
          <p className="text-xs text-brand-charcoal/40 uppercase tracking-wider">Comodă (bază suspendată)</p>
          <ParamSlider
            label="Înălțime suspendare"
            value={c.suspensionHeight}
            {...LIVING_UNIT_LIMITS.suspensionHeight} unit="cm"
            onChange={setSuspensionHeight}
          />
          <ParamSlider
            label="Înălțime comodă"
            value={c.comodaHeight}
            {...LIVING_UNIT_LIMITS.comodaHeight} unit="cm"
            onChange={setComodaHeight}
          />
          <ParamSlider
            label="Lățime comodă"
            value={c.comodaWidth}
            {...LIVING_UNIT_LIMITS.comodaWidth} unit="cm"
            onChange={setComodaWidth}
          />
          <ParamSlider
            label="Număr coloane"
            value={c.comodaColumns}
            {...LIVING_UNIT_LIMITS.comodaColumns} unit="buc"
            onChange={setComodaColumns}
          />
        </div>
      )}

      {/* ── CORP VERTICAL (turn = raft + dulap) ── */}
      {activeTab === 'vertical' && (
        <div className="space-y-5">
          <p className="text-xs text-brand-charcoal/40 uppercase tracking-wider">Turn (raft deschis + dulap)</p>
          <ParamSlider
            label="Lățime raft deschis"
            value={c.raftWidth}
            {...LIVING_UNIT_LIMITS.raftWidth} unit="cm"
            onChange={setRaftWidth}
          />
          <ParamSlider
            label="Lățime dulap"
            value={c.dulapWidth}
            {...LIVING_UNIT_LIMITS.dulapWidth} unit="cm"
            onChange={setDulapWidth}
          />
          <ParamSlider
            label="Înălțime totală"
            value={c.totalHeight}
            {...LIVING_UNIT_LIMITS.totalHeight} unit="cm"
            onChange={setTotalHeight}
          />

          {/* Mirror toggle */}
          <button
            onClick={toggleMirror}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center space-x-4 ${
              c.mirrored
                ? 'border-brand-accent bg-brand-accent/5'
                : 'border-brand-beige/50 hover:border-brand-beige'
            }`}
          >
            <FlipHorizontal className={`w-6 h-6 ${c.mirrored ? 'text-brand-accent' : 'text-brand-charcoal/40'}`} />
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${c.mirrored ? 'text-brand-accent' : 'text-brand-dark'}`}>
                Oglindire dulap
              </h4>
              <p className="text-xs text-brand-charcoal/50">
                {c.mirrored ? 'Dulapul este pe stânga' : 'Dulapul este pe dreapta'}
              </p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-all ${
              c.mirrored ? 'bg-brand-accent' : 'bg-brand-beige'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
                c.mirrored ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </div>
      )}

      {/* ── Computed info ── */}
      <div className="p-4 bg-brand-warm rounded-xl space-y-2">
        <p className="text-xs text-brand-charcoal/50 uppercase tracking-wider mb-2">Dimensiuni calculate</p>
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/60">Lățime totală (auto)</span>
          <span className="font-semibold">{c.totalWidth} cm</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/60">Înălțime turn (raft + dulap)</span>
          <span className="font-semibold">{towerHeight} cm</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/60">Lățime turn</span>
          <span className="font-semibold">{c.raftWidth + c.dulapWidth} cm</span>
        </div>
      </div>

      {/* ── Advanced dimensions ── */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-brand-accent hover:text-brand-accent/80 flex items-center space-x-1"
      >
        <span>{showAdvanced ? '▾' : '▸'} Dimensiuni avansate</span>
      </button>

      {showAdvanced && (
        <div className="space-y-5 p-4 bg-brand-warm/50 rounded-xl border border-brand-beige/30">
          <ParamSlider
            label="Adâncime"
            value={c.depth}
            {...LIVING_UNIT_LIMITS.depth} unit="cm"
            onChange={setDepth}
          />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// STEP 2: Materials
// ──────────────────────────────────────────────
function MaterialsStep() {
  const config = useLivingUnitStore((s) => s.config);
  const setBodyMaterial = useLivingUnitStore((s) => s.setBodyMaterial);
  const setFrontMaterial = useLivingUnitStore((s) => s.setFrontMaterial);

  const [activeTab, setActiveTab] = useState<'body' | 'front'>('body');

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
        <p className="text-brand-charcoal/50 text-sm mt-1">
          Alege materialul pentru corp (comodă + rafturi) și front dulap.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-brand-warm p-1">
        <button
          onClick={() => setActiveTab('body')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'body' ? 'bg-white shadow text-brand-dark' : 'text-brand-charcoal/50'
          }`}
        >
          Corp + Comodă
        </button>
        <button
          onClick={() => setActiveTab('front')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'front' ? 'bg-white shadow text-brand-dark' : 'text-brand-charcoal/50'
          }`}
        >
          Front Dulap
        </button>
      </div>

      {/* Materials list by type */}
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
                    className={`relative p-2 rounded-lg border-2 transition-all group ${
                      isActive
                        ? 'border-brand-accent shadow-md'
                        : 'border-brand-beige/30 hover:border-brand-beige/50'
                    }`}
                  >
                    <div
                      className={`material-swatch w-full h-10 rounded-md ${isActive ? 'active' : ''}`}
                      style={{ backgroundColor: mat.color }}
                    />
                    <p className="text-[10px] font-medium mt-1 text-brand-charcoal/70 truncate">{mat.name}</p>
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
              <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: selected.color }} />
              <div>
                <p className="text-sm font-semibold">{selected.name}</p>
                <p className="text-xs text-brand-charcoal/50">{selected.description}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ──────────────────────────────────────────────
// STEP 3: Summary
// ──────────────────────────────────────────────
function SummaryStep() {
  const config = useLivingUnitStore((s) => s.config);
  const price = useLivingUnitStore((s) => s.price);

  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);
  const towerHeight = config.totalHeight - config.suspensionHeight - config.comodaHeight;

  const delivery = bodyMat?.type === 'lemn-masiv' ? '10-14 săptămâni' :
                   bodyMat?.type === 'furnir' ? '8-12 săptămâni' : '6-10 săptămâni';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm">Sumar Configurare</h3>
        <p className="text-brand-charcoal/50 text-sm mt-1">Verifică configurația Corp Living Suspendat.</p>
      </div>

      {/* Config Summary */}
      <div className="space-y-3">
        <p className="text-xs text-brand-charcoal/40 uppercase tracking-wider">Corp Orizontal (Comodă)</p>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Lățime comodă</span>
          <span className="text-sm font-semibold">{config.comodaWidth} cm</span>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Înălțime comodă</span>
          <span className="text-sm font-semibold">{config.comodaHeight} cm</span>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Număr coloane</span>
          <span className="text-sm font-semibold">{config.comodaColumns}</span>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Înălțime suspendare</span>
          <span className="text-sm font-semibold">{config.suspensionHeight} cm</span>
        </div>

        <p className="text-xs text-brand-charcoal/40 uppercase tracking-wider mt-4">Corp Vertical (Turn)</p>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Lățime raft deschis</span>
          <span className="text-sm font-semibold">{config.raftWidth} cm</span>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Lățime dulap</span>
          <span className="text-sm font-semibold">{config.dulapWidth} cm</span>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Înălțime turn</span>
          <span className="text-sm font-semibold">{towerHeight} cm</span>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Oglindire</span>
          <span className="text-sm font-semibold">
            {config.mirrored ? 'Da — dulap pe stânga' : 'Nu — dulap pe dreapta'}
          </span>
        </div>

        <p className="text-xs text-brand-charcoal/40 uppercase tracking-wider mt-4">Dimensiuni generale</p>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Dimensiuni totale</span>
          <span className="text-sm font-semibold">
            {config.totalWidth} × {config.totalHeight} × {config.depth} cm
          </span>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Material corp</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: bodyMat?.color }} />
            <span className="text-sm font-semibold">{bodyMat?.name}</span>
          </div>
        </div>
        <div className="p-3 bg-brand-warm rounded-lg flex justify-between items-center">
          <span className="text-sm text-brand-charcoal/60">Material front dulap</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: frontMat?.color }} />
            <span className="text-sm font-semibold">{frontMat?.name}</span>
          </div>
        </div>
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
          <span className="text-brand-charcoal/50">Comodă</span>
          <span>{formatPrice(price.comodaCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/50">Turn (raft + dulap corp)</span>
          <span>{formatPrice(price.towerCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/50">Fronturi (sertare + ușă)</span>
          <span>{formatPrice(price.frontsCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/50">Feronerie & montaj</span>
          <span>{formatPrice(price.hardwareCost)}</span>
        </div>

        {price.discount > 0 && (
          <>
            <div className="border-t border-dashed border-brand-beige/30 my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-brand-charcoal/50">Subtotal</span>
              <span>{formatPrice(price.totalBeforeDiscount)}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-sage">
              <span>Discount volum</span>
              <span>-{formatPrice(price.discount)}</span>
            </div>
          </>
        )}

        <div className="border-t border-brand-beige/50 pt-3 mt-2 flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-bold text-brand-accent">{formatPrice(price.total)}</span>
        </div>
      </div>

      {/* TVA info */}
      <div className="bg-brand-warm/60 rounded-lg p-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/50">Preț fără TVA</span>
          <span className="font-medium">{formatPrice(price.total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-charcoal/50">TVA (19%)</span>
          <span className="font-medium">{formatPrice(Math.round(price.total * 0.19))}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-brand-dark border-t border-brand-accent/20 pt-1 mt-1">
          <span>Total cu TVA</span>
          <span className="text-brand-accent">{formatPrice(Math.round(price.total * 1.19))}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button className="btn-primary w-full text-center justify-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Solicită Ofertă
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN PANEL
// ──────────────────────────────────────────────
export default function LivingUnitPanel() {
  const currentStep = useLivingUnitStore((s) => s.currentStep);
  const steps = useLivingUnitStore((s) => s.steps);
  const nextStep = useLivingUnitStore((s) => s.nextStep);
  const prevStep = useLivingUnitStore((s) => s.prevStep);
  const goToStep = useLivingUnitStore((s) => s.goToStep);
  const price = useLivingUnitStore((s) => s.price);
  const resetConfig = useLivingUnitStore((s) => s.resetConfig);

  const idx = steps.indexOf(currentStep);
  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;

  function renderStep() {
    switch (currentStep) {
      case 'parameters': return <ParametersStep />;
      case 'materials':  return <MaterialsStep />;
      case 'summary':    return <SummaryStep />;
    }
  }

  return (
    <div className="configurator-panel flex flex-col h-full">
      {/* Step dots */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {steps.map((step, i) => (
            <button
              key={step}
              onClick={() => i <= idx && goToStep(step)}
              className={`step-dot ${
                i === idx ? 'active' : i < idx ? 'completed' : 'pending'
              }`}
              title={stepMeta[step].title}
            />
          ))}
        </div>
        <button
          onClick={resetConfig}
          className="text-xs text-brand-charcoal/30 hover:text-brand-charcoal/60 flex items-center space-x-1"
          title="Resetează"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Step label */}
      <div className="flex items-center space-x-2 mb-4 text-xs text-brand-charcoal/30 uppercase tracking-wider">
        {stepMeta[currentStep].icon}
        <span>
          Pas {idx + 1} din {steps.length}: {stepMeta[currentStep].title}
        </span>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto mb-6 -mx-1 px-1">
        {renderStep()}
      </div>

      {/* Price + Navigation */}
      <div className="border-t border-brand-beige/30 pt-4 space-y-3">
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-brand-charcoal/50">Preț estimat</span>
          <span className="text-xl font-bold text-brand-accent">{formatPrice(price.total)}</span>
        </div>

        {/* Nav */}
        <div className="flex items-center space-x-3">
          {!isFirst && (
            <button
              onClick={prevStep}
              className="flex-1 py-3 rounded-lg border border-brand-beige/50 text-brand-charcoal/60 font-medium text-sm hover:bg-brand-warm transition-colors flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Înapoi</span>
            </button>
          )}
          {!isLast && (
            <button
              onClick={nextStep}
              className="flex-1 btn-primary justify-center text-sm"
            >
              <span>Continuă</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
