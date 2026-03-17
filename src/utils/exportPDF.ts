import jsPDF from 'jspdf';
import { FurnitureConfig, PriceBreakdown } from '@/types';
import { getMaterialById } from '@/data/materials';
import { furnitureCategories, fronts, bases, additionalOptions } from '@/data/catalog';
import { formatPrice, getDeliveryEstimate } from '@/data/pricing';

const PANEL_THICKNESS = 1.8; // cm

interface PieceInfo {
  name: string;
  width: number;
  height: number;
  thickness: number;
  qty: number;
  material: string;
}

function getCategoryName(config: FurnitureConfig): string {
  return furnitureCategories.find((c) => c.id === config.category)?.name || config.category;
}

function getFrontTypeName(type: string): string {
  const f = fronts.find((fr) => fr.type === type);
  return f?.name || type;
}

function getBaseTypeName(type: string): string {
  const b = bases.find((bs) => bs.id === type);
  return b?.name || type;
}

function getOptionName(id: string): string {
  const o = additionalOptions.find((opt) => opt.id === id);
  return o?.name || id;
}

function getOptionPrice(id: string): number {
  const o = additionalOptions.find((opt) => opt.id === id);
  return o?.price || 0;
}

/**
 * Generate a list of all individual pieces needed to build the furniture
 */
function generatePiecesList(config: FurnitureConfig): PieceInfo[] {
  const { width, height, depth } = config.dimensions;
  const { columns, rows, columnWidths, rowHeights } = config.compartments;
  const bodyMatObj = getMaterialById(config.bodyMaterialId);
  const frontMatObj = getMaterialById(config.frontMaterialId);
  // Use full product code (id) when it differs from the display name (EGGER convention)
  const bodyMat = bodyMatObj ? (bodyMatObj.id !== bodyMatObj.name ? bodyMatObj.id : bodyMatObj.name) : 'N/A';
  const frontMat = frontMatObj ? (frontMatObj.id !== frontMatObj.name ? frontMatObj.id : frontMatObj.name) : 'N/A';

  const pieces: PieceInfo[] = [];
  const t = PANEL_THICKNESS;

  const isTable = config.category === 'mese' || config.category === 'masute-cafea';

  if (isTable) {
    pieces.push({
      name: 'Blat masă',
      width: width,
      height: depth,
      thickness: t * 2,
      qty: 1,
      material: bodyMat,
    });
    pieces.push({
      name: 'Picior masă',
      width: 5,
      height: 76,
      thickness: 5,
      qty: 4,
      material: bodyMat,
    });
    return pieces;
  }

  // Top panel
  pieces.push({
    name: 'Panou superior',
    width: width,
    height: depth,
    thickness: t,
    qty: 1,
    material: bodyMat,
  });

  // Bottom panel
  pieces.push({
    name: 'Panou inferior',
    width: width,
    height: depth,
    thickness: t,
    qty: 1,
    material: bodyMat,
  });

  // Side panels
  pieces.push({
    name: 'Panou lateral',
    width: depth,
    height: height,
    thickness: t,
    qty: 2,
    material: bodyMat,
  });

  // Back panel
  if (config.backPanel) {
    pieces.push({
      name: 'Panou spate',
      width: width,
      height: height,
      thickness: t / 2,
      qty: 1,
      material: bodyMat,
    });
  }

  // Vertical dividers
  if (columns > 1) {
    pieces.push({
      name: 'Despărțitor vertical',
      width: depth,
      height: height - t * 2,
      thickness: t,
      qty: columns - 1,
      material: bodyMat,
    });
  }

  // Horizontal shelves per column
  const totalColWeight = columnWidths.reduce((a, b) => a + b, 0);
  const usableWidth = width - t * (columns + 1);

  for (let col = 0; col < columns; col++) {
    const colW = (columnWidths[col] / totalColWeight) * usableWidth;
    const colRows = rows[col];

    if (colRows > 1) {
      pieces.push({
        name: `Poliță (col. ${col + 1})`,
        width: Math.round(colW * 10) / 10,
        height: depth - t / 2,
        thickness: t,
        qty: colRows - 1,
        material: bodyMat,
      });
    }
  }

  // Front pieces
  const frontCounts: Record<string, { count: number; avgW: number; avgH: number }> = {};

  for (const front of config.fronts) {
    const key = front.frontType;
    // Calculate approximate compartment dimensions
    const colW = (columnWidths[front.col] / totalColWeight) * usableWidth;
    const rowH = rowHeights[front.col];
    const totalRowWeight = rowH.reduce((a, b) => a + b, 0);
    const usableH = height - t * (rows[front.col] + 1);
    const cellH = (rowH[front.row] / totalRowWeight) * usableH;

    // Applied front is slightly larger than opening
    const appliedW = colW + t * 0.5;
    const appliedH = cellH + t * 0.5;

    if (!frontCounts[key]) {
      frontCounts[key] = { count: 0, avgW: 0, avgH: 0 };
    }
    frontCounts[key].count += 1;
    frontCounts[key].avgW += appliedW;
    frontCounts[key].avgH += appliedH;
  }

  for (const [type, data] of Object.entries(frontCounts)) {
    pieces.push({
      name: `Front: ${getFrontTypeName(type)}`,
      width: Math.round((data.avgW / data.count) * 10) / 10,
      height: Math.round((data.avgH / data.count) * 10) / 10,
      thickness: t / 2,
      qty: data.count,
      material: frontMat,
    });
  }

  return pieces;
}

