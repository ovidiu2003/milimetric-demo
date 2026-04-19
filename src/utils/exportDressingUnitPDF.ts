import jsPDF from 'jspdf';
import { DressingUnitConfig } from '@/types';
import { getMaterialById } from '@/data/materials';
import { calculateDressingUnitPrice, DRESSING_INTERIOR_OPTIONS } from '@/store/dressingUnitStore';

const PANEL_THICKNESS = 1.8;
const BACK_PANEL_THICKNESS = PANEL_THICKNESS / 2;

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
    style: 'currency', currency: 'RON',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);
}

function round1(v: number): number { return Math.round(v * 10) / 10; }

function getMaterialCode(id: string): string {
  const material = getMaterialById(id);
  if (!material) return 'N/A';
  return material.id !== material.name ? material.id : material.name;
}

function getDeliveryEstimate(config: DressingUnitConfig): string {
  const bodyMat = getMaterialById(config.bodyMaterialId);
  if (bodyMat?.type === 'lemn-masiv') return '10-14 saptamani';
  if (bodyMat?.type === 'furnir') return '8-12 saptamani';
  return '6-10 saptamani';
}

function generateDressingPiecesList(config: DressingUnitConfig): PieceInfo[] {
  const t = PANEL_THICKNESS;
  const bodyHeight = config.totalHeight - config.plinthHeight;
  const body = getMaterialCode(config.bodyMaterialId);
  const front = getMaterialCode(config.frontMaterialId);
  const pieces: PieceInfo[] = [];

  // Grupeaza modulele dupa latime pentru a reduce liniile tabelului
  type Bucket = {
    width: number;
    count: number;
    mainH: number;     // inaltimea corpului principal
    topCount: number;  // cate module din grup au compartiment superior
    topHeights: number[]; // inaltimile compartimentelor superioare din grup (pot fi diferite)
    topCompByHeight: Map<number, number>;
    shelves4: number;  // module cu 'rafturi'
    shelves1Bar: number; // module cu 'bara-raft'
    mixt: number;      // module cu 'mixt'
    open6: number;     // module cu 'rafturi-deschise'
    doorModules: number;
    doorTopModules: number; // module cu usi SI compartiment superior
  };

  // Fiecare modul este o cutie independenta. Compartimentul superior (daca exista)
  // este o cutie separata cu laterale, top si bottom proprii asezata peste corpul principal.
  config.modules.forEach((m, idx) => {
    const mw = m.width;
    const mainH = m.hasTopCompartment ? bodyHeight - m.topCompartmentHeight : bodyHeight;
    const topH = m.hasTopCompartment ? m.topCompartmentHeight : 0;
    const tag = `M${idx + 1}`;

    // Laterale corp principal (doar mainH)
    pieces.push({
      name: `Panou lateral corp ${tag}`,
      length: config.depth,
      width: mainH,
      thickness: t,
      qty: 2,
      material: body,
    });

    // Top / bottom corp principal
    pieces.push({
      name: `Panou orizontal corp (top/jos) ${tag}`,
      length: round1(mw - 2 * t),
      width: config.depth,
      thickness: t,
      qty: 2,
      material: body,
    });

    // Spate corp principal
    pieces.push({
      name: `Spate corp ${tag}`,
      length: round1(mw - 2 * t),
      width: round1(mainH - 2 * t),
      thickness: BACK_PANEL_THICKNESS,
      qty: 1,
      material: body,
    });

    if (m.hasTopCompartment) {
      // Cutie compartiment superior independenta: 2 laterale + top + bottom + spate
      pieces.push({
        name: `Panou lateral compartiment sus ${tag}`,
        length: config.depth,
        width: topH,
        thickness: t,
        qty: 2,
        material: body,
      });
      pieces.push({
        name: `Panou orizontal compartiment sus (top/jos) ${tag}`,
        length: round1(mw - 2 * t),
        width: config.depth,
        thickness: t,
        qty: 2,
        material: body,
      });
      pieces.push({
        name: `Spate compartiment sus ${tag}`,
        length: round1(mw - 2 * t),
        width: round1(topH - 2 * t),
        thickness: BACK_PANEL_THICKNESS,
        qty: 1,
        material: body,
      });
    }

    // Interior
    switch (m.interiorType) {
      case 'bara-raft':
        pieces.push({ name: `Raft interior ${tag}`, length: round1(mw - 2 * t), width: round1(config.depth - t), thickness: t, qty: 1, material: body });
        pieces.push({ name: `Bara haine ${tag}`,    length: round1(mw - 2 * t), width: 2.4, thickness: 2.4, qty: 1, material: 'OL cromat' });
        break;
      case 'rafturi':
        pieces.push({ name: `Raft interior ${tag}`, length: round1(mw - 2 * t), width: round1(config.depth - t), thickness: t, qty: 4, material: body });
        break;
      case 'mixt':
        pieces.push({ name: `Raft interior ${tag}`, length: round1(mw - 2 * t), width: round1(config.depth - t), thickness: t, qty: 1, material: body });
        pieces.push({ name: `Bara haine ${tag}`,    length: round1(mw - 2 * t), width: 2.4, thickness: 2.4, qty: 1, material: 'OL cromat' });
        pieces.push({ name: `Front sertar ${tag}`,  length: round1(mw - 2 * t), width: 18, thickness: t, qty: 2, material: front });
        break;
      case 'rafturi-deschise':
        pieces.push({ name: `Raft biblioteca ${tag}`, length: round1(mw - 2 * t), width: round1(config.depth - t), thickness: t, qty: 6, material: body });
        break;
    }

    // Usi pe toata inaltimea - de la podea pana la varf (acopera si plinta)
    // Toate modulele au usi structural
    {
      const fullDoorH = mainH + topH + config.plinthHeight; // include plinta
      const singleDoor = m.width < 60; // sub 600mm = o singura usa
      pieces.push({
        name: `Usa (pana la podea) ${tag}`,
        length: singleDoor ? round1(mw - 0.4) : round1(mw / 2 - 0.2),
        width: round1(fullDoorH - 0.4),
        thickness: t,
        qty: singleDoor ? 1 : 2,
        material: front,
      });
    }
  });

  // Biblioteca laterala (side shelves): deschidere in lateral, FARA plinta, FARA top/bottom cap
  const s = config.sideShelves;
  if (s.position !== 'none') {
    const sides = s.position === 'both' ? 2 : 1;
    const libDepth = s.columnWidth;       // cat iese in afara (X)
    const libZ = config.depth;            // adancime (aliniata cu dressingul)
    const libH = config.totalHeight;      // inaltimea totala (de la podea)
    const shelfZ = libZ / s.columns;

    // Front (in culoarea frontului, de la podea la varf)
    pieces.push({
      name: 'Front biblioteca (pana la podea)',
      length: round1(libH - 0.4),
      width: round1(libDepth - 0.4),
      thickness: t,
      qty: sides,
      material: front,
    });
    // Spate individual al bibliotecii (de la podea la top)
    pieces.push({
      name: 'Spate biblioteca (individual, pana la podea)',
      length: round1(libH),
      width: round1(libDepth),
      thickness: t,
      qty: sides,
      material: body,
    });
    // Panou lateral intre biblioteca si modul (de la podea la top)
    pieces.push({
      name: 'Panou lateral biblioteca (spre modul)',
      length: round1(libH),
      width: round1(libZ),
      thickness: t,
      qty: sides,
      material: body,
    });
    // Separatoare interioare intre coloane
    if (s.columns > 1) {
      pieces.push({
        name: 'Separator intern biblioteca',
        length: round1(libH),
        width: round1(libDepth),
        thickness: t,
        qty: sides * (s.columns - 1),
        material: body,
      });
    }
    // Rafturi
    pieces.push({
      name: 'Raft biblioteca laterala',
      length: round1(libDepth - t),
      width: round1(shelfZ - t),
      thickness: t,
      qty: sides * s.columns * s.shelfCount,
      material: body,
    });
  }

  if (config.plinthHeight > 0) {
    pieces.push({
      name: 'Plinta',
      length: round1(config.totalWidth),
      width: config.plinthHeight,
      thickness: t,
      qty: 2,
      material: body,
    });
  }

  return pieces;
}

