'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Copy, Shirt, Layers, Rows3, Footprints, GalleryVertical, Grid3x3, Square } from 'lucide-react';
import { useDressingUnitStore, SECTION_MIN_HEIGHT, SECTION_DEFAULT_HEIGHT, DRESSING_UNIT_LIMITS } from '@/store/dressingUnitStore';
import { DressingModuleSection, DressingSectionType } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// Catalog de funcții — cele 7 funcții Tylko
// ═══════════════════════════════════════════════════════════════════════════
type FunctionMeta = {
  id: DressingSectionType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const FUNCTIONS: FunctionMeta[] = [
  { id: 'hanging-rod',      label: 'Bară haine',       description: 'Pentru paltoane, rochii, haine atârnate', icon: Shirt },
  { id: 'shelves',          label: 'Rafturi',          description: 'Pulovere, textile pliate, cutii',         icon: Layers },
  { id: 'drawers',          label: 'Sertare',          description: 'Lenjerie, accesorii, obiecte mici',       icon: Rows3 },
  { id: 'shoe-rack',        label: 'Rafturi pantofi',  description: 'Rafturi înclinate pentru încălțăminte',   icon: Footprints },
  { id: 'pull-out-trouser', label: 'Suport pantaloni', description: 'Bare extensibile pentru pantaloni',       icon: GalleryVertical },
  { id: 'pull-out-basket',  label: 'Coșuri sârmă',     description: 'Coșuri extensibile, organizare flexibilă', icon: Grid3x3 },
  { id: 'mirror',           label: 'Oglindă',          description: 'Panou oglindă pe peretele din spate',     icon: Square },
];

const FN_BY_ID: Record<DressingSectionType, FunctionMeta | null> = FUNCTIONS.reduce((acc, f) => {
  acc[f.id] = f;
  return acc;
}, { 'empty': null } as Record<DressingSectionType, FunctionMeta | null>);

const HEIGHT_STEP = 5;

// Defaults per tip atunci cand se schimba functia unei zone (pastrand heightCm)
function typeDefaults(type: DressingSectionType): Partial<DressingModuleSection> {
  switch (type) {
    case 'shelves':          return { shelfCount: 3 };
    case 'drawers':          return { drawerCount: 2 };
    case 'shoe-rack':        return { shoeCount: 3 };
    case 'pull-out-trouser': return { trouserRodCount: 4 };
    case 'pull-out-basket':  return { basketCount: 2 };
    default:                 return {};
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Mini preview SVG (coloana din stanga — doar vizual)
// ═══════════════════════════════════════════════════════════════════════════
function MiniPreview({ sections, availableCm, activeId, onSelect, columnHeightPx = 340 }: {
  sections: DressingModuleSection[];
  availableCm: number;
  activeId: string | null;
  onSelect: (id: string | null) => void;
  columnHeightPx?: number;
}) {
  const total = Math.max(1, sections.reduce((s, x) => s + x.heightCm, 0));
  const heights = sections.map((s) => (s.heightCm / total) * columnHeightPx);

  return (
    <div className="relative rounded-lg border-2 border-brand-charcoal/25 bg-brand-cream/15 overflow-hidden select-none"
         style={{ width: 140, height: columnHeightPx }}
         onClick={() => onSelect(null)}>
      {/* Rendering top→bottom: array e stocat bottom→top */}
      <div className="flex flex-col-reverse h-full">
        {sections.map((sec, i) => {
          const pxH = heights[i];
          const isActive = sec.id === activeId;
          const fn = FN_BY_ID[sec.type];
          const Icon = fn?.icon;
          return (
            <button key={sec.id} type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(sec.id); }}
              className={`relative w-full flex items-center justify-center border-t border-brand-beige/40 first:border-t-0 transition-colors ${
                isActive ? 'bg-brand-accent/15 ring-1 ring-brand-accent z-10' : 'bg-white/60 hover:bg-brand-cream/40'
              }`}
              style={{ height: pxH }}>
              <div className="flex flex-col items-center gap-0.5 opacity-80">
                {Icon && pxH >= 28 && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-accent' : 'text-brand-charcoal/60'}`} />}
                {pxH >= 44 && (
                  <span className={`text-[9px] font-bold tabular-nums leading-none ${isActive ? 'text-brand-accent' : 'text-brand-charcoal/55'}`}>
                    {sec.heightCm}cm
                  </span>
                )}
                {pxH < 28 && (
                  <span className={`text-[8.5px] font-bold tabular-nums ${isActive ? 'text-brand-accent' : 'text-brand-charcoal/55'}`}>
                    {sec.heightCm}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Card secțiune (rândul din lista din dreapta)
// ═══════════════════════════════════════════════════════════════════════════
function SectionCard({
  section, positionLabel, isFirst, isLast, isActive, canDelete,
  onToggle, onChangeType, onUpdate, onMove, onDelete,
}: {
  section: DressingModuleSection;
  positionLabel: string;       // "1 / 3" — arătat în badge
  isFirst: boolean;            // nu poate urca (sus = prima în listă = top vizual)
  isLast: boolean;             // nu poate coborî
  isActive: boolean;
  canDelete: boolean;
  onToggle: () => void;
  onChangeType: (t: DressingSectionType) => void;
  onUpdate: (patch: Partial<DressingModuleSection>) => void;
  onMove: (dir: 'up' | 'down') => void;
  onDelete: () => void;
}) {
  const fn = FN_BY_ID[section.type];
  const Icon = fn?.icon;
  const min = SECTION_MIN_HEIGHT[section.type] ?? 20;

  return (
    <div className={`rounded-lg border transition-all ${
      isActive ? 'border-brand-accent bg-brand-accent/5 shadow-sm' : 'border-brand-beige/50 bg-white hover:border-brand-charcoal/30'
    }`}>
      {/* Header rând — click pt expand */}
      <button type="button" onClick={onToggle}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-left">
        {/* Badge poziție */}
        <span className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold tabular-nums ${
          isActive ? 'bg-brand-accent text-white' : 'bg-brand-beige/60 text-brand-charcoal/65'
        }`}>
          {positionLabel}
        </span>
        {/* Icon */}
        <div className={`shrink-0 w-7 h-7 rounded flex items-center justify-center ${
          isActive ? 'bg-brand-accent/15 text-brand-accent' : 'bg-brand-cream/60 text-brand-charcoal/55'
        }`}>
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        {/* Etichete */}
        <div className="flex-1 min-w-0">
          <div className={`text-[12px] font-semibold leading-tight ${isActive ? 'text-brand-dark' : 'text-brand-dark'}`}>
            {fn?.label || 'Zonă'}
          </div>
          <div className="text-[10px] text-brand-charcoal/55 leading-tight truncate">
            {extraLabel(section)}
          </div>
        </div>
        {/* Height badge */}
        <span className={`shrink-0 text-[11px] font-bold tabular-nums px-2 py-0.5 rounded ${
          isActive ? 'bg-white text-brand-accent ring-1 ring-brand-accent/30' : 'bg-brand-cream/60 text-brand-charcoal/70'
        }`}>
          {section.heightCm}<span className="opacity-55 ml-0.5 font-normal">cm</span>
        </span>
        {/* Chevron */}
        <ChevronDown className={`w-4 h-4 shrink-0 text-brand-charcoal/40 transition-transform ${isActive ? 'rotate-180 text-brand-accent' : ''}`} />
      </button>

      {/* Conținut expandat */}
      {isActive && (
        <div className="px-2.5 pb-2.5 pt-1 space-y-2.5 border-t border-brand-beige/40 animate-fade-in">
          {/* Grid selector funcție */}
          <div>
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-brand-charcoal/50 mb-1">Funcție</div>
            <div className="grid grid-cols-4 gap-1">
              {FUNCTIONS.map((f) => {
                const F = f.icon;
                const sel = f.id === section.type;
                return (
                  <button key={f.id} onClick={() => onChangeType(f.id)}
                    title={f.description}
                    className={`flex flex-col items-center gap-0.5 py-1.5 rounded border text-[9px] font-semibold transition-all ${
                      sel
                        ? 'bg-brand-accent border-brand-accent text-white shadow-sm'
                        : 'bg-white border-brand-beige/50 text-brand-charcoal/70 hover:border-brand-accent/50 hover:text-brand-dark'
                    }`}>
                    <F className="w-3.5 h-3.5" />
                    <span className="leading-none tracking-tight">{f.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper count specific tipului */}
          {countRow(section, onUpdate)}

          {/* Slider înălțime */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9.5px] font-semibold uppercase tracking-wider text-brand-charcoal/50">Înălțime</span>
              <div className="flex items-center gap-1">
                <button onClick={() => onUpdate({ heightCm: section.heightCm - HEIGHT_STEP })}
                  className="w-6 h-6 rounded border border-brand-beige/60 hover:bg-brand-cream/60 text-brand-charcoal/70 text-xs font-bold">−</button>
                <span className="text-[11px] font-bold tabular-nums text-brand-dark min-w-[42px] text-center">{section.heightCm}cm</span>
                <button onClick={() => onUpdate({ heightCm: section.heightCm + HEIGHT_STEP })}
                  className="w-6 h-6 rounded border border-brand-beige/60 hover:bg-brand-cream/60 text-brand-charcoal/70 text-xs font-bold">+</button>
              </div>
            </div>
            <input type="range" min={min} max={240} step={HEIGHT_STEP}
              value={Math.min(240, Math.max(min, section.heightCm))}
              onChange={(e) => onUpdate({ heightCm: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 accent-brand-accent" />
          </div>

          {/* Bara de acțiuni */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <div className="flex gap-1">
              <button onClick={() => onMove('up')} disabled={isFirst} title="Mută sus"
                className="w-7 h-7 rounded border border-brand-beige/60 hover:bg-brand-cream/60 disabled:opacity-30 disabled:cursor-not-allowed text-brand-charcoal/70 flex items-center justify-center">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onMove('down')} disabled={isLast} title="Mută jos"
                className="w-7 h-7 rounded border border-brand-beige/60 hover:bg-brand-cream/60 disabled:opacity-30 disabled:cursor-not-allowed text-brand-charcoal/70 flex items-center justify-center">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <button onClick={onDelete} disabled={!canDelete}
              className="flex items-center gap-1 px-2 h-7 rounded text-[10px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Trash2 className="w-3 h-3" />Șterge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function extraLabel(sec: DressingModuleSection): string {
  switch (sec.type) {
    case 'shelves':          return `${sec.shelfCount ?? 3} rafturi interior`;
    case 'drawers':          return `${sec.drawerCount ?? 2} sertare`;
    case 'hanging-rod':      return 'Bară metalică cu suport';
    case 'shoe-rack':        return `${sec.shoeCount ?? 3} rafturi înclinate`;
    case 'pull-out-trouser': return `${sec.trouserRodCount ?? 4} bare extensibile`;
    case 'pull-out-basket':  return `${sec.basketCount ?? 2} coșuri sârmă`;
    case 'mirror':           return 'Panou oglindă argintată';
    default:                 return 'Spațiu gol';
  }
}

function countRow(section: DressingModuleSection, onUpdate: (p: Partial<DressingModuleSection>) => void): React.ReactNode {
  const render = (label: string, field: keyof DressingModuleSection, cur: number, min: number, max: number) => (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9.5px] font-semibold uppercase tracking-wider text-brand-charcoal/50">{label}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onUpdate({ [field]: Math.max(min, cur - 1) } as Partial<DressingModuleSection>)}
            className="w-6 h-6 rounded border border-brand-beige/60 hover:bg-brand-cream/60 text-brand-charcoal/70 text-xs font-bold">−</button>
          <span className="text-[11px] font-bold tabular-nums text-brand-dark min-w-[24px] text-center">{cur}</span>
          <button onClick={() => onUpdate({ [field]: Math.min(max, cur + 1) } as Partial<DressingModuleSection>)}
            className="w-6 h-6 rounded border border-brand-beige/60 hover:bg-brand-cream/60 text-brand-charcoal/70 text-xs font-bold">+</button>
        </div>
      </div>
    </div>
  );
  switch (section.type) {
    case 'shelves':
      return render('Număr rafturi', 'shelfCount', section.shelfCount ?? 3,
        DRESSING_UNIT_LIMITS.sectionShelfCount.min, DRESSING_UNIT_LIMITS.sectionShelfCount.max);
    case 'drawers':
      return render('Număr sertare', 'drawerCount', section.drawerCount ?? 2,
        DRESSING_UNIT_LIMITS.drawerCount.min, DRESSING_UNIT_LIMITS.drawerCount.max);
    case 'shoe-rack':
      return render('Rafturi pantofi', 'shoeCount', section.shoeCount ?? 3, 2, 6);
    case 'pull-out-trouser':
      return render('Bare pantaloni', 'trouserRodCount', section.trouserRodCount ?? 4, 2, 6);
    case 'pull-out-basket':
      return render('Număr coșuri', 'basketCount', section.basketCount ?? 2, 1, 4);
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Popover pentru butonul "Adaugă zonă" — grid 4×2 funcții
// ═══════════════════════════════════════════════════════════════════════════
function AddSectionButton({ onAdd, label }: { onAdd: (t: DressingSectionType) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-dashed border-brand-beige/70 hover:border-brand-accent hover:bg-brand-accent/5 text-[11px] font-semibold text-brand-charcoal/60 hover:text-brand-accent transition-colors">
        <Plus className="w-3.5 h-3.5" />{label}
      </button>
      {open && (
        <div className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-1 bg-white rounded-lg shadow-xl border border-brand-beige/60 p-2 w-64 animate-fade-in">
          <div className="text-[9.5px] font-semibold uppercase tracking-wider text-brand-charcoal/50 mb-1.5 px-1">Alege funcția</div>
          <div className="grid grid-cols-2 gap-1">
            {FUNCTIONS.map((f) => {
              const F = f.icon;
              return (
                <button key={f.id}
                  onClick={() => { onAdd(f.id); setOpen(false); }}
                  className="flex items-start gap-1.5 px-2 py-1.5 rounded hover:bg-brand-cream/60 text-left transition-colors">
                  <div className="shrink-0 w-7 h-7 rounded bg-brand-cream/60 flex items-center justify-center text-brand-charcoal/60">
                    <F className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] font-semibold text-brand-dark leading-tight">{f.label}</div>
                    <div className="text-[9px] text-brand-charcoal/55 leading-tight line-clamp-2">{f.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN — Layout split: preview mic (stanga) + lista sectiuni (dreapta)
// ═══════════════════════════════════════════════════════════════════════════
export default function ModuleStack({
  moduleIndex, sections, availableCm, columnHeightPx = 340, canCopy,
}: {
  moduleIndex: number;
  sections: DressingModuleSection[];
  availableCm: number;
  columnHeightPx?: number;
  canCopy: boolean;
}) {
  const activeId = useDressingUnitStore((s) => s.activeSectionByModule[moduleIndex] ?? null);
  const setActive = useDressingUnitStore((s) => s.setActiveSection);
  const insertAt = useDressingUnitStore((s) => s.insertModuleSection);
  const removeSec = useDressingUnitStore((s) => s.removeModuleSection);
  const updateSec = useDressingUnitStore((s) => s.updateModuleSection);
  const moveSec = useDressingUnitStore((s) => s.moveModuleSection);
  const copyToAll = useDressingUnitStore((s) => s.copyModuleSectionsToAll);

  // Listă în ordine vizuală (sus → jos).
  // În store secțiunile sunt stocate bottom→top, deci inversez pt afișare.
  const visualOrder = useMemo(() => [...sections].reverse(), [sections]);

  const totalCm = sections.reduce((s, sec) => s + sec.heightCm, 0);
  const drift = totalCm - availableCm;
  const balanced = Math.abs(drift) < 2;

  const toggleActive = (id: string) => setActive(moduleIndex, activeId === id ? null : id);

  return (
    <div className="space-y-2.5">
      {/* ─── HEADER: status ocupare + copy ─── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-charcoal/55">Zone interior</span>
          <span className="text-[10px] text-brand-charcoal/45 tabular-nums">{sections.length} {sections.length === 1 ? 'zonă' : 'zone'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full ${
            balanced
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
          }`}>
            {balanced ? '✓ ' : ''}{totalCm}<span className="opacity-60"> / {availableCm}cm</span>
          </span>
          {canCopy && (
            <button onClick={() => copyToAll(moduleIndex)} title="Aplică aceeași structură tuturor modulelor"
              className="flex items-center gap-1 text-[10px] font-semibold text-brand-charcoal/60 hover:text-brand-accent px-2 py-0.5 rounded border border-brand-beige/40 hover:border-brand-accent/40 hover:bg-brand-accent/5 transition-colors">
              <Copy className="w-3 h-3" />Copiază
            </button>
          )}
        </div>
      </div>

      {/* ─── LAYOUT 2 COLOANE: preview mic + lista ─── */}
      <div className="flex gap-3">
        {/* COLOANA PREVIEW (minor, doar citit) */}
        <div className="shrink-0 flex flex-col items-center gap-1.5">
          <MiniPreview sections={sections} availableCm={availableCm}
            activeId={activeId} onSelect={(id) => setActive(moduleIndex, id)}
            columnHeightPx={columnHeightPx} />
          <div className="text-[9px] text-brand-charcoal/45 text-center leading-tight max-w-[140px]">
            Previzualizare · Click pe o zonă
          </div>
        </div>

        {/* LISTA — editor principal */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ minHeight: columnHeightPx }}>
          {/* ADD SUS */}
          <AddSectionButton
            onAdd={(t) => insertAt(moduleIndex, sections.length, t)}
            label="Adaugă zonă sus"
          />

          {/* LISTA DE ZONE */}
          <div className="space-y-1.5 my-1.5 flex-1 overflow-y-auto pr-1" style={{ maxHeight: columnHeightPx + 40 }}>
            {visualOrder.length === 0 && (
              <div className="text-[10.5px] text-brand-charcoal/50 text-center py-6 rounded-lg border border-dashed border-brand-beige/60">
                Modulul e gol — adaugă prima zonă
              </div>
            )}
            {visualOrder.map((sec, visIdx) => {
              const realIdx = sections.length - 1 - visIdx;
              return (
                <SectionCard
                  key={sec.id}
                  section={sec}
                  positionLabel={`${visIdx + 1}`}
                  isFirst={visIdx === 0}
                  isLast={visIdx === visualOrder.length - 1}
                  isActive={sec.id === activeId}
                  canDelete={sections.length > 1}
                  onToggle={() => toggleActive(sec.id)}
                  onChangeType={(t) => updateSec(moduleIndex, sec.id, { type: t, ...typeDefaults(t) })}
                  onUpdate={(p) => updateSec(moduleIndex, sec.id, p)}
                  onMove={(dir) => {
                    // În store: 'up' ridică vizual (array bottom→top) înseamnă pozitie realIdx++
                    // Doar delegăm — moveSec rezolvă semantica.
                    moveSec(moduleIndex, sec.id, dir === 'up' ? 'up' : 'down');
                  }}
                  onDelete={() => { removeSec(moduleIndex, sec.id); setActive(moduleIndex, null); }}
                />
              );
            })}
          </div>

          {/* ADD JOS */}
          <AddSectionButton
            onAdd={(t) => insertAt(moduleIndex, 0, t)}
            label="Adaugă zonă jos"
          />
        </div>
      </div>
    </div>
  );
}