/**
 * Draw a technical front-view diagram of the furniture
 */
function drawFrontView(
  doc: jsPDF,
  config: FurnitureConfig,
  x: number,
  y: number,
  maxW: number,
  maxH: number
) {
  const { width, height, depth } = config.dimensions;
  const { columns, rows, columnWidths, rowHeights } = config.compartments;
  const t = PANEL_THICKNESS;

  // Scale factor to fit in available space
  const scaleX = maxW / width;
  const scaleY = maxH / height;
  const scale = Math.min(scaleX, scaleY) * 0.85;

  const drawW = width * scale;
  const drawH = height * scale;

  // Center in available space
  const offsetX = x + (maxW - drawW) / 2;
  const offsetY = y + (maxH - drawH) / 2;

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);

  // Outer body rectangle
  doc.rect(offsetX, offsetY, drawW, drawH);

  // Panel thickness lines (inner rectangle)
  const tScaled = t * scale;
  doc.setLineWidth(0.2);
  doc.setDrawColor(120, 120, 120);
  doc.rect(offsetX + tScaled, offsetY + tScaled, drawW - tScaled * 2, drawH - tScaled * 2);

  // Vertical dividers
  const totalColWeight = columnWidths.reduce((a, b) => a + b, 0);
  const usableW = drawW - tScaled * (columns + 1);

  let xPos = offsetX + tScaled;
  for (let col = 0; col < columns; col++) {
    const colW = (columnWidths[col] / totalColWeight) * usableW;

    // Horizontal shelves in this column
    const colRows = rows[col];
    const rowH = rowHeights[col];
    const totalRowWeight = rowH.reduce((a: number, b: number) => a + b, 0);
    const usableH = drawH - tScaled * (colRows + 1);

    let yPos = offsetY + tScaled;
    for (let row = colRows - 1; row >= 0; row--) {
      const cellH = (rowH[row] / totalRowWeight) * usableH;

      // Draw compartment rectangle
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.15);
      doc.rect(xPos, yPos, colW, cellH);

      // Front type label
      const front = config.fronts.find((f) => f.col === col && f.row === row);
      if (front) {
        doc.setFontSize(5);
        doc.setTextColor(100, 100, 100);
        const frontLabel = getFrontTypeName(front.frontType);
        doc.text(frontLabel, xPos + colW / 2, yPos + cellH / 2, { align: 'center' });

        // Draw front indicator (hatching for doors)
        if (front.frontType === 'usa' || front.frontType === 'usa-sticla' || front.frontType === 'usa-oglinda') {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.1);
          // Diagonal line indicating door swing
          doc.line(xPos + 1, yPos + cellH - 1, xPos + colW - 1, yPos + 1);
        } else if (front.frontType === 'sertar') {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.1);
          // Double horizontal lines for drawer
          const cy = yPos + cellH / 2;
          doc.line(xPos + 2, cy - 1, xPos + colW - 2, cy - 1);
          doc.line(xPos + 2, cy + 1, xPos + colW - 2, cy + 1);
        }
      }

      yPos += cellH + tScaled;
    }

    // Vertical divider
    if (col < columns - 1) {
      xPos += colW;
      doc.setDrawColor(80, 80, 80);
      doc.setLineWidth(0.3);
      doc.rect(xPos, offsetY + tScaled, tScaled, drawH - tScaled * 2);
      xPos += tScaled;
    } else {
      xPos += colW + tScaled;
    }
  }

  // Dimension annotations
  doc.setDrawColor(200, 149, 108); // brand-accent color
  doc.setTextColor(200, 149, 108);
  doc.setFontSize(7);
  doc.setLineWidth(0.3);

  // Width dimension (bottom)
  const dimY = offsetY + drawH + 8;
  doc.line(offsetX, dimY, offsetX + drawW, dimY);
  doc.line(offsetX, dimY - 2, offsetX, dimY + 2);
  doc.line(offsetX + drawW, dimY - 2, offsetX + drawW, dimY + 2);
  doc.text(`${width} cm`, offsetX + drawW / 2, dimY + 4, { align: 'center' });

  // Height dimension (right)
  const dimX = offsetX + drawW + 8;
  doc.line(dimX, offsetY, dimX, offsetY + drawH);
  doc.line(dimX - 2, offsetY, dimX + 2, offsetY);
  doc.line(dimX - 2, offsetY + drawH, dimX + 2, offsetY + drawH);

  // Rotated height text
  doc.text(`${height} cm`, dimX + 4, offsetY + drawH / 2, {
    angle: 90,
    align: 'center',
  });

  return { drawW, drawH, offsetX, offsetY };
}

