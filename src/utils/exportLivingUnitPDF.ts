import jsPDF from 'jspdf';
import { LivingUnitConfig } from '@/types';
import { getMaterialById } from '@/data/materials';
import { calculateLivingUnitPrice } from '@/store/livingUnitStore';

const PANEL_THICKNESS = 1.8;
const BACK_PANEL_THICKNESS = PANEL_THICKNESS / 2;
const FRONT_JOINT_GAP = 0;
const TOP_FRONT_OVERHANG = 1.0;

interface PieceInfo {
  name: string;
  length: number;
  width: number;
  thickness: number;
  qty: number;
  material: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function getMaterialCode(id: string): string {
  const material = getMaterialById(id);
  if (!material) return 'N/A';
  return material.id !== material.name ? material.id : material.name;
}

function getDeliveryEstimate(config: LivingUnitConfig): string {
  const bodyMat = getMaterialById(config.bodyMaterialId);
  if (bodyMat?.type === 'lemn-masiv') return '10-14 saptamani';
  if (bodyMat?.type === 'furnir') return '8-12 saptamani';
  return '6-10 saptamani';
}

function getLivingDerivedDimensions(config: LivingUnitConfig) {
  const t = PANEL_THICKNESS;
  const towerHeight = config.totalHeight - config.suspensionHeight - config.comodaHeight;
  const towerWidth = config.raftWidth + config.dulapWidth;
  const comodaModuleWidth = config.comodaWidth / config.comodaColumns;
  const comodaModuleInnerWidth = comodaModuleWidth - 2 * t;
  const drawerFrontWidth = comodaModuleWidth - FRONT_JOINT_GAP;
  const drawerFrontHeight = config.comodaHeight;
  const openShelfWidth = config.raftWidth - 2 * t;

  return {
    t,
    towerHeight,
    towerWidth,
    comodaModuleWidth,
    comodaModuleInnerWidth,
    drawerFrontWidth,
    drawerFrontHeight,
    openShelfWidth,
  };
}

function generateLivingPiecesList(config: LivingUnitConfig): PieceInfo[] {
  const d = getLivingDerivedDimensions(config);
  const bodyMaterial = getMaterialCode(config.bodyMaterialId);
  const frontMaterial = getMaterialCode(config.frontMaterialId);

  const pieces: PieceInfo[] = [
    {
      name: 'Comoda modul - panou superior',
      length: round1(d.comodaModuleInnerWidth),
      width: config.depth,
      thickness: d.t,
      qty: config.comodaColumns,
      material: bodyMaterial,
    },
    {
      name: 'Comoda - blat comun',
      length: round1(config.comodaWidth),
      width: round1(config.depth + TOP_FRONT_OVERHANG),
      thickness: d.t,
      qty: 1,
      material: bodyMaterial,
    },
    {
      name: 'Comoda modul - panou inferior',
      length: round1(d.comodaModuleInnerWidth),
      width: config.depth,
      thickness: d.t,
      qty: config.comodaColumns,
      material: bodyMaterial,
    },
    {
      name: 'Comoda modul - laterala',
      length: config.depth,
      width: config.comodaHeight,
      thickness: d.t,
      qty: config.comodaColumns * 2,
      material: bodyMaterial,
    },
    {
      name: 'Comoda modul - panou spate',
      length: round1(d.comodaModuleInnerWidth),
      width: round1(config.comodaHeight - 2 * d.t),
      thickness: BACK_PANEL_THICKNESS,
      qty: config.comodaColumns,
      material: bodyMaterial,
    },
  ];

  pieces.push({
    name: 'Comoda - front sertar',
    length: round1(d.drawerFrontWidth),
    width: round1(d.drawerFrontHeight),
    thickness: BACK_PANEL_THICKNESS,
    qty: config.comodaColumns,
    material: bodyMaterial,
  });

  pieces.push(
    {
      name: 'Raft deschis - laterala',
      length: config.depth,
      width: round1(d.towerHeight),
      thickness: d.t,
      qty: 2,
      material: bodyMaterial,
    },
    {
      name: 'Raft deschis - panou superior',
      length: round1(config.raftWidth - 2 * d.t),
      width: config.depth,
      thickness: d.t,
      qty: 1,
      material: bodyMaterial,
    },
    {
      name: 'Raft deschis - panou spate',
      length: round1(config.raftWidth - 2 * d.t),
      width: round1(d.towerHeight - d.t),
      thickness: BACK_PANEL_THICKNESS,
      qty: 1,
      material: bodyMaterial,
    },
    {
      name: 'Dulap - laterala',
      length: config.depth,
      width: round1(d.towerHeight),
      thickness: d.t,
      qty: 2,
      material: bodyMaterial,
    },
    {
      name: 'Dulap - panou superior',
      length: round1(config.dulapWidth - 2 * d.t),
      width: config.depth,
      thickness: d.t,
      qty: 1,
      material: bodyMaterial,
    },
    {
      name: 'Dulap - panou spate',
      length: round1(config.dulapWidth - 2 * d.t),
      width: round1(d.towerHeight - d.t),
      thickness: BACK_PANEL_THICKNESS,
      qty: 1,
      material: bodyMaterial,
    }
  );

  if (config.openShelfCount > 0) {
    pieces.push({
      name: 'Raft deschis - polita',
      length: round1(d.openShelfWidth),
      width: round1(config.depth - d.t),
      thickness: d.t,
      qty: config.openShelfCount,
      material: bodyMaterial,
    });
  }

  pieces.push({
    name: 'Dulap - front usa',
    length: round1(config.dulapWidth),
    width: round1(d.towerHeight - d.t),
    thickness: BACK_PANEL_THICKNESS,
    qty: 1,
    material: frontMaterial,
  });

  return pieces;
}

function drawLivingFrontView(
  doc: jsPDF,
  config: LivingUnitConfig,
  x: number,
  y: number,
  maxW: number,
  maxH: number
) {
  const d = getLivingDerivedDimensions(config);
  const totalW = config.totalWidth;
  const totalH = config.totalHeight;
  const scale = Math.min(maxW / totalW, maxH / totalH) * 0.82;

  const drawW = totalW * scale;
  const drawH = totalH * scale;
  const offsetX = x + (maxW - drawW) / 2;
  const offsetY = y + (maxH - drawH) / 2;
  const towerWScaled = d.towerWidth * scale;
  const comodaWScaled = config.comodaWidth * scale;
  const comodaHScaled = config.comodaHeight * scale;
  const suspensionScaled = config.suspensionHeight * scale;
  const towerHScaled = d.towerHeight * scale;
  const towerX = config.mirrored ? offsetX : offsetX + drawW - towerWScaled;
  const comodaX = offsetX + (drawW - comodaWScaled) / 2;
  const comodaY = offsetY + drawH - comodaHScaled - suspensionScaled;
  const towerY = comodaY - towerHScaled;
  const tScaled = PANEL_THICKNESS * scale;

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.45);

