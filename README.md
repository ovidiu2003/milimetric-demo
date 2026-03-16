# Milimetric — Configurator de mobilier la comandă

**Milimetric** este o aplicație web modernă care permite clienților să configureze și să vizualizeze mobilier personalizat în timp real, obținând instant un deviz de preț și un PDF cu specificațiile complete.

---

## Despre proiect

Aplicația combină un configurator interactiv 3D cu un site de prezentare, oferind o experiență completă de la inspirație până la comandă. Numele „Milimetric" reflectă precizia cu care fiecare piesă de mobilier este proiectată și executată la milimetru.

### Ce poate fi configurat

Utilizatorul poate personaliza 7 categorii de mobilier:

- **Biblioteci & Rafturi**
- **Comode & Sideboarduri**
- **Dulapuri & Garderobere**
- **Mese** (dining / birou)
- **Măsuțe de cafea**
- **Mobilier Suspendat**
- **Mobilier Hol**

Există și un configurator dedicat pentru **Corp Living Suspendat** — un sistem complex de mobilier de perete cu corpuri orizontale, turnuri verticale și opțiuni de oglindire stânga/dreapta.

### Funcționalități principale

- **Vizualizare 3D în timp real** — modelul se actualizează instant pe măsură ce utilizatorul modifică dimensiunile, compartimentele sau materialele.
- **Configurare pas cu pas** — wizard multi-etapă: categorie → dimensiuni → compartimente → fronturi → materiale → soclu → opțiuni suplimentare → sumar.
- **Calcul dinamic de preț** — prețul se calculează în funcție de volum, material, număr de compartimente, fronturi, soclu și opțiuni, cu reduceri de volum aplicate automat.
- **Export PDF** — generare automată de ofertă/deviz în format PDF cu toate specificațiile și prețul detaliat.
- **Site de prezentare integrat** — pagini de catalog, galerie, blog, contact și despre noi.

### Materiale disponibile

Peste 20 de opțiuni de material, printre care:

- Lemn masiv (stejar, nuc, fag, mesteacăn, frasin, cireș, pin, tei)
- MDF vopsit (culori standard + RAL personalizat)
- Furnir natural
- PAL melaminat
- Lacuit mat / lucios

---

## Tehnologii folosite

| Categorie | Tehnologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, TypeScript, Tailwind CSS |
| 3D | Three.js, React Three Fiber, Drei |
| Animații | Framer Motion |
| State management | Zustand |
| PDF | jsPDF |
| Iconițe | Lucide React |
| Deploy | Netlify |

---

## Structura proiectului

```
src/
├── app/                  # Pagini Next.js (App Router)
│   ├── configurator/     # Configurator per categorie + Corp Living Suspendat
│   ├── catalog/          # Catalog produse
│   ├── galerie/          # Galerie proiecte
│   ├── contact/          # Formular contact
│   ├── jurnal/           # Blog
│   └── despre-noi/       # Despre companie
├── components/           # Componente React
│   ├── configurator/     # Canvas 3D, panou configurare, modele 3D
│   └── layout/           # Header, Footer
├── store/                # State global (Zustand)
├── data/                 # Catalog, materiale, logică de prețuri
├── types/                # Tipuri TypeScript
└── utils/                # Export PDF
```

---

## Rulare locală

```bash
npm install
npm run dev
```

Aplicația va fi disponibilă la [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de producție
npm run lint    # verificare cod
```
