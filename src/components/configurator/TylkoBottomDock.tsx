'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Ruler, ChevronUp } from 'lucide-react';
import { useDressingUnitStore, DRESSING_UNIT_LIMITS } from '@/store/dressingUnitStore';

// ─────────────────────────────────────────────────────────────
// Slider cu tick marks (stil Tylko)
// ─────────────────────────────────────────────────────────────
function TickSlider({
  label, value, min, max, step, unit, onChange, scale = 1, tickStep,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  scale?: number;
  /** Pasul vizual (în unitățile afișate) între tick marks vizibile */
  tickStep?: number;
}) {
  const dv = Math.round(value * scale);
  const dmin = Math.round(min * scale);
  const dmax = Math.round(max * scale);
  const dstep = Math.max(1, Math.round(step * scale));
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(dv.toString());
  useEffect(() => { setInputVal(dv.toString()); }, [dv]);

  const commit = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) onChange(Math.max(min, Math.min(max, parsed / scale)));
  };

  // Generăm tick marks
  const tsStep = tickStep ?? Math.max(dstep, Math.round((dmax - dmin) / 10));
  const ticks: number[] = [];
  for (let v = Math.ceil(dmin / tsStep) * tsStep; v <= dmax; v += tsStep) {
    ticks.push(v);
  }

  return (
    <div className="flex flex-col gap-1 min-w-[180px] flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.1em] text-brand-charcoal/55 font-semibold">
          {label}
        </span>
        {editing ? (
          <input
            type="number"
            autoFocus
            value={inputVal}
            min={dmin}
            max={dmax}
            step={dstep}
            onChange={(e) => {
              setInputVal(e.target.value);
              const p = parseInt(e.target.value, 10);
              if (!isNaN(p)) onChange(Math.max(min, Math.min(max, p / scale)));
            }}
            onBlur={() => { setEditing(false); if (inputVal) commit(inputVal); }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="w-16 text-right bg-white text-[14px] font-bold text-brand-dark tabular-nums outline-none rounded px-1 ring-1 ring-brand-accent/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-[14px] font-bold text-brand-dark tabular-nums hover:text-brand-accent transition-colors leading-none"
            title="Click pentru a introduce valoare"
          >
            {dv}
            <span className="text-[10px] text-brand-charcoal/40 font-normal ml-0.5">{unit}</span>
          </button>
        )}
      </div>

      <div className="relative h-5">
        {/* Track cu tick marks */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-brand-beige/40" />
        {/* Tick marks */}
        {ticks.map((t) => {
          const p = ((t - dmin) / (dmax - dmin)) * 100;
          return (
            <div
              key={t}
              className="absolute top-1/2 -translate-y-1/2 w-px h-[7px] bg-brand-charcoal/20"
              style={{ left: `${p}%` }}
            />
          );
        })}
        {/* Fill activ */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-gradient-to-r from-brand-accent/70 to-brand-accent"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-brand-accent shadow-md transition-[left] duration-75 pointer-events-none"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={dmin}
          max={dmax}
          step={dstep}
          value={dv}
          onChange={(e) => onChange(parseInt(e.target.value, 10) / scale)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-[9px] text-brand-charcoal/35 tabular-nums">
        <span>{dmin}{unit}</span>
        <span>{dmax}{unit}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom Dock — apare peste canvas, stil Tylko
// ─────────────────────────────────────────────────────────────
export default function TylkoBottomDock() {
  const c = useDressingUnitStore((s) => s.config);
  const setTotalModulesWidth = useDressingUnitStore((s) => s.setTotalModulesWidth);
  const setTotalHeight = useDressingUnitStore((s) => s.setTotalHeight);
  const setDepth = useDressingUnitStore((s) => s.setDepth);

  const [collapsed, setCollapsed] = useState(false);
  const totalModulesW = c.modules.reduce((acc, m) => acc + m.width, 0);

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div
        className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 transition-all duration-300 ${
          collapsed ? 'p-1.5' : 'p-3 pb-2'
        }`}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-brand-charcoal/70 hover:text-brand-accent transition-colors"
            title="Afișează controale dimensiuni"
          >
            <Ruler className="w-3.5 h-3.5" />
            Dimensiuni
            <ChevronUp className="w-3 h-3" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Ruler className="w-3 h-3 text-brand-charcoal/45" />
              <span className="text-[10px] uppercase tracking-[0.12em] text-brand-charcoal/55 font-semibold flex-1">
                Dimensiuni
              </span>
              <button
                onClick={() => setCollapsed(true)}
                className="text-brand-charcoal/35 hover:text-brand-charcoal/70 p-1 -mr-1 rounded transition-colors"
                title="Ascunde"
              >
                <ChevronUp className="w-3 h-3 rotate-180" />
              </button>
            </div>
            <div className="flex items-stretch gap-4 px-1">
              <TickSlider
                label="Lățime"
                value={totalModulesW}
                min={c.modules.length * DRESSING_UNIT_LIMITS.moduleWidth.min}
                max={c.modules.length * DRESSING_UNIT_LIMITS.moduleWidth.max}
                step={DRESSING_UNIT_LIMITS.totalModulesWidth.step}
                unit="mm"
                scale={10}
                onChange={setTotalModulesWidth}
                tickStep={500}
              />
              <div className="w-px bg-brand-beige/40 self-stretch" />
              <TickSlider
                label="Înălțime"
                value={c.totalHeight}
                min={DRESSING_UNIT_LIMITS.totalHeight.min}
                max={DRESSING_UNIT_LIMITS.totalHeight.max}
                step={DRESSING_UNIT_LIMITS.totalHeight.step}
                unit="mm"
                scale={10}
                onChange={setTotalHeight}
                tickStep={200}
              />
              <div className="w-px bg-brand-beige/40 self-stretch" />
              <TickSlider
                label="Adâncime"
                value={c.depth}
                min={DRESSING_UNIT_LIMITS.depth.min}
                max={DRESSING_UNIT_LIMITS.depth.max}
                step={DRESSING_UNIT_LIMITS.depth.step}
                unit="mm"
                scale={10}
                onChange={setDepth}
                tickStep={50}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
