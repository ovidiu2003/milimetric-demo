'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ChevronLeft,
  Quote,
  Sofa,
  PenTool,
  Home,
  ImageIcon,
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
    text: 'Am avut o comunicare directă, ne-a ajutat să clarificăm toate detaliile cu multă răbdare.',
    author: 'Tihamér Juhász',
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

/* ── Journal articles ── */
const articles = [
  {
    title: 'Cum să alegi mobilierul de care ai nevoie',
    excerpt:
      'Atunci când vine vorba de alegerea mobilierului, mulți dintre noi ne lăsăm duși de val: vedem o piesă frumoasă, o comandăm impulsiv...',
    tag: 'Ghid',
  },
  {
    title: 'Practic și sigur pentru tine și copilul tău',
    excerpt:
      'Atunci când îți mobilezi locuința, investești nu doar în aspect, ci și în funcționalitate, durabilitate și siguranță...',
    tag: 'Familie',
  },
  {
    title: 'De ce să alegi o bucătărie personalizată',
    excerpt:
      'Alegerea unei bucătării personalizate poate fi o aventură palpitantă, dar și o provocare. Este esențial să ții cont de câteva aspecte cheie...',
    tag: 'Bucătărie',
  },
];

export default function HomePage() {
  const pageRef = useReveal();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  /* Auto-rotate testimonials */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={pageRef}>
      {/* ═══ HERO ═══ */}
      <section id="hero" className="relative bg-brand-dark text-brand-cream overflow-hidden min-h-screen flex items-center">
        <div className="section-container py-28 md:py-40 lg:py-48 relative z-10 w-full">
          <div className="max-w-3xl">
            <p className="hero-tag-anim text-[11px] tracking-[0.4em] uppercase text-brand-gold font-medium mb-7 opacity-0">
              precizie pe gustul tău
            </p>
            <h1 className="hero-h1-anim font-display text-[2.8rem] md:text-[4.2rem] lg:text-[5.5rem] font-light leading-[0.98] tracking-[-0.03em] text-white opacity-0">
              „În sfârșit<br />
              am ajuns{' '}
              <span className="italic text-brand-gold">acasă!"</span>
            </h1>
            <div className="hero-line-anim w-16 h-px bg-brand-gold/40 mt-9 mb-8 origin-left scale-x-0" />
            <p className="hero-sub-anim text-lg md:text-xl text-white/50 leading-relaxed max-w-xl opacity-0">
              Milimetric te ajută să faci din locul tău, acasă. De la design până la execuție,
              dăm formă nevoilor tale cu precizie, la milimetru.
            </p>
            <div className="hero-cta-anim flex flex-wrap gap-4 mt-11 opacity-0">
              <Link
                href="/configurator/corp-living-suspendat"
                className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-brand-gold text-brand-dark font-medium text-sm tracking-wide transition-all duration-300 hover:bg-[#fbe8b5] hover:shadow-lg hover:shadow-brand-gold/20"
              >
                Configurator 3D
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center px-9 py-4 border border-white/20 text-white font-medium text-sm tracking-wide transition-all duration-300 hover:bg-white/10 hover:border-white/40"
              >
                Mobilier la comandă
              </Link>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-3 opacity-0 hero-scroll-anim">
            <span className="text-[9px] tracking-[0.35em] uppercase text-brand-gold/60">Descoperă</span>
            <div className="w-px h-10 bg-gradient-to-b from-brand-gold/50 to-transparent animate-pulse" />
          </div>
        </div>
        {/* Hero background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: 'url(/media/hero.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 via-brand-dark/60 to-brand-dark/40" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-dark/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent" />
      </section>

      {/* ═══ DUAL CTA CARDS — inspired by milimetric.ro ═══ */}
      <section className="relative bg-brand-cream overflow-hidden">
        <div className="section-container py-24 md:py-36">
          <div className="reveal text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <p className="text-[11px] tracking-[0.35em] uppercase text-brand-accent font-medium mb-5">
              Milimetric te ajută
            </p>
            <h2 className="font-display text-[2.2rem] md:text-[3rem] font-light leading-[1.06] tracking-[-0.02em] text-brand-dark">
              Faci din locul tău, <span className="italic text-brand-accent">acasă</span>
            </h2>
          </div>

          <div className="reveal grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {/* Card 1 — Inspirație / Galerie */}
            <Link
              href="/catalog"
              className="group relative bg-white border border-brand-beige/30 p-10 md:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-accent/[0.06] hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent/60 to-brand-accent/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <div className="w-14 h-14 rounded-full bg-brand-accent/8 flex items-center justify-center mb-7">
                <ImageIcon className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="font-display text-[1.7rem] font-normal text-brand-dark mb-4 leading-tight">
                Inspirație
              </h3>
              <p className="text-[0.92rem] text-brand-charcoal/50 leading-relaxed mb-8">
                Nu facem doar mobilă la milimetric.ro. De la design până la execuție,
                dăm formă nevoilor tale și te ajutăm să găsești cea mai bună soluție.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-accent group-hover:gap-3 transition-all duration-300">
                Descoperă galeria
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* Card 2 — Mobilă la comandă / Configurator */}
            <Link
              href="/configurator/corp-living-suspendat"
              className="group relative bg-brand-dark text-brand-cream border border-white/[0.06] p-10 md:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-dark/20 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-gold/70 to-brand-gold/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <div className="w-14 h-14 rounded-full bg-brand-gold/10 flex items-center justify-center mb-7">
                <Sofa className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-display text-[1.7rem] font-normal text-white mb-4 leading-tight">
                Mobilă la comandă
              </h3>
              <p className="text-[0.92rem] text-white/40 leading-relaxed mb-8">
                Design, măsurători, proiectare, execuție. Răbdare și profesionalism
                în fiecare etapă pentru mobilierul creat la milimetru, cu precizie, pe gustul tău.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-gold group-hover:gap-3 transition-all duration-300">
                Deschide configuratorul
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CONFIGURATOR PROMO ═══ */}
      <section className="relative overflow-hidden border-y border-brand-beige/15">
        <Image
          src="/media/Schita.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover object-center md:object-[center_30%]"
        />
        <div className="absolute inset-0 bg-white/70 md:bg-white/55" />
        <div className="section-container py-24 md:py-36 relative z-10">
          <div className="reveal grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left – copy */}
            <div className="max-w-lg bg-white/70 backdrop-blur-sm p-8 md:p-10 rounded">
              <p className="text-[11px] tracking-[0.3em] uppercase text-brand-dark font-bold mb-5">
                Configurator 3D
              </p>
              <h2 className="font-display text-[2.4rem] md:text-[3.2rem] font-medium leading-[1.08] tracking-[-0.02em] text-brand-dark">
                Creează-ți singur <br />
                <span className="italic text-brand-accent">mobilierul perfect</span>
              </h2>
              <div className="w-12 h-px bg-brand-accent/40 mt-6 mb-7" />
              <p className="text-[0.95rem] text-brand-dark/80 leading-relaxed font-medium mb-4">
                Nu mai aștepta cataloage și listări de prețuri. Cu configuratorul nostru 3D alegi
                dimensiunile, materialele și structura — și vezi rezultatul instant, din orice unghi.
              </p>
              <p className="text-[0.95rem] text-brand-dark/80 leading-relaxed font-medium mb-9">
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

            {/* Right – feature cards */}
            <div className="relative">
              <div className="bg-white/70 backdrop-blur-sm border border-brand-beige/30 p-8 md:p-10">
                <div className="space-y-7">
                  <div className="flex items-start gap-5">
                    <div className="w-11 h-11 rounded-full bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                      <Ruler className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-dark text-[0.95rem]">Dimensiuni personalizate</p>
                      <p className="text-sm text-brand-dark/65 mt-1 leading-relaxed">
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
                      <p className="text-sm text-brand-dark/65 mt-1 leading-relaxed">
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
                      <p className="text-sm text-brand-dark/65 mt-1 leading-relaxed">
                        Rotește, mărește, explorează — vezi exact cum va arăta la tine acasă.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block absolute -bottom-6 -left-6 w-32 h-32 bg-brand-accent/5 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-brand-cream">
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
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-brand-beige/40" />
                )}
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border border-brand-beige/50 mb-5 group-hover:border-brand-accent/40 transition-colors duration-300">
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
      <section className="bg-brand-dark text-brand-cream relative overflow-hidden">
        {/* Decorative bg element */}
        <div className="absolute top-0 right-0 w-[40%] h-full opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(249,225,161,1) 40px, rgba(249,225,161,1) 41px)`,
          }}
        />
        <div className="section-container py-24 md:py-32 relative z-10">
          <div className="reveal grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-brand-gold font-medium mb-5">
                De ce milimetric
              </p>
              <h2 className="font-display text-[2rem] md:text-[2.8rem] font-light leading-[1.1] text-white">
                Mobilier creat cu răbdare <br />
                <span className="italic text-brand-gold">și precizie</span>
              </h2>
              <div className="w-12 h-px bg-brand-gold/30 mt-6 mb-7" />
              <p className="text-[0.95rem] text-white/40 leading-relaxed max-w-md">
                Nu facem mobilier de serie. Fiecare proiect este unic — de la design la montaj,
                totul este gândit pentru spațiul tău.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: <Sparkles className="w-5 h-5" />, title: 'La milimetru', desc: 'Fiecare piesă fabricată exact pe dimensiunile spațiului tău.' },
                { icon: <Palette className="w-5 h-5" />, title: 'Materialele tale', desc: 'Peste 40 de texturi și culori premium la alegere.' },
                { icon: <Shield className="w-5 h-5" />, title: 'Feronerie premium', desc: 'Blum, Hettich — doar mecanisme de top, cu garanție.' },
                { icon: <Clock className="w-5 h-5" />, title: 'Fără compromisuri', desc: 'Nu ne grăbim. Facem lucrurile bine, la fiecare proiect.' },
              ].map((b) => (
                <div
                  key={b.title}
                  className="p-6 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-300"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4">
                    <span className="text-brand-gold">{b.icon}</span>
                  </div>
                  <h3 className="text-white font-medium text-[0.95rem] mb-1.5">{b.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ JOURNAL / BLOG TEASERS ═══ */}
      <section className="bg-white">
        <div className="section-container py-24 md:py-32">
          <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-18">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-brand-accent font-medium mb-4">
                Jurnal
              </p>
              <h2 className="font-display text-[2rem] md:text-[2.8rem] font-light leading-[1.1] text-brand-dark">
                Sfaturi & <span className="italic">inspirație</span>
              </h2>
            </div>
            <Link
              href="/catalog"
              className="btn-ghost text-sm gap-1.5 group self-start"
            >
              Toate articolele
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="reveal grid md:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article, i) => (
              <article
                key={i}
                className="group border border-brand-beige/30 bg-brand-cream/30 overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Placeholder image area */}
                <div className="relative h-48 bg-gradient-to-br from-brand-beige/30 to-brand-warm overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PenTool className="w-8 h-8 text-brand-accent/20" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-medium bg-white/80 backdrop-blur-sm text-brand-accent">
                      {article.tag}
                    </span>
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="font-display text-[1.25rem] font-normal text-brand-dark mb-3 leading-snug group-hover:text-brand-accent transition-colors duration-300">
                    {article.title}
                  </h3>
                  <p className="text-[0.88rem] text-brand-charcoal/45 leading-relaxed mb-5 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-accent group-hover:gap-2.5 transition-all duration-300">
                    Vezi detalii
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS — carousel style ═══ */}
      <section className="bg-brand-warm relative overflow-hidden">
        {/* Decorative quote marks */}
        <div className="absolute top-16 left-8 font-display text-[12rem] leading-none text-brand-accent/[0.04] pointer-events-none select-none">
          &ldquo;
        </div>
        <div className="section-container py-24 md:py-32 relative z-10">
          <div className="reveal text-center max-w-xl mx-auto mb-14 md:mb-18">
            <p className="text-[11px] tracking-[0.3em] uppercase text-brand-accent font-medium mb-4">
              Recenzii
            </p>
            <h2 className="font-display text-[2rem] md:text-[2.8rem] font-light leading-[1.1] text-brand-dark">
              Clienții noștri îți spun de ce au ales<br />
              <span className="italic">să lucreze cu milimetric.ro</span>
            </h2>
          </div>

          {/* Featured testimonial */}
          <div className="reveal max-w-2xl mx-auto">
            <div className="bg-white p-10 md:p-14 border border-brand-beige/30 relative">
              <Quote className="w-8 h-8 text-brand-accent/15 mb-6" />
              <div className="min-h-[120px] flex items-center">
                <p className="font-display text-[1.3rem] md:text-[1.6rem] text-brand-dark/80 leading-relaxed italic font-light">
                  &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-brand-beige/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-brand-accent/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-brand-accent">
                      {testimonials[activeTestimonial].author.split(' ').map((w) => w[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-brand-dark">{testimonials[activeTestimonial].author}</p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Navigation arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="w-10 h-10 rounded-full border border-brand-beige/40 flex items-center justify-center text-brand-charcoal/40 hover:border-brand-accent hover:text-brand-accent transition-colors duration-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                    className="w-10 h-10 rounded-full border border-brand-beige/40 flex items-center justify-center text-brand-charcoal/40 hover:border-brand-accent hover:text-brand-accent transition-colors duration-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeTestimonial
                      ? 'w-8 bg-brand-accent'
                      : 'w-1.5 bg-brand-beige hover:bg-brand-accent/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative bg-brand-cream overflow-hidden">
        <div className="section-container py-28 md:py-40 text-center relative z-10">
          <div className="reveal max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-brand-accent/8 flex items-center justify-center mx-auto mb-8">
              <Home className="w-6 h-6 text-brand-accent" />
            </div>
            <h2 className="font-display text-[2.4rem] md:text-[3.6rem] font-light leading-[1.04] tracking-[-0.02em] text-brand-dark mb-6">
              Gata să faci din locul<br />
              tău, <span className="italic text-brand-accent">acasă?</span>
            </h2>
            <p className="text-[0.95rem] text-brand-charcoal/50 leading-relaxed mb-11 max-w-md mx-auto">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-accent/[0.03] pointer-events-none" />
      </section>
    </div>
  );
}