/**
 * Draw a side-view diagram
 */
function drawSideView(
  doc: jsPDF,
  config: FurnitureConfig,
  x: number,
  y: number,
  maxW: number,
  maxH: number
) {
  const { height, depth } = config.dimensions;
  const t = PANEL_THICKNESS;

  const scaleX = maxW / depth;
  const scaleY = maxH / height;
  const scale = Math.min(scaleX, scaleY) * 0.85;

  const drawW = depth * scale;
  const drawH = height * scale;

  const offsetX = x + (maxW - drawW) / 2;
  const offsetY = y + (maxH - drawH) / 2;

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.rect(offsetX, offsetY, drawW, drawH);

  // Inner shelves (simplified side view)
  const tScaled = t * scale;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.15);

  // Top/bottom panels
  doc.rect(offsetX, offsetY, drawW, tScaled);
  doc.rect(offsetX, offsetY + drawH - tScaled, drawW, tScaled);

  // Back panel
  if (config.backPanel) {
    doc.setDrawColor(150, 150, 150);
    doc.rect(offsetX, offsetY, tScaled / 2, drawH);
  }

  // Front line (applied front position)
  doc.setDrawColor(200, 149, 108);
  doc.setLineWidth(0.3);
  const frontPos = offsetX + drawW + 1;
  doc.line(frontPos, offsetY, frontPos, offsetY + drawH);

  // Depth annotation
  doc.setTextColor(200, 149, 108);
  doc.setFontSize(7);
  const dimY2 = offsetY + drawH + 8;
  doc.line(offsetX, dimY2, offsetX + drawW, dimY2);
  doc.line(offsetX, dimY2 - 2, offsetX, dimY2 + 2);
  doc.line(offsetX + drawW, dimY2 - 2, offsetX + drawW, dimY2 + 2);
  doc.text(`${depth} cm`, offsetX + drawW / 2, dimY2 + 4, { align: 'center' });
}

/**
 * Build the full PDF document and return jsPDF instance.
 */