  doc.rect(comodaX, comodaY, comodaWScaled, comodaHScaled);
  doc.rect(towerX, towerY, towerWScaled, towerHScaled);

  doc.setDrawColor(130, 130, 130);
  doc.setLineWidth(0.18);
  doc.rect(comodaX + tScaled, comodaY + tScaled, comodaWScaled - 2 * tScaled, comodaHScaled - 2 * tScaled);
  doc.rect(towerX + tScaled, towerY + tScaled, towerWScaled - 2 * tScaled, towerHScaled - tScaled * 1.5);

  const dividerOffset = (config.mirrored ? config.dulapWidth : config.raftWidth) * scale;
  const dividerX = towerX + dividerOffset;
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.25);
  doc.rect(dividerX - tScaled / 2, towerY + tScaled, tScaled, towerHScaled - tScaled);

  const usableComodaW = comodaWScaled - 2 * tScaled;
  const compartmentW = (usableComodaW - (config.comodaColumns - 1) * tScaled) / config.comodaColumns;
  let currentX = comodaX + tScaled;
  for (let i = 0; i < config.comodaColumns; i++) {
    doc.setDrawColor(180, 180, 180);
    doc.rect(currentX, comodaY + tScaled, compartmentW, comodaHScaled - 2 * tScaled);
    doc.setFontSize(5);
    doc.setTextColor(110, 110, 110);
    doc.text(`S${i + 1}`, currentX + compartmentW / 2, comodaY + comodaHScaled / 2, { align: 'center' });
    currentX += compartmentW;
    if (i < config.comodaColumns - 1) {
      doc.setDrawColor(80, 80, 80);
      doc.rect(currentX, comodaY + tScaled, tScaled, comodaHScaled - 2 * tScaled);
      currentX += tScaled;
    }
  }

  if (config.openShelfCount > 0) {
    const raftX1 = config.mirrored ? dividerX + tScaled / 2 : towerX + tScaled;
    const raftX2 = config.mirrored ? towerX + towerWScaled - tScaled : dividerX - tScaled / 2;
    const shelfW = raftX2 - raftX1;
    const cells = config.openShelfCount + 1;
    const cubeH = (towerHScaled - (cells + 1) * tScaled) / cells;
+    doc.setFontSize(5);
+    doc.setTextColor(120, 120, 120);
    for (let i = 1; i <= config.openShelfCount; i++) {
      const shelfY = towerY + tScaled + i * (cubeH + tScaled) - tScaled / 2;
      doc.setDrawColor(90, 90, 90);
      doc.rect(raftX1, shelfY, shelfW, tScaled);
    }
  }

  const doorX1 = config.mirrored ? towerX + tScaled : dividerX + tScaled / 2;
  const doorW = config.dulapWidth * scale - tScaled * 1.5;
  doc.setDrawColor(170, 170, 170);
  doc.rect(doorX1, towerY + tScaled / 2, doorW, towerHScaled - tScaled / 2);

  doc.setDrawColor(200, 149, 108);
  doc.setTextColor(200, 149, 108);
  doc.setLineWidth(0.28);
  doc.setFontSize(7);

  const totalDimY = offsetY + drawH + 8;
  doc.line(offsetX, totalDimY, offsetX + drawW, totalDimY);
  doc.line(offsetX, totalDimY - 2, offsetX, totalDimY + 2);
  doc.line(offsetX + drawW, totalDimY - 2, offsetX + drawW, totalDimY + 2);
  doc.text(`${config.totalWidth * 10} mm`, offsetX + drawW / 2, totalDimY + 4, { align: 'center' });

  const totalDimX = offsetX + drawW + 8;
  doc.line(totalDimX, offsetY, totalDimX, offsetY + drawH);
  doc.line(totalDimX - 2, offsetY, totalDimX + 2, offsetY);
  doc.line(totalDimX - 2, offsetY + drawH, totalDimX + 2, offsetY + drawH);
  doc.text(`${config.totalHeight * 10} mm`, totalDimX + 4, offsetY + drawH / 2, {
    angle: 90,
    align: 'center',
  });

  const towerDimY = towerY - 6;
  doc.line(towerX, towerDimY, towerX + towerWScaled, towerDimY);
  doc.line(towerX, towerDimY - 1.5, towerX, towerDimY + 1.5);
  doc.line(towerX + towerWScaled, towerDimY - 1.5, towerX + towerWScaled, towerDimY + 1.5);
  doc.text(`${d.towerWidth * 10} mm`, towerX + towerWScaled / 2, towerDimY - 1.5, { align: 'center' });

  const comodaDimY = comodaY + comodaHScaled + 14;
  doc.line(comodaX, comodaDimY, comodaX + comodaWScaled, comodaDimY);
  doc.line(comodaX, comodaDimY - 1.5, comodaX, comodaDimY + 1.5);
  doc.line(comodaX + comodaWScaled, comodaDimY - 1.5, comodaX + comodaWScaled, comodaDimY + 1.5);
  doc.text(`${config.comodaWidth * 10} mm`, comodaX + comodaWScaled / 2, comodaDimY + 4, { align: 'center' });
}

