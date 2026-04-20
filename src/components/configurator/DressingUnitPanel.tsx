'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, RotateCcw, ShoppingCart, Download,
  Ruler, Blocks, Sparkles, Truck, ChevronDown, ChevronLeft, ChevronRight, Lock,
  DoorOpen, DoorClosed, Plus, Minus, Eye, EyeOff,
  PanelLeft, PanelRight, PanelsTopLeft,
} from 'lucide-react';
import {
  useDressingUnitStore,
  DRESSING_UNIT_LIMITS,
  DRESSING_SIDE_POSITION_OPTIONS,
  DRESSING_SIDE_LAYOUT_OPTIONS,
  DRESSING_PRESETS,
  DRESSING_MODULE_PRESETS,
  DressingUnitStep,
  moduleInteriorHeight,
} from '@/store/dressingUnitStore';
import { materialTypes, getBodyMaterials, getFrontMaterials, getMaterialById } from '@/data/materials';
import { useTextures } from '@/hooks/useTextures';
import OfferRequestModal from '@/components/configurator/OfferRequestModal';
import {
  exportDressingUnitPDF,
  generateDressingUnitPDFBase64,
  getDressingUnitPDFFileName,
} from '@/utils/exportDressingUnitPDF';

const stepMeta: Record<DressingUnitStep, { label: string; title: string; subtitle: string }> = {
  size:     { label: 'Dimensiuni', title: 'Alege dimensiunile exterioare',  subtitle: 'Lățime, înălțime, adâncime — rămân fixe la pașii următori.' },
  layout:   { label: 'Structură',  title: 'Alege o preconfigurație',        subtitle: 'Pornește de la un aspect gata-făcut și ajustează modulele.' },
  interior: { label: 'Funcții',    title: 'Funcțiile fiecărui modul',       subtitle: 'Alege un tip rapid și personalizează-l cum îți dorești.' },
  colors:   { label: 'Culori',     title: 'Materiale și culori',            subtitle: 'Finisează-l exact cum îți dorești.' },
  summary:  { label: 'Rezumat',    title: 'Rezumat și ofertă',              subtitle: 'Verifică și cere oferta finală.' },
};

function formatPrice(p: number): string {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(p);
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="pb-2.5 border-b border-brand-beige/20 mb-3">
      <h2 className="text-[17px] font-bold text-brand-dark leading-tight">{title}</h2>
      <p className="text-[11.5px] text-brand-charcoal/55 mt-0.5 leading-snug">{subtitle}</p>
    </div>
  );
}

function BigSlider({
  label, value, min, max, step, unit, onChange, scale = 1, tickStep,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; scale?: number; tickStep?: number;
}) {
  const dv = Math.round(value * scale);
  const dmin = Math.round(min * scale);
  const dmax = Math.round(max * scale);
  const dstep = Math.max(1, Math.round(step * scale));
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(dv.toString());
  useEffect(() => { setInputVal(dv.toString()); }, [dv]);
  const tsStep = tickStep ?? Math.max(1, Math.round((dmax - dmin) / 8));
  const ticks: number[] = [];
  for (let v = Math.ceil(dmin / tsStep) * tsStep; v <= dmax; v += tsStep) ticks.push(v);
  return (
    <div className="group">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold">{label}</span>
        {editing ? (
          <input type="number" autoFocus value={inputVal} min={dmin} max={dmax} step={dstep}
            onChange={(e) => { setInputVal(e.target.value); const p = parseInt(e.target.value, 10); if (!isNaN(p)) onChange(Math.max(min, Math.min(max, p / scale))); }}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="w-24 text-right bg-white text-[18px] font-bold text-brand-dark tabular-nums outline-none rounded px-1 ring-2 ring-brand-accent/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
        ) : (
          <button onClick={() => setEditing(true)} className="hover:text-brand-accent transition-colors" title="Click pentru a edita">
            <span className="text-[22px] font-bold text-brand-dark tabular-nums leading-none">{dv}</span>
            <span className="text-[11px] text-brand-charcoal/45 ml-1">{unit}</span>
          </button>
        )}
      </div>
      <div className="relative h-7">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-brand-beige/40" />
        {ticks.map((t) => {
          const p = ((t - dmin) / (dmax - dmin)) * 100;
          return <div key={t} className="absolute top-1/2 -translate-y-1/2 w-px h-[8px] bg-brand-charcoal/20" style={{ left: `${p}%` }} />;
        })}
        <div className="absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-gradient-to-r from-brand-accent/70 to-brand-accent" style={{ width: `${pct}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-brand-accent shadow-md pointer-events-none group-hover:scale-110 transition-transform" style={{ left: `${pct}%` }} />
        <input type="range" min={dmin} max={dmax} step={dstep} value={dv}
          onChange={(e) => onChange(parseInt(e.target.value, 10) / scale)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
      <div className="flex justify-between text-[10px] text-brand-charcoal/35 tabular-nums mt-0.5">
        <span>{dmin}{unit}</span><span>{dmax}{unit}</span>
      </div>
    </div>
  );
}

function StepperButton({ value, min, max, onChange, label, unit = '' }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string; unit?: string; }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white border border-brand-beige/40 px-3 py-2.5">
      <span className="text-[12px] font-semibold text-brand-charcoal/75">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="w-8 h-8 rounded-lg bg-brand-cream/50 hover:bg-brand-accent/10 hover:text-brand-accent text-brand-charcoal/70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"><Minus className="w-4 h-4" /></button>
        <span className="w-10 text-center text-[16px] font-bold tabular-nums text-brand-dark">{value}<span className="text-[10px] text-brand-charcoal/40 font-normal ml-0.5">{unit}</span></span>
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="w-8 h-8 rounded-lg bg-brand-cream/50 hover:bg-brand-accent/10 hover:text-brand-accent text-brand-charcoal/70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

function OptionCard({ active, onClick, title, subtitle, icon }: { active: boolean; onClick: () => void; title: string; subtitle?: string; icon?: React.ReactNode; }) {
  return (
    <button onClick={onClick}
      className={`relative text-left rounded-xl border-2 p-3 transition-all ${active ? 'border-brand-accent bg-brand-accent/5 shadow-sm' : 'border-brand-beige/30 bg-white hover:border-brand-beige/60 hover:bg-brand-cream/30'}`}>
      <div className="flex items-start gap-2.5">
        {icon && (
          <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-brand-accent text-white' : 'bg-brand-cream/50 text-brand-charcoal/60'}`}>{icon}</div>
        )}
        <div className="min-w-0 flex-1">
          <div className={`text-[13px] font-bold leading-tight ${active ? 'text-brand-accent' : 'text-brand-dark'}`}>{title}</div>
          {subtitle && <div className="text-[10.5px] text-brand-charcoal/50 mt-0.5 leading-snug">{subtitle}</div>}
        </div>
        {active && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
        )}
      </div>
    </button>
  );
}

