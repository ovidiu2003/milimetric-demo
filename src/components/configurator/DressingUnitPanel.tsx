'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check,
  RotateCcw, ShoppingCart, Download,
  Ruler, PaintBucket, FileText, Truck, ChevronDown,
  DoorOpen, DoorClosed, Sparkles, Layers, Package, PanelLeft, PanelRight, PanelsTopLeft,
  Archive, Grid3x3,
} from 'lucide-react';
import {
  useDressingUnitStore,
  DRESSING_UNIT_LIMITS,
  DRESSING_INTERIOR_OPTIONS,
  DRESSING_SIDE_POSITION_OPTIONS,
  DRESSING_PRESETS,
  DressingUnitStep,
} from '@/store/dressingUnitStore';
import { DressingInteriorType, DressingSidePosition } from '@/types';
import { materialTypes, getBodyMaterials, getFrontMaterials, getMaterialById } from '@/data/materials';
import { useTextures } from '@/hooks/useTextures';
import OfferRequestModal from '@/components/configurator/OfferRequestModal';
import {
  exportDressingUnitPDF,
  generateDressingUnitPDFBase64,
  getDressingUnitPDFFileName,
} from '@/utils/exportDressingUnitPDF';

const stepMeta: Record<DressingUnitStep, { label: string; icon: React.ReactNode }> = {
  parameters: { label: 'Dimensiuni', icon: <Ruler className="w-3.5 h-3.5" /> },
  materials:  { label: 'Materiale',  icon: <PaintBucket className="w-3.5 h-3.5" /> },
  summary:    { label: 'Finalizare', icon: <FileText className="w-3.5 h-3.5" /> },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency', currency: 'RON',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);
}