function drawFrontView(doc: jsPDF, config: DressingUnitConfig, x: number, y: number, maxW: number, maxH: number) {
  const t = PANEL_THICKNESS;
  const totalW = config.totalWidth;
  const totalH = config.totalHeight;
  const scale = Math.min(maxW / totalW, maxH / totalH) * 0.82;
  const drawW = totalW * scale;
  const drawH = totalH * scale;
  const offsetX = x + (maxW - drawW) / 2;
  const offsetY = y + (maxH - drawH) / 2;
  const tScaled = t * scale;
  const plinthScaled = config.plinthHeight * scale;

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.45);
  doc.rect(offsetX, offsetY, drawW, drawH - plinthScaled);

  // Plinth
  if (plinthScaled > 0) {
    doc.setFillColor(60, 40, 30);
    doc.rect(offsetX + drawW * 0.01, offsetY + drawH - plinthScaled, drawW - drawW * 0.02, plinthScaled, 'F');
  }

  // Each module (lățimi individuale)
  const bodyH = drawH - plinthScaled;
  const sideCfg = config.sideShelves;
  const hasLeft = sideCfg.position === 'left' || sideCfg.position === 'both';
  const hasRight = sideCfg.position === 'right' || sideCfg.position === 'both';
  const sideUnitW = sideCfg.columnWidth * scale;
  const leftSideW = hasLeft ? sideUnitW : 0;
  const modulesOffsetX = offsetX + leftSideW;

  // Draw side libraries as solid panels (front pana la podea, fara top/bottom)
  const drawSideBand = (bandX: number) => {
    // Panou plin (frontul bibliotecii) - de la podea pana la top
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.35);
    doc.rect(bandX, offsetY, sideUnitW, drawH);
    // Eticheta "Biblioteca"
    doc.setFontSize(5);
    doc.setTextColor(140, 140, 140);
    doc.text('Bibl.', bandX + sideUnitW / 2, offsetY + drawH / 2, {
      align: 'center',
      angle: 90,
    });
  };
  if (hasLeft) drawSideBand(offsetX);
  if (hasRight) drawSideBand(offsetX + drawW - sideUnitW);

  let cursorX = modulesOffsetX;
  for (let i = 0; i < config.moduleCount; i++) {
    const m = config.modules[i];
    const mwScaled = m.width * scale;
    const mx = cursorX;
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.25);
    if (i > 0) doc.line(mx, offsetY, mx, offsetY + bodyH);

    const innerX = mx + tScaled;
    const innerW = mwScaled - 2 * tScaled;

    // Compartiment superior (daca exista)
    const topH = m.hasTopCompartment ? m.topCompartmentHeight * scale : 0;
    const mainH = bodyH - topH;
    // Toate modulele au usi structural
    {
      // Usi de la podea pana la varf (acopera si plinta in fata)
      const fullInnerY = offsetY + tScaled;
      const fullInnerH = drawH - 2 * tScaled; // include plinta
      const singleDoor = m.width < 60;
      doc.setDrawColor(170, 170, 170);
      doc.setLineWidth(0.25);
      if (singleDoor) {
        // O singura usa care acopera tot interiorul
        doc.rect(innerX, fullInnerY, innerW, fullInnerH);
        // Maner vertical pe partea dreapta (balama stanga)
        doc.setFillColor(40, 30, 20);
        doc.rect(innerX + innerW - 2, fullInnerY + fullInnerH * 0.2, 0.5, fullInnerH * 0.6, 'F');
      } else {
        doc.rect(innerX, fullInnerY, innerW / 2, fullInnerH);
        doc.rect(innerX + innerW / 2, fullInnerY, innerW / 2, fullInnerH);
        // Manere verticale in mijloc
        doc.setFillColor(40, 30, 20);
        doc.rect(innerX + innerW / 2 - 1.5, fullInnerY + fullInnerH * 0.2, 0.5, fullInnerH * 0.6, 'F');
        doc.rect(innerX + innerW / 2 + 1, fullInnerY + fullInnerH * 0.2, 0.5, fullInnerH * 0.6, 'F');
      }
    }

    doc.setFontSize(5);
    doc.setTextColor(110, 110, 110);
    doc.text(`M${i + 1}`, mx + mwScaled / 2, offsetY + bodyH + 4, { align: 'center' });
    doc.text(`${Math.round(m.width * 10)}mm`, mx + mwScaled / 2, offsetY + bodyH + 7, { align: 'center' });

    cursorX += mwScaled;
  }

  // Dimension lines
  doc.setDrawColor(200, 149, 108);
  doc.setTextColor(200, 149, 108);
  doc.setLineWidth(0.28);
  doc.setFontSize(7);

  const totalDimY = offsetY + drawH + 8;
  doc.line(offsetX, totalDimY, offsetX + drawW, totalDimY);
  doc.line(offsetX, totalDimY - 2, offsetX, totalDimY + 2);
  doc.line(offsetX + drawW, totalDimY - 2, offsetX + drawW, totalDimY + 2);
  doc.text(`${Math.round(config.totalWidth * 10)} mm`, offsetX + drawW / 2, totalDimY + 4, { align: 'center' });

  const totalDimX = offsetX + drawW + 8;
  doc.line(totalDimX, offsetY, totalDimX, offsetY + drawH);
  doc.line(totalDimX - 2, offsetY, totalDimX + 2, offsetY);
  doc.line(totalDimX - 2, offsetY + drawH, totalDimX + 2, offsetY + drawH);
  doc.text(`${config.totalHeight * 10} mm`, totalDimX + 4, offsetY + drawH / 2, { angle: 90, align: 'center' });
}