function ToggleRow({ label, description, active, onToggle }: { label: string; description?: string; active: boolean; onToggle: () => void; }) {
  return (
    <button onClick={onToggle}
      className={`w-full flex items-center justify-between gap-3 rounded-xl border-2 px-3 py-2.5 transition-all ${active ? 'border-brand-accent/40 bg-brand-accent/5' : 'border-brand-beige/30 bg-white hover:border-brand-beige/60'}`}>
      <div className="text-left min-w-0 flex-1">
        <div className="text-[12.5px] font-semibold text-brand-dark">{label}</div>
        {description && <div className="text-[10.5px] text-brand-charcoal/55 mt-0.5 leading-tight">{description}</div>}
      </div>
      <div className={`shrink-0 relative w-10 h-6 rounded-full transition-colors ${active ? 'bg-brand-accent' : 'bg-brand-beige/50'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${active ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
    </button>
  );
}

function LockedDimsBanner() {
  const c = useDressingUnitStore((s) => s.config);
  const goToStep = useDressingUnitStore((s) => s.goToStep);
  return (
    <button onClick={() => goToStep('size')}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-cream/60 border border-brand-beige/30 hover:bg-brand-cream/90 hover:border-brand-beige/60 transition-all text-left">
      <Lock className="w-3 h-3 text-brand-charcoal/50 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] uppercase tracking-widest text-brand-charcoal/45 font-semibold leading-none">Dimensiuni fixate</div>
        <div className="text-[11px] text-brand-dark font-semibold tabular-nums mt-0.5">
          {Math.round(c.totalWidth * 10)} × {c.totalHeight * 10} × {c.depth * 10} mm
        </div>
      </div>
      <span className="text-[10px] text-brand-accent/80 shrink-0 font-medium">Editează</span>
    </button>
  );
}

/** Mini-thumbnail SVG pentru preset modul, inspirat de Tylko (reprezentare schematică a secțiunilor). */
function ModulePresetThumb({ schematic, active, size = 'sm' }: { schematic: { type: string; flex: number; shelves?: number; drawers?: number }[]; active: boolean; size?: 'sm' | 'lg'; }) {
  const total = schematic.reduce((a, s) => a + s.flex, 0) || 1;
  const H = size === 'lg' ? 110 : 60;
  const W = size === 'lg' ? 72 : 44;
  let y = 0;
  const stroke = active ? '#b07e3e' : '#a5998b';
  const fill = active ? '#fbf5ec' : '#ffffff';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={size === 'lg' ? 'w-full h-[110px]' : 'w-full h-14'} preserveAspectRatio="none">
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill={fill} stroke={stroke} strokeWidth="1" rx="2" />
      {schematic.map((s, i) => {
        const h = (s.flex / total) * H;
        const rectY = y;
        y += h;
        const elems: React.ReactNode[] = [];
        if (i > 0) elems.push(<line key={`sep-${i}`} x1="1" y1={rectY} x2={W - 1} y2={rectY} stroke={stroke} strokeWidth="0.8" />);
        if (s.type === 'hanging-rod') {
          const midY = rectY + h * 0.28;
          elems.push(<line key={`rod-${i}`} x1="4" y1={midY} x2={W - 4} y2={midY} stroke={stroke} strokeWidth="1.2" />);
          // hangers
          for (let k = 0; k < 3; k++) {
            const x = 10 + k * 12;
            elems.push(<line key={`hg-${i}-${k}`} x1={x} y1={midY} x2={x} y2={midY + h * 0.45} stroke={stroke} strokeWidth="0.6" opacity="0.7" />);
          }
        } else if (s.type === 'shelves') {
          const shelves = s.shelves ?? 3;
          for (let k = 1; k <= shelves; k++) {
            const sy = rectY + (h * k) / (shelves + 1);
            elems.push(<line key={`sh-${i}-${k}`} x1="2" y1={sy} x2={W - 2} y2={sy} stroke={stroke} strokeWidth="0.7" opacity="0.75" />);
          }
        } else if (s.type === 'drawers') {
          const n = s.drawers ?? 2;
          for (let k = 1; k < n; k++) {
            const dy = rectY + (h * k) / n;
            elems.push(<line key={`dr-${i}-${k}`} x1="1" y1={dy} x2={W - 1} y2={dy} stroke={stroke} strokeWidth="0.7" />);
          }
          // mânere
          for (let k = 0; k < n; k++) {
            const dyCenter = rectY + h * ((k + 0.5) / n);
            elems.push(<line key={`hd-${i}-${k}`} x1={W / 2 - 4} y1={dyCenter} x2={W / 2 + 4} y2={dyCenter} stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />);
          }
        } else if (s.type === 'shoe-rack') {
          // rafturi inclinate
          const n = 3;
          for (let k = 0; k < n; k++) {
            const yTop = rectY + (h * (k + 0.2)) / n;
            const yBot = rectY + (h * (k + 0.8)) / n;
            elems.push(<line key={`shoe-${i}-${k}`} x1="3" y1={yTop} x2={W - 3} y2={yBot} stroke={stroke} strokeWidth="0.9" />);
          }
        } else if (s.type === 'pull-out-trouser') {
          // rama + 3 bare
          elems.push(<rect key={`tr-fr-${i}`} x="3" y={rectY + 2} width={W - 6} height={h - 4} fill="none" stroke={stroke} strokeWidth="0.5" strokeDasharray="1 1" opacity="0.6" />);
          const n = 3;
          for (let k = 0; k < n; k++) {
            const ry = rectY + 2 + ((h - 4) * (k + 0.5)) / n;
            elems.push(<line key={`tr-${i}-${k}`} x1="5" y1={ry} x2={W - 5} y2={ry} stroke={stroke} strokeWidth="0.8" strokeLinecap="round" />);
          }
        } else if (s.type === 'pull-out-basket') {
          // cosuri — 2 dreptunghiuri cu linie mediana
          const n = 2;
          for (let k = 0; k < n; k++) {
            const by0 = rectY + (h * k) / n + 1;
            const by1 = rectY + (h * (k + 1)) / n - 1;
            elems.push(<rect key={`bk-${i}-${k}`} x="2" y={by0} width={W - 4} height={by1 - by0} fill="none" stroke={stroke} strokeWidth="0.6" rx="0.5" />);
            elems.push(<line key={`bk-${i}-${k}-m`} x1="3" y1={(by0 + by1) / 2} x2={W - 3} y2={(by0 + by1) / 2} stroke={stroke} strokeWidth="0.4" opacity="0.6" />);
          }
        } else if (s.type === 'mirror') {
          // oglinda — dreptunghi cu stralucire
          elems.push(<rect key={`m-${i}`} x="3" y={rectY + 2} width={W - 6} height={h - 4} fill={active ? '#e4ecf4' : '#eef2f6'} stroke={stroke} strokeWidth="0.5" rx="0.5" opacity="0.75" />);
          elems.push(<line key={`m-s-${i}`} x1={W * 0.3} y1={rectY + 4} x2={W * 0.7} y2={rectY + h - 4} stroke="#ffffff" strokeWidth="0.8" opacity="0.9" strokeLinecap="round" />);
        }
        return <g key={`g-${i}`}>{elems}</g>;
      })}
    </svg>
  );
}

function SizeStep() {
  const c = useDressingUnitStore((s) => s.config);
  const setTotalModulesWidth = useDressingUnitStore((s) => s.setTotalModulesWidth);
  const setTotalHeight = useDressingUnitStore((s) => s.setTotalHeight);
  const setDepth = useDressingUnitStore((s) => s.setDepth);
  const setPlinthHeight = useDressingUnitStore((s) => s.setPlinthHeight);
  const totalModulesW = c.modules.reduce((a, m) => a + m.width, 0);
  const sizePresets = [
    { label: 'Compact',  w: 200, h: 230 },
    { label: 'Standard', w: 250, h: 240 },
    { label: 'Mare',     w: 300, h: 260 },
  ];
  return (
    <div className="animate-step-in space-y-4 pt-1">
      <StepHeading title={stepMeta.size.title} subtitle={stepMeta.size.subtitle} />

      {/* Live preview dimensiuni — sus, mereu vizibil */}
      <div className="rounded-xl bg-gradient-to-br from-brand-accent/10 via-brand-accent/5 to-transparent border border-brand-accent/20 px-4 py-3">
        <div className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 font-semibold mb-1.5 flex items-center gap-1.5"><Lock className="w-3 h-3" />Dimensiuni totale — se vor fixa la pașii următori</div>
        <div className="flex items-baseline gap-2 tabular-nums flex-wrap">
          <div><span className="text-[9px] text-brand-charcoal/40 uppercase">L </span><span className="text-[19px] font-bold text-brand-dark">{Math.round(c.totalWidth * 10)}</span></div>
          <span className="text-brand-charcoal/20">×</span>
          <div><span className="text-[9px] text-brand-charcoal/40 uppercase">H </span><span className="text-[19px] font-bold text-brand-dark">{c.totalHeight * 10}</span></div>
          <span className="text-brand-charcoal/20">×</span>
          <div><span className="text-[9px] text-brand-charcoal/40 uppercase">A </span><span className="text-[19px] font-bold text-brand-dark">{c.depth * 10}</span></div>
          <span className="text-[11px] text-brand-charcoal/40 ml-auto">mm</span>
        </div>
      </div>

      {/* Quick presets dimensiuni */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.1em] text-brand-charcoal/50 font-semibold mb-1.5">Dimensiuni rapide</div>
        <div className="grid grid-cols-3 gap-1.5">
          {sizePresets.map((p) => {
            const isActive = Math.abs(totalModulesW - p.w) < 1 && Math.abs(c.totalHeight - p.h) < 1;
            return (
              <button key={p.label} onClick={() => { setTotalModulesWidth(p.w); setTotalHeight(p.h); }}
                className={`rounded-lg border-2 px-2 py-2 text-center transition-all ${isActive ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-beige/30 bg-white hover:border-brand-beige/60'}`}>
                <div className={`text-[11.5px] font-bold ${isActive ? 'text-brand-accent' : 'text-brand-dark'}`}>{p.label}</div>
                <div className="text-[9.5px] text-brand-charcoal/50 tabular-nums">{p.w * 10} × {p.h * 10} mm</div>
              </button>
            );
          })}
        </div>
      </div>

      <BigSlider label="Lățime module (fără bibliotecă)" value={totalModulesW} min={c.modules.length * DRESSING_UNIT_LIMITS.moduleWidth.min} max={c.modules.length * DRESSING_UNIT_LIMITS.moduleWidth.max} step={DRESSING_UNIT_LIMITS.totalModulesWidth.step} unit="mm" scale={10} onChange={setTotalModulesWidth} tickStep={500} />
      <BigSlider label="Înălțime" value={c.totalHeight} min={DRESSING_UNIT_LIMITS.totalHeight.min} max={DRESSING_UNIT_LIMITS.totalHeight.max} step={DRESSING_UNIT_LIMITS.totalHeight.step} unit="mm" scale={10} onChange={setTotalHeight} tickStep={200} />
      <BigSlider label="Adâncime" value={c.depth} min={DRESSING_UNIT_LIMITS.depth.min} max={DRESSING_UNIT_LIMITS.depth.max} step={DRESSING_UNIT_LIMITS.depth.step} unit="mm" scale={10} onChange={setDepth} tickStep={50} />
      <BigSlider label="Plintă" value={c.plinthHeight} min={DRESSING_UNIT_LIMITS.plinthHeight.min} max={DRESSING_UNIT_LIMITS.plinthHeight.max} step={DRESSING_UNIT_LIMITS.plinthHeight.step} unit="mm" scale={10} onChange={setPlinthHeight} tickStep={50} />
    </div>
  );
}

