'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Users, Target, Heart, Award, ArrowRight } from 'lucide-react';

const values = [
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Precizie',
    description: 'Fiecare piesă este fabricată la milimetru, cu atenție la cele mai mici detalii.',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Pasiune',
    description: 'Punem suflet în fiecare proiect. Mobilierul nostru este creat cu dragoste pentru meșteșug.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Comunicare',
    description: 'Ascultăm, înțelegem și colaborăm cu tine la fiecare pas, de la idee la instalare.',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Calitate',
    description: 'Folosim doar materiale premium și feronerie de top (Blum, Hettich) pentru durabilitate.',
  },
];

const team = [
  { name: 'Echipa Design', role: 'Proiectare & Design', emoji: '🎨' },
  { name: 'Echipa Producție', role: 'Fabricare & Finisaj', emoji: '🔨' },
  { name: 'Echipa Montaj', role: 'Livrare & Instalare', emoji: '🏠' },
  { name: 'Echipa Suport', role: 'Consultanță & Suport', emoji: '💬' },
];

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const el = ref.current;
    if (el) el.querySelectorAll('.fade-section').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function DespreNoiPage() {
  const pageRef = useFadeIn();

  return (
    <div ref={pageRef} className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-dark text-brand-cream py-20 md:py-32">
        <div className="section-container">
          <div className="max-w-2xl">
            <h1 className="heading-xl mb-6">
              Creăm mobilier cu{' '}
              <span className="italic text-brand-accent">suflet și precizie</span>
            </h1>
            <div className="w-12 h-px bg-brand-accent mt-6 mb-8" />
            <p className="text-lg text-brand-cream/50 leading-relaxed">
              milimetric.ro este un atelier de mobilier la comandă unde fiecare piesă este gândită, 
              proiectată și fabricată cu atenție la cele mai mici detalii. Nu facem mobilier de serie — 
              facem mobilier pentru tine.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-container section-padding fade-section">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="heading-lg text-brand-dark">Povestea noastră</h2>
            <div className="w-12 h-px bg-brand-beige" />
            <p className="text-brand-charcoal/60 leading-relaxed">
              milimetric.ro a pornit dintr-o idee simplă: mobilierul ar trebui să se potrivească perfect 
              spațiului tău, nu invers. Am observat că prea mulți oameni fac compromisuri cu mobilierul 
              de serie care nu se potrivește niciodată exact.
            </p>
            <p className="text-brand-charcoal/60 leading-relaxed">
              Așa că am creat un atelier unde fiecare piesă de mobilier este proiectată la milimetru, 
              din materiale premium, cu feronerie de top, și cu un design care reflectă personalitatea 
              fiecărui client.
            </p>
            <p className="text-brand-charcoal/60 leading-relaxed">
              Astăzi, milimetric.ro servește peste 200 de clienți mulțumiți din toată România, oferind 
              mobilier personalizat pentru bucătării, livinguri, dormitoare, birouri și mai mult.
            </p>
          </div>
          <div className="bg-brand-warm p-12">
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="font-display text-4xl text-brand-accent">200+</p>
                <p className="text-sm text-brand-charcoal/50 mt-1">Clienți mulțumiți</p>
              </div>
              <div>
                <p className="font-display text-4xl text-brand-accent">500+</p>
                <p className="text-sm text-brand-charcoal/50 mt-1">Proiecte realizate</p>
              </div>
              <div>
                <p className="font-display text-4xl text-brand-accent">4.9</p>
                <p className="text-sm text-brand-charcoal/50 mt-1">Rating Google</p>
              </div>
              <div>
                <p className="font-display text-4xl text-brand-accent">3+</p>
                <p className="text-sm text-brand-charcoal/50 mt-1">Ani experiență</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white section-padding fade-section">
        <div className="section-container">
          <h2 className="heading-lg text-center text-brand-dark mb-4">Valorile noastre</h2>
          <div className="separator mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            {values.map((value, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="text-brand-accent mx-auto">
                  {value.icon}
                </div>
                <h3 className="font-display text-lg font-normal tracking-display text-brand-dark">{value.title}</h3>
                <p className="text-sm text-brand-charcoal/50 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-container section-padding fade-section">
        <h2 className="heading-lg text-center text-brand-dark mb-4">Echipa noastră</h2>
        <div className="separator mb-16" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <div key={i} className="card p-8 text-center">
              <div className="text-5xl mb-5">{member.emoji}</div>
              <h3 className="font-display text-lg tracking-display text-brand-dark">{member.name}</h3>
              <p className="text-sm text-brand-charcoal/50 mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-dark text-brand-cream section-padding fade-section">
        <div className="section-container text-center max-w-2xl mx-auto">
          <h2 className="heading-lg text-brand-cream mb-4">Hai să lucrăm împreună</h2>
          <p className="text-brand-cream/40 mb-10">
            Spune-ne ce ai nevoie și noi îl transformăm în realitate. Consultanță gratuită.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog" className="btn-primary text-sm">
              Catalog
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/contact" className="px-8 py-3.5 border border-brand-cream/20 text-brand-cream/70 font-medium tracking-wide hover:border-brand-cream/50 hover:text-brand-cream transition-all duration-300 inline-flex items-center justify-center text-sm">
              Contactează-ne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
