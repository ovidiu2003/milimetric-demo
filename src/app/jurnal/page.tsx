'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

const blogPosts = [
  {
    slug: 'cum-sa-alegi-mobilierul-de-care-ai-nevoie',
    title: 'Cum să alegi mobilierul de care ai nevoie',
    excerpt: 'Atunci când vine vorba de alegerea mobilierului, mulți dintre noi ne lăsăm duși de val: vedem o piesă frumoasă, o comandăm impulsiv, și apoi descoperim că nu se potrivește. Iată ghidul nostru complet.',
    date: '2025-12-15',
    readTime: '8 min',
    tags: ['ghid', 'sfaturi', 'mobilier'],
    category: 'Ghiduri',
  },
  {
    slug: 'practic-si-sigur-pentru-tine-si-copilul-tau',
    title: 'Practic și sigur pentru tine și copilul tău',
    excerpt: 'Atunci când îți mobilezi locuința, investești nu doar în aspect, ci și în funcționalitate, durabilitate și siguranță. Iar dacă ai un copil, știi deja că mobilierul trebuie gândit diferit.',
    date: '2025-11-28',
    readTime: '6 min',
    tags: ['copii', 'siguranță', 'mobilier'],
    category: 'Sfaturi',
  },
  {
    slug: 'de-ce-sa-alegi-o-bucatarie-personalizata',
    title: 'De ce să alegi o bucătărie personalizată pe gustul tău',
    excerpt: 'Alegerea unei bucătării personalizate poate fi o aventură palpitantă, dar și o provocare. Este esențial să ții cont de câteva aspecte cheie pentru a obține un spațiu perfect.',
    date: '2025-11-10',
    readTime: '7 min',
    tags: ['bucătărie', 'personalizare', 'design'],
    category: 'Design',
  },
  {
    slug: 'tendinte-mobilier-2026',
    title: 'Tendințe în mobilier pentru 2026',
    excerpt: 'Descoperă cele mai noi tendințe în mobilier pentru anul 2026: materiale naturale, culori calde, design multifuncțional și sustenabilitate.',
    date: '2025-10-20',
    readTime: '10 min',
    tags: ['tendințe', 'design', '2026'],
    category: 'Tendințe',
  },
  {
    slug: 'cum-ne-calculam-preturile',
    title: 'Cum ne calculăm prețurile — Transparență totală',
    excerpt: 'La milimetric.ro credem în transparență. Aflați cum sunt calculate prețurile mobilierului nostru la comandă, ce factori influențează costul și cum optimizați bugetul.',
    date: '2025-09-15',
    readTime: '5 min',
    tags: ['prețuri', 'transparență', 'ghid'],
    category: 'Informații',
  },
  {
    slug: 'ghid-materiale-lemn-masiv-vs-mdf',
    title: 'Ghid Materiale: Lemn Masiv vs MDF vs PAL',
    excerpt: 'Care sunt diferențele reale între lemn masiv, MDF și PAL? Când să alegi fiecare material și cum influențează prețul, durabilitatea și aspectul mobilierului tău.',
    date: '2025-08-22',
    readTime: '12 min',
    tags: ['materiale', 'lemn', 'mdf', 'ghid'],
    category: 'Ghiduri',
  },
];

export default function JurnalPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <section className="bg-white border-b border-brand-beige/30">
        <div className="section-container py-10">
          <h1 className="heading-lg text-brand-dark">Jurnal</h1>
          <div className="w-12 h-px bg-brand-accent mt-4 mb-4" />
          <p className="text-brand-charcoal/50 text-sm">
            Articole, ghiduri și inspirație pentru mobilierul tău personalizat.
          </p>
        </div>
      </section>

      <div className="section-container py-10">
        {/* Featured Post — left-right alternating layout starts here */}
        <div className="card-interactive bg-white mb-12 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="aspect-[4/3] md:aspect-auto bg-brand-warm flex items-center justify-center">
              <div className="text-7xl">📖</div>
            </div>
            <div className="p-10 flex flex-col justify-center">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-xs text-brand-accent uppercase tracking-wider">
                  {blogPosts[0].category}
                </span>
                <span className="text-xs text-brand-charcoal/30 flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(blogPosts[0].date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </span>
              </div>
              <h2 className="heading-md text-brand-dark mb-4">{blogPosts[0].title}</h2>
              <p className="text-brand-charcoal/50 leading-relaxed text-sm mb-6">{blogPosts[0].excerpt}</p>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-xs text-brand-charcoal/30 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{blogPosts[0].readTime} lectură</span>
                </span>
              </div>
              <Link href={`/jurnal/${blogPosts[0].slug}`} className="btn-primary text-sm self-start">
                Citește mai mult
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Alternating left-right layout for remaining posts */}
        <div className="space-y-px bg-brand-beige/20">
          {blogPosts.slice(1).map((post, i) => (
            <article key={post.slug} className="bg-white">
              <div className={`grid md:grid-cols-2 gap-0 ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
                <div className="aspect-[3/2] bg-brand-warm flex items-center justify-center md:[direction:ltr]">
                  <div className="text-5xl">📝</div>
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center md:[direction:ltr]">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="text-xs text-brand-accent uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-xs text-brand-charcoal/30">
                      {new Date(post.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl tracking-display text-brand-dark mb-3">
                    {post.title}
                  </h3>
                  <p className="text-sm text-brand-charcoal/50 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-brand-charcoal/30 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </span>
                    <Link href={`/jurnal/${post.slug}`} className="text-brand-accent text-sm tracking-wide link-subtle">
                      Citește
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
