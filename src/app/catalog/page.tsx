'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Grid3X3, List, ArrowRight } from 'lucide-react';
import { catalogItems, getFeaturedItems } from '@/data/catalogItems';
import { furnitureCategories } from '@/data/catalog';
import { FurnitureCategory, CatalogItem } from '@/types';
import { formatPrice } from '@/data/pricing';
import FurniturePreview from '@/components/FurniturePreview';
import { useConfiguratorStore } from '@/store/configuratorStore';

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream" />}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setPendingPreset = useConfiguratorStore((s) => s.setPendingPreset);

  // Read ?categorie= from URL on mount
  const initialCategory = (searchParams.get('categorie') as FurnitureCategory) || 'all';
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync if URL param changes (e.g. browser back/forward)
  useEffect(() => {
    const param = searchParams.get('categorie') as FurnitureCategory | null;
    setSelectedCategory(param || 'all');
  }, [searchParams]);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');

  const handleConfigureItem = (item: CatalogItem) => {
    if (item.configuratorPath) {
      // Custom configurator page (e.g., Corp Living Suspendat)
      router.push(item.configuratorPath);
      return;
    }
    if (item.configPreset) {
      setPendingPreset(item.configPreset);
    }
    router.push(`/configurator/${item.category}`);
  };

  const filteredItems = catalogItems
    .filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.material.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <section className="bg-white border-b border-brand-beige/30">
        <div className="section-container py-10">
          <h1 className="heading-lg text-brand-dark">Catalog Mobilier</h1>
          <div className="w-12 h-px bg-brand-accent mt-4 mb-4" />
          <p className="text-brand-charcoal/50 text-sm">
            Explorează colecția noastră sau personalizează orice piesă cu configuratorul.
          </p>
        </div>
      </section>

      <div className="section-container py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="bg-white border border-brand-beige/50 p-6 sticky top-28">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/30" />
                <input
                  type="text"
                  placeholder="Caută mobilier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 text-sm"
                />
              </div>

              {/* Categories */}
              <div className="space-y-1">
                <h3 className="text-xs uppercase tracking-wider text-brand-charcoal/40 mb-3">Categorii</h3>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors duration-200 ${
                    selectedCategory === 'all'
                      ? 'text-brand-accent'
                      : 'text-brand-charcoal/50 hover:text-brand-dark'
                  }`}
                >
                  Toate ({catalogItems.length})
                </button>
                {furnitureCategories.map((cat) => {
                  const count = catalogItems.filter((i) => i.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors duration-200 flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'text-brand-accent'
                          : 'text-brand-charcoal/50 hover:text-brand-dark'
                      }`}
                    >
                      <span>{cat.icon} {cat.name}</span>
                      <span className="text-xs text-brand-charcoal/30">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort */}
              <div className="mt-6 pt-6 border-t border-brand-beige/30">
                <h3 className="text-xs uppercase tracking-wider text-brand-charcoal/40 mb-3">Sortare</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="input-field text-sm"
                >
                  <option value="name">Nume (A-Z)</option>
                  <option value="price-asc">Preț crescător</option>
                  <option value="price-desc">Preț descrescător</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-brand-charcoal/40 uppercase tracking-wider">
                {filteredItems.length} {filteredItems.length === 1 ? 'produs' : 'produse'}
              </p>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="heading-sm text-brand-charcoal/30 mb-2">Niciun produs găsit</h3>
                <p className="text-brand-charcoal/30 text-sm">Încearcă altă căutare sau categorie.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-brand-beige/20">
                {filteredItems.map((item) => (
                  <div key={item.id} className="card-interactive group bg-white cursor-pointer" onClick={() => handleConfigureItem(item)}>
                    {/* Image */}
                    <div className="aspect-[4/3] bg-brand-warm relative overflow-hidden flex items-center justify-center p-4">
                      <FurniturePreview
                        item={item}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                      />
                      {item.isCustomizable && (
                        <div className="absolute top-3 left-3 bg-brand-accent text-white text-xs tracking-wide px-2.5 py-1">
                          Personalizabil
                        </div>
                      )}
                      {item.featured && (
                        <div className="absolute top-3 right-3 bg-brand-dark text-brand-cream text-xs tracking-wide px-2.5 py-1">
                          Popular
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div>
                        <h3 className="font-display text-lg tracking-display text-brand-dark group-hover:text-brand-accent transition-colors duration-300">
                          {item.name}
                        </h3>
                        <p className="text-xs text-brand-charcoal/40 mt-1 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-brand-charcoal/30">
                        <span>{item.dimensions.width}×{item.dimensions.height}×{item.dimensions.depth} cm</span>
                        <span>·</span>
                        <span>{item.material}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-brand-beige/30">
                        <div>
                          <p className="font-display text-xl text-brand-accent">
                            {formatPrice(item.basePrice)}
                          </p>
                          <p className="text-xs text-brand-charcoal/30">Livrare: {item.deliveryWeeks} săpt.</p>
                        </div>
                        <button
                          onClick={() => handleConfigureItem(item)}
                          className="btn-primary text-xs py-2 px-4"
                        >
                          Configurează
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
