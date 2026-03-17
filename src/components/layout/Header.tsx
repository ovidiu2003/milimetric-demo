'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail } from 'lucide-react';

const navigation = [
  { name: 'Acasă', href: '/' },
  { name: 'Catalog', href: '/catalog' },
  { name: 'Despre Noi', href: '/despre-noi' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const [heroMode, setHeroMode] = useState(isHomepage);
  const heroEndRef = useRef(0);

  // Sync heroMode immediately on route change (before paint)
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  useIsomorphicLayoutEffect(() => {
    if (!isHomepage) { setHeroMode(false); return; }
    // On homepage, compute hero boundary and set immediately
    const heroSpace = document.querySelector('.hero-scroll-space') as HTMLElement | null;
    heroEndRef.current = heroSpace ? heroSpace.offsetTop + heroSpace.offsetHeight : window.innerHeight * 7;
    setHeroMode(window.scrollY < heroEndRef.current);
    setScrolled(window.scrollY > 20);
  }, [isHomepage]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (isHomepage) {
        // Recalc hero boundary lazily (in case layout shifted)
        if (!heroEndRef.current) {
          const heroSpace = document.querySelector('.hero-scroll-space') as HTMLElement | null;
          heroEndRef.current = heroSpace ? heroSpace.offsetTop + heroSpace.offsetHeight : window.innerHeight * 7;
        }
        setHeroMode(window.scrollY < heroEndRef.current);
      } else {
        setHeroMode(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  // Remove the CSS-only homepage class once React has hydrated and taken over
  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.remove('is-homepage');
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Top Bar — hidden in hero mode */}
      <div className={`header-topbar bg-brand-dark text-brand-cream/70 text-xs tracking-wide py-2.5 hidden ${heroMode ? '' : 'md:block'}`}>
          <div className="section-container flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <a href="tel:+40759203138" className="flex items-center space-x-2 hover:text-brand-cream transition-colors duration-300">
                <Phone className="w-3 h-3" />
                <span>+40 759 203 138</span>
              </a>
              <a href="mailto:comenzi@milimetric.ro" className="flex items-center space-x-2 hover:text-brand-cream transition-colors duration-300">
                <Mail className="w-3 h-3" />
                <span>comenzi@milimetric.ro</span>
              </a>
            </div>
            <span className="text-brand-cream/40 italic font-display tracking-display">
              Nu ne grăbim. Facem lucrurile bine.
            </span>
          </div>
        </div>

      {/* Main Header */}
      <header
        className={`header-main sticky top-0 z-50 transition-all duration-500 ${
          heroMode
            ? 'bg-transparent'
            : scrolled
              ? 'bg-brand-cream/95 backdrop-blur-md shadow-sm'
              : 'bg-brand-cream'
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span className={`header-logo font-display text-2xl md:text-3xl font-light tracking-display transition-colors duration-500 ${heroMode ? 'text-white hero-mode-text' : 'text-brand-dark'}`}>
                milimetric
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={`header-nav-link px-4 py-2 text-sm tracking-wide transition-colors duration-300 ${
                      heroMode
                        ? isActive(item.href)
                          ? 'text-[#EDD090] hero-mode-text'
                          : 'text-white/90 hover:text-[#EDD090] hero-mode-text'
                        : isActive(item.href)
                          ? 'text-brand-accent'
                          : 'text-brand-charcoal hover:text-brand-accent'
                    }`}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
            </nav>

            {/* CTA + Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`header-mobile-btn lg:hidden p-2 transition-colors duration-300 ${heroMode ? 'text-white hover:text-[#EDD090]' : 'text-brand-dark hover:text-brand-accent'}`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Subtle border — hidden in hero mode */}
        <div className={`header-border h-px bg-brand-beige/40 ${heroMode ? 'hidden' : ''}`} />

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-brand-cream border-b border-brand-beige/40 transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <div className="section-container py-6 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-base tracking-wide transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-brand-accent'
                      : 'text-brand-charcoal hover:text-brand-accent'
                  }`}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
