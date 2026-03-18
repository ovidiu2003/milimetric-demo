'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Ruler,
  Palette,
  Eye,
  Send,
  Truck,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Quote,
} from 'lucide-react';

/* ── Intersection Observer hook for scroll-triggered reveals ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('revealed');
        }),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );
    el.querySelectorAll('.reveal').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Testimonials ── */
const testimonials = [
  {
    text: 'Termenul de livrare a fost chiar mai scurt față de ce mi-au oferit alți furnizori, ceea ce a fost un mare plus.',
    author: 'Rareș Popa',
  },
  {
    text: 'De la început, am fost impresionat de răbdarea și deschiderea lor de a asculta toate dorințele noastre.',
    author: 'Alin Cruceriu',
  },
  {
    text: 'Profesioniști! Sunt super mulțumit de toată mobila făcută de ei. Bucătăria este super, suportul excelent.',
    author: 'Vilcan Adrian',
  },
  {
    text: 'Disponibilitatea arătată încă de la prima întâlnire m-a convins să-mi proiectez mobilierul din întreaga locuință.',
    author: 'Marius Cojoc',
  },
];

/* ── Steps ── */
const steps = [
  {
    icon: <Ruler className="w-6 h-6" />,
    num: '01',
    title: 'Configurează',
    desc: 'Alege dimensiunile, structura și materialele direct în configuratorul 3D.',
  },
  {
    icon: <Eye className="w-6 h-6" />,
    num: '02',
    title: 'Vizualizează',
    desc: 'Vezi în timp real cum arată mobilierul tău, din orice unghi, cu materialele alese.',
  },
  {
    icon: <Send className="w-6 h-6" />,
    num: '03',
    title: 'Solicită oferta',
    desc: 'Trimite configurația ta și primești o ofertă detaliată, fără obligații.',
  },
  {
    icon: <Truck className="w-6 h-6" />,
    num: '04',
    title: 'Livrare & Montaj',
    desc: 'Fabricăm, livrăm și montăm — totul inclus, cu garanție.',
  },
];

/* ── Benefits ── */
const benefits = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'La milimetru',
    desc: 'Fiecare piesă fabricată exact pe dimensiunile spațiului tău.',
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: 'Materialele tale',
    desc: 'Peste 40 de texturi și culori premium la alegere.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Feronerie premium',
    desc: 'Blum, Hettich — doar mecanisme de top, cu garanție.',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Fără compromisuri',
    desc: 'Nu ne grăbim. Facem lucrurile bine, la fiecare proiect.',
  },
];

