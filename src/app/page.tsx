'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Quote, Ruler, Palette, Truck, Shield } from 'lucide-react';
import { furnitureCategories } from '@/data/catalog';

const HeroScene = dynamic(() => import('@/components/HeroScene'), {
  ssr: false,
  loading: () => <div style={{ height: '700vh', background: '#0A0806' }} />,
});

const testimonials = [
  {
    name: 'Rareș Popa',
    text: 'Termenul de livrare a fost chiar mai scurt față de ce mi-au oferit alți furnizori, ceea ce a fost un mare plus. Calitatea mobilierului este excelentă!',
    source: 'Recenzie Google',
  },
  {
    name: 'Alin Cruceriu',
    text: 'De la început, am fost impresionat de răbdarea și deschiderea lor de a asculta toate dorințele. Configuratorul 3D m-a ajutat enorm să vizualizez rezultatul final.',
    source: 'Recenzie Google',
  },
  {
    name: 'Tihamér Juhász',
    text: 'Am avut o comunicare directă, ne-a ajutat să clarificăm toate detaliile cu multă răbdare. Recomand cu încredere!',
    source: 'Recenzie Google',
  },
];

const features = [
  {
    icon: <Ruler className="w-7 h-7" />,
    title: 'Dimensiuni la milimetru',
    description: 'Fiecare piesă este fabricată exact pe dimensiunile spațiului tău — nimic aproximativ.',
  },
  {
    icon: <Palette className="w-7 h-7" />,
    title: '20+ materiale premium',
    description: 'Lemn masiv de stejar și nuc, MDF vopsit în orice culoare RAL — tu alegi.',
  },
  {
    icon: <Truck className="w-7 h-7" />,
    title: 'Livrare & montaj inclus',
    description: 'Transport în toată România cu montaj profesional în 4–12 săptămâni.',
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: 'Garanție extinsă',
    description: 'Feronerie Blum/Hettich, materiale premium, garanție pentru fiecare produs.',
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Configurezi online',
    description: 'Folosește configuratorul nostru 3D pentru a defini dimensiunile, materialele și detaliile mobilierului.',
  },
  {
    step: '02',
    title: 'Primești oferta',
    description: 'Echipa noastră analizează configurația și îți trimite o ofertă detaliată cu preț final.',
  },
  {
    step: '03',
    title: 'Fabricăm cu precizie',
    description: 'Mobilierul tău este fabricat în atelierul nostru, cu atenție la fiecare detaliu.',
  },
  {
    step: '04',
    title: 'Livrare & montaj',
    description: 'Livrăm și montăm la tine acasă, asigurându-ne că totul se potrivește perfect.',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero 3D Scene */}
      <HeroScene />

      {/* ═══ Post-hero content — scrolls over the fixed hero ═══ */}
      <div className="relative z-10">

        {/* ── mm cutout — transparent bg so hero shows through the letter holes ── */}
        <div className="w-full">
          <svg
            viewBox="0 0 1200 280"
            preserveAspectRatio="xMidYMax slice"
            className="w-full h-auto block"
            style={{ minHeight: '120px', maxHeight: '280px' }}
          >
            <defs>
              <mask id="mm-cutout">
                <rect width="1200" height="280" fill="white" />
                <text
                  x="600"
                  y="265"
                  textAnchor="middle"
                  textLength="415"
                  lengthAdjust="spacing"
                  fontFamily="'DM Sans', 'Helvetica Neue', Arial, sans-serif"
                  fontSize="250"
                  fontWeight="700"
                  fill="black"
                >
                  mm
                </text>
              </mask>
            </defs>
            <rect width="1200" height="280" fill="#F7F4EF" mask="url(#mm-cutout)" />
          </svg>
        </div>

        {/* ── Section 1: Statement ── */}
        <section className="bg-[#F7F4EF]">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 py-28 md:py-40 text-center">
            <p className="text-sm tracking-[0.3em] uppercase text-brand-accent mb-6">
              Milimetric
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.8rem)] font-light leading-[1.1] text-[#2A231C] tracking-[-0.01em]">
              Milimetric te ajută să faci<br />
              <em className="italic text-brand-accent">din locul tău, acasă.</em>
            </h2>
            <p className="mt-8 text-[1.05rem] leading-[1.8] text-[#5A4E44] max-w-2xl mx-auto">
              De la design până la execuție, dăm formă nevoilor tale și te ajutăm 
              să găsești cea mai bună soluție. Mobilier la milimetru, cu precizie, pe gustul tău.
            </p>
          </div>
        </section>

        {/* ── Section 2: Two cards — Inspirație + Mobilier ── */}
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Card: Inspirație */}
              <Link
                href="/galerie"
                className="group relative bg-[#F1EDE7] overflow-hidden transition-all duration-500 hover:shadow-xl"
              >
                <div className="p-10 md:p-14 flex flex-col justify-between min-h-[320px]">
                  <div>
                    <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-4">
                      Inspirație
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl font-light text-[#2A231C] leading-[1.15] tracking-[-0.005em]">
                      Nu facem doar mobilă.
                    </h3>
                  </div>
                  <p className="text-[0.95rem] leading-[1.75] text-[#6B5E52] mt-6 max-w-sm">
                    De la design până la execuție, dăm formă nevoilor tale și te ajutăm 
                    să găsești cea mai bună soluție.
                  </p>
                  <div className="mt-8 flex items-center text-brand-accent text-sm tracking-wide group-hover:translate-x-1 transition-transform duration-300">
                    <span>Vezi galeria</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>

              {/* Card: Mobilier la comandă */}
              <Link
                href="/configurator"
                className="group relative bg-[#2A231C] overflow-hidden transition-all duration-500 hover:shadow-xl"
              >
                <div className="p-10 md:p-14 flex flex-col justify-between min-h-[320px]">
                  <div>
                    <p className="text-xs tracking-[0.3em] uppercase text-[#C09850] mb-4">
                      Mobilier la comandă
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl font-light text-white leading-[1.15] tracking-[-0.005em]">
                      Design, proiectare, execuție.
                    </h3>
                  </div>
                  <p className="text-[0.95rem] leading-[1.75] text-white/60 mt-6 max-w-sm">
                    Răbdare și profesionalism în fiecare etapă pentru mobilierul creat 
                    la milimetru, cu precizie, pe gustul tău.
                  </p>
                  <div className="mt-8 flex items-center text-[#C09850] text-sm tracking-wide group-hover:translate-x-1 transition-transform duration-300">
                    <span>Configurează acum</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Section 3: Features ── */}
        <section className="bg-[#F7F4EF]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24 md:py-36">
            <div className="text-center mb-20">
              <p className="text-sm tracking-[0.3em] uppercase text-brand-accent mb-5">
                De ce milimetric
              </p>
              <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-light text-[#2A231C] leading-[1.15]">
                Mobilier făcut cum trebuie
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-10 lg:gap-x-14">
              {features.map((feature, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="text-brand-accent mb-5 flex justify-center lg:justify-start">
                    {feature.icon}
                  </div>
                  <h3 className="text-[1.05rem] font-medium text-[#2A231C] mb-2.5 tracking-[-0.005em]">
                    {feature.title}
                  </h3>
                  <p className="text-[0.9rem] leading-[1.75] text-[#807468]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 4: Categories grid ── */}
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24 md:py-36">
            <div className="text-center mb-20">
              <p className="text-sm tracking-[0.3em] uppercase text-brand-accent mb-5">
                Catalog
              </p>
              <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-light text-[#2A231C] leading-[1.15]">
                Ce dorești să configurezi?
              </h2>
              <p className="mt-5 text-[0.95rem] leading-[1.75] text-[#807468] max-w-lg mx-auto">
                Alege categoria de mobilier și începe configurarea pas cu pas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {furnitureCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalog?categorie=${cat.id}`}
                  className="group relative border border-[#E8E2DA] hover:border-brand-accent/40 bg-white p-8 transition-all duration-400 hover:shadow-lg"
                >
                  <div className="text-3xl mb-5">{cat.icon}</div>
                  <h3 className="text-[1.05rem] font-medium text-[#2A231C] group-hover:text-brand-accent transition-colors duration-300 mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-[0.85rem] leading-[1.7] text-[#9A8E82]">
                    {cat.description}
                  </p>
                  <div className="mt-6 flex items-center text-xs text-brand-accent tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Configurează</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 5: Process steps ── */}
        <section className="bg-[#F7F4EF]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24 md:py-36">
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-20">
              {/* Left — heading */}
              <div className="lg:w-1/3 mb-14 lg:mb-0 lg:sticky lg:top-32">
                <p className="text-sm tracking-[0.3em] uppercase text-brand-accent mb-5">
                  Procesul nostru
                </p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-light text-[#2A231C] leading-[1.15]">
                  Cum funcționează
                </h2>
                <p className="mt-5 text-[0.95rem] leading-[1.75] text-[#807468]">
                  Patru pași simpli de la idee la mobilierul montat la tine acasă.
                </p>
                <Link
                  href="/configurator"
                  className="inline-flex items-center mt-8 text-brand-accent text-sm tracking-wide hover:translate-x-1 transition-transform duration-300"
                >
                  <span>Începe configurarea</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Right — steps */}
              <div className="lg:w-2/3 space-y-0">
                {processSteps.map((step, i) => (
                  <div
                    key={i}
                    className="flex gap-6 md:gap-8 py-8 border-b border-[#DDD6CC] last:border-b-0"
                  >
                    <span className="font-display text-4xl md:text-5xl text-[#D5CCBF] leading-none mt-1 select-none flex-shrink-0 w-14 md:w-16">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="text-[1.1rem] font-medium text-[#2A231C] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[0.9rem] leading-[1.75] text-[#807468]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 6: Testimonials ── */}
        <section className="bg-[#2A231C]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24 md:py-36">
            <div className="text-center mb-20">
              <p className="text-sm tracking-[0.3em] uppercase text-[#C09850] mb-5">
                Recenzii
              </p>
              <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-light text-white leading-[1.15]">
                Clienții noștri îți spun de ce<br className="hidden md:block" />
                au ales să lucreze cu noi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="bg-white/[0.04] border border-white/[0.06] p-8 md:p-10 flex flex-col"
                >
                  <Quote className="w-5 h-5 text-[#C09850]/50 mb-6 flex-shrink-0" />
                  <p className="text-[0.95rem] leading-[1.8] text-white/70 italic flex-1">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="mt-8 pt-6 border-t border-white/[0.06]">
                    <p className="text-white/90 text-[0.9rem] font-medium">{testimonial.name}</p>
                    <p className="text-white/35 text-xs mt-1">{testimonial.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 7: CTA ── */}
        <section className="bg-white">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-28 md:py-40 text-center">
            <p className="text-sm tracking-[0.3em] uppercase text-brand-accent mb-6">
              Gata să începi?
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.8rem)] font-light leading-[1.1] text-[#2A231C] tracking-[-0.01em]">
              Configurează-ți mobilierul<br />
              <em className="italic text-brand-accent">chiar acum.</em>
            </h2>
            <p className="mt-6 text-[0.95rem] leading-[1.75] text-[#807468] max-w-lg mx-auto">
              Folosește configuratorul nostru 3D sau contactează-ne pentru o consultație gratuită.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/configurator" className="btn-primary text-sm">
                Deschide configuratorul
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/contact" className="btn-secondary text-sm">
                Consultație gratuită
              </Link>
            </div>
          </div>
        </section>

      </div>{/* end post-hero wrapper */}
    </div>
  );
}