function createPDFDocument(config: FurnitureConfig, price: PriceBreakdown) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;

  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);
  // Full product code for PDF display (e.g. EGGER_F206_ST9_Black Pietra Grigia)
  const bodyMatCode = bodyMat ? (bodyMat.id !== bodyMat.name ? bodyMat.id : bodyMat.name) : 'N/A';
  const frontMatCode = frontMat ? (frontMat.id !== frontMat.name ? frontMat.id : frontMat.name) : 'N/A';
  const catName = getCategoryName(config);
  const delivery = getDeliveryEstimate(config);
  const dateStr = new Date().toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ===== PAGE 1: HEADER + TECHNICAL DRAWINGS =====

  // Header background
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageW, 38, 'F');

  // Logo / brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('milimetric.ro', margin, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('Mobilier la comandă — proiectat la milimetru', margin, 26);

  // Document info
  doc.setTextColor(200, 149, 108);
  doc.setFontSize(8);
  doc.text(`Desen tehnic — ${catName}`, pageW - margin, 16, { align: 'right' });
  doc.setTextColor(180, 180, 180);
  doc.text(`Data: ${dateStr}`, pageW - margin, 22, { align: 'right' });
  doc.text('comenzi@milimetric.ro | +40 759 203 138', pageW - margin, 28, { align: 'right' });

  let curY = 45;

  // Title
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Desen Tehnic — ${catName}`, margin, curY);
  curY += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Dimensiuni: ${config.dimensions.width} × ${config.dimensions.height} × ${config.dimensions.depth} cm | Material corp: ${bodyMatCode} | Material fronturi: ${frontMatCode}`,
    margin,
    curY
  );
  curY += 10;

  // Separator line
  doc.setDrawColor(200, 149, 108);
  doc.setLineWidth(0.5);
  doc.line(margin, curY, pageW - margin, curY);
  curY += 8;

  // Front view
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VEDERE DIN FAȚĂ', margin, curY);
  curY += 4;

  const frontViewH = 95;
  drawFrontView(doc, config, margin, curY, contentW * 0.65, frontViewH);

  // Side view (right side)
  doc.text('VEDERE LATERALĂ', margin + contentW * 0.7, curY - 4);
  drawSideView(doc, config, margin + contentW * 0.7, curY, contentW * 0.3, frontViewH);

  curY += frontViewH + 18;

  // ===== PIECES TABLE =====
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('LISTĂ PIESE (DEBITARE)', margin, curY);
  curY += 6;

  const pieces = generatePiecesList(config);

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, curY, contentW, 7, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);

  const colX = [margin + 2, margin + 50, margin + 75, margin + 100, margin + 120, margin + 140];
  doc.text('Piesă', colX[0], curY + 5);
  doc.text('Lungime (cm)', colX[1], curY + 5);
  doc.text('Lățime (cm)', colX[2], curY + 5);
  doc.text('Gros. (cm)', colX[3], curY + 5);
  doc.text('Cant.', colX[4], curY + 5);
  doc.text('Material', colX[5], curY + 5);
  curY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  pieces.forEach((piece, i) => {
    if (curY > pageH - 40) {
      doc.addPage();
      curY = margin;
    }

    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, curY, contentW, 6, 'F');
    }

    doc.setTextColor(40, 40, 40);
    doc.text(piece.name, colX[0], curY + 4.5);
    doc.text(`${piece.width}`, colX[1], curY + 4.5);
    doc.text(`${piece.height}`, colX[2], curY + 4.5);
    doc.text(`${piece.thickness}`, colX[3], curY + 4.5);
    doc.text(`${piece.qty}`, colX[4], curY + 4.5);
    doc.setTextColor(100, 100, 100);
    doc.text(piece.material.substring(0, 18), colX[5], curY + 4.5);
    curY += 6;
  });

  // Bottom border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, curY, pageW - margin, curY);
  curY += 3;

  // Total pieces count
  const totalPieces = pieces.reduce((sum, p) => sum + p.qty, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text(`Total piese: ${totalPieces}`, margin + 2, curY + 3);
  curY += 10;

  // ===== PAGE 2: ACCESSORIES + PRICING =====
  doc.addPage();
  curY = margin;

  // Header on page 2
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageW, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('milimetric.ro', margin, 16);
  doc.setFontSize(8);
  doc.setTextColor(200, 149, 108);
  doc.text(`Accesorii & Preț — ${catName}`, pageW - margin, 16, { align: 'right' });
  curY = 32;

  // ===== ACCESSORIES LIST =====
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCESORII ȘI OPȚIUNI', margin, curY);
  curY += 8;

  // Fronts
  const frontCounts: Record<string, number> = {};
  for (const f of config.fronts) {
    const name = getFrontTypeName(f.frontType);
    frontCounts[name] = (frontCounts[name] || 0) + 1;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Fronturi:', margin, curY);
  curY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (Object.keys(frontCounts).length === 0) {
    doc.setTextColor(150, 150, 150);
    doc.text('— fără fronturi —', margin + 4, curY);
    curY += 5;
  } else {
    for (const [name, count] of Object.entries(frontCounts)) {
      doc.setTextColor(40, 40, 40);
      doc.text(`• ${name}`, margin + 4, curY);
      doc.text(`×${count}`, margin + 70, curY);
      curY += 5;
    }
  }

  curY += 3;

  // Base
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Bază:', margin, curY);
  curY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(`• ${getBaseTypeName(config.baseType)}`, margin + 4, curY);
  curY += 8;

  // Additional options
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Opțiuni adiționale:', margin, curY);
  curY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (config.additionalOptions.length === 0) {
    doc.setTextColor(150, 150, 150);
    doc.text('— nicio opțiune suplimentară selectată —', margin + 4, curY);
    curY += 5;
  } else {
    for (const optId of config.additionalOptions) {
      doc.setTextColor(40, 40, 40);
      doc.text(`• ${getOptionName(optId)}`, margin + 4, curY);
      doc.setTextColor(100, 100, 100);
      doc.text(`${formatPrice(getOptionPrice(optId))}`, margin + 100, curY);
      curY += 5;
    }
  }

  // Back panel
  curY += 3;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Panou spate:', margin, curY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(config.backPanel ? 'Da' : 'Nu', margin + 35, curY);
  curY += 5;

  // Feronerie
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Feronerie:', margin, curY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text('Blum / Hettich (premium)', margin + 35, curY);
  curY += 12;

  // Separator
  doc.setDrawColor(200, 149, 108);
  doc.setLineWidth(0.5);
  doc.line(margin, curY, pageW - margin, curY);
  curY += 10;

  // ===== PRICE BREAKDOWN =====
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CALCULATIE PREȚ', margin, curY);
  curY += 10;

  // Price table
  const priceItems: [string, number][] = [
    ['Corp mobilier (structură + polițe)', price.bodyPrice],
    ['Fronturi', price.frontPrice],
    ['Bază', price.basePrice],
    ['Panou spate', price.backPanelPrice],
    ['Opțiuni adiționale', price.additionalOptionsPrice],
  ];

  doc.setFontSize(9);
  for (const [label, amount] of priceItems) {
    if (amount <= 0) continue;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin + 4, curY);
    doc.setTextColor(26, 26, 26);
    doc.text(formatPrice(amount), pageW - margin, curY, { align: 'right' });
    curY += 7;
  }

  // Subtotal
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, curY, pageW - margin, curY);
  curY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Subtotal (fără TVA)', margin + 4, curY);
  doc.setTextColor(26, 26, 26);
  doc.text(formatPrice(price.totalBeforeDiscount), pageW - margin, curY, { align: 'right' });
  curY += 7;

  // Discount
  if (price.discount > 0) {
    doc.setTextColor(34, 139, 34);
    doc.text('Discount volum', margin + 4, curY);
    doc.text(`-${formatPrice(price.discount)}`, pageW - margin, curY, { align: 'right' });
    curY += 7;
  }

  // Price without VAT
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, curY, pageW - margin, curY);
  curY += 6;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text('Preț fără TVA', margin + 4, curY);
  doc.text(formatPrice(price.total), pageW - margin, curY, { align: 'right' });
  curY += 7;

  // TVA  
  const tva = Math.round(price.total * 0.19);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('TVA (19%)', margin + 4, curY);
  doc.text(formatPrice(tva), pageW - margin, curY, { align: 'right' });
  curY += 7;

  // Total with VAT highlight box
  doc.setDrawColor(200, 149, 108);
  doc.setLineWidth(0.8);
  doc.line(margin, curY, pageW - margin, curY);
  curY += 2;

  doc.setFillColor(254, 249, 244);
  doc.rect(margin, curY, contentW, 12, 'F');
  doc.setDrawColor(200, 149, 108);
  doc.setLineWidth(0.5);
  doc.rect(margin, curY, contentW, 12);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 149, 108);
  doc.text('TOTAL CU TVA', margin + 6, curY + 8.5);
  doc.setFontSize(14);
  doc.text(formatPrice(price.total + tva), pageW - margin - 6, curY + 8.5, { align: 'right' });
  curY += 20;

  // Delivery estimate
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Termen estimat de livrare: ${delivery}`, margin, curY);
  curY += 5;
  doc.text('Prețul include producția, finisajul și feroneria Blum/Hettich.', margin, curY);
  curY += 5;
  doc.text('Transportul și montajul se calculează separat.', margin, curY);
  curY += 15;

  // ===== FOOTER =====
  // Footer on both pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setFillColor(240, 240, 240);
    doc.rect(0, pageH - 18, pageW, 18, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(
      'milimetric.ro — comenzi@milimetric.ro — +40 759 203 138 — Mobilier la comandă',
      pageW / 2,
      pageH - 10,
      { align: 'center' }
    );
    doc.text(`Pagina ${pg} din ${totalPages}`, pageW / 2, pageH - 5, {
      align: 'center',
    });
  }

  return doc;
}

export function getPDFFileName(config: FurnitureConfig): string {
  return `milimetric_${config.category}_${config.dimensions.width}x${config.dimensions.height}x${config.dimensions.depth}_desen-tehnic.pdf`;
}

/**
 * Export technical PDF to local file.
 */
export function exportPDF(config: FurnitureConfig, price: PriceBreakdown) {
  const doc = createPDFDocument(config, price);
  doc.save(getPDFFileName(config));
}

/**
 * Generate technical PDF as Blob (for API upload / email attachment).
 */
export function generatePDFBlob(config: FurnitureConfig, price: PriceBreakdown): Blob {
  const doc = createPDFDocument(config, price);
  return doc.output('blob');
}

export function generatePDFBase64(config: FurnitureConfig, price: PriceBreakdown): string {
  const doc = createPDFDocument(config, price);
  return doc.output('datauristring').split(',')[1] || '';
}
