'use client';

import React, { useState } from 'react';

interface OfferFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface OfferRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OfferFormData) => Promise<void>;
  title?: string;
}

export default function OfferRequestModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Solicita oferta',
}: OfferRequestModalProps) {
  const [form, setForm] = useState<OfferFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Completeaza toate campurile.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      });
      onClose();
      setForm({ firstName: '', lastName: '', phone: '', email: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu am putut trimite cererea. Incearca din nou.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Inchide"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <div className="relative rounded-2xl bg-white shadow-2xl border border-brand-beige/50 p-5 w-[92vw] max-w-[80vw] max-h-[85vh] lg:max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-brand-dark">{title}</h3>
        <p className="text-sm text-brand-charcoal/50 mt-1">
          Completeaza datele, iar configuratia in PDF va fi trimisa automat la comenzi@milimetric.ro.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input-field"
              placeholder="Nume"
              value={form.firstName}
              onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Prenume"
              value={form.lastName}
              onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
            />
          </div>

          <input
            className="input-field w-full"
            placeholder="Nr. telefon"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />

          <input
            type="email"
            className="input-field w-full"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={onClose}>
              Renunta
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={submitting}>
              {submitting ? 'Se trimite...' : 'Trimite oferta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
