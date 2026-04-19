// ===== FURNITURE TYPES =====

export type FurnitureCategory =
  | 'biblioteci'      // Bookcases & Shelving
  | 'comode'          // Cabinets & Sideboards
  | 'dulapuri'        // Closets, Cupboards & Wardrobes
  | 'dressing'        // Dressing Rooms & Walk-in Closets
  | 'mese'            // Tables
  | 'masute-cafea'    // Coffee Tables
  | 'suspendat'       // Hanging/Wall-mount Furniture
  | 'hol';            // Hallway Storage

export interface FurnitureCategoryInfo {
  id: FurnitureCategory;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  image: string;
  maxWidth: number;
  maxHeight: number;
  maxDepth: number;
  minWidth: number;
  minHeight: number;
  minDepth: number;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  hasBase: boolean;
  hasFronts: boolean;
  hasCompartments: boolean;
  configuratorPath: string;
}

// ===== DIMENSIONS =====

export interface Dimensions {
  width: number;   // cm
  height: number;  // cm
  depth: number;   // cm
}

// ===== MATERIALS =====

export type MaterialType = 'lemn-masiv' | 'mdf-vopsit' | 'pal-melaminat' | 'furnir' | 'mdf-lacuit';

export type WoodType =
  | 'stejar'      // Oak
  | 'nuc'         // Walnut
  | 'fag'         // Beech
  | 'mesteacan'   // Birch
  | 'frasin'      // Ash
  | 'cires'       // Cherry
  | 'pin'         // Pine
  | 'tei';        // Linden

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  woodType?: WoodType;
  color: string;        // Hex color for preview
  textureUrl?: string;
  priceMultiplier: number;
  description: string;
  category: 'body' | 'front' | 'both';
}

// ===== FRONTS (DOORS, DRAWERS) =====

export type FrontType = 'none' | 'usa' | 'sertar' | 'usa-sticla' | 'usa-oglinda' | 'clapa';

export interface Front {
  id: string;
  type: FrontType;
  name: string;
  icon: string;
  pricePerUnit: number;
  applicableCategories: FurnitureCategory[];
}

export interface CompartmentFront {
  row: number;
  col: number;
  frontType: FrontType;
  materialId?: string;
}

// ===== COMPARTMENTS =====

export interface CompartmentConfig {
  columns: number;
  rows: number[];        // rows per column
  columnWidths: number[]; // relative widths
  rowHeights: number[][]; // relative heights per column
}

// ===== BASE TYPES =====

export type BaseType = 'picioare' | 'plinta' | 'cadru' | 'rotile' | 'suspendat' | 'none';

export interface Base {
  id: BaseType;
  name: string;
  icon: string;
  height: number;  // cm
  priceAdd: number;
  applicableCategories: FurnitureCategory[];
}

// ===== ADDITIONAL OPTIONS =====

export interface AdditionalOption {
  id: string;
  name: string;
  description: string;
  price: number;
  selected: boolean;
  icon: string;
}

// ===== FURNITURE CONFIGURATION STATE =====

export interface FurnitureConfig {
  category: FurnitureCategory;
  dimensions: Dimensions;
  bodyMaterialId: string;
  frontMaterialId: string;
  compartments: CompartmentConfig;
  fronts: CompartmentFront[];
  baseType: BaseType;
  baseHeight: number;
  backPanel: boolean;
  backPanelMaterialId?: string;
  additionalOptions: string[];  // ids of selected options
  // Table specific
  tableShape?: 'dreptunghi' | 'oval' | 'rotund' | 'patrat';
  tableExtensible?: boolean;
  legStyle?: string;
}

// ===== PRICING =====

export interface PriceBreakdown {
  bodyPrice: number;
  frontPrice: number;
  basePrice: number;
  backPanelPrice: number;
  additionalOptionsPrice: number;
  totalBeforeDiscount: number;
  discount: number;
  total: number;
}

// ===== CATALOG =====

