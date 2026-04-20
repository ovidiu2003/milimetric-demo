'use client';

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useDressingUnitStore } from '@/store/dressingUnitStore';
import { getMaterialById } from '@/data/materials';
import OfferRequestModal from '@/components/configurator/OfferRequestModal';
import {
  generateDressingUnitPDFBase64,
  getDressingUnitPDFFileName,
} from '@/utils/exportDressingUnitPDF';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency', currency: 'RON',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);
}

export default function PriceHUD() {
  const price = useDressingUnitStore((s) => s.price);
  const config = useDressingUnitStore((s) => s.config);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);

  async function handleSubmit(data: { firstName: string; lastName: string; phone: string; email: string }) {
    setStatus(null);
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
      throw new Error(body?.error || 'Nu am putut trimite oferta. Încearcă din nou.');
    }
    setStatus('Cererea a fost trimisă cu succes!');
  }

  return (
    <>
      <div className="absolute bottom-3 right-3 z-20 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-2.5 flex items-center gap-2.5">
          {/* Material swatches */}
          <div className="flex items-center gap-1">
            <span
              className="w-5 h-5 rounded-md ring-1 ring-brand-beige/40 shadow-sm"
              style={
                bodyMat?.textureUrl
                  ? { backgroundImage: `url(${bodyMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { backgroundColor: bodyMat?.color }
              }
              title={`Corp: ${bodyMat?.name}`}
            />
            <span
              className="w-5 h-5 rounded-md ring-1 ring-brand-beige/40 shadow-sm"
              style={
                frontMat?.textureUrl
                  ? { backgroundImage: `url(${frontMat.textureUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { backgroundColor: frontMat?.color }
              }
              title={`Front: ${frontMat?.name}`}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col items-end leading-tight pr-1">
            <span className="text-[9px] uppercase tracking-widest text-brand-charcoal/45 font-semibold">
              Preț estimat
            </span>
            <span className="text-[18px] font-bold text-brand-accent tabular-nums leading-none">
              {formatPrice(price.total)}
            </span>
            <span className="text-[9px] text-brand-charcoal/40 tabular-nums">
              {formatPrice(Math.round(price.total * 1.19))} cu TVA
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 bg-brand-dark hover:bg-brand-charcoal text-white font-semibold text-[12px] px-3.5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Solicită ofertă
          </button>
        </div>
        {status && (
          <div className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-500/90 text-white text-[11px] text-center shadow animate-fade-in">
            {status}
          </div>
        )}
      </div>

      <OfferRequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        title="Solicită ofertă"
      />
    </>
  );
}
