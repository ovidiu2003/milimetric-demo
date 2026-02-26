'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { furnitureCategories } from '@/data/catalog';
import { ChevronRight, ArrowRight } from 'lucide-react';

const categories = furnitureCategories;

export default function ConfiguratorHomePage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-dark text-white py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="heading-xl mb-4">Configurator 3D</h1>
          <div className="w-12 h-px bg-brand-accent mx-auto mb-6" />
          <p className="text-brand-cream/50 text-lg max-w-2xl mx-auto mb-8">
            Proiectează-ți mobilierul perfect pas cu pas. Alege dimensiunile, materialele,
            fronturile și toate detaliile — totul vizualizat în timp real.
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-brand-cream/30 uppercase tracking-wider">
            <span>Dimensiuni la milimetru</span>
            <span>·</span>
            <span>20+ materiale</span>
            <span>·</span>
            <span>Preț în timp real</span>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section-container -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-beige/20">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.configuratorPath}
              className="card-interactive group bg-white"
            >
              <div className="aspect-[4/3] bg-brand-warm flex items-center justify-center relative overflow-hidden">
                <span className="text-7xl group-hover:scale-110 transition-transform duration-700">{cat.icon}</span>
                <div className="absolute inset-0 bg-brand-accent/0 group-hover:bg-brand-accent/5 transition-colors duration-500" />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-display text-lg tracking-display text-brand-dark group-hover:text-brand-accent transition-colors duration-300">
                  {cat.name}
                </h3>
                <p className="text-sm text-brand-charcoal/50 leading-relaxed">{cat.description}</p>
                <div className="pt-3 flex items-center justify-between border-t border-brand-beige/30">
                  <div className="text-xs text-brand-charcoal/30">
                    <span>Max: {cat.maxWidth}×{cat.maxHeight} cm</span>
                  </div>
                  <div className="flex items-center text-brand-accent text-sm">
                    <span>Configurează</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="section-container section-padding">
        <div className="bg-white border border-brand-beige/50 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg text-brand-dark mb-6">
                Cum funcționează?
              </h2>
              <div className="w-12 h-px bg-brand-beige mb-8" />
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Alege categoria', desc: 'Selectează tipul de mobilier pe care dorești să-l configurezi.' },
                  { step: '02', title: 'Setează dimensiunile', desc: 'Introdu lățimea, înălțimea și adâncimea exacte.' },
                  { step: '03', title: 'Personalizează', desc: 'Alege materiale, fronturi, compartimente și opțiuni extra.' },
                  { step: '04', title: 'Solicită oferta', desc: 'Finalizează configurația și primește oferta noastră de preț.' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-5">
                    <span className="font-display text-3xl text-brand-beige shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-display text-lg tracking-display text-brand-dark">{item.title}</h4>
                      <p className="text-sm text-brand-charcoal/50 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-warm p-8 text-center">
              <h3 className="font-display text-xl tracking-display text-brand-dark mb-3">Previzualizare 3D</h3>
              <div className="w-8 h-px bg-brand-accent mx-auto mb-4" />
              <p className="text-brand-charcoal/50 text-sm mb-6">
                Vizualizează mobilierul tău în 3D în timp real, din orice unghi. Schimbă materialele 
                și dimensiunile și vezi rezultatul instant.
              </p>
              <Link href="/configurator/biblioteci" className="btn-primary inline-flex text-sm">
                Încearcă Acum
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Special Requests */}
      <section className="section-container pb-20">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-brand-dark mb-4">
            Soluții speciale
          </h2>
          <div className="w-12 h-px bg-brand-accent mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-beige/20">
          {[
            { title: 'Soluții de colț', desc: 'Mobilier de colț și în formă de L, adaptat perfect spațiului tău.' },
            { title: 'Mobilier încastrat', desc: 'Soluții de încastrare cu benzi de acoperire și repere exacte.' },
            { title: 'Proiecte speciale', desc: 'Implementăm specificațiile tale individuale, oricât de complexe.' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 text-center">
              <h3 className="font-display text-lg tracking-display text-brand-dark mb-3">{item.title}</h3>
              <p className="text-sm text-brand-charcoal/50 mb-4">{item.desc}</p>
              <Link href="/contact" className="link-subtle text-sm text-brand-accent">
                Solicită Consultanță
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