function LayoutStep() {
  const c = useDressingUnitStore((s) => s.config);
  const setModuleCount = useDressingUnitStore((s) => s.setModuleCount);
  const setModuleWidth = useDressingUnitStore((s) => s.setModuleWidth);
  const applyPreset = useDressingUnitStore((s) => s.applyPreset);
  const setSideShelvesPosition = useDressingUnitStore((s) => s.setSideShelvesPosition);
  const setSideShelvesColumns = useDressingUnitStore((s) => s.setSideShelvesColumns);
  const setSideShelvesColumnWidth = useDressingUnitStore((s) => s.setSideShelvesColumnWidth);
  const setSideShelvesShelfCount = useDressingUnitStore((s) => s.setSideShelvesShelfCount);
  const setSideShelvesLayout = useDressingUnitStore((s) => s.setSideShelvesLayout);
  const [showSide, setShowSide] = useState(c.sideShelves.position !== 'none');
  // Auto-sync: dacă biblioteca laterală e activată extern (din alt pas), deschide accordion-ul.
  useEffect(() => { if (c.sideShelves.position !== 'none') setShowSide(true); }, [c.sideShelves.position]);
  return (
    <div className="animate-step-in space-y-4 pt-1">
      <StepHeading title={stepMeta.layout.title} subtitle={stepMeta.layout.subtitle} />
      <LockedDimsBanner />
      <section>
        <div className="flex items-center gap-1.5 mb-2"><Sparkles className="w-3 h-3 text-brand-accent" /><h3 className="text-[11px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold">Puncte de plecare</h3></div>
        <div className="grid grid-cols-2 gap-2">
          {DRESSING_PRESETS.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p.id)} title={p.description}
              className="group text-left p-2.5 rounded-xl border-2 border-brand-beige/30 bg-white hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all">
              <div className="flex items-center gap-1 mb-1">
                <div className="flex gap-0.5">{Array.from({ length: p.modules.length }).map((_, i) => (<div key={i} className="w-1 h-5 rounded-sm bg-brand-accent/40 group-hover:bg-brand-accent/70 transition-colors" />))}</div>
                <span className="ml-auto text-[9px] tabular-nums text-brand-charcoal/40">{p.modules.length} module</span>
              </div>
              <div className="text-[12px] font-bold text-brand-dark group-hover:text-brand-accent leading-tight">{p.name}</div>
              <div className="text-[10px] text-brand-charcoal/50 mt-0.5 leading-snug line-clamp-2">{p.description}</div>
            </button>
          ))}
        </div>
      </section>
      <section>
        <div className="flex items-center gap-1.5 mb-2"><Blocks className="w-3 h-3 text-brand-charcoal/40" /><h3 className="text-[11px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold">Număr module</h3></div>
        <StepperButton label="Module în dressing" value={c.moduleCount} min={DRESSING_UNIT_LIMITS.moduleCount.min} max={DRESSING_UNIT_LIMITS.moduleCount.max} onChange={setModuleCount} unit="buc" />
      </section>
      <section>
        <div className="flex items-center gap-1.5 mb-2"><Ruler className="w-3 h-3 text-brand-charcoal/40" /><h3 className="text-[11px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold">Lățime per modul</h3></div>
        <div className="space-y-1.5">
          {c.modules.map((m, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white border border-brand-beige/30 px-2.5 py-2">
              <div className="shrink-0 w-6 h-6 rounded-lg bg-brand-charcoal/10 text-brand-charcoal/70 flex items-center justify-center text-[10.5px] font-bold">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <BigSlider label="Lățime" value={m.width} min={DRESSING_UNIT_LIMITS.moduleWidth.min} max={DRESSING_UNIT_LIMITS.moduleWidth.max} step={DRESSING_UNIT_LIMITS.moduleWidth.step} unit="mm" scale={10} onChange={(v) => setModuleWidth(i, v)} tickStep={200} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <button onClick={() => setShowSide((v) => !v)} className="w-full flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold mb-2 hover:text-brand-charcoal/80 transition-colors">
          <span className="flex items-center gap-1.5"><PanelsTopLeft className="w-3 h-3" />Bibliotecă laterală{c.sideShelves.position !== 'none' && (<span className="text-[9px] bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded-full font-bold lowercase tracking-normal">activă</span>)}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showSide ? '' : '-rotate-90'}`} />
        </button>
        {showSide && (
          <div className="space-y-2 animate-fade-in">
            <div className="grid grid-cols-2 gap-1.5">
              {DRESSING_SIDE_POSITION_OPTIONS.map((opt) => {
                const icon = opt.id === 'left' ? <PanelLeft className="w-3.5 h-3.5" /> : opt.id === 'right' ? <PanelRight className="w-3.5 h-3.5" /> : opt.id === 'both' ? <PanelsTopLeft className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />;
                return (<OptionCard key={opt.id} active={c.sideShelves.position === opt.id} onClick={() => setSideShelvesPosition(opt.id)} title={opt.name} icon={icon} />);
              })}
            </div>
            {c.sideShelves.position !== 'none' && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <BigSlider label="Coloane" value={c.sideShelves.columns} min={DRESSING_UNIT_LIMITS.sideColumns.min} max={DRESSING_UNIT_LIMITS.sideColumns.max} step={DRESSING_UNIT_LIMITS.sideColumns.step} unit="buc" onChange={setSideShelvesColumns} />
                <BigSlider label="Lățime bibliotecă" value={c.sideShelves.columnWidth} min={DRESSING_UNIT_LIMITS.sideColumnWidth.min} max={DRESSING_UNIT_LIMITS.sideColumnWidth.max} step={DRESSING_UNIT_LIMITS.sideColumnWidth.step} unit="mm" scale={10} onChange={setSideShelvesColumnWidth} />
                <BigSlider label="Rafturi per coloană" value={c.sideShelves.shelfCount} min={DRESSING_UNIT_LIMITS.sideShelfCount.min} max={DRESSING_UNIT_LIMITS.sideShelfCount.max} step={DRESSING_UNIT_LIMITS.sideShelfCount.step} unit="buc" onChange={setSideShelvesShelfCount} />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold mb-1.5">Aranjament polițe</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DRESSING_SIDE_LAYOUT_OPTIONS.map((opt) => (<OptionCard key={opt.id} active={c.sideShelves.layout === opt.id} onClick={() => setSideShelvesLayout(opt.id)} title={opt.name} subtitle={opt.description} />))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Carousel preset-uri modul — 4 preset-uri vizibile per slide
// ═══════════════════════════════════════════════════════════════════════════
const PRESETS_PER_SLIDE = 4;
function PresetCarousel({ activeIdx, activePresetId, apply }: {
  activeIdx: number;
  activePresetId: string | undefined;
  apply: (moduleIdx: number, presetId: string) => void;
}) {
  const presets = DRESSING_MODULE_PRESETS;
  const totalSlides = Math.ceil(presets.length / PRESETS_PER_SLIDE);
  const activeRealIdx = presets.findIndex((p) => p.id === activePresetId);
  const activeSlide = activeRealIdx >= 0 ? Math.floor(activeRealIdx / PRESETS_PER_SLIDE) : 0;
  const [slide, setSlide] = useState<number>(activeSlide);

  // Sync slide cu preset-ul aplicat când user schimbă modulul.
  useEffect(() => { setSlide(activeSlide); }, [activeSlide]);

  const goPrev = () => setSlide((v) => (v - 1 + totalSlides) % totalSlides);
  const goNext = () => setSlide((v) => (v + 1) % totalSlides);
  const start = slide * PRESETS_PER_SLIDE;
  const visible = presets.slice(start, start + PRESETS_PER_SLIDE);
  // Padding dacă ultimul slide are mai puțin de 4 — pentru aliniere grid
  const padded = [...visible, ...Array(PRESETS_PER_SLIDE - visible.length).fill(null)];

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles className="w-3 h-3 text-brand-accent" />
        <span className="text-[10.5px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold">Funcție modul</span>
        <span className="ml-auto text-[9.5px] text-brand-charcoal/45 tabular-nums font-semibold">
          {slide + 1} / {totalSlides}
        </span>
      </div>

      {/* Slide cu săgeți ─ 4 preset-uri per slide */}
      <div className="flex items-stretch gap-1.5">
        <button onClick={goPrev} className="shrink-0 w-7 rounded-lg border-2 border-brand-beige/40 bg-white hover:border-brand-accent/60 hover:bg-brand-accent/5 text-brand-charcoal/60 hover:text-brand-accent flex items-center justify-center transition-all active:scale-95"
          title="Slide anterior">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0 grid grid-cols-4 gap-1.5">
          {padded.map((p, i) =>
            p ? (
              <button key={p.id} onClick={() => apply(activeIdx, p.id)} title={`${p.name} — ${p.description}`}
                className={`rounded-lg border-2 transition-all p-1.5 ${
                  p.id === activePresetId
                    ? 'border-brand-accent bg-brand-accent/5 shadow-sm'
                    : 'border-brand-beige/40 bg-white hover:border-brand-accent/50 hover:shadow-sm'
                }`}>
                <ModulePresetThumb schematic={p.schematic} active={p.id === activePresetId} size="lg" />
                <div className={`text-[9px] font-semibold leading-tight text-center mt-1 line-clamp-2 min-h-[22px] ${
                  p.id === activePresetId ? 'text-brand-accent' : 'text-brand-charcoal/65'
                }`}>{p.name}</div>
              </button>
            ) : (
              <div key={`empty-${i}`} className="rounded-lg border-2 border-dashed border-brand-beige/20 bg-transparent" />
            )
          )}
        </div>

        <button onClick={goNext} className="shrink-0 w-7 rounded-lg border-2 border-brand-beige/40 bg-white hover:border-brand-accent/60 hover:bg-brand-accent/5 text-brand-charcoal/60 hover:text-brand-accent flex items-center justify-center transition-all active:scale-95"
          title="Slide următor">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Puncte indicator per slide */}
      <div className="flex items-center justify-center gap-1 mt-2">
        {Array.from({ length: totalSlides }).map((_, i) => {
          const slideHasActive = activeRealIdx >= 0 && Math.floor(activeRealIdx / PRESETS_PER_SLIDE) === i;
          return (
            <button key={i} onClick={() => setSlide(i)} title={`Slide ${i + 1}`}
              className={`rounded-full transition-all ${
                i === slide
                  ? 'bg-brand-accent w-5 h-1.5'
                  : slideHasActive
                    ? 'bg-brand-accent/50 w-1.5 h-1.5'
                    : 'bg-brand-charcoal/20 hover:bg-brand-charcoal/40 w-1.5 h-1.5'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function InteriorStep() {
  const c = useDressingUnitStore((s) => s.config);
  const applyModulePreset = useDressingUnitStore((s) => s.applyModulePreset);
  const setModuleTopCompartmentHeight = useDressingUnitStore((s) => s.setModuleTopCompartmentHeight);
  const toggleModuleDoors = useDressingUnitStore((s) => s.toggleModuleDoors);
  const toggleAllDoors = useDressingUnitStore((s) => s.toggleAllDoors);
  const selectedIdx = useDressingUnitStore((s) => s.selectedModuleIdx);
  const setSelected = useDressingUnitStore((s) => s.setSelectedModule);
  const activeIdx = selectedIdx ?? 0;
  const activeModule = c.modules[activeIdx];
  const anyDoors = c.modules.some((m) => m.hasDoors);
  useEffect(() => { if (selectedIdx === null) setSelected(0); }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  if (!activeModule) return null;

  // Detect preset-ul activ pentru modulul curent (match prin signatura de tipuri de secțiuni)
  const activeSig = (activeModule.sections || []).map((s) => s.type).join('|');
  const activePresetId = DRESSING_MODULE_PRESETS.find((p) => p.schematic.map((x) => x.type).join('|') === activeSig)?.id;

  return (
    <div className="animate-step-in space-y-3 pt-1">
      <StepHeading title={stepMeta.interior.title} subtitle={stepMeta.interior.subtitle} />
      <LockedDimsBanner />

      {/* ─── TAB MODULE (numeric, stil Tylko: "1 · 2 · 3 · Modul 4") ─── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10.5px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold">Alege modulul</span>
          <span className="ml-auto text-[9.5px] text-brand-charcoal/40">Click și pe modul în 3D</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
          {c.modules.map((m, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                title={`Modul ${i + 1} · ${Math.round(m.width * 10)}mm`}
                className={`shrink-0 rounded-xl border-2 transition-all tabular-nums flex items-center justify-center ${
                  active
                    ? 'bg-brand-accent border-brand-accent text-white px-4 py-2 text-[13px] font-bold shadow-md ring-2 ring-brand-accent/30 ring-offset-1'
                    : 'bg-white border-brand-charcoal/15 text-brand-charcoal/80 hover:border-brand-accent hover:text-brand-dark hover:shadow-sm w-11 h-11 text-[14px] font-bold'
                }`}
              >
                {active ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-[15px]">{i + 1}</span>
                    <span className="opacity-70 text-[11px] font-semibold">{Math.round(m.width * 10)}mm</span>
                  </span>
                ) : (
                  i + 1
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── CAROUSEL PRESETURI (un preset vizibil + săgeți prev/next) ─── */}
      <PresetCarousel activeIdx={activeIdx} activePresetId={activePresetId} apply={applyModulePreset} />

      {/* ─── AFIȘARE (echivalent "Display" din Tylko) ─── */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10.5px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold">Afișare</span>
          <span className="ml-auto text-[9.5px] text-brand-charcoal/40">Modul {activeIdx + 1}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button onClick={() => { if (activeModule.hasDoors) toggleModuleDoors(activeIdx); }}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition-all ${
              !activeModule.hasDoors ? 'border-brand-accent bg-brand-accent/5 text-brand-dark' : 'border-brand-beige/40 bg-white text-brand-charcoal/65 hover:border-brand-accent/40'
            }`}>
            <DoorOpen className="w-4 h-4" />
            <span className="text-[10.5px] font-semibold leading-tight">Deschis</span>
          </button>
          <button onClick={() => { if (!activeModule.hasDoors) toggleModuleDoors(activeIdx); }}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition-all ${
              activeModule.hasDoors ? 'border-brand-accent bg-brand-accent/5 text-brand-dark' : 'border-brand-beige/40 bg-white text-brand-charcoal/65 hover:border-brand-accent/40'
            }`}>
            <DoorClosed className="w-4 h-4" />
            <span className="text-[10.5px] font-semibold leading-tight">Cu uși</span>
          </button>
          <button onClick={toggleAllDoors}
            title={anyDoors ? 'Ascunde toate ușile pentru a vedea interiorul' : 'Afișează ușile pe toate modulele'}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition-all ${
              anyDoors ? 'border-brand-beige/40 bg-white text-brand-charcoal/65 hover:border-brand-accent/40' : 'border-brand-accent bg-brand-accent/5 text-brand-dark'
            }`}>
            {anyDoors ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-[10.5px] font-semibold leading-tight text-center">{anyDoors ? 'Vezi interior' : 'Vezi uși'}</span>
          </button>
        </div>
      </div>

      {/* ─── COMPARTIMENT SUPERIOR (rămâne — e dimensiune constructivă unică) ─── */}
      <div className="pt-1 border-t border-brand-beige/20">
        <div className="rounded-xl bg-white border border-brand-beige/30 px-3 py-2.5">
          <BigSlider label="Înălțime compartiment superior" value={activeModule.topCompartmentHeight} min={DRESSING_UNIT_LIMITS.topCompartmentHeight.min} max={DRESSING_UNIT_LIMITS.topCompartmentHeight.max} step={DRESSING_UNIT_LIMITS.topCompartmentHeight.step} unit="mm" scale={10} tickStep={100} onChange={(v) => setModuleTopCompartmentHeight(activeIdx, v)} />
        </div>
      </div>
    </div>
  );
}

function ColorsStep() {
  const config = useDressingUnitStore((s) => s.config);
  const setBodyMaterial = useDressingUnitStore((s) => s.setBodyMaterial);
  const setFrontMaterial = useDressingUnitStore((s) => s.setFrontMaterial);
  const setSideMaterial = useDressingUnitStore((s) => s.setSideMaterial);
  const [activeTab, setActiveTab] = useState<'body' | 'front' | 'side'>('body');
  const { loading: texturesLoading } = useTextures();
  // Biblioteca (doar structura) folose\u0219te materialele de tip corp
  const activeMaterials = activeTab === 'front' ? getFrontMaterials() : getBodyMaterials();
  const activeMaterialId =
    activeTab === 'body'  ? config.bodyMaterialId :
    activeTab === 'front' ? config.frontMaterialId :
                            config.sideMaterialId;
  const setMaterial =
    activeTab === 'body'  ? setBodyMaterial :
    activeTab === 'front' ? setFrontMaterial :
                            setSideMaterial;
  const selectedMat = getMaterialById(activeMaterialId);
  const grouped = materialTypes.map((mt) => ({ ...mt, items: activeMaterials.filter((m) => m.type === mt.id) })).filter((g) => g.items.length > 0);
  const tabLabel =
    activeTab === 'body'  ? 'Material corp' :
    activeTab === 'front' ? 'Material front' :
                            'Material bibliotec\u0103 (structur\u0103)';
  return (
    <div className="animate-step-in space-y-3 pt-1 flex flex-col h-full min-h-0">
      <StepHeading title={stepMeta.colors.title} subtitle={stepMeta.colors.subtitle} />
      <div className="flex rounded-xl bg-brand-cream/60 p-1 gap-1 shrink-0">
        <button onClick={() => setActiveTab('body')}  className={`flex-1 py-2.5 text-[12px] font-bold rounded-lg transition-all ${activeTab === 'body'  ? 'bg-white shadow-md text-brand-dark ring-1 ring-brand-beige/30' : 'text-brand-charcoal/45 hover:text-brand-charcoal/70'}`}>Corp</button>
        <button onClick={() => setActiveTab('front')} className={`flex-1 py-2.5 text-[12px] font-bold rounded-lg transition-all ${activeTab === 'front' ? 'bg-white shadow-md text-brand-dark ring-1 ring-brand-beige/30' : 'text-brand-charcoal/45 hover:text-brand-charcoal/70'}`}>Front</button>
        <button onClick={() => setActiveTab('side')}  className={`flex-1 py-2.5 text-[12px] font-bold rounded-lg transition-all ${activeTab === 'side'  ? 'bg-white shadow-md text-brand-dark ring-1 ring-brand-beige/30' : 'text-brand-charcoal/45 hover:text-brand-charcoal/70'}`}>Bibliotec\u0103</button>
      </div>
      {selectedMat && (
        <div className="shrink-0 flex items-center gap-3 px-3 py-2 rounded-xl bg-brand-accent/5 border border-brand-accent/20">
          <div className="w-10 h-10 rounded-lg shrink-0 ring-1 ring-brand-accent/20 shadow-sm" style={selectedMat.textureUrl ? { backgroundImage: `url(${selectedMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: selectedMat.color }} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-brand-dark truncate">{selectedMat.name}</div>
            <div className="text-[10px] text-brand-charcoal/50">{tabLabel}</div>
          </div>
          {selectedMat.priceMultiplier > 1.5 && (<span className="text-[9px] font-bold text-white bg-brand-accent px-2 py-0.5 rounded uppercase tracking-wider">Premium</span>)}
        </div>
      )}
      {texturesLoading && (
        <div className="shrink-0 flex items-center gap-2 text-[11px] text-brand-charcoal/45"><div className="w-3 h-3 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />Se încarcă texturile...</div>
      )}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 -mx-1 px-1">
        {grouped.map((group) => (
          <div key={group.id}>
            <h4 className="text-[11px] text-brand-charcoal/50 uppercase tracking-widest font-semibold mb-1.5 sticky top-0 bg-white py-1 z-10">{group.name}</h4>
            <div className="grid grid-cols-4 gap-2">
              {group.items.map((mat) => {
                const isActive = mat.id === activeMaterialId;
                return (
                  <button key={mat.id} onClick={() => setMaterial(mat.id)} title={mat.name}
                    className={`relative rounded-xl overflow-hidden group transition-all ${isActive ? 'ring-2 ring-brand-accent ring-offset-1 shadow-lg' : 'ring-1 ring-brand-beige/25 hover:ring-brand-beige/60 hover:shadow-md'}`}>
                    <div className="w-full aspect-square" style={mat.textureUrl ? { backgroundImage: `url(${mat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: mat.color }} />
                    <p className="text-[9.5px] font-medium text-brand-charcoal/65 truncate px-1 py-0.5 bg-white/95 leading-tight">{mat.name}</p>
                    {mat.priceMultiplier > 1.5 && (<span className="absolute top-0.5 right-0.5 text-[7px] bg-brand-accent text-white px-1 py-px rounded font-bold">P</span>)}
                    {isActive && (<div className="absolute top-1 left-1 w-4 h-4 bg-brand-accent rounded-full flex items-center justify-center shadow"><Check className="w-2.5 h-2.5 text-white" /></div>)}
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
  const delivery = bodyMat?.type === 'lemn-masiv' ? '10-14 săpt.' : bodyMat?.type === 'furnir' ? '8-12 săpt.' : '6-10 săpt.';
  async function handleOfferSubmit(data: { firstName: string; lastName: string; phone: string; email: string; }) {
    setStatusMessage(null);
    const pdfBase64 = generateDressingUnitPDFBase64(config);
    const res = await fetch('/api/send-offer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, configType: 'Corp Dressing', pdfBase64, pdfFilename: getDressingUnitPDFFileName(config) }) });
    if (!res.ok) { const body = await res.json().catch(() => null); throw new Error(body?.error || 'Nu am putut trimite oferta. Incearca din nou.'); }
    setStatusMessage('Cererea a fost trimisă cu succes!');
  }
  return (
    <div className="animate-step-in space-y-3 pt-1">
      <StepHeading title={stepMeta.summary.title} subtitle={stepMeta.summary.subtitle} />
      <div className="rounded-xl bg-gradient-to-br from-brand-accent/10 via-brand-accent/5 to-transparent px-4 py-4 text-center border border-brand-accent/20">
        <p className="text-[10px] text-brand-charcoal/50 uppercase tracking-widest mb-1">Preț estimat (TVA inclus)</p>
        <p className="text-[30px] font-bold text-brand-accent leading-none tabular-nums">{formatPrice(Math.round(price.total * 1.19))}</p>
        <p className="text-[11px] text-brand-charcoal/45 mt-1 tabular-nums">{formatPrice(price.total)} fără TVA</p>
      </div>
      <div className="rounded-xl bg-brand-cream/50 px-3 py-2.5 flex items-center gap-3 text-[12px]">
        <div className="flex items-center gap-1">
          <span className="w-5 h-5 rounded-md shrink-0 ring-1 ring-brand-beige/30" style={bodyMat?.textureUrl ? { backgroundImage: `url(${bodyMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: bodyMat?.color }} title={bodyMat?.name} />
          <span className="w-5 h-5 rounded-md shrink-0 ring-1 ring-brand-beige/30" style={frontMat?.textureUrl ? { backgroundImage: `url(${frontMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: frontMat?.color }} title={frontMat?.name} />
        </div>
        <span className="text-brand-charcoal/50 text-[11px] truncate flex-1">{bodyMat?.name} / {frontMat?.name}</span>
        <span className="text-brand-charcoal/55 flex items-center gap-1 shrink-0"><Truck className="w-3.5 h-3.5" />{delivery}</span>
      </div>
      <button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-1.5 text-[12px] text-brand-accent/70 hover:text-brand-accent font-medium">
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        {showDetails ? 'Ascunde detalii' : 'Vezi detalii configurare'}
      </button>
      {showDetails && (
        <div className="space-y-2 animate-fade-in">
          <div className="rounded-xl bg-brand-cream/40 px-3 py-1">
            <SummaryRow label="Dimensiuni" value={`${Math.round(config.totalWidth * 10)} × ${config.totalHeight * 10} × ${config.depth * 10} mm`} />
            <SummaryRow label="Module" value={`${config.moduleCount} buc`} />
            <SummaryRow label="Plintă" value={`${config.plinthHeight * 10} mm`} />
            <SummaryRow label="Uși" value={`${config.modules.filter((m) => m.hasDoors).length} / ${config.moduleCount} module`} />
          </div>
          <div className="rounded-xl bg-white border border-brand-beige/20 px-3 py-1">
            {config.modules.map((m, i) => {
              const doorLabel = m.hasDoors ? 'cu uși' : 'deschis';
              const secs = m.sections || [];
              // Agregă secțiunile pe tipuri: {Bară: 1, Rafturi: 2, ...}
              const typeCounts = secs.reduce<Record<string, number>>((acc, s) => {
                const nameMap: Record<string, string> = {
                  'hanging-rod': 'Bară', 'shelves': 'Rafturi', 'drawers': 'Sertare',
                  'shoe-rack': 'Pantofi', 'pull-out-trouser': 'Pantaloni',
                  'pull-out-basket': 'Coșuri', 'mirror': 'Oglindă', 'empty': 'Gol',
                };
                const n = nameMap[s.type] || s.type;
                acc[n] = (acc[n] || 0) + 1;
                return acc;
              }, {});
              const summary = Object.entries(typeCounts)
                .map(([name, n]) => n > 1 ? `${n}× ${name}` : name)
                .join(' + ') || 'Gol';
              return (<SummaryRow key={i} label={`Modul ${i + 1} (${Math.round(m.width * 10)} mm)`} value={`${summary} · ${doorLabel}`} />);
            })}
          </div>
          <div className="rounded-xl border border-brand-beige/20 px-3 py-1">
            <SummaryRow label="Corp" value={formatPrice(price.bodyCost)} />
            <SummaryRow label="Interior" value={formatPrice(price.interiorCost)} />
            <SummaryRow label="Fronturi" value={formatPrice(price.frontsCost)} />
            <SummaryRow label="Plintă" value={formatPrice(price.plinthCost)} />
            <SummaryRow label="Feronerie" value={formatPrice(price.hardwareCost)} />
            {price.discount > 0 && (<div className="flex justify-between items-center py-1.5 text-[12px] text-brand-sage"><span>Discount</span><span>-{formatPrice(price.discount)}</span></div>)}
          </div>
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button onClick={() => setIsOfferModalOpen(true)} className="flex-1 py-3 rounded-xl bg-brand-dark hover:bg-brand-charcoal text-white font-semibold text-[14px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]">
          <ShoppingCart className="w-4 h-4" />Solicită ofertă
        </button>
        <button onClick={() => exportDressingUnitPDF(config)} className="py-3 px-4 rounded-xl border border-brand-beige/40 bg-white text-brand-charcoal/60 hover:text-brand-accent hover:border-brand-accent/40 hover:shadow-md transition-all flex items-center justify-center active:scale-[0.98]" title="Exportă PDF">
          <Download className="w-4 h-4" />
        </button>
      </div>
      {statusMessage && (<p className="text-[11px] text-brand-sage text-center animate-fade-in">{statusMessage}</p>)}
      <OfferRequestModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} onSubmit={handleOfferSubmit} title="Solicită ofertă" />
    </div>
  );
}

export default function DressingUnitPanel() {
  const currentStep = useDressingUnitStore((s) => s.currentStep);
  const steps = useDressingUnitStore((s) => s.steps);
  const nextStep = useDressingUnitStore((s) => s.nextStep);
  const prevStep = useDressingUnitStore((s) => s.prevStep);
  const goToStep = useDressingUnitStore((s) => s.goToStep);
  const price = useDressingUnitStore((s) => s.price);
  const resetConfig = useDressingUnitStore((s) => s.resetConfig);
  const idx = steps.indexOf(currentStep);
  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;
  function renderStep() {
    switch (currentStep) {
      case 'size':     return <SizeStep />;
      case 'layout':   return <LayoutStep />;
      case 'interior': return <InteriorStep />;
      case 'colors':   return <ColorsStep />;
      case 'summary':  return <SummaryStep />;
    }
  }
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 pt-4 lg:pt-5 pb-3 border-b border-brand-beige/15">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {steps.map((step, i) => {
            const meta = stepMeta[step];
            const isActive = i === idx;
            const isDone = i < idx;
            return (
              <React.Fragment key={step}>
                {i > 0 && (<div className={`flex-1 h-[2px] transition-colors duration-300 ${i <= idx ? 'bg-brand-accent' : 'bg-brand-beige/40'}`} />)}
                <button onClick={() => goToStep(step)} title={meta.label}
                  className={`flex flex-col items-center gap-0.5 transition-all shrink-0 ${isActive || isDone ? '' : 'opacity-60 hover:opacity-100'}`}>
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold transition-all ${isActive ? 'bg-brand-accent text-white shadow-md ring-4 ring-brand-accent/15' : isDone ? 'bg-brand-accent text-white' : 'bg-brand-beige/40 text-brand-charcoal/50'}`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className={`text-[9px] sm:text-[9.5px] uppercase tracking-wider font-bold whitespace-nowrap ${isActive ? 'text-brand-accent' : 'text-brand-charcoal/50'} ${isActive ? 'inline' : 'hidden sm:inline'}`}>{meta.label}</span>
                </button>
              </React.Fragment>
            );
          })}
          <button onClick={resetConfig} className="ml-1 shrink-0 text-brand-charcoal/30 hover:text-brand-charcoal/60 hover:bg-brand-cream/60 p-1.5 rounded-lg transition-all" title="Resetează configurație">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-24 lg:pb-6 px-0.5">
        {renderStep()}
      </div>
      {!isLast && (
        <div className="shrink-0 pt-3 pb-3 px-4 lg:px-0 border-t border-brand-beige/15 bg-white/95 backdrop-blur-md lg:backdrop-blur-none fixed bottom-0 left-0 right-0 lg:relative z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:shadow-none">
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button onClick={prevStep} className="py-2.5 px-4 rounded-xl border-2 border-brand-beige/30 bg-white text-brand-charcoal/60 text-[13px] font-semibold hover:bg-brand-cream/40 hover:border-brand-beige/50 transition-all flex items-center gap-1.5 active:scale-[0.98]">
                <ArrowLeft className="w-3.5 h-3.5" />Înapoi
              </button>
            )}
            <div className="flex-1 text-right">
              <span className="text-[9px] text-brand-charcoal/40 block uppercase tracking-widest font-semibold">Preț estimat</span>
              <span className="text-[16px] font-bold text-brand-accent tabular-nums leading-tight">{formatPrice(price.total)}</span>
            </div>
            <button onClick={nextStep} className="py-2.5 px-6 rounded-xl bg-brand-dark hover:bg-brand-charcoal text-white text-[13px] font-bold transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-[0.98]">
              Continuă<ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