export interface CatalogItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  description: string;
  imageUrl: string;
  images: string[];
  basePrice: number;
  dimensions: Dimensions;
  material: string;
  isCustomizable: boolean;
  configPreset?: Partial<FurnitureConfig>;
  configuratorPath?: string; // Override default /configurator/{category} route
  featured: boolean;
  deliveryWeeks: string;
  tags: string[];
}

// ===== LIVING UNIT CONFIGURATOR =====

export interface LivingUnitConfig {
  // ── Corp orizontal (comoda) ──
  suspensionHeight: number;  // cm — distance from floor to comoda bottom
  comodaHeight: number;      // cm — height of horizontal comoda
  comodaWidth: number;       // cm — width of the comoda (independent of tower)
  comodaColumns: number;     // number of drawer compartments

  // ── Corp vertical (tower = raft + dulap) ──
  raftWidth: number;         // cm — width of open shelving column
  dulapWidth: number;        // cm — width of closed cabinet
  openShelfCount: number;    // number of adjustable shelves in the open vertical body

  // Overall dimensions
  totalWidth: number;        // cm — total width = max(comodaWidth, tower) — auto-calculated
  totalHeight: number;       // cm — total height (floor to tower top)
  depth: number;             // cm — depth of the unit

  // Layout
  mirrored: boolean;         // tower on left (true) or right (false)

  // Materials
  bodyMaterialId: string;    // material for body + comoda fronts + shelving
  frontMaterialId: string;   // material for dulap front (door)
}

// ===== DRESSING UNIT CONFIGURATOR =====

export type DressingInteriorType = 'bara-raft' | 'rafturi' | 'mixt' | 'rafturi-deschise';

export type DressingSectionType = 'drawers' | 'shelves' | 'hanging-rod' | 'empty';

export interface DressingModuleSection {
  id: string;                         // unique stable id (timestamp/random)
  type: DressingSectionType;
  heightCm: number;                   // cm — allocated vertical space
  drawerCount?: number;               // only for 'drawers' (1..5)
  shelfCount?: number;                // only for 'shelves' (0..6, interior shelves)
}

export interface DressingModuleConfig {
  width: number;                      // cm — individual module width (80..120)
  interiorType: DressingInteriorType; // interior layout quick-preset (regenerates sections)
  sections?: DressingModuleSection[]; // custom vertical sections (bottom-to-top)
  hasDoors: boolean;                  // closed with doors (vertical handle) or open
  hasTopCompartment: boolean;         // optional small storage box above main body
  topCompartmentHeight: number;       // cm — height of the top compartment (30..60)
}

export type DressingSidePosition = 'none' | 'left' | 'right' | 'both';

export type DressingSideLayout = 'uniform' | 'asimetric' | 'galerie' | 'vitrina';

export interface DressingSideShelvesConfig {
  position: DressingSidePosition;     // pe ce parte se ataseaza biblioteca laterala
  columns: number;                    // 1 sau 2 coloane inguste (per side)
  columnWidth: number;                // cm — latimea unei coloane (20..40)
  shelfCount: number;                 // numar de rafturi vizibile per coloana (3..8)
  layout: DressingSideLayout;         // aranjamentul politelor
}

export interface DressingUnitConfig {
  // Modules
  moduleCount: number;       // number of modules side-by-side (1..6)
  modules: DressingModuleConfig[]; // per-module settings, length == moduleCount

  // Optional side shelving extension (biblioteca laterala)
  sideShelves: DressingSideShelvesConfig;

  // Overall dimensions (totalWidth is auto = sum of module widths + side shelves)
  totalWidth: number;        // cm — auto-calculated
  totalHeight: number;       // cm — floor to top (including plinth + top compartment if any)
  depth: number;             // cm — depth of the unit
  plinthHeight: number;      // cm — base plinth height (0 = no plinth)

  // Materials
  bodyMaterialId: string;
  frontMaterialId: string;
}

// ===== BLOG / JOURNAL =====

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string;
  author: string;
  tags: string[];
}

// ===== TESTIMONIALS =====

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  source: string;
  sourceUrl: string;
}

// ===== GALLERY =====

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: FurnitureCategory;
  description: string;
  dimensions?: string;
  material?: string;
}