function drawLivingSideView(
  doc: jsPDF,
  config: LivingUnitConfig,
  x: number,
  y: number,
  maxW: number,
  maxH: number
) {
  const d = getLivingDerivedDimensions(config);
  const scale = Math.min(maxW / config.depth, maxH / config.totalHeight) * 0.82;
  const drawW = config.depth * scale;
  const drawH = config.totalHeight * scale;
  const offsetX = x + (maxW - drawW) / 2;
  const offsetY = y + (maxH - drawH) / 2;
  const tScaled = PANEL_THICKNESS * scale;
  const suspensionScaled = config.suspensionHeight * scale;
  const comodaHScaled = config.comodaHeight * scale;
  const towerHScaled = d.towerHeight * scale;
  const comodaY = offsetY + drawH - comodaHScaled - suspensionScaled;
  const towerY = comodaY - towerHScaled;

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.45);
  doc.rect(offsetX, comodaY, drawW, comodaHScaled);
  doc.rect(offsetX, towerY, drawW, towerHScaled);

  doc.setDrawColor(130, 130, 130);
  doc.setLineWidth(0.18);
  doc.rect(offsetX, comodaY, drawW, tScaled);
  doc.rect(offsetX, comodaY + comodaHScaled - tScaled, drawW, tScaled);
  doc.rect(offsetX, towerY, drawW, tScaled);
  doc.rect(offsetX, towerY + towerHScaled - tScaled, drawW, tScaled);
  doc.rect(offsetX, towerY, BACK_PANEL_THICKNESS * scale, towerHScaled);
  doc.rect(offsetX, comodaY, BACK_PANEL_THICKNESS * scale, comodaHScaled);

  doc.setDrawColor(200, 149, 108);
  doc.setTextColor(200, 149, 108);
  doc.setLineWidth(0.28);
  doc.setFontSize(7);

  const depthDimY = offsetY + drawH + 8;
  doc.line(offsetX, depthDimY, offsetX + drawW, depthDimY);
  doc.line(offsetX, depthDimY - 2, offsetX, depthDimY + 2);
  doc.line(offsetX + drawW, depthDimY - 2, offsetX + drawW, depthDimY + 2);
  doc.text(`${config.depth * 10} mm`, offsetX + drawW / 2, depthDimY + 4, { align: 'center' });

  const totalDimX = offsetX + drawW + 8;
  doc.line(totalDimX, offsetY, totalDimX, offsetY + drawH);
  doc.line(totalDimX - 2, offsetY, totalDimX + 2, offsetY);
  doc.line(totalDimX - 2, offsetY + drawH, totalDimX + 2, offsetY + drawH);
  doc.text(`${config.totalHeight * 10} mm`, totalDimX + 4, offsetY + drawH / 2, {
    angle: 90,
    align: 'center',
  });

  const suspensionDimX = offsetX - 7;
  doc.line(suspensionDimX, comodaY + comodaHScaled, suspensionDimX, offsetY + drawH);
  doc.line(suspensionDimX - 1.5, comodaY + comodaHScaled, suspensionDimX + 1.5, comodaY + comodaHScaled);
  doc.line(suspensionDimX - 1.5, offsetY + drawH, suspensionDimX + 1.5, offsetY + drawH);
  doc.text(`${config.suspensionHeight * 10} mm`, suspensionDimX - 3.5, comodaY + comodaHScaled + suspensionScaled / 2, {
    angle: 90,
    align: 'center',
  });

  doc.text(`Comoda: ${config.comodaHeight * 10} mm`, offsetX + drawW / 2, comodaY + comodaHScaled / 2, { align: 'center' });
  doc.text(`Turn: ${round1(d.towerHeight * 10)} mm`, offsetX + drawW / 2, towerY + towerHScaled / 2, { align: 'center' });
}

