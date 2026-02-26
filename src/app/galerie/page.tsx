'use client';

import React, { useState } from 'react';
import { furnitureCategories } from '@/data/catalog';
import { FurnitureCategory } from '@/types';
import { X, ZoomIn } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: FurnitureCategory;
  description: string;
  material: string;
  dimensions: string;
}

const galleryItems: GalleryItem[] = [
  { id: 'g1', title: 'Bibliotecă Living Stejar', category: 'biblioteci', description: 'Bibliotecă din stejar masiv cu uși inferioare și iluminare LED.', material: 'Stejar Natural', dimensions: '240×210×35 cm' },
  { id: 'g2', title: 'Sideboard Sufragerie', category: 'comode', description: 'Sideboard elegant din furnir de nuc cu sertare Blum soft-close.', material: 'Furnir Nuc', dimensions: '200×80×45 cm' },
  { id: 'g3', title: 'Garderobă Walk-in', category: 'dulapuri', description: 'Garderobă walk-in cu organizare completă: bare, sertare, rafturi.', material: 'PAL Alb + LED', dimensions: '320×250×60 cm' },
  { id: 'g4', title: 'Masă Dining Extensibilă', category: 'mese', description: 'Masă de dining extensibilă pentru 8-12 persoane din stejar masiv.', material: 'Stejar Natural', dimensions: '200-280×100×76 cm' },
  { id: 'g5', title: 'Corp TV Perete', category: 'suspendat', description: 'Ansamblu TV suspendat cu nișe și iluminare ambientală.', material: 'MDF Antracit', dimensions: '260×45×35 cm' },
  { id: 'g6', title: 'Mobilier Hol Complet', category: 'hol', description: 'Set complet hol: cuier, bancă pantofi, dulap și oglindă.', material: 'Stejar + MDF Alb', dimensions: '180×220×40 cm' },
  { id: 'g7', title: 'Bibliotecă Home Office', category: 'biblioteci', description: 'Perete bibliotecă pentru birou cu nișă pentru monitor și sertare.', material: 'MDF Gri Mat', dimensions: '300×240×40 cm' },
  { id: 'g8', title: 'Dulap Dormitor pe Colț', category: 'dulapuri', description: 'Dulap în formă de L cu uși batante și oglindă interioară.', material: 'PAL Stejar Deschis', dimensions: '280×220×60 cm' },
  { id: 'g9', title: 'Comodă Noptieră Set', category: 'comode', description: 'Set 2 noptiere asortate cu 2 sertare fiecare.', material: 'Nuc Natural', dimensions: '50×55×40 cm' },
  { id: 'g10', title: 'Măsuță Cafea Stejar', category: 'masute-cafea', description: 'Măsuță de cafea cu raft inferior din stejar masiv.', material: 'Stejar Natural', dimensions: '110×60×42 cm' },
  { id: 'g11', title: 'Rafturi Bucătărie', category: 'biblioteci', description: 'Rafturi deschise din stejar masiv pentru bucătărie.', material: 'Stejar Natural', dimensions: '120×80×25 cm' },
  { id: 'g12', title: 'Birou Executiv', category: 'mese', description: 'Birou executiv din nuc masiv cu sertare laterale.', material: 'Nuc Natural', dimensions: '180×80×76 cm' },
];

export default function GaleriePage() {
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filtered = selectedCategory === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <section className="bg-white border-b border-brand-beige/30">
        <div className="section-container py-10">
          <h1 className="heading-lg text-brand-dark">Galerie Proiecte</h1>
          <div className="w-12 h-px bg-brand-accent mt-4 mb-4" />
          <p className="text-brand-charcoal/50 text-sm">
            Fiecare piesă este unică — creată pentru un spațiu, un client, o poveste.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-brand-beige/30 sticky top-20 md:top-24 z-30">
        <div className="section-container">
          <div className="flex items-center space-x-1 py-3 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-sm tracking-wide whitespace-nowrap transition-colors duration-300 ${
                selectedCategory === 'all'
                  ? 'text-brand-accent border-b-2 border-brand-accent'
                  : 'text-brand-charcoal/50 hover:text-brand-dark'
              }`}
            >
              Toate
            </button>
            {furnitureCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-sm tracking-wide whitespace-nowrap transition-colors duration-300 ${
                  selectedCategory === cat.id
                    ? 'text-brand-accent border-b-2 border-brand-accent'
                    : 'text-brand-charcoal/50 hover:text-brand-dark'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="section-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-beige/20">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card-interactive group bg-white cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="aspect-[4/3] bg-brand-warm relative overflow-hidden flex items-center justify-center">
                <div className="text-6xl group-hover:scale-105 transition-transform duration-700">
                  {furnitureCategories.find((c) => c.id === item.category)?.icon || '📦'}
                </div>
                <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-colors duration-500 flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg tracking-display text-brand-dark group-hover:text-brand-accent transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-xs text-brand-charcoal/40 mt-2 leading-relaxed">{item.description}</p>
                <div className="flex items-center space-x-3 mt-3 text-xs text-brand-charcoal/30">
                  <span>{item.material}</span>
                  <span>·</span>
                  <span>{item.dimensions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-brand-dark/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white max-w-2xl w-full overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-brand-warm flex items-center justify-center relative">
              <div className="text-8xl">
                {furnitureCategories.find((c) => c.id === selectedItem.category)?.icon || '📦'}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white flex items-center justify-center hover:bg-brand-cream transition-colors duration-200"
              >
                <X className="w-5 h-5 text-brand-dark" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <h2 className="heading-md text-brand-dark">{selectedItem.title}</h2>
              <p className="text-brand-charcoal/60 text-sm leading-relaxed">{selectedItem.description}</p>
              <div className="flex items-center space-x-8 text-sm text-brand-charcoal/40">
                <div><span className="text-brand-dark">Material:</span> {selectedItem.material}</div>
                <div><span className="text-brand-dark">Dimensiuni:</span> {selectedItem.dimensions}</div>
              </div>
              <div className="pt-4 flex gap-4">
                <a href={`/configurator/${selectedItem.category}`} className="btn-primary text-sm">
                  Configurează Similar
                </a>
                <button onClick={() => setSelectedItem(null)} className="btn-ghost text-sm">
                  Închide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