function drawSideView(doc: jsPDF, config: DressingUnitConfig, x: number, y: number, maxW: number, maxH: number) {
  const t = PANEL_THICKNESS;
  const scale = Math.min(maxW / config.depth, maxH / config.totalHeight) * 0.82;
  const drawW = config.depth * scale;
  const drawH = config.totalHeight * scale;
  const offsetX = x + (maxW - drawW) / 2;
  const offsetY = y + (maxH - drawH) / 2;
  const plinthScaled = config.plinthHeight * scale;
  const tScaled = t * scale;

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.45);
  doc.rect(offsetX, offsetY, drawW, drawH - plinthScaled);

  if (plinthScaled > 0) {
    doc.setFillColor(60, 40, 30);
    doc.rect(offsetX + 1, offsetY + drawH - plinthScaled, drawW - 2, plinthScaled, 'F');
  }

  doc.setDrawColor(130, 130, 130);
  doc.setLineWidth(0.18);
  doc.rect(offsetX, offsetY, drawW, tScaled);
  doc.rect(offsetX, offsetY + drawH - plinthScaled - tScaled, drawW, tScaled);
  doc.rect(offsetX, offsetY, BACK_PANEL_THICKNESS * scale, drawH - plinthScaled);

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
  doc.text(`${config.totalHeight * 10} mm`, totalDimX + 4, offsetY + drawH / 2, { angle: 90, align: 'center' });
}

