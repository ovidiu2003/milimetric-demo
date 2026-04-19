'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, FlipHorizontal, RotateCcw,
  ShoppingCart, Download, Ruler, PaintBucket, FileText, ChevronDown,
} from 'lucide-react';
import { useDressingStore, DRESSING_LIMITS, DressingStep } from '@/store/dressingStore';
import { getBodyMaterials, getFrontMaterials, getMaterialById } from '@/data/materials';
import { useTextures } from '@/hooks/useTextures';
import OfferRequestModal from '@/components/configurator/OfferRequestModal';

const stepMeta: Record<DressingStep, { label: string; icon: React.ReactNode }> = {
  parameters: { label: 'Dimensiuni', icon: <Ruler className="w-3.5 h-3.5" /> },
  materials: { label: 'Materiale', icon: <PaintBucket className="w-3.5 h-3.5" /> },
  summary: { label: 'Finalizare', icon: <FileText className="w-3.5 h-3.5" /> },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency', currency: 'RON',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);
}

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

  useEffect(() => {
    setInputValue(dv.toString());
  }, [dv]);

  const commitValue = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed / scale)));
    }
  };

  return (
    <div className="group overflow-visible px-1 pt-1 pb-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-brand-charcoal/60 leading-none group-hover:text-brand-charcoal/80 transition-colors">
          {label}
        </span>
        <div className="flex items-baseline gap-0.5">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              const parsed = parseInt(e.target.value, 10);
              if (!isNaN(parsed)) {
                onChange(Math.max(min, Math.min(max, parsed / scale)));
              }
            }}
            onBlur={(e) => {
              if (e.target.value === '' || isNaN(parseInt(e.target.value, 10))) {
                setInputValue(dv.toString());
              } else {
                commitValue(e.target.value);
              }
            }}
            className="w-14 text-right bg-transparent text-[14px] font-semibold text-brand-dark tabular-nums focus:outline-none focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-brand-accent/20 rounded px-0.5 py-0 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            min={dmin}
            max={dmax}
            step={dstep}
          />
          <span className="text-[11px] text-brand-charcoal/40 leading-none">{unit}</span>
        </div>
      </div>
      <div className="relative h-[6px] rounded-full bg-brand-beige/30 shadow-inner">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-accent/70 to-brand-accent transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
        <div className="slider-tooltip" style={{ left: `${pct}%` }}>
          {dv}{unit}
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-white border-2 border-brand-accent shadow-md transition-[left] duration-75 group-hover:scale-110 group-hover:shadow-lg"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={dmin}
          max={dmax}
          step={dstep}
          value={dv}
          onChange={(e) => {
            const raw = e.target.value;
            const val = parseInt(raw, 10) / scale;
            onChange(val);
            setInputValue(raw);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function DressingPanel() {
  const { currentStep, steps, config, price, setCurrentStep, prevStep, nextStep, updateConfig, toggleMirror, resetToDefaults } =
    useDressingStore();

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [expandedMaterialGroup, setExpandedMaterialGroup] = useState<'body' | 'front' | null>('body');
  const bodyMaterials = getBodyMaterials();
  const frontMaterials = getFrontMaterials();
  const currentBodyMat = getMaterialById(config.bodyMaterialId);
  const currentFrontMat = getMaterialById(config.frontMaterialId);

  const stepIndex = steps.indexOf(currentStep);

  const handleOfferSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/send-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'dressing',
          price,
          config,
        }),
      });
      if (response.ok) {
        setShowOfferModal(false);
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ════════════════════════════════════════════════════════════════════════════ */}
      <div className="border-b border-brand-beige/30 p-4 lg:p-6">
        <h2 className="heading-sm text-brand-dark mb-3">Configurator Dressing</h2>

        {/* Step indicators */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {steps.map((step, idx) => {
            const meta = stepMeta[step];
            const isCurrent = step === currentStep;
            const isDone = idx < stepIndex;
            return (
              <React.Fragment key={step}>
                <button
                  onClick={() => setCurrentStep(step)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-[12px] font-medium ${
                    isCurrent
                      ? 'bg-brand-accent text-white shadow-md'
                      : isDone
                      ? 'bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20'
                      : 'bg-brand-beige/20 text-brand-charcoal/50'
                  }`}
                >
                  {isDone && <Check className="w-3 h-3" />}
                  {!isDone && meta.icon}
                  {meta.label}
                </button>
                {idx < steps.length - 1 && <div className="h-px flex-1 bg-brand-beige/30" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Price display */}
        <div className="text-center">
          <p className="text-[12px] text-brand-charcoal/50 mb-1">Preț estimat</p>
          <p className="text-2xl font-bold text-brand-accent">{formatPrice(price)}</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {/* CONTENT */}
      {/* ════════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
        {/* ──────── PARAMETERS ──────── */}
        {currentStep === 'parameters' && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-brand-beige/20">
              <h3 className="text-[13px] font-semibold text-brand-dark mb-3">Rack-uri de Haine</h3>
              <ParamSlider
                label="Înălțime"
                value={config.clothesRackHeight}
                min={DRESSING_LIMITS.clothesRackHeight.min}
                max={DRESSING_LIMITS.clothesRackHeight.max}
                step={DRESSING_LIMITS.clothesRackHeight.step}
                unit="cm"
                onChange={(v) => updateConfig({ clothesRackHeight: v })}
                scale={10}
              />
              <ParamSlider
                label="Lățime"
                value={config.clothesRackWidth}
                min={DRESSING_LIMITS.clothesRackWidth.min}
                max={DRESSING_LIMITS.clothesRackWidth.max}
                step={DRESSING_LIMITS.clothesRackWidth.step}
                unit="cm"
                onChange={(v) => updateConfig({ clothesRackWidth: v })}
                scale={10}
              />
              <ParamSlider
                label="Număr"
                value={config.clothesRackCount}
                min={DRESSING_LIMITS.clothesRackCount.min}
                max={DRESSING_LIMITS.clothesRackCount.max}
                step={DRESSING_LIMITS.clothesRackCount.step}
                unit="buc"
                onChange={(v) => updateConfig({ clothesRackCount: Math.round(v) })}
              />
            </div>

            <div className="pb-4 border-b border-brand-beige/20">
              <h3 className="text-[13px] font-semibold text-brand-dark mb-3">Prateliere</h3>
              <ParamSlider
                label="Număr"
                value={config.shelfCount}
                min={DRESSING_LIMITS.shelfCount.min}
                max={DRESSING_LIMITS.shelfCount.max}
                step={DRESSING_LIMITS.shelfCount.step}
                unit="buc"
                onChange={(v) => updateConfig({ shelfCount: Math.round(v) })}
              />
              <ParamSlider
                label="Înălțime"
                value={config.shelfHeight}
                min={DRESSING_LIMITS.shelfHeight.min}
                max={DRESSING_LIMITS.shelfHeight.max}
                step={DRESSING_LIMITS.shelfHeight.step}
                unit="cm"
                onChange={(v) => updateConfig({ shelfHeight: v })}
                scale={10}
              />
            </div>

            <div className="pb-4 border-b border-brand-beige/20">
              <h3 className="text-[13px] font-semibold text-brand-dark mb-3">Sertare</h3>
              <ParamSlider
                label="Număr"
                value={config.drawerCount}
                min={DRESSING_LIMITS.drawerCount.min}
                max={DRESSING_LIMITS.drawerCount.max}
                step={DRESSING_LIMITS.drawerCount.step}
                unit="buc"
                onChange={(v) => updateConfig({ drawerCount: Math.round(v) })}
              />
              <ParamSlider
                label="Înălțime"
                value={config.drawerHeight}
                min={DRESSING_LIMITS.drawerHeight.min}
                max={DRESSING_LIMITS.drawerHeight.max}
                step={DRESSING_LIMITS.drawerHeight.step}
                unit="cm"
                onChange={(v) => updateConfig({ drawerHeight: v })}
                scale={10}
              />
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-brand-dark mb-3">Dimensiuni Generale</h3>
              <ParamSlider
                label="Lățime totală"
                value={config.totalWidth}
                min={DRESSING_LIMITS.totalWidth.min}
                max={DRESSING_LIMITS.totalWidth.max}
                step={DRESSING_LIMITS.totalWidth.step}
                unit="cm"
                onChange={(v) => updateConfig({ totalWidth: v })}
                scale={10}
              />
              <ParamSlider
                label="Înălțime totală"
                value={config.totalHeight}
                min={DRESSING_LIMITS.totalHeight.min}
                max={DRESSING_LIMITS.totalHeight.max}
                step={DRESSING_LIMITS.totalHeight.step}
                unit="cm"
                onChange={(v) => updateConfig({ totalHeight: v })}
                scale={10}
              />
              <ParamSlider
                label="Adâncime"
                value={config.depth}
                min={DRESSING_LIMITS.depth.min}
                max={DRESSING_LIMITS.depth.max}
                step={DRESSING_LIMITS.depth.step}
                unit="cm"
                onChange={(v) => updateConfig({ depth: v })}
                scale={10}
              />
            </div>
          </div>
        )}

        {/* ──────── MATERIALS ──────── */}
        {currentStep === 'materials' && (
          <div className="space-y-3">
            {/* Body Material */}
            <div className="border border-brand-beige/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedMaterialGroup(expandedMaterialGroup === 'body' ? null : 'body')}
                className="w-full flex items-center justify-between p-3 bg-brand-beige/10 hover:bg-brand-beige/20 transition-colors"
              >
                <span className="text-[13px] font-semibold text-brand-dark">Corp</span>
                <ChevronDown
                  className="w-4 h-4 text-brand-charcoal/50 transition-transform"
                  style={{ transform: expandedMaterialGroup === 'body' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              {expandedMaterialGroup === 'body' && (
                <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                  {bodyMaterials.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => updateConfig({ bodyMaterialId: mat.id })}
                      className={`w-full text-left px-3 py-2 rounded transition-all text-[12px] ${
                        config.bodyMaterialId === mat.id
                          ? 'bg-brand-accent/10 border-l-2 border-brand-accent'
                          : 'hover:bg-brand-beige/10 border-l-2 border-transparent'
                      }`}
                    >
                      {mat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Front Material */}
            <div className="border border-brand-beige/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedMaterialGroup(expandedMaterialGroup === 'front' ? null : 'front')}
                className="w-full flex items-center justify-between p-3 bg-brand-beige/10 hover:bg-brand-beige/20 transition-colors"
              >
                <span className="text-[13px] font-semibold text-brand-dark">Fronturi</span>
                <ChevronDown
                  className="w-4 h-4 text-brand-charcoal/50 transition-transform"
                  style={{ transform: expandedMaterialGroup === 'front' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              {expandedMaterialGroup === 'front' && (
                <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                  {frontMaterials.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => updateConfig({ frontMaterialId: mat.id })}
                      className={`w-full text-left px-3 py-2 rounded transition-all text-[12px] ${
                        config.frontMaterialId === mat.id
                          ? 'bg-brand-accent/10 border-l-2 border-brand-accent'
                          : 'hover:bg-brand-beige/10 border-l-2 border-transparent'
                      }`}
                    >
                      {mat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────── SUMMARY ──────── */}
        {currentStep === 'summary' && (
          <div className="space-y-4">
            <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-brand-dark mb-3">Rezumat Configurare</h3>
              <div className="space-y-2 text-[12px] text-brand-charcoal/70">
                <div className="flex justify-between">
                  <span>Rack-uri haine:</span>
                  <span className="font-semibold">{config.clothesRackCount} buc × {(config.clothesRackHeight / 10).toFixed(0)} cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Prateliere:</span>
                  <span className="font-semibold">{config.shelfCount} buc</span>
                </div>
                <div className="flex justify-between">
                  <span>Sertare:</span>
                  <span className="font-semibold">{config.drawerCount} buc</span>
                </div>
                <div className="flex justify-between border-t border-brand-accent/20 pt-2 mt-2">
                  <span>Dimensiuni:</span>
                  <span className="font-semibold">
                    {(config.totalWidth / 10).toFixed(0)} × {(config.totalHeight / 10).toFixed(0)} × {(config.depth / 10).toFixed(0)} cm
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-brand-beige/10 rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-brand-dark mb-2">Materiale</h3>
              <div className="space-y-2 text-[12px] text-brand-charcoal/70">
                <div>
                  <span className="text-brand-charcoal/50">Corp:</span>
                  <p className="font-semibold">{currentBodyMat?.name || 'Necunoscut'}</p>
                </div>
                <div>
                  <span className="text-brand-charcoal/50">Fronturi:</span>
                  <p className="font-semibold">{currentFrontMat?.name || 'Necunoscut'}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[12px] text-brand-charcoal/50 mb-2">
                Prețul este o estimare și poate varia în funcție de opțiunile finale și materiale premium.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ════════════════════════════════════════════════════════════════════════════ */}
      <div className="border-t border-brand-beige/30 p-4 lg:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMirror}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-beige text-brand-charcoal/70 rounded-lg hover:bg-brand-beige/10 transition-all text-[13px] font-medium"
          >
            <FlipHorizontal className="w-4 h-4" />
            Oglindă
          </button>
          <button
            onClick={resetToDefaults}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-beige text-brand-charcoal/70 rounded-lg hover:bg-brand-beige/10 transition-all text-[13px] font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={prevStep}
            disabled={stepIndex === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-beige text-brand-charcoal/70 disabled:opacity-30 rounded-lg hover:bg-brand-beige/10 transition-all text-[13px] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi
          </button>
          <button
            onClick={nextStep}
            disabled={stepIndex === steps.length - 1}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-accent text-white rounded-lg hover:bg-brand-accent-hover transition-all text-[13px] font-medium disabled:opacity-50"
          >
            {stepIndex === steps.length - 1 ? 'Gata' : 'Următorul'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setShowOfferModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-accent text-white rounded-lg hover:bg-brand-accent-hover transition-all text-[13px] font-semibold"
        >
          <ShoppingCart className="w-4 h-4" />
          Cere Ofertă
        </button>
      </div>

      {/* Offer Modal */}
      <OfferRequestModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={handleOfferSubmit}
        title="Cere Ofertă Dressing"
      />
    </div>
  );
}