export default function HomePage() {
  const pageRef = useReveal();

  return (
    <div ref={pageRef}>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-brand-dark text-brand-cream overflow-hidden">
        <div className="section-container py-24 md:py-36 lg:py-44 relative z-10">
          <div className="max-w-3xl">
            <p className="text-[11px] tracking-[0.35em] uppercase text-[#EDD090] font-medium mb-6">
              Configurator de mobilier 3D
            </p>
            <h1 className="font-display text-[2.8rem] md:text-[4rem] lg:text-[5rem] font-light leading-[1.04] tracking-[-0.025em] text-white">
              Mobilierul tău,{' '}
              <br className="hidden sm:block" />
              <span className="italic text-[#EDD090]">creat de tine</span>
            </h1>
            <div className="w-14 h-px bg-[#EDD090]/40 mt-8 mb-7" />
            <p className="text-lg md:text-xl text-white/45 leading-relaxed max-w-xl">
              Alege dimensiunile, materialele și structura — și vezi rezultatul instant,
              în 3D. Libertatea de a-ți crea singur mobilierul perfect, la milimetru.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                href="/configurator/corp-living-suspendat"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#EDD090] text-brand-dark font-medium text-sm tracking-wide transition-all duration-300 hover:bg-[#f0d89a]"
              >
                Deschide configuratorul
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-white/25 text-white font-medium text-sm tracking-wide transition-all duration-300 hover:bg-white/10"
              >
                Vezi catalogul
              </Link>
            </div>
          </div>
        </div>
        {/* Hero background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/media/hero.png)' }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-brand-dark/65" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EDD090]/20 to-transparent" />
      </section>

      {/* ═══ CONFIGURATOR PROMO ═══ */}
      <section className="relative bg-brand-cream overflow-hidden">
        <div className="section-container py-24 md:py-36">
          <div className="reveal grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left – copy */}
            <div className="max-w-lg">
              <p className="text-[11px] tracking-[0.3em] uppercase text-brand-accent font-medium mb-5">
                Configurator 3D
              </p>
              <h2 className="font-display text-[2.4rem] md:text-[3.2rem] font-light leading-[1.08] tracking-[-0.02em] text-brand-dark">
                Creează-ți singur <br />
                <span className="italic text-brand-accent">mobilierul perfect</span>
              </h2>
              <div className="w-12 h-px bg-brand-accent/40 mt-6 mb-7" />
              <p className="text-[0.95rem] text-brand-charcoal/55 leading-relaxed mb-4">
                Nu mai aștepta cataloage și listări de prețuri. Cu configuratorul nostru 3D alegi 
                dimensiunile, materialele și structura — și vezi rezultatul instant, din orice unghi.
              </p>
              <p className="text-[0.95rem] text-brand-charcoal/55 leading-relaxed mb-9">
                Libertatea de a-ți crea propriul mobilier, la milimetru, de pe canapea.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/configurator/corp-living-suspendat"
                  className="btn-primary gap-2 text-sm"
                >
                  Deschide configuratorul
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/catalog" className="btn-secondary text-sm">
                  Vezi catalogul
                </Link>
              </div>
            </div>

            {/* Right – feature visual */}
            <div className="relative">
              <div className="config-promo-card bg-white border border-brand-beige/40 p-8 md:p-10 shadow-xl">
                {/* Decorative grid dots */}
                <div className="absolute top-4 right-4 grid grid-cols-3 gap-1.5 opacity-20">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                  ))}
                </div>
                {/* Screenshots / feature highlights */}
                <div className="space-y-7">
                  <div className="flex items-start gap-5">
                    <div className="w-11 h-11 rounded-full bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                      <Ruler className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-dark text-[0.95rem]">Dimensiuni personalizate</p>
                      <p className="text-sm text-brand-charcoal/45 mt-1 leading-relaxed">
                        Înălțime, lățime, adâncime — totul la milimetru, cu slidere intuitive.
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-brand-beige/30" />
                  <div className="flex items-start gap-5">
                    <div className="w-11 h-11 rounded-full bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                      <Palette className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-dark text-[0.95rem]">Materiale premium</p>
                      <p className="text-sm text-brand-charcoal/45 mt-1 leading-relaxed">
                        Stejar, nuc, culori RAL — alege corpul și frontul separat.
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-brand-beige/30" />
                  <div className="flex items-start gap-5">
                    <div className="w-11 h-11 rounded-full bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-dark text-[0.95rem]">Previzualizare 3D</p>
                      <p className="text-sm text-brand-charcoal/45 mt-1 leading-relaxed">
                        Rotește, mărește, explorează — vezi exact cum va arăta la tine acasă.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating accent */}
              <div className="hidden lg:block absolute -bottom-6 -left-6 w-32 h-32 bg-brand-accent/5 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-white border-y border-brand-beige/20">
        <div className="section-container py-24 md:py-32">
          <div className="reveal text-center max-w-xl mx-auto mb-16 md:mb-20">
            <p className="text-[11px] tracking-[0.3em] uppercase text-brand-accent font-medium mb-4">
              Cum funcționează
            </p>
            <h2 className="font-display text-[2rem] md:text-[2.8rem] font-light leading-[1.1] tracking-[-0.01em] text-brand-dark">
              De la idee la <span className="italic">realitate</span>
            </h2>
          </div>

          <div className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative group">
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-brand-beige/40" />
                )}
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-cream border border-brand-beige/50 mb-5 group-hover:border-brand-accent/40 transition-colors duration-300">
                    <span className="text-brand-accent">{step.icon}</span>
                  </div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-brand-accent/60 font-medium mb-2">
                    {step.num}
                  </p>
                  <h3 className="font-display text-xl font-normal text-brand-dark mb-2">{step.title}</h3>
                  <p className="text-sm text-brand-charcoal/45 leading-relaxed max-w-[240px] mx-auto">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="bg-brand-dark text-brand-cream">
        <div className="section-container py-24 md:py-32">
          <div className="reveal grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#EDD090] font-medium mb-5">
                De ce milimetric
              </p>
              <h2 className="font-display text-[2rem] md:text-[2.8rem] font-light leading-[1.1] text-white">
                Mobilier creat cu răbdare <br />
                <span className="italic text-[#EDD090]">și precizie</span>
              </h2>
              <div className="w-12 h-px bg-[#EDD090]/30 mt-6 mb-7" />
              <p className="text-[0.95rem] text-white/40 leading-relaxed max-w-md">
                Nu facem mobilier de serie. Fiecare proiect este unic — de la design la montaj, 
                totul este gândit pentru spațiul tău.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="p-6 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-300"
                >
                  <div className="w-9 h-9 rounded-full bg-[#EDD090]/10 flex items-center justify-center mb-4">
                    <span className="text-[#EDD090]">{b.icon}</span>
                  </div>
                  <h3 className="text-white font-medium text-[0.95rem] mb-1.5">{b.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="bg-brand-warm">
        <div className="section-container py-24 md:py-32">
          <div className="reveal text-center max-w-xl mx-auto mb-14 md:mb-18">
            <p className="text-[11px] tracking-[0.3em] uppercase text-brand-accent font-medium mb-4">
              Clienți mulțumiți
            </p>
            <h2 className="font-display text-[2rem] md:text-[2.8rem] font-light leading-[1.1] text-brand-dark">
              Ce spun <span className="italic">clienții noștri</span>
            </h2>
          </div>

          <div className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white p-7 border border-brand-beige/30 flex flex-col"
              >
                <Quote className="w-5 h-5 text-brand-accent/30 mb-4 flex-shrink-0" />
                <p className="text-[0.9rem] text-brand-charcoal/55 leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-5 pt-4 border-t border-brand-beige/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-brand-accent">
                      {t.author.split(' ').map((w) => w[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-dark">{t.author}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-brand-accent text-brand-accent" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative bg-brand-cream overflow-hidden">
        <div className="section-container py-24 md:py-36 text-center relative z-10">
          <div className="reveal max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.3em] uppercase text-brand-accent font-medium mb-5">
              Gata de proiectare?
            </p>
            <h2 className="font-display text-[2.2rem] md:text-[3.4rem] font-light leading-[1.06] tracking-[-0.02em] text-brand-dark mb-6">
              Creează mobilierul care<br />
              <span className="italic text-brand-accent">ți se potrivește</span>
            </h2>
            <p className="text-[0.95rem] text-brand-charcoal/50 leading-relaxed mb-10 max-w-md mx-auto">
              Deschide configuratorul, alege dimensiunile și materialele, și solicită o ofertă gratuită — totul în câteva minute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/configurator/corp-living-suspendat"
                className="btn-primary gap-2 text-sm px-10"
              >
                Începe configurarea
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/despre-noi" className="btn-ghost text-sm gap-1.5 group">
                Despre noi
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative background circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-accent/[0.03] pointer-events-none" />
      </section>
    </div>
  );
}
