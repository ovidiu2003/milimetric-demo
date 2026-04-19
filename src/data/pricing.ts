import { FurnitureConfig, PriceBreakdown, FurnitureCategory } from '@/types';
import { getMaterialById } from './materials';
import { fronts, bases, additionalOptions } from './catalog';

// Base prices per cubic centimeter based on category
const basePricesPerCm3: Record<FurnitureCategory, number> = {
  'biblioteci': 0.0018,
  'comode': 0.0022,
  'dulapuri': 0.0025,
  'dressing': 0.0028,
  'mese': 0.0030,
  'masute-cafea': 0.0028,
  'suspendat': 0.0024,
  'hol': 0.0020,
};

// Minimum prices per category
const minimumPrices: Record<FurnitureCategory, number> = {
  'biblioteci': 350,
  'comode': 400,
  'dulapuri': 500,
  'dressing': 700,
  'mese': 300,
  'masute-cafea': 200,
  'suspendat': 250,
  'hol': 350,
};

export function calculatePrice(config: FurnitureConfig): PriceBreakdown {
  const { dimensions, category, bodyMaterialId, frontMaterialId, compartments, fronts: configFronts, baseType, backPanel, additionalOptions: selectedOptions } = config;

  // 1. Calculate body price based on volume
  const volume = dimensions.width * dimensions.height * dimensions.depth;
  const baseBodyPrice = volume * basePricesPerCm3[category];

  // Apply material multiplier
  const bodyMaterial = getMaterialById(bodyMaterialId);
  const bodyMultiplier = bodyMaterial?.priceMultiplier || 1.0;
  const bodyPrice = Math.max(baseBodyPrice * bodyMultiplier, minimumPrices[category]);

  // 2. Calculate compartment shelves price
  const totalCompartments = compartments.rows.reduce((sum, r) => sum + r, 0);
  const shelfPrice = totalCompartments * 15 * bodyMultiplier; // 15 RON per shelf/divider

  // 3. Calculate fronts price
  let frontPrice = 0;
  const frontMaterial = getMaterialById(frontMaterialId);
  const frontMultiplier = frontMaterial?.priceMultiplier || 1.0;

  if (configFronts && configFronts.length > 0) {
    configFronts.forEach(cf => {
      const frontDef = fronts.find(f => f.type === cf.frontType);
      if (frontDef) {
        frontPrice += frontDef.pricePerUnit * frontMultiplier;
      }
    });
  }

  // 4. Calculate base price
  const baseDef = bases.find(b => b.id === baseType);
  const basePrice = baseDef?.priceAdd || 0;

  // 5. Back panel price
  const backPanelPrice = backPanel ? 40 * bodyMultiplier : 0;

  // 6. Additional options price
  let additionalOptionsPrice = 0;
  if (selectedOptions && selectedOptions.length > 0) {
    selectedOptions.forEach(optId => {
      const opt = additionalOptions.find(o => o.id === optId);
      if (opt) {
        additionalOptionsPrice += opt.price;
      }
    });
  }

  // 7. Calculate total
  const totalBeforeDiscount = bodyPrice + shelfPrice + frontPrice + basePrice + backPanelPrice + additionalOptionsPrice;

  // Volume discount
  let discountPercent = 0;
  if (totalBeforeDiscount >= 15000) discountPercent = 0.15;
  else if (totalBeforeDiscount >= 10000) discountPercent = 0.12;
  else if (totalBeforeDiscount >= 7500) discountPercent = 0.10;
  else if (totalBeforeDiscount >= 5000) discountPercent = 0.08;
  else if (totalBeforeDiscount >= 3000) discountPercent = 0.05;
  else if (totalBeforeDiscount >= 1500) discountPercent = 0.03;

  const discount = totalBeforeDiscount * discountPercent;
  const total = totalBeforeDiscount - discount;

  return {
    bodyPrice: Math.round(bodyPrice + shelfPrice),
    frontPrice: Math.round(frontPrice),
    basePrice: Math.round(basePrice),
    backPanelPrice: Math.round(backPanelPrice),
    additionalOptionsPrice: Math.round(additionalOptionsPrice),
    totalBeforeDiscount: Math.round(totalBeforeDiscount),
    discount: Math.round(discount),
    total: Math.round(total),
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getDeliveryEstimate(config: FurnitureConfig): string {
  const bodyMaterial = getMaterialById(config.bodyMaterialId);
  if (bodyMaterial?.type === 'lemn-masiv') {
    return '8-12 săptămâni';
  }
  if (bodyMaterial?.type === 'furnir') {
    return '6-10 săptămâni';
  }
  return '4-8 săptămâni';
}