function createLivingUnitPDF(config: LivingUnitConfig) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;

  const price = calculateLivingUnitPrice(config);
  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);
  const bodyMatCode = getMaterialCode(config.bodyMaterialId);
  const frontMatCode = getMaterialCode(config.frontMaterialId);
  const d = getLivingDerivedDimensions(config);
  const pieces = generateLivingPiecesList(config);
  const delivery = getDeliveryEstimate(config);
  const dateStr = new Date().toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let y = margin;

  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageW, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('milimetric.ro', margin, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('Corp living suspendat - fisa tehnica si debitare', margin, 24);
  doc.setTextColor(200, 149, 108);
  doc.text(`Data: ${dateStr}`, pageW - margin, 16, { align: 'right' });
  doc.text('comenzi@milimetric.ro | +40 759 203 138', pageW - margin, 24, { align: 'right' });

  y = 42;
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Plan / schita de lucru', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Dimensiuni totale: ${config.totalWidth * 10} x ${config.totalHeight * 10} x ${config.depth * 10} mm | ` +
      `Material corp: ${bodyMatCode} | Material front: ${frontMatCode}`,
    margin,
    y
  );
  y += 8;

  drawLivingFrontView(doc, config, margin, y, contentW * 0.64, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text('VEDERE DIN FATA', margin, y - 2);

  drawLivingSideView(doc, config, margin + contentW * 0.69, y, contentW * 0.31, 110);
  doc.text('VEDERE LATERALA', margin + contentW * 0.69, y - 2);

  y += 116;
  doc.setDrawColor(200, 149, 108);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DETALII CONFIGURATIE', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const detailLines = [
    `Comoda: ${config.comodaWidth * 10} x ${config.comodaHeight * 10} x ${config.depth * 10} mm, ${config.comodaColumns} coloane`,
    `Turn vertical: ${round1(d.towerWidth * 10)} x ${round1(d.towerHeight * 10)} x ${config.depth * 10} mm`,
    `Raft deschis: ${config.raftWidth * 10} mm latime, ${config.openShelfCount} polite`,
    `Dulap: ${config.dulapWidth * 10} mm latime, front usa ${round1((d.towerHeight - d.t) * 10)} mm inaltime`,
    `Suspendare: ${config.suspensionHeight * 10} mm | Oglindire: ${config.mirrored ? 'Da - dulap pe stanga' : 'Nu - dulap pe dreapta'}`,
    `Material corp: ${bodyMat?.name || 'N/A'} (${bodyMatCode})`,
    `Material front: ${frontMat?.name || 'N/A'} (${frontMatCode})`,
  ];
  detailLines.forEach((line) => {
    doc.text(`- ${line}`, margin, y);
    y += 5;
  });

  doc.addPage();
  y = margin;

  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageW, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('milimetric.ro', margin, 15);
  doc.setTextColor(200, 149, 108);
  doc.setFontSize(8);
  doc.text('Lista piese / debitare', pageW - margin, 15, { align: 'right' });

  y = 32;
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('LISTA PLACI SI COMPONENTE', margin, y);
  y += 6;

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, contentW, 7, 'F');
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  const cols = [margin + 2, margin + 64, margin + 88, margin + 112, margin + 130, margin + 145];
  doc.text('Piesa', cols[0], y + 5);
  doc.text('L (mm)', cols[1], y + 5);
  doc.text('l (mm)', cols[2], y + 5);
  doc.text('Gros.', cols[3], y + 5);
  doc.text('Cant.', cols[4], y + 5);
  doc.text('Material', cols[5], y + 5);
  y += 7;

  doc.setFont('helvetica', 'normal');
  pieces.forEach((piece, index) => {
    if (y > pageH - 35) {
      doc.addPage();
      y = margin;
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, y, contentW, 6, 'F');
    }

    doc.setTextColor(35, 35, 35);
    doc.text(piece.name, cols[0], y + 4.3);
    doc.text(`${round1(piece.length * 10)}`, cols[1], y + 4.3);
    doc.text(`${round1(piece.width * 10)}`, cols[2], y + 4.3);
    doc.text(`${round1(piece.thickness * 10)}`, cols[3], y + 4.3);
    doc.text(`${piece.qty}`, cols[4], y + 4.3);
    doc.setTextColor(95, 95, 95);
    doc.text(piece.material.substring(0, 22), cols[5], y + 4.3);
    y += 6;
  });

  y += 4;
  doc.setDrawColor(200, 149, 108);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ESTIMARE PRET', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const priceLines: [string, number][] = [
    ['Comoda', price.comodaCost],
    ['Turn (raft + dulap corp)', price.towerCost],
    ['Fronturi (sertare + usa)', price.frontsCost],
    ['Feronerie si montaj', price.hardwareCost],
  ];

  priceLines.forEach(([label, amount]) => {
    doc.text(label, margin + 2, y);
    doc.text(formatPrice(amount), pageW - margin, y, { align: 'right' });
    y += 6;
  });

  if (price.discount > 0) {
    doc.text('Subtotal', margin + 2, y);
    doc.text(formatPrice(price.totalBeforeDiscount), pageW - margin, y, { align: 'right' });
    y += 6;
    doc.setTextColor(34, 139, 34);
    doc.text('Discount volum', margin + 2, y);
    doc.text(`-${formatPrice(price.discount)}`, pageW - margin, y, { align: 'right' });
    doc.setTextColor(26, 26, 26);
    y += 6;
  }

  const tva = Math.round(price.total * 0.19);
  doc.line(margin, y, pageW - margin, y);
  y += 7;
  doc.text('Total fara TVA', margin + 2, y);
  doc.text(formatPrice(price.total), pageW - margin, y, { align: 'right' });
  y += 6;
  doc.text('TVA (19%)', margin + 2, y);
  doc.text(formatPrice(tva), pageW - margin, y, { align: 'right' });
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 149, 108);
  doc.text('TOTAL CU TVA', margin + 2, y);
  doc.text(formatPrice(price.total + tva), pageW - margin, y, { align: 'right' });
  y += 10;

  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Termen estimat de livrare: ${delivery}`, margin, y);
  y += 4.5;
  doc.text('Lista de piese este orientativa si descrie configuratia tehnica selectata de client.', margin, y);

  const pages = (doc as any).internal.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFillColor(240, 240, 240);
    doc.rect(0, pageH - 18, pageW, 18, 'F');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'milimetric.ro - comenzi@milimetric.ro - +40 759 203 138 - Corp living suspendat',
      pageW / 2,
      pageH - 10,
      { align: 'center' }
    );
    doc.text(`Pagina ${page} din ${pages}`, pageW / 2, pageH - 5, {
      align: 'center',
    });
  }

  return doc;
}

export function getLivingUnitPDFFileName(config: LivingUnitConfig): string {
  return `milimetric_living_suspendat_${config.totalWidth}x${config.totalHeight}x${config.depth}.pdf`;
}

export function exportLivingUnitPDF(config: LivingUnitConfig) {
  const doc = createLivingUnitPDF(config);
  doc.save(getLivingUnitPDFFileName(config));
}

export function generateLivingUnitPDFBlob(config: LivingUnitConfig): Blob {
  const doc = createLivingUnitPDF(config);
  return doc.output('blob');
}

export function generateLivingUnitPDFBase64(config: LivingUnitConfig): string {
  const doc = createLivingUnitPDF(config);
  return doc.output('datauristring').split(',')[1] || '';
}