// ──────────────────────────────────────────────
// Slider
// ──────────────────────────────────────────────
function ParamSlider({
  label, value, min, max, step, unit, onChange, scale = 1,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; scale?: number;
}) {
  const dv = Math.round(value * scale);
  const dmin = Math.round(min * scale);
  const dmax = Math.round(max * scale);
  const dstep = Math.round(step * scale);
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const [inputValue, setInputValue] = useState<string>(dv.toString());

  useEffect(() => { setInputValue(dv.toString()); }, [dv]);

  const commitValue = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) onChange(Math.max(min, Math.min(max, parsed / scale)));
  };

  return (
    <div className="group overflow-visible px-1 pt-0.5 pb-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] text-brand-charcoal/60 leading-none group-hover:text-brand-charcoal/80 transition-colors">{label}</span>
        <div className="flex items-baseline gap-0.5">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              const parsed = parseInt(e.target.value, 10);
              if (!isNaN(parsed)) onChange(Math.max(min, Math.min(max, parsed / scale)));
            }}
            onBlur={(e) => {
              if (e.target.value === '' || isNaN(parseInt(e.target.value, 10))) {
                setInputValue(dv.toString());
              } else commitValue(e.target.value);
            }}
            className="w-12 text-right bg-transparent text-[13px] font-semibold text-brand-dark tabular-nums focus:outline-none focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-brand-accent/20 rounded px-0.5 py-0 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            min={dmin} max={dmax} step={dstep}
          />
          <span className="text-[10px] text-brand-charcoal/40 leading-none">{unit}</span>
        </div>
      </div>
      <div className="relative h-[5px] rounded-full bg-brand-beige/30 shadow-inner">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-accent/70 to-brand-accent transition-[width] duration-75" style={{ width: `${pct}%` }} />
        <div className="slider-tooltip" style={{ left: `${pct}%` }}>{dv}{unit}</div>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[12px] h-[12px] rounded-full bg-white border-2 border-brand-accent shadow-md transition-[left] duration-75 group-hover:scale-110 group-hover:shadow-lg" style={{ left: `${pct}%` }} />
        <input type="range" min={dmin} max={dmax} step={dstep} value={dv}
          onChange={(e) => onChange(parseInt(e.target.value, 10) / scale)}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-6 opacity-0 cursor-pointer"
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// STEP 1: Parameters
// ──────────────────────────────────────────────
function ParametersStep() {
  const c = useDressingUnitStore((s) => s.config);
  const {
    setModuleCount, setTotalModulesWidth, setTotalHeight, setDepth, setPlinthHeight,
    setModuleWidth, setModuleInterior, toggleModuleDoors,
    toggleModuleTopCompartment, setModuleTopCompartmentHeight,
    setSideShelvesPosition, setSideShelvesColumns,
    setSideShelvesColumnWidth, setSideShelvesShelfCount,
    applyPreset, toggleAllDoors,
  } = useDressingUnitStore();

  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [showPresets, setShowPresets] = useState(true);

  return (
    <div className="flex flex-col">
      {/* Presets - compact chips */}
      <div className="py-2 px-4 lg:px-[25px] border-b border-brand-beige/20">
        <button
          onClick={() => setShowPresets((v) => !v)}
          className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-semibold mb-1.5 hover:text-brand-charcoal/70 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Preconfigurări
          </span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showPresets ? '' : '-rotate-90'}`} />
        </button>
        {showPresets && (
          <div className="grid grid-cols-2 gap-1.5">
            {DRESSING_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                title={p.description}
                className="group text-left px-2 py-1.5 rounded-lg bg-white border border-brand-beige/30 hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all"
              >
                <div className="text-[11px] font-semibold text-brand-dark group-hover:text-brand-accent leading-tight">
                  {p.name}
                </div>
                <div className="text-[9.5px] text-brand-charcoal/45 tabular-nums mt-0.5">
                  {p.modules.length} mod · {p.totalHeight * 10}mm
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* General */}
      <div className="space-y-2 py-2.5 px-4 lg:px-[25px] border-b border-brand-beige/20">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Ruler className="w-3 h-3 text-brand-charcoal/40" />
          <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-semibold">Dimensiuni generale</p>
        </div>
        <ParamSlider label="Număr module" value={c.moduleCount}
          {...DRESSING_UNIT_LIMITS.moduleCount} unit="buc"
          onChange={setModuleCount}
        />
        <ParamSlider
          label="Lățime totală module"
          value={c.modules.reduce((acc, m) => acc + m.width, 0)}
          min={c.modules.length * DRESSING_UNIT_LIMITS.moduleWidth.min}
          max={c.modules.length * DRESSING_UNIT_LIMITS.moduleWidth.max}
          step={DRESSING_UNIT_LIMITS.totalModulesWidth.step}
          unit="mm"
          scale={10}
          onChange={setTotalModulesWidth}
        />
        <ParamSlider label="Înălțime totală" value={c.totalHeight}
          {...DRESSING_UNIT_LIMITS.totalHeight} unit="mm" scale={10}
          onChange={setTotalHeight}
        />
        <ParamSlider label="Adâncime" value={c.depth}
          {...DRESSING_UNIT_LIMITS.depth} unit="mm" scale={10}
          onChange={setDepth}
        />
        <ParamSlider label="Plintă" value={c.plinthHeight}
          {...DRESSING_UNIT_LIMITS.plinthHeight} unit="mm" scale={10}
          onChange={setPlinthHeight}
        />
      </div>

      {/* Per-module configuration */}
      <div className="space-y-2 py-2.5 px-4 lg:px-[25px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-brand-charcoal/40" />
            <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-semibold">
              Module individuale
            </p>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-brand-charcoal/5 text-brand-charcoal/55 font-semibold tabular-nums">
              {c.modules.length}
            </span>
          </div>
          {(() => {
            const anyDoors = c.modules.some((m) => m.hasDoors);
            return (
              <button
                onClick={toggleAllDoors}
                title={anyDoors ? 'Ascunde ușile pentru a vedea interiorul' : 'Afișează ușile'}
                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md transition-all ${
                  anyDoors
                    ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/25 hover:bg-brand-accent/15'
                    : 'bg-white text-brand-charcoal/60 border border-brand-beige/30 hover:border-brand-accent/40'
                }`}
              >
                {anyDoors ? <DoorClosed className="w-3 h-3" /> : <DoorOpen className="w-3 h-3" />}
                <span className="font-medium">{anyDoors ? 'Ascunde uși' : 'Afișează uși'}</span>
              </button>
            );
          })()}
        </div>
        <p className="text-[10px] text-brand-charcoal/45 leading-snug -mt-1">
          Apasă pe un modul pentru a-i modifica lățimea, interiorul sau a adăuga un compartiment superior.
        </p>
        <div className="space-y-1.5">
          {c.modules.map((m, i) => {
            const isExpanded = expandedModule === i;
            const interiorLabel =
              m.interiorType === 'bara-raft' ? 'Bară + raft' :
              m.interiorType === 'rafturi' ? 'Rafturi' :
              'Mixt (bară + rafturi)';
            const InteriorIcon =
              m.interiorType === 'bara-raft' ? Archive :
              m.interiorType === 'rafturi' ? Grid3x3 :
              Package;

            return (
              <div
                key={i}
                className={`rounded-lg border overflow-hidden transition-all ${
                  isExpanded
                    ? 'border-brand-accent/40 bg-white shadow-sm'
                    : 'border-brand-beige/30 bg-[#F9F7F3] hover:border-brand-beige/60'
                }`}
              >
                {/* Summary row - always visible */}
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 hover:bg-white/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold shrink-0 ${
                      isExpanded
                        ? 'bg-brand-accent text-white'
                        : 'bg-brand-charcoal/10 text-brand-charcoal/70'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-[12px] font-semibold text-brand-dark shrink-0">
                      Modul {i + 1}
                    </span>
                    <span className="text-[10.5px] text-brand-charcoal/55 tabular-nums shrink-0 px-1.5 py-0.5 rounded bg-brand-charcoal/5">
                      {Math.round(m.width * 10)} mm
                    </span>
                    <span className="flex items-center gap-1 text-[10.5px] text-brand-charcoal/55 truncate min-w-0">
                      <InteriorIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{interiorLabel}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {m.hasTopCompartment && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-accent/10 text-brand-accent font-semibold uppercase tracking-wider">
                        Top
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-brand-charcoal/40 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 pt-2 space-y-2 border-t border-brand-beige/30 bg-[#FBFAF7] animate-module-expand">
                    <ParamSlider
                      label="Lățime modul"
                      value={m.width}
                      {...DRESSING_UNIT_LIMITS.moduleWidth}
                      unit="mm"
                      scale={10}
                      onChange={(v) => setModuleWidth(i, v)}
                    />

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-brand-charcoal/45 font-semibold block mb-1">
                        Configurație interior
                      </label>
                      <div className="relative">
                        <select
                          value={m.interiorType}
                          onChange={(e) => setModuleInterior(i, e.target.value as DressingInteriorType)}
                          className="w-full appearance-none bg-white border border-brand-beige/40 rounded-md px-2.5 py-1.5 pr-7 text-[11.5px] text-brand-dark font-medium focus:outline-none focus:ring-1 focus:ring-brand-accent/30 focus:border-brand-accent/50 transition-all"
                        >
                          {DRESSING_INTERIOR_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-brand-charcoal/40 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-brand-charcoal/45 font-semibold block mb-1">
                        Compartiment superior
                      </label>
                      <button
                        onClick={() => toggleModuleTopCompartment(i)}
                        className={`w-full flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-md transition-all border ${
                          m.hasTopCompartment
                            ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/30'
                            : 'bg-white text-brand-charcoal/60 border-brand-beige/40 hover:border-brand-accent/30'
                        }`}
                      >
                        <span className="font-medium">
                          {m.hasTopCompartment ? 'Activat' : 'Adaugă compartiment'}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          m.hasTopCompartment ? 'bg-brand-accent text-white' : 'bg-brand-charcoal/10 text-brand-charcoal/50'
                        }`}>
                          {m.hasTopCompartment ? 'ON' : 'OFF'}
                        </span>
                      </button>
                      {m.hasTopCompartment && (
                        <div className="mt-1.5">
                          <ParamSlider
                            label="Înălțime compartiment"
                            value={m.topCompartmentHeight}
                            {...DRESSING_UNIT_LIMITS.topCompartmentHeight}
                            unit="mm"
                            scale={10}
                            onChange={(v) => setModuleTopCompartmentHeight(i, v)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side shelves (biblioteca laterala) */}
      <div className="space-y-2 py-2.5 px-4 lg:px-[25px] border-t border-brand-beige/20">
        <div className="flex items-center gap-1.5 mb-0.5">
          {c.sideShelves.position === 'left' ? (
            <PanelLeft className="w-3 h-3 text-brand-charcoal/40" />
          ) : c.sideShelves.position === 'right' ? (
            <PanelRight className="w-3 h-3 text-brand-charcoal/40" />
          ) : (
            <PanelsTopLeft className="w-3 h-3 text-brand-charcoal/40" />
          )}
          <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-semibold">
            Bibliotecă laterală
          </p>
        </div>
        <div className="relative">
          <select
            value={c.sideShelves.position}
            onChange={(e) => setSideShelvesPosition(e.target.value as DressingSidePosition)}
            className="w-full appearance-none bg-white border border-brand-beige/40 rounded-md px-2.5 py-1.5 pr-7 text-[11.5px] text-brand-dark font-medium focus:outline-none focus:ring-1 focus:ring-brand-accent/30 focus:border-brand-accent/50 transition-all"
          >
            {DRESSING_SIDE_POSITION_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-brand-charcoal/40 pointer-events-none" />
        </div>

        {c.sideShelves.position !== 'none' && (
          <div className="space-y-1.5 pt-1">
            <ParamSlider
              label="Coloane"
              value={c.sideShelves.columns}
              {...DRESSING_UNIT_LIMITS.sideColumns}
              unit="buc"
              onChange={setSideShelvesColumns}
            />
            <ParamSlider
              label="Lățime"
              value={c.sideShelves.columnWidth}
              {...DRESSING_UNIT_LIMITS.sideColumnWidth}
              unit="mm"
              scale={10}
              onChange={setSideShelvesColumnWidth}
            />
            <ParamSlider
              label="Rafturi / coloană"
              value={c.sideShelves.shelfCount}
              {...DRESSING_UNIT_LIMITS.sideShelfCount}
              unit="buc"
              onChange={setSideShelvesShelfCount}
            />
          </div>
        )}
      </div>

      {/* Dimensions bar */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F5F3EE] text-[11.5px] shrink-0 mt-auto mx-4 lg:mx-[25px] mb-2 border border-brand-beige/30">
        <span className="text-brand-charcoal/55 font-medium flex items-center gap-1">
          <Ruler className="w-3 h-3" />
          Total
        </span>
        <div className="flex items-center gap-2.5 font-semibold text-brand-dark tabular-nums">
          <span title="Lățime totală">L <span className="text-brand-accent">{Math.round(c.totalWidth * 10)}</span></span>
          <span title="Înălțime totală">H <span className="text-brand-accent">{c.totalHeight * 10}</span></span>
          <span title="Adâncime">A <span className="text-brand-accent">{c.depth * 10}</span></span>
          <span className="text-brand-charcoal/45 font-normal">mm</span>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// STEP 2: Materials
// ──────────────────────────────────────────────
function MaterialsStep() {
  const config = useDressingUnitStore((s) => s.config);
  const setBodyMaterial = useDressingUnitStore((s) => s.setBodyMaterial);
  const setFrontMaterial = useDressingUnitStore((s) => s.setFrontMaterial);

  const [activeTab, setActiveTab] = useState<'body' | 'front'>('body');
  const { loading: texturesLoading } = useTextures();

  const bodyMaterials = getBodyMaterials();
  const frontMaterials = getFrontMaterials();

  const activeMaterials = activeTab === 'body' ? bodyMaterials : frontMaterials;
  const activeMaterialId = activeTab === 'body' ? config.bodyMaterialId : config.frontMaterialId;
  const setMaterial = activeTab === 'body' ? setBodyMaterial : setFrontMaterial;
  const selectedMat = getMaterialById(activeMaterialId);

  const grouped = materialTypes.map((mt) => ({
    ...mt,
    items: activeMaterials.filter((m) => m.type === mt.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col h-full animate-step-in">
      <div className="flex rounded-xl bg-[#F5F3EE] p-1 shrink-0 sticky top-0 z-20 gap-1 mx-1 lg:mx-0">
        <button
          onClick={() => setActiveTab('body')}
          className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'body' ? 'bg-white shadow-md text-brand-dark ring-1 ring-brand-beige/20' : 'text-brand-charcoal/45 hover:text-brand-charcoal/70 hover:bg-white/50'
          }`}
        >Corp</button>
        <button
          onClick={() => setActiveTab('front')}
          className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'front' ? 'bg-white shadow-md text-brand-dark ring-1 ring-brand-beige/20' : 'text-brand-charcoal/45 hover:text-brand-charcoal/70 hover:bg-white/50'
          }`}
        >Front</button>
      </div>

      {selectedMat && (
        <div className="mx-1 lg:mx-0 mt-2 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-brand-accent/5 border border-brand-accent/10 animate-fade-in">
          <div
            className="w-8 h-8 rounded-md shrink-0 ring-1 ring-brand-accent/20"
            style={selectedMat.textureUrl
              ? { backgroundImage: `url(${selectedMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { backgroundColor: selectedMat.color }}
          />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-brand-dark truncate">{selectedMat.name}</p>
            <p className="text-[10px] text-brand-charcoal/45">{activeTab === 'body' ? 'Material corp' : 'Material front'}</p>
          </div>
          {selectedMat.priceMultiplier > 1.5 && (
            <span className="ml-auto text-[9px] font-bold text-white bg-brand-accent px-1.5 py-0.5 rounded-md shrink-0">PREMIUM</span>
          )}
        </div>
      )}

      {texturesLoading && (
        <div className="flex items-center gap-2 text-[11px] text-brand-charcoal/35 mt-2 px-1">
          <div className="w-3 h-3 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
          Se încarcă texturile...
        </div>
      )}
      <div className="space-y-3 overflow-y-auto flex-1 mt-2 px-1 lg:px-0">
        {grouped.map((group) => (
          <div key={group.id}>
            <h4 className="text-[11px] text-brand-charcoal/50 uppercase tracking-widest font-medium mb-1.5 sticky top-0 bg-white py-0.5 z-10">
              {group.name}
            </h4>
            <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-5 gap-1.5 animate-stagger">
              {group.items.map((mat) => {
                const isActive = mat.id === activeMaterialId;
                return (
                  <button
                    key={mat.id}
                    onClick={() => setMaterial(mat.id)}
                    title={mat.name}
                    className={`material-card relative rounded-lg overflow-hidden ${
                      isActive
                        ? 'ring-2 ring-brand-accent ring-offset-1 shadow-lg'
                        : 'ring-1 ring-brand-beige/20 hover:ring-brand-beige/50 hover:shadow-md'
                    }`}
                  >
                    <div
                      className="w-full aspect-square"
                      style={mat.textureUrl
                        ? { backgroundImage: `url(${mat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { backgroundColor: mat.color }}
                    />
                    <p className="text-[9px] font-medium text-brand-charcoal/65 truncate px-1 py-0.5 bg-white/90 leading-tight">{mat.name}</p>
                    {mat.priceMultiplier > 1.5 && (
                      <span className="absolute top-0 right-0 text-[7px] bg-brand-accent text-white px-1 py-px rounded-bl font-medium">P</span>
                    )}
                    {isActive && (
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-brand-accent rounded-full flex items-center justify-center shadow-sm">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// STEP 3: Summary
// ──────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-brand-beige/15 last:border-0">
      <span className="text-[12px] text-brand-charcoal/60">{label}</span>
      <span className="text-[12px] font-semibold text-brand-dark tabular-nums">{value}</span>
    </div>
  );
}

function SummaryStep() {
  const config = useDressingUnitStore((s) => s.config);
  const price = useDressingUnitStore((s) => s.price);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);

  const delivery = bodyMat?.type === 'lemn-masiv' ? '10-14 săpt.' :
                   bodyMat?.type === 'furnir' ? '8-12 săpt.' : '6-10 săpt.';

  async function handleOfferSubmit(data: { firstName: string; lastName: string; phone: string; email: string; }) {
    setStatusMessage(null);
    const pdfBase64 = generateDressingUnitPDFBase64(config);
    const res = await fetch('/api/send-offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        configType: 'Corp Dressing',
        pdfBase64,
        pdfFilename: getDressingUnitPDFFileName(config),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || 'Nu am putut trimite oferta. Incearca din nou.');
    }
    setStatusMessage('Cererea a fost trimisă cu succes!');
  }

  return (
    <div className="space-y-2 animate-step-in">
      <div className="rounded-xl bg-gradient-to-br from-brand-accent/10 via-brand-accent/5 to-transparent px-4 py-3.5 text-center border border-brand-accent/10">
        <p className="text-[10px] text-brand-charcoal/50 uppercase tracking-wider mb-1">Preț estimat (TVA inclus)</p>
        <p className="text-[28px] font-bold text-brand-accent leading-none tabular-nums">{formatPrice(Math.round(price.total * 1.19))}</p>
        <p className="text-[11px] text-brand-charcoal/40 mt-1 tabular-nums">{formatPrice(price.total)} fără TVA</p>
      </div>

      <div className="rounded-lg bg-[#F5F3EE] px-3 py-2.5 flex items-center gap-3 text-[12px]">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-md shrink-0 ring-1 ring-brand-beige/30"
              style={bodyMat?.textureUrl
                ? { backgroundImage: `url(${bodyMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { backgroundColor: bodyMat?.color }}
              title={bodyMat?.name}
            />
            <span className="w-4 h-4 rounded-md shrink-0 ring-1 ring-brand-beige/30"
              style={frontMat?.textureUrl
                ? { backgroundImage: `url(${frontMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { backgroundColor: frontMat?.color }}
              title={frontMat?.name}
            />
          </div>
          <span className="text-brand-charcoal/50 text-[11px]">{bodyMat?.name} / {frontMat?.name}</span>
        </div>
        <span className="text-brand-charcoal/20 ml-auto">•</span>
        <span className="text-brand-charcoal/55 flex items-center gap-1">
          <Truck className="w-3.5 h-3.5" />{delivery}
        </span>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 text-[12px] text-brand-accent/70 hover:text-brand-accent transition-colors font-medium px-0.5"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
        {showDetails ? 'Ascunde detalii' : 'Vezi detalii configurare'}
      </button>

      {showDetails && (
        <div className="space-y-2 animate-fade-in">
          <div className="rounded-lg bg-[#F5F3EE] px-3 py-1">
            <SummaryRow label="Dimensiuni" value={`${Math.round(config.totalWidth * 10)} × ${config.totalHeight * 10} × ${config.depth * 10} mm`} />
            <SummaryRow label="Module" value={`${config.moduleCount} buc`} />
            <SummaryRow label="Plintă" value={`${config.plinthHeight * 10} mm`} />
            <SummaryRow label="Uși"
              value={`${config.modules.filter((m) => m.hasDoors).length} / ${config.moduleCount} module`}
            />
          </div>

          <div className="rounded-lg bg-white border border-brand-beige/20 px-3 py-1">
            {config.modules.map((m, i) => {
              const opt = DRESSING_INTERIOR_OPTIONS.find((o) => o.id === m.interiorType);
              const doorLabel = m.interiorType === 'rafturi-deschise'
                ? 'fără uși'
                : m.hasDoors ? 'cu uși' : 'deschis';
              const topLabel = m.hasTopCompartment ? ` · compartiment sus ${m.topCompartmentHeight * 10} mm` : '';
              return (
                <SummaryRow
                  key={i}
                  label={`Modul ${i + 1} (${m.width * 10} mm)`}
                  value={`${opt?.name || m.interiorType} · ${doorLabel}${topLabel}`}
                />
              );
            })}
          </div>

          <div className="rounded-lg border border-brand-beige/20 px-3 py-1">
            <SummaryRow label="Corp" value={formatPrice(price.bodyCost)} />
            <SummaryRow label="Interior" value={formatPrice(price.interiorCost)} />
            <SummaryRow label="Fronturi" value={formatPrice(price.frontsCost)} />
            <SummaryRow label="Plintă" value={formatPrice(price.plinthCost)} />
            <SummaryRow label="Feronerie" value={formatPrice(price.hardwareCost)} />
            {price.discount > 0 && (
              <div className="flex justify-between items-center py-1.5 text-[12px] text-brand-sage">
                <span>Discount</span>
                <span>-{formatPrice(price.discount)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => setIsOfferModalOpen(true)}
          className="flex-1 py-3 rounded-xl bg-brand-dark hover:bg-brand-charcoal text-white font-semibold text-[14px] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <ShoppingCart className="w-4 h-4" />
          Solicită Ofertă
        </button>
        <button
          onClick={() => exportDressingUnitPDF(config)}
          className="py-3 px-4 rounded-xl border border-brand-beige/40 bg-white text-brand-charcoal/60 hover:text-brand-accent hover:border-brand-accent/40 hover:shadow-md transition-all duration-200 flex items-center justify-center active:scale-[0.98]"
          title="Exportă PDF"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
      {statusMessage && (
        <p className="text-[11px] text-brand-sage text-center animate-fade-in">{statusMessage}</p>
      )}

      <OfferRequestModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmit={handleOfferSubmit}
        title="Solicita oferta"
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN PANEL
// ──────────────────────────────────────────────
export default function DressingUnitPanel() {
  const currentStep = useDressingUnitStore((s) => s.currentStep);
  const steps = useDressingUnitStore((s) => s.steps);
  const nextStep = useDressingUnitStore((s) => s.nextStep);
  const prevStep = useDressingUnitStore((s) => s.prevStep);
  const goToStep = useDressingUnitStore((s) => s.goToStep);
  const price = useDressingUnitStore((s) => s.price);
  const resetConfig = useDressingUnitStore((s) => s.resetConfig);
  const config = useDressingUnitStore((s) => s.config);

  const idx = steps.indexOf(currentStep);
  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;

  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);

  function renderStep() {
    switch (currentStep) {
      case 'parameters': return <ParametersStep />;
      case 'materials':  return <MaterialsStep />;
      case 'summary':    return <SummaryStep />;
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 pt-4 lg:pt-[30px] mb-2">
        <div className="flex items-center">
          {steps.map((step, i) => {
            const meta = stepMeta[step];
            const isActive = i === idx;
            const isDone = i < idx;
            return (
              <React.Fragment key={step}>
                {i > 0 && (
                  <div className={`flex-1 h-px transition-colors duration-300 ${
                    i <= idx ? 'bg-brand-accent/25' : 'bg-brand-beige/25'
                  }`} />
                )}
                <button
                  onClick={() => goToStep(step)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium transition-all duration-150 ${
                    isActive ? 'text-brand-accent'
                    : isDone ? 'text-brand-charcoal/60 hover:text-brand-charcoal/80'
                    : 'text-brand-charcoal/35 hover:text-brand-charcoal/50'
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-200 ${
                    isActive ? 'bg-brand-dark text-white shadow-sm'
                    : isDone ? 'bg-brand-dark text-white'
                    : 'bg-brand-beige/25 text-brand-charcoal/35'
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  <span className="text-[11px] sm:inline">{meta.label}</span>
                  {step === 'materials' && isDone && (
                    <span className="flex items-center gap-0.5 ml-0.5">
                      <span className="w-2.5 h-2.5 rounded-full ring-1 ring-brand-beige/30"
                        style={bodyMat?.textureUrl
                          ? { backgroundImage: `url(${bodyMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : { backgroundColor: bodyMat?.color }}
                      />
                      <span className="w-2.5 h-2.5 rounded-full ring-1 ring-brand-beige/30"
                        style={frontMat?.textureUrl
                          ? { backgroundImage: `url(${frontMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : { backgroundColor: frontMat?.color }}
                      />
                    </span>
                  )}
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-16 lg:pb-0">
        {renderStep()}
      </div>

      {!isLast && (
        <div className="shrink-0 pt-2.5 mt-1 border-t border-brand-beige/15 lg:relative fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none px-4 pb-[env(safe-area-inset-bottom)] lg:px-0 lg:pb-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:shadow-none">
          <div className="flex items-center gap-2 pb-1.5">
            {!isFirst && (
              <button
                onClick={prevStep}
                className="py-2.5 px-4 rounded-xl border border-brand-beige/30 bg-white text-brand-charcoal/60 text-[13px] font-medium hover:bg-[#F5F3EE] hover:border-brand-beige/50 hover:shadow-sm transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Înapoi
              </button>
            )}
            <div className="flex-1 text-right">
              <span className="text-[10px] text-brand-charcoal/40 block leading-none">estimat</span>
              <span className="text-[16px] font-bold text-brand-accent tabular-nums leading-tight">{formatPrice(price.total)}</span>
            </div>
            <button
              onClick={nextStep}
              className="py-2.5 px-6 rounded-xl bg-brand-dark hover:bg-brand-charcoal text-white text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Continuă
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
