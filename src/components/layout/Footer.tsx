'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, ArrowUp } from 'lucide-react';

const navLinks = [
  { name: 'Acasă', href: '/' },
  { name: 'Despre noi', href: '/despre-noi' },
  { name: 'Catalog', href: '/catalog' },
];

const legalLinks = [
  { name: 'Politică de cookie-uri', href: '/cookies' },
  { name: 'Politică de confidențialitate', href: '/confidentialitate' },
  { name: 'Politică de preț', href: '/jurnal/politica-de-pret' },
  { name: 'Termeni și condiții', href: '/termeni' },
  { name: 'Întrebări frecvente', href: '/faq' },
];

const externalLinks = [
  { name: 'Soluționarea Alternativă a Litigiilor', href: 'https://anpc.ro/ce-este-sal/' },
  { name: 'Soluționarea Online a Litigiilor', href: 'https://ec.europa.eu/consumers/odr' },
];

export default function Footer() {
  const pathname = usePathname();
  const isConfigurator = pathname?.startsWith('/configurator/');
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`relative z-10 bg-[#0a0a0a] text-[#fafafa]/70${isConfigurator ? ' hidden lg:block' : ''}`}>

      {/* ── Main footer content ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-14 lg:gap-8">

          {/* Brand & contact — spans 5 cols */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center group">
              <span className="font-display text-3xl font-light tracking-[-0.02em] text-white">
                milimetric
              </span>
            </Link>
            <p className="mt-6 text-[0.9rem] leading-[1.8] text-white/40 max-w-sm">
              Mobilier creat cu răbdare și precizie, pe gustul tău. De la idee la montaj — fiecare piesă gândită pentru spațiul tău.
            </p>

            {/* Contact */}
            <div className="mt-8 space-y-3.5">
              <a
                href="mailto:comenzi@milimetric.ro"
                className="flex items-center gap-3 text-[0.9rem] text-white/50 hover:text-[#f9e1a1] transition-colors duration-300"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>comenzi@milimetric.ro</span>
              </a>
              <a
                href="tel:+40759203138"
                className="flex items-center gap-3 text-[0.9rem] text-white/50 hover:text-[#f9e1a1] transition-colors duration-300"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+40 759 203 138</span>
              </a>
              <div className="flex items-center gap-3 text-[0.9rem] text-white/35">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Miercurea-Ciuc, România</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-5 mt-8">
              <a href="https://www.facebook.com/share/16Ugetaudk/" target="_blank" rel="noopener noreferrer"
                className="text-white/25 hover:text-[#f9e1a1] transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/milimetric.ro" target="_blank" rel="noopener noreferrer"
                className="text-white/25 hover:text-[#f9e1a1] transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/milimetric-ro" target="_blank" rel="noopener noreferrer"
                className="text-white/25 hover:text-[#f9e1a1] transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Nav links — spans 3 cols */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-white/30 mb-6 font-medium">
              Navigare
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.9rem] text-white/45 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal — spans 4 cols */}
          <div className="lg:col-span-4">
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-white/30 mb-6 font-medium">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.9rem] text-white/45 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {externalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.9rem] text-white/45 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-[0.8rem] tracking-wide">
            © {new Date().getFullYear()} milimetric.ro — Toate drepturile rezervate.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-white/20 hover:text-[#f9e1a1] transition-colors duration-300 text-[0.8rem] tracking-wide"
          >
            <span>ÎNAPOI SUS</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