function createDressingUnitPDF(config: DressingUnitConfig) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;

  const price = calculateDressingUnitPrice(config);
  const bodyMat = getMaterialById(config.bodyMaterialId);
  const frontMat = getMaterialById(config.frontMaterialId);
  const bodyMatCode = getMaterialCode(config.bodyMaterialId);
  const frontMatCode = getMaterialCode(config.frontMaterialId);
  const pieces = generateDressingPiecesList(config);
  const delivery = getDeliveryEstimate(config);
  const dateStr = new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });

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
  doc.text('Corp dressing modular - fisa tehnica si debitare', margin, 24);
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
    `Dimensiuni totale: ${Math.round(config.totalWidth * 10)} x ${config.totalHeight * 10} x ${config.depth * 10} mm | ` +
    `Material corp: ${bodyMatCode} | Material front: ${frontMatCode}`,
    margin, y
  );
  y += 8;

  drawFrontView(doc, config, margin, y, contentW * 0.64, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text('VEDERE DIN FATA', margin, y - 2);

  drawSideView(doc, config, margin + contentW * 0.69, y, contentW * 0.31, 110);
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
  const detailLines: string[] = [
    `${config.moduleCount} module cu latimi individuale (total: ${Math.round(config.totalWidth * 10)} mm)`,
    `Inaltime totala: ${config.totalHeight * 10} mm (corp ${(config.totalHeight - config.plinthHeight) * 10} mm + plinta ${config.plinthHeight * 10} mm)`,
    `Adancime: ${config.depth * 10} mm`,
    `Material corp: ${bodyMat?.name || 'N/A'} (${bodyMatCode})`,
    `Material front: ${frontMat?.name || 'N/A'} (${frontMatCode})`,
  ];
  config.modules.forEach((m, i) => {
    const opt = DRESSING_INTERIOR_OPTIONS.find((o) => o.id === m.interiorType);
    const doorLabel = m.width < 60 ? '1 usa batanta cu maner vertical' : '2 usi batante cu maner vertical';
    const topLabel = m.hasTopCompartment ? `, compartiment superior ${Math.round(m.topCompartmentHeight * 10)} mm` : '';
    detailLines.push(`Modul ${i + 1} (${Math.round(m.width * 10)} mm): ${opt?.name || m.interiorType} - ${doorLabel}${topLabel}`);
  });
  detailLines.forEach((line) => {
    doc.text(`- ${line}`, margin, y);
    y += 5;
  });

  // Page 2: pieces + price
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
    if (y > pageH - 35) { doc.addPage(); y = margin; }
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
    ['Corp (laterale, orizontale, spate)', price.bodyCost],
    ['Interior (rafturi, bara, sertare)', price.interiorCost],
    ['Fronturi (usi)', price.frontsCost],
    ['Plinta', price.plinthCost],
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
      'milimetric.ro - comenzi@milimetric.ro - +40 759 203 138 - Corp dressing modular',
      pageW / 2, pageH - 10, { align: 'center' }
    );
    doc.text(`Pagina ${page} din ${pages}`, pageW / 2, pageH - 5, { align: 'center' });
  }

  return doc;
}

export function getDressingUnitPDFFileName(config: DressingUnitConfig): string {
  return `milimetric_dressing_${Math.round(config.totalWidth)}x${config.totalHeight}x${config.depth}.pdf`;
}

export function exportDressingUnitPDF(config: DressingUnitConfig) {
  const doc = createDressingUnitPDF(config);
  doc.save(getDressingUnitPDFFileName(config));
}

export function generateDressingUnitPDFBlob(config: DressingUnitConfig): Blob {
  const doc = createDressingUnitPDF(config);
  return doc.output('blob');
}

export function generateDressingUnitPDFBase64(config: DressingUnitConfig): string {
  const doc = createDressingUnitPDF(config);
  return doc.output('datauristring').split(',')[1] || '';
}
