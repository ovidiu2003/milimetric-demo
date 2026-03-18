'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, ArrowRight } from 'lucide-react';

const navigation = [
  { name: 'Acasă', href: '/' },
  { name: 'Catalog', href: '/catalog' },
  { name: 'Despre Noi', href: '/despre-noi' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-brand-dark text-brand-cream/70 text-xs tracking-wide py-2 hidden md:block">
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
          <span className="text-brand-cream/35 italic font-display text-[0.8rem] tracking-display">
            precizie pe gustul tău
          </span>
        </div>
      </div>

      {/* ═══ Modern Navbar ═══ */}
      <header
        className={`nav-header sticky top-0 z-50 ${
          scrolled ? 'nav-header--scrolled' : ''
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-[4.2rem] md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-baseline gap-0.5 group relative z-10">
              <span className="font-display text-[1.75rem] md:text-[2.1rem] font-semibold tracking-[-0.01em] text-brand-dark transition-colors duration-300 group-hover:text-brand-accent">
                milimetric
              </span>
              <span className="text-[0.7rem] md:text-[0.8rem] font-medium text-brand-accent tracking-wide">.ro</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              <nav className="nav-pill-group flex items-center gap-1 p-1.5 rounded-full">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-pill relative px-5 py-2.5 text-[0.9rem] tracking-[0.01em] font-medium rounded-full transition-all duration-300 ${
                      isActive(item.href)
                        ? 'text-brand-accent'
                        : 'text-brand-dark/55 hover:text-brand-dark'
                    }`}
                  >
                    {isActive(item.href) && (
                      <span className="nav-pill-bg" />
                    )}
                    <span className="relative z-[1]">{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* CTA */}
              <Link
                href="/configurator/corp-living-suspendat"
                className="nav-cta ml-2"
              >
                <span>Configurator</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden relative z-10 w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 ${
                mobileMenuOpen
                  ? 'bg-brand-dark/5 text-brand-accent'
                  : 'text-brand-dark/70 hover:bg-brand-dark/[0.04]'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 nav-mobile-menu transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
          }`}
        >
          <div className="section-container py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3.5 text-[0.95rem] font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-brand-accent bg-brand-accent/[0.06]'
                      : 'text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/[0.03]'
                  }`}
                >
                  {isActive(item.href) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                  )}
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 mt-3 border-t border-brand-dark/[0.06]">
              <Link
                href="/configurator/corp-living-suspendat"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-cta w-full justify-center text-[0.9rem]"
              >
                <span>Deschide Configuratorul</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
