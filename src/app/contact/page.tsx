'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Linkedin, CheckCircle } from 'lucide-react';

const contactInfo = [
  {
    icon: <Phone className="w-5 h-5" />,
    label: 'Telefon',
    value: '+40 759 203 138',
    href: 'tel:+40759203138',
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: 'Email',
    value: 'comenzi@milimetric.ro',
    href: 'mailto:comenzi@milimetric.ro',
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: 'Sediu',
    value: 'București, România',
    href: null,
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: 'Program',
    value: 'Luni - Vineri: 09:00 - 18:00',
    href: null,
  },
];

const socialLinks = [
  { icon: <Facebook className="w-5 h-5" />, label: 'Facebook', href: 'https://facebook.com/milimetric.ro' },
  { icon: <Instagram className="w-5 h-5" />, label: 'Instagram', href: 'https://instagram.com/milimetric.ro' },
  { icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn', href: 'https://linkedin.com/company/milimetric' },
];

const furnitureTypes = [
  'Bibliotecă / Raft',
  'Comodă / Sideboard',
  'Dulap / Garderobă',
  'Masă',
  'Măsuță de cafea',
  'Mobilier suspendat',
  'Mobilier hol',
  'Bucătărie',
  'Mobilier birou',
  'Altele',
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

export default function ContactPage() {
  const pageRef = useFadeIn();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    furnitureType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-dark text-brand-cream py-20 md:py-28">
        <div className="section-container">
          <div className="max-w-2xl">
            <h1 className="heading-xl mb-4">
              Să <span className="italic text-brand-accent">vorbim</span> despre
              proiectul tău
            </h1>
            <div className="w-12 h-px bg-brand-accent mt-6 mb-8" />
            <p className="text-lg text-brand-cream/50 leading-relaxed">
              Ai o idee sau ai nevoie de ajutor? Contactează-ne și îți vom răspunde în cel mai scurt timp.
              Consultanță gratuită pentru orice proiect.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="section-container -mt-8 relative z-10 fade-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-beige/30">
          {contactInfo.map((item, i) => (
            <div key={i} className="bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="text-brand-accent shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-brand-charcoal/40 uppercase tracking-wider mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-brand-dark font-medium hover:text-brand-accent transition-colors duration-300 text-sm">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-brand-dark font-medium text-sm">{item.value}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="section-container section-padding fade-section">
        <div className="grid lg:grid-cols-5 gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="heading-lg text-brand-dark mb-2">Trimite-ne un mesaj</h2>
            <p className="text-brand-charcoal/50 mb-10 text-sm">
              Completează formularul și te vom contacta în cel mai scurt timp posibil.
            </p>

            {submitted ? (
              <div className="bg-brand-warm border border-brand-beige/30 p-12 text-center">
                <CheckCircle className="w-12 h-12 text-brand-sage mx-auto mb-4" />
                <h3 className="heading-md text-brand-dark mb-2">Mesaj trimis cu succes</h3>
                <p className="text-brand-charcoal/50 text-sm">
                  Îți mulțumim! Te vom contacta în cel mai scurt timp posibil.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', furnitureType: '', message: '' });
                  }}
                  className="mt-6 text-brand-accent text-sm hover:underline"
                >
                  Trimite alt mesaj
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-charcoal/50 mb-2">
                      Nume complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: Ion Popescu"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-charcoal/50 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Ex: ion@email.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-charcoal/50 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Ex: 0759 203 138"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-charcoal/50 mb-2">
                      Tip mobilier
                    </label>
                    <select
                      name="furnitureType"
                      value={formData.furnitureType}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Selectează tipul...</option>
                      {furnitureTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-charcoal/50 mb-2">
                    Mesajul tău *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Descrie-ne proiectul tău: dimensiuni, materiale preferate, stil dorit..."
                    className="input-field resize-none"
                  />
                </div>

                <button type="submit" className="btn-primary text-sm">
                  <Send className="w-4 h-4 mr-2" />
                  Trimite mesajul
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map placeholder */}
            <div className="bg-white border border-brand-beige/50 overflow-hidden">
              <div className="bg-brand-warm h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-brand-accent mx-auto mb-2" />
                  <p className="font-display text-lg tracking-display text-brand-dark">București, România</p>
                  <p className="text-xs text-brand-charcoal/40 mt-1">Livrăm în toată țara</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg tracking-display text-brand-dark mb-4">Zone de livrare</h3>
                <ul className="space-y-2.5 text-sm text-brand-charcoal/60">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-sage" />
                    București — transport gratuit
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-sage" />
                    Ilfov — transport gratuit
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-sage" />
                    Restul țării — cost calculat
                  </li>
                </ul>
              </div>
            </div>

            {/* Social */}
            <div className="bg-white border border-brand-beige/50 p-6">
              <h3 className="font-display text-lg tracking-display text-brand-dark mb-4">Urmărește-ne</h3>
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-charcoal/30 hover:text-brand-accent transition-colors duration-300"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-brand-dark p-6">
              <h3 className="font-display text-lg tracking-display text-brand-cream mb-3">Preferi să suni?</h3>
              <p className="text-brand-cream/40 text-sm mb-4">
                Suntem disponibili luni - vineri, 09:00 - 18:00.
              </p>
              <a
                href="tel:+40759203138"
                className="flex items-center gap-3 border border-white/10 p-4 hover:border-brand-accent/30 transition-colors duration-300"
              >
                <Phone className="w-5 h-5 text-brand-accent" />
                <div>
                  <p className="text-brand-accent text-sm font-medium">+40 759 203 138</p>
                  <p className="text-xs text-brand-cream/30">Apel gratuit</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white section-padding fade-section">
        <div className="section-container">
          <h2 className="heading-lg text-center text-brand-dark mb-4">Întrebări frecvente</h2>
          <div className="separator mb-16" />
          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {[
              {
                q: 'Cât durează realizarea unei piese de mobilier?',
                a: 'Timpul de producție variază între 3-8 săptămâni, în funcție de complexitatea proiectului.',
              },
              {
                q: 'Oferiți consultanță gratuită?',
                a: 'Da! Discuțiile inițiale și consultanța de design sunt complet gratuite.',
              },
              {
                q: 'Ce materiale folosiți?',
                a: 'Lucrăm cu lemn masiv, MDF vopsit și lacuit, PAL melaminat și furnir natural, toate de calitate premium.',
              },
              {
                q: 'Livrați în toată România?',
                a: 'Da, livrăm și montăm în toată România. Transport gratuit în București și Ilfov.',
              },
              {
                q: 'Cum funcționează procesul de comandă?',
                a: 'Configurezi online sau ne contactezi, stabilim detaliile, semnăm contractul cu un avans de 50%, fabricăm și livrăm.',
              },
              {
                q: 'Oferiți garanție?',
                a: 'Da, toate produsele noastre vin cu garanție de 2 ani. Folosim feronerie Blum și Hettich cu garanție pe viață.',
              },
            ].map((faq, i) => (
              <div key={i} className="space-y-2">
                <h3 className="font-display text-lg tracking-display text-brand-dark">{faq.q}</h3>
                <p className="text-brand-charcoal/50 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
