'use client';

import React from 'react';
import { CatalogItem } from '@/types';
import { materials } from '@/data/materials';

/**
 * Material color lookup with fallback.
 */
function getMaterialColor(materialId?: string): string {
  if (!materialId) return '#c9a96e';
  const mat = materials.find((m) => m.id === materialId);
  return mat?.color || '#c9a96e';
}

/**
 * Darken a hex colour by a factor (0–1).
 */
function darken(hex: string, factor: number): string {
  const c = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(c.substring(0, 2), 16) * (1 - factor)));
  const g = Math.max(0, Math.round(parseInt(c.substring(2, 4), 16) * (1 - factor)));
  const b = Math.max(0, Math.round(parseInt(c.substring(4, 6), 16) * (1 - factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Lighten a hex colour by a factor (0–1).
 */
function lighten(hex: string, factor: number): string {
  const c = hex.replace('#', '');
  const r = Math.min(255, Math.round(parseInt(c.substring(0, 2), 16) + (255 - parseInt(c.substring(0, 2), 16)) * factor));
  const g = Math.min(255, Math.round(parseInt(c.substring(2, 4), 16) + (255 - parseInt(c.substring(2, 4), 16)) * factor));
  const b = Math.min(255, Math.round(parseInt(c.substring(4, 6), 16) + (255 - parseInt(c.substring(4, 6), 16)) * factor));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface FurniturePreviewProps {
  item: CatalogItem;
  className?: string;
}

/**
 * SVG-based 2D furniture preview that renders based on item configPreset.
 * Supports: biblioteci, comode, dulapuri, suspendat, hol (compartment grid)
 *           mese, masute-cafea (table shapes)
 */
export default function FurniturePreview({ item, className = '' }: FurniturePreviewProps) {
  const preset = item.configPreset;

  if (!preset) {
    // Fallback: simple box
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="30" width="140" height="140" rx="4" fill="#c9a96e" stroke="#8a7040" strokeWidth="2" />
          <text x="100" y="105" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="sans-serif">
            {item.dimensions.width}×{item.dimensions.height}
          </text>
        </svg>
      </div>
    );
  }

  const isTable = preset.category === 'mese' || preset.category === 'masute-cafea';

  if (isTable) {
    return <TablePreview item={item} preset={preset} className={className} />;
  }

  return <CabinetPreview item={item} preset={preset} className={className} />;
}

// ─────────────────────────────────────────────
// TABLE / COFFEE TABLE PREVIEW
// ─────────────────────────────────────────────
function TablePreview({
  item,
  preset,
  className,
}: {
  item: CatalogItem;
  preset: Partial<import('@/types').FurnitureConfig>;
  className: string;
}) {
  const bodyColor = getMaterialColor(preset.bodyMaterialId);
  const legColor = darken(bodyColor, 0.25);
  const shape = preset.tableShape || 'dreptunghi';
  const isCoffee = preset.category === 'masute-cafea';

  // Viewbox constants
  const vw = 200;
  const vh = 200;
  const padding = 20;

  // Table top dimensions relative to viewbox
  const topW = vw - padding * 2;
  const topH = isCoffee ? 14 : 12;
  const topY = vh * 0.35;

  // Legs
  const legW = 6;
  const legH = vh * 0.35;
  const legY = topY + topH;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Shadow */}
        <ellipse
          cx={vw / 2}
          cy={legY + legH + 8}
          rx={topW * 0.45}
          ry={6}
          fill="rgba(0,0,0,0.08)"
        />

        {/* Legs */}
        {shape === 'rotund' || shape === 'oval' ? (
          <>
            {/* Central pedestal or 4 slight-angle legs */}
            <line x1={padding + 25} y1={legY} x2={padding + 18} y2={legY + legH} stroke={legColor} strokeWidth={legW} strokeLinecap="round" />
            <line x1={vw - padding - 25} y1={legY} x2={vw - padding - 18} y2={legY + legH} stroke={legColor} strokeWidth={legW} strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* 4 straight legs */}
            <line x1={padding + 12} y1={legY} x2={padding + 12} y2={legY + legH} stroke={legColor} strokeWidth={legW} strokeLinecap="round" />
            <line x1={vw - padding - 12} y1={legY} x2={vw - padding - 12} y2={legY + legH} stroke={legColor} strokeWidth={legW} strokeLinecap="round" />
            {/* Two middle-depth legs (perspective hint) */}
            <line x1={padding + 20} y1={legY - 2} x2={padding + 20} y2={legY + legH - 4} stroke={darken(legColor, 0.1)} strokeWidth={legW * 0.7} strokeLinecap="round" opacity="0.5" />
            <line x1={vw - padding - 20} y1={legY - 2} x2={vw - padding - 20} y2={legY + legH - 4} stroke={darken(legColor, 0.1)} strokeWidth={legW * 0.7} strokeLinecap="round" opacity="0.5" />
          </>
        )}

        {/* Table top */}
        {shape === 'rotund' ? (
          <ellipse
            cx={vw / 2}
            cy={topY + topH / 2}
            rx={topW / 2}
            ry={topH + 8}
            fill={bodyColor}
            stroke={darken(bodyColor, 0.2)}
            strokeWidth="1.5"
          />
        ) : shape === 'oval' ? (
          <ellipse
            cx={vw / 2}
            cy={topY + topH / 2}
            rx={topW / 2}
            ry={topH + 6}
            fill={bodyColor}
            stroke={darken(bodyColor, 0.2)}
            strokeWidth="1.5"
          />
        ) : (
          <rect
            x={padding}
            y={topY}
            width={topW}
            height={topH}
            rx={3}
            fill={bodyColor}
            stroke={darken(bodyColor, 0.2)}
            strokeWidth="1.5"
          />
        )}

        {/* Top edge highlight */}
        {shape === 'rotund' || shape === 'oval' ? (
          <ellipse
            cx={vw / 2}
            cy={topY + topH / 2 - 2}
            rx={topW / 2 - 4}
            ry={topH + (shape === 'oval' ? 2 : 4)}
            fill="none"
            stroke={lighten(bodyColor, 0.3)}
            strokeWidth="0.8"
            opacity="0.6"
          />
        ) : (
          <rect
            x={padding + 3}
            y={topY + 2}
            width={topW - 6}
            height={topH - 4}
            rx={2}
            fill="none"
            stroke={lighten(bodyColor, 0.3)}
            strokeWidth="0.8"
            opacity="0.6"
          />
        )}

        {/* Dimensions label */}
        <text
          x={vw / 2}
          y={vh - 8}
          textAnchor="middle"
          fontSize="10"
          fill="#888"
          fontFamily="sans-serif"
        >
          {item.dimensions.width}×{item.dimensions.depth} cm
        </text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// CABINET / SHELVING / WARDROBE PREVIEW
// ─────────────────────────────────────────────
function CabinetPreview({
  item,
  preset,
  className,
}: {
  item: CatalogItem;
  preset: Partial<import('@/types').FurnitureConfig>;
  className: string;
}) {
  const bodyColor = getMaterialColor(preset.bodyMaterialId);
  const frontColor = getMaterialColor(preset.frontMaterialId);
  const compartments = preset.compartments;
  const fronts = preset.fronts || [];
  const baseType = preset.baseType || 'plinta';
  const isSuspended = baseType === 'suspendat';

  if (!compartments) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="30" width="140" height="140" rx="4" fill={bodyColor} stroke={darken(bodyColor, 0.2)} strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // SVG viewbox
  const vw = 200;
  const vh = 240;
  const padding = 16;
  const baseH = isSuspended ? 0 : baseType === 'picioare' ? 16 : baseType === 'cadru' ? 12 : 8;
  const topGap = isSuspended ? 20 : 0;

  // Available area for the cabinet body
  const bodyW = vw - padding * 2;
  const bodyH = vh - padding * 2 - baseH - topGap - 16; // 16 for dimension label space
  const bodyX = padding;
  const bodyY = padding + topGap;

  // Compute column widths
  const totalColWeight = compartments.columnWidths.reduce((a, b) => a + b, 0);
  const gap = 2; // gap between compartments
  const totalGapsX = (compartments.columns - 1) * gap;
  const usableW = bodyW - 4; // 2px border each side
  const colWidths = compartments.columnWidths.map(
    (w) => ((w / totalColWeight) * (usableW - totalGapsX))
  );

  // Build column x-positions
  const colPositions: number[] = [];
  let cx = bodyX + 2;
  for (let c = 0; c < compartments.columns; c++) {
    colPositions.push(cx);
    cx += colWidths[c] + gap;
  }

  // Build front lookup
  const frontMap = new Map<string, string>();
  fronts.forEach((f) => {
    frontMap.set(`${f.row}-${f.col}`, f.frontType);
  });

  // SVG elements
  const elements: React.ReactNode[] = [];

  // Suspended mount line
  if (isSuspended) {
    elements.push(
      <line
        key="mount-line"
        x1={bodyX + 10}
        y1={bodyY - 6}
        x2={bodyX + bodyW - 10}
        y2={bodyY - 6}
        stroke="#999"
        strokeWidth="2"
        strokeDasharray="6 3"
      />
    );
    // Mount screws
    elements.push(
      <circle key="screw-l" cx={bodyX + 20} cy={bodyY - 6} r="3" fill="#bbb" stroke="#999" strokeWidth="1" />,
      <circle key="screw-r" cx={bodyX + bodyW - 20} cy={bodyY - 6} r="3" fill="#bbb" stroke="#999" strokeWidth="1" />
    );
  }

  // Body outer rectangle
  elements.push(
    <rect
      key="body"
      x={bodyX}
      y={bodyY}
      width={bodyW}
      height={bodyH}
      rx={2}
      fill={bodyColor}
      stroke={darken(bodyColor, 0.25)}
      strokeWidth="2"
    />
  );

  // Body inner highlight
  elements.push(
    <rect
      key="body-highlight"
      x={bodyX + 1}
      y={bodyY + 1}
      width={bodyW - 2}
      height={bodyH / 3}
      rx={2}
      fill={lighten(bodyColor, 0.15)}
      opacity="0.3"
    />
  );

  // Compartment cells
  for (let c = 0; c < compartments.columns; c++) {
    const rows = compartments.rows[c] || 1;
    const heights = compartments.rowHeights[c] || Array(rows).fill(1);
    const totalRowWeight = heights.reduce((a: number, b: number) => a + b, 0);
    const totalGapsY = (rows - 1) * gap;
    const usableH = bodyH - 4; // 2px border vertical
    const cellX = colPositions[c];
    const cellW = colWidths[c];

    let ry = bodyY + 2;

    for (let r = 0; r < rows; r++) {
      const cellH = (heights[r] / totalRowWeight) * (usableH - totalGapsY);
      const ft = frontMap.get(`${r}-${c}`);

      // Cell background (open or with front)
      if (!ft || ft === 'none') {
        // Open compartment – lighter interior
        elements.push(
          <rect
            key={`cell-${c}-${r}`}
            x={cellX}
            y={ry}
            width={cellW}
            height={cellH}
            rx={1}
            fill={lighten(bodyColor, 0.25)}
            stroke={darken(bodyColor, 0.12)}
            strokeWidth="0.8"
          />
        );
        // Shelf lines for open compartments
        if (cellH > 20) {
          elements.push(
            <line
              key={`shelf-${c}-${r}`}
              x1={cellX + 1}
              y1={ry + cellH * 0.5}
              x2={cellX + cellW - 1}
              y2={ry + cellH * 0.5}
              stroke={darken(bodyColor, 0.1)}
              strokeWidth="0.5"
              opacity="0.4"
            />
          );
        }
      } else if (ft === 'sertar') {
        // Drawer
        elements.push(
          <rect
            key={`cell-${c}-${r}`}
            x={cellX}
            y={ry}
            width={cellW}
            height={cellH}
            rx={1.5}
            fill={frontColor}
            stroke={darken(frontColor, 0.2)}
            strokeWidth="1"
          />
        );
        // Drawer handle (horizontal line)
        const handleW = Math.min(cellW * 0.4, 28);
        elements.push(
          <line
            key={`handle-${c}-${r}`}
            x1={cellX + cellW / 2 - handleW / 2}
            y1={ry + cellH / 2}
            x2={cellX + cellW / 2 + handleW / 2}
            y2={ry + cellH / 2}
            stroke={darken(frontColor, 0.35)}
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      } else if (ft === 'usa') {
        // Door
        elements.push(
          <rect
            key={`cell-${c}-${r}`}
            x={cellX}
            y={ry}
            width={cellW}
            height={cellH}
            rx={1.5}
            fill={frontColor}
            stroke={darken(frontColor, 0.2)}
            strokeWidth="1"
          />
        );
        // Door knob
        elements.push(
          <circle
            key={`knob-${c}-${r}`}
            cx={cellX + cellW - 6}
            cy={ry + cellH / 2}
            r="2"
            fill={darken(frontColor, 0.35)}
          />
        );
      } else if (ft === 'usa-sticla') {
        // Glass door
        elements.push(
          <rect
            key={`cell-${c}-${r}`}
            x={cellX}
            y={ry}
            width={cellW}
            height={cellH}
            rx={1.5}
            fill={frontColor}
            stroke={darken(frontColor, 0.2)}
            strokeWidth="1"
          />
        );
        // Glass panel
        elements.push(
          <rect
            key={`glass-${c}-${r}`}
            x={cellX + 3}
            y={ry + 3}
            width={cellW - 6}
            height={cellH - 6}
            rx={1}
            fill="rgba(180,210,230,0.35)"
            stroke="rgba(120,160,190,0.5)"
            strokeWidth="0.8"
          />
        );
        // Glass highlight
        elements.push(
          <line
            key={`glass-hl-${c}-${r}`}
            x1={cellX + 5}
            y1={ry + 5}
            x2={cellX + cellW * 0.3}
            y2={ry + cellH - 5}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      } else if (ft === 'usa-oglinda') {
        // Mirror door
        elements.push(
          <rect
            key={`cell-${c}-${r}`}
            x={cellX}
            y={ry}
            width={cellW}
            height={cellH}
            rx={1.5}
            fill={frontColor}
            stroke={darken(frontColor, 0.2)}
            strokeWidth="1"
          />
        );
        // Mirror panel
        elements.push(
          <rect
            key={`mirror-${c}-${r}`}
            x={cellX + 2.5}
            y={ry + 2.5}
            width={cellW - 5}
            height={cellH - 5}
            rx={1}
            fill="rgba(200,215,225,0.5)"
            stroke="rgba(160,180,200,0.6)"
            strokeWidth="0.6"
          />
        );
        // Mirror diagonal reflection
        elements.push(
          <line
            key={`refl1-${c}-${r}`}
            x1={cellX + cellW * 0.25}
            y1={ry + 4}
            x2={cellX + cellW * 0.15}
            y2={ry + cellH * 0.4}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />,
          <line
            key={`refl2-${c}-${r}`}
            x1={cellX + cellW * 0.35}
            y1={ry + 4}
            x2={cellX + cellW * 0.25}
            y2={ry + cellH * 0.35}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        );
      } else if (ft === 'clapa') {
        // Flap door
        elements.push(
          <rect
            key={`cell-${c}-${r}`}
            x={cellX}
            y={ry}
            width={cellW}
            height={cellH}
            rx={1.5}
            fill={frontColor}
            stroke={darken(frontColor, 0.2)}
            strokeWidth="1"
          />
        );
        // Bottom handle line
        const handleW = Math.min(cellW * 0.35, 24);
        elements.push(
          <line
            key={`flap-h-${c}-${r}`}
            x1={cellX + cellW / 2 - handleW / 2}
            y1={ry + cellH - 5}
            x2={cellX + cellW / 2 + handleW / 2}
            y2={ry + cellH - 5}
            stroke={darken(frontColor, 0.3)}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      }

      ry += cellH + gap;
    }
  }

  // Base
  const baseY = bodyY + bodyH;
  if (baseType === 'picioare') {
    // Four legs
    const legW = 5;
    elements.push(
      <line key="leg-l" x1={bodyX + 10} y1={baseY} x2={bodyX + 8} y2={baseY + baseH} stroke={darken(bodyColor, 0.3)} strokeWidth={legW} strokeLinecap="round" />,
      <line key="leg-r" x1={bodyX + bodyW - 10} y1={baseY} x2={bodyX + bodyW - 8} y2={baseY + baseH} stroke={darken(bodyColor, 0.3)} strokeWidth={legW} strokeLinecap="round" />
    );
  } else if (baseType === 'plinta') {
    elements.push(
      <rect
        key="plinta"
        x={bodyX + 3}
        y={baseY}
        width={bodyW - 6}
        height={baseH}
        rx={1}
        fill={darken(bodyColor, 0.15)}
        stroke={darken(bodyColor, 0.25)}
        strokeWidth="1"
      />
    );
  } else if (baseType === 'cadru') {
    elements.push(
      <rect
        key="cadru"
        x={bodyX + 6}
        y={baseY + 2}
        width={bodyW - 12}
        height={baseH - 2}
        rx={1}
        fill="none"
        stroke={darken(bodyColor, 0.35)}
        strokeWidth="2.5"
      />
    );
  } else if (baseType === 'rotile') {
    const wheelR = 4;
    elements.push(
      <circle key="wh-l" cx={bodyX + 14} cy={baseY + baseH - wheelR} r={wheelR} fill="#888" stroke="#666" strokeWidth="1" />,
      <circle key="wh-r" cx={bodyX + bodyW - 14} cy={baseY + baseH - wheelR} r={wheelR} fill="#888" stroke="#666" strokeWidth="1" />
    );
  }

  // Shadow for grounded furniture
  if (!isSuspended) {
    elements.push(
      <ellipse
        key="shadow"
        cx={bodyX + bodyW / 2}
        cy={baseY + baseH + 4}
        rx={bodyW * 0.42}
        ry={3}
        fill="rgba(0,0,0,0.06)"
      />
    );
  }

  // Dimensions label
  elements.push(
    <text
      key="dim"
      x={vw / 2}
      y={vh - 4}
      textAnchor="middle"
      fontSize="9"
      fill="#999"
      fontFamily="sans-serif"
    >
      {item.dimensions.width}×{item.dimensions.height}×{item.dimensions.depth} cm
    </text>
  );

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {elements}
      </svg>
    </div>
  );
}
