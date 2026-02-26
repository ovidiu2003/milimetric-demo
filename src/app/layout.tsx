import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://milimetric.ro'),
  title: 'milimetric — Mobilier la Comandă',
  description: 'Mobilier creat cu răbdare și precizie, pe gustul tău. Configurează-ți mobilierul perfect — biblioteci, comode, dulapuri, mese — totul la comandă, la milimetru.',
  keywords: 'mobilier la comandă, configurator mobilier, mobilier personalizat, biblioteci, dulapuri, comode, mese, România',
  openGraph: {
    title: 'milimetric — Mobilier la Comandă',
    description: 'Nu ne grăbim. Facem lucrurile bine. Mobilier artizanal, configurat pe gustul tău.',
    url: 'https://milimetric.ro',
    siteName: 'milimetric',
    locale: 'ro_RO',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        {/* Blocking script: detect homepage before first paint to prevent header flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(location.pathname==='/'){document.documentElement.classList.add('is-homepage')}`,
          }}
        />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
