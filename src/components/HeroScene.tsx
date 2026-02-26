'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Link from 'next/link';

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollSpaceRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLDivElement>(null);
  const phaseTitleRef = useRef<HTMLDivElement>(null);
  const phaseDescRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const progFillRef = useRef<HTMLDivElement>(null);
  const progNumRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<HTMLDivElement[]>([]);
  const finalRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    // ═══════════════════════════════════════
    // RENDERER
    // ═══════════════════════════════════════
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0806);
    scene.fog = new THREE.FogExp2(0x0a0806, 0.018);

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 3.8, 13);
    camera.lookAt(0, 1, 0);

    // ═══════════════════════════════════════
    // LIGHTS
    // ═══════════════════════════════════════
    scene.add(new THREE.AmbientLight(0xf5eed8, 0.7));

    const sun = new THREE.DirectionalLight(0xfff6e8, 4.0);
    sun.position.set(-6, 11, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
    sun.shadow.camera.far = 60; sun.shadow.bias = -0.0006; sun.shadow.radius = 5;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xd0e0f0, 1.2);
    fill.position.set(8, 3, -4); scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffd8a0, 1.2);
    rim.position.set(-8, 3, -7); scene.add(rim);

    // Extra front fill for visibility
    const frontFill = new THREE.DirectionalLight(0xfff0e0, 0.8);
    frontFill.position.set(0, 5, 10); scene.add(frontFill);

    // Hemisphere light for natural ambient bounce
    const hemi = new THREE.HemisphereLight(0xfff8f0, 0x1a1410, 0.6);
    scene.add(hemi);

    const ledLight = new THREE.PointLight(0xffe0a0, 0.5, 12, 1.0);
    ledLight.position.set(0, 2.25, -3.0); scene.add(ledLight);

    function addSpot(x: number, y: number, z: number, tx: number, ty: number, tz: number, int = 3.5) {
      const s = new THREE.SpotLight(0xfff8f0, int, 28, Math.PI * 0.12, 0.55, 1.0);
      s.position.set(x, y, z); s.target.position.set(tx, ty, tz);
      s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.001;
      scene.add(s); scene.add(s.target); return s;
    }
    addSpot(-1.5, 9, 2, -1.5, 0, -3);
    addSpot(1.5, 9, 2, 1.5, 0, -3);
    addSpot(0, 8, 5, 0, 0.5, -2, 2.5);
    addSpot(0, 9, 2, 0, 0, -3, 1.5);

    // ═══════════════════════════════════════
    // PROCEDURAL TEXTURES
    // ═══════════════════════════════════════
    function oakTex(w = 512, h = 256) {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d')!;
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#C8A97A'); g.addColorStop(0.3, '#D4B88A'); g.addColorStop(0.7, '#C0A070'); g.addColorStop(1, '#C8A97A');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 100; i++) {
        const y2 = Math.random() * h; const amp = 0.5 + Math.random() * 3; const freq = 0.02 + Math.random() * 0.05;
        ctx.beginPath(); ctx.lineWidth = 0.2 + Math.random() * 1.4;
        ctx.globalAlpha = 0.04 + Math.random() * 0.14;
        ctx.strokeStyle = Math.random() > 0.4 ? '#8A6030' : '#E0C090';
        for (let x = 0; x <= w; x += 2) { const yy = y2 + Math.sin(x * freq + i * 2) * amp; x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.5, 1); return t;
    }

    function charcoalTex(w = 256, h = 256) {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = '#2A2622'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6000; i++) {
        const a = 0.015 + Math.random() * 0.04;
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 60 : 20},${Math.random() > 0.5 ? 55 : 18},${Math.random() > 0.5 ? 50 : 16},${a})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
    }

    function calacattaTex(w = 1024, h = 512) {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = '#F4F1ED'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) {
        const pts: number[][] = [];
        for (let j = 0; j < 6; j++) pts.push([Math.random() * w, Math.random() * h]);
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let j = 1; j < pts.length - 2; j++) ctx.bezierCurveTo(pts[j][0], pts[j][1], pts[j + 1][0], pts[j + 1][1], pts[j + 1][0], pts[j + 1][1]);
        const veinColor = Math.random() > 0.3 ? `rgba(140,132,124,${0.12 + Math.random() * 0.25})` : `rgba(180,170,160,${0.06 + Math.random() * 0.1})`;
        ctx.strokeStyle = veinColor; ctx.lineWidth = 1 + Math.random() * 4; ctx.stroke();
        ctx.strokeStyle = veinColor.replace(/[\d.]+\)$/, (v: string) => `${parseFloat(v) * 0.4})`);
        ctx.lineWidth += 3; ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const grd = ctx.createRadialGradient(Math.random() * w, Math.random() * h, 10, Math.random() * w, Math.random() * h, 80 + Math.random() * 120);
        grd.addColorStop(0, 'rgba(210,195,180,0.08)'); grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
      }
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 0.5); return t;
    }

    function concreteTex(w = 512, h = 512) {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = '#1C1814'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 15000; i++) {
        const a = 0.01 + Math.random() * 0.04; const c = 14 + Math.random() * 18;
        ctx.fillStyle = `rgba(${c + 8},${c + 4},${c},${a})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.strokeStyle = 'rgba(10,8,5,0.2)'; ctx.lineWidth = 0.5;
        ctx.moveTo(Math.random() * w, Math.random() * h);
        ctx.lineTo(Math.random() * w, Math.random() * h); ctx.stroke();
      }
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
    }

    function darkTileTex(w = 256, h = 256) {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = '#1E1A15'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = `rgba(60,50,40,${0.02 + Math.random() * 0.04})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      ctx.strokeStyle = 'rgba(8,6,4,0.8)'; ctx.lineWidth = 1.5;
      const gw = w / 4, gh = h / 4;
      for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * gw, 0); ctx.lineTo(i * gw, h); ctx.stroke(); }
      for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(0, i * gh); ctx.lineTo(w, i * gh); ctx.stroke(); }
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t;
    }

    const texOak = oakTex();
    const texCharcoal = charcoalTex();
    const texCalacatta = calacattaTex();
    const texConcrete = concreteTex();
    const texDarkTile = darkTileTex();
    const texPanelWood = oakTex(512, 256);

    // ═══════════════════════════════════════
    // MATERIALS
    // ═══════════════════════════════════════
    const matLower = new THREE.MeshStandardMaterial({ map: texCharcoal, roughness: 0.88, metalness: 0.0, color: 0x2a2622 });
    const matUpper = new THREE.MeshStandardMaterial({ map: texOak, roughness: 0.45, metalness: 0.0 });
    const matMarble = new THREE.MeshStandardMaterial({ map: texCalacatta, roughness: 0.05, metalness: 0.02, color: 0xf4f1ed });
    const matCarcass = new THREE.MeshStandardMaterial({ color: 0x181410, roughness: 0.72, metalness: 0.0 });
    const matBrass = new THREE.MeshStandardMaterial({ color: 0xc09850, roughness: 0.18, metalness: 0.88 });
    const matSteel = new THREE.MeshStandardMaterial({ color: 0x9a9690, roughness: 0.12, metalness: 0.9 });
    const matGlass = new THREE.MeshStandardMaterial({ color: 0xb8c8cc, roughness: 0.01, metalness: 0.08, transparent: true, opacity: 0.22 });
    const matFloor = new THREE.MeshStandardMaterial({ map: texConcrete, roughness: 0.84, metalness: 0.04, color: 0x302820 });
    const matWall = new THREE.MeshStandardMaterial({ color: 0x201c18, roughness: 0.92, metalness: 0.0 });
    const matTile = new THREE.MeshStandardMaterial({ map: texDarkTile, roughness: 0.55, metalness: 0.14, color: 0x1e1a15 });
    const matPanel = new THREE.MeshStandardMaterial({ map: texPanelWood, roughness: 0.5, metalness: 0.0 });

    // ═══════════════════════════════════════
    // ROOM
    // ═══════════════════════════════════════
    const room = new THREE.Group(); scene.add(room);

    const fl = new THREE.Mesh(new THREE.PlaneGeometry(32, 24), matFloor);
    fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; room.add(fl);
    for (let i = -10; i <= 10; i++) {
      const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.006, 24), new THREE.MeshStandardMaterial({ color: 0x1a1610, roughness: 1 }));
      ln.rotation.x = -Math.PI / 2; ln.position.set(i * 1.1, 0.001, 0); room.add(ln);
    }
    const bw = new THREE.Mesh(new THREE.PlaneGeometry(32, 14), matWall);
    bw.position.set(0, 7, -5.6); bw.receiveShadow = true; room.add(bw);
    const lw = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), matWall);
    lw.rotation.y = Math.PI / 2; lw.position.set(-10, 7, 0); lw.receiveShadow = true; room.add(lw);
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), matWall);
    rw.rotation.y = -Math.PI / 2; rw.position.set(10, 7, 0); rw.receiveShadow = true; room.add(rw);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x181510, roughness: 1 });
    const cwm = new THREE.Mesh(new THREE.PlaneGeometry(32, 24), ceilMat);
    cwm.rotation.x = Math.PI / 2; cwm.position.y = 13; room.add(cwm);
    const sk = new THREE.Mesh(new THREE.BoxGeometry(32, 0.1, 0.05), new THREE.MeshStandardMaterial({ color: 0x181410, roughness: 0.7 }));
    sk.position.set(0, 0.05, -5.55); room.add(sk);

    // ═══════════════════════════════════════
    // PANELS
    // ═══════════════════════════════════════
    const PCNT = 18;
    const panelGroup = new THREE.Group(); scene.add(panelGroup);
    const panelMeshes: THREE.Mesh[] = [];

    const pSizes = [
      [2.4, 0.038, 0.6], [2.0, 0.038, 0.58], [2.4, 0.038, 0.6], [1.8, 0.038, 0.55],
      [2.2, 0.038, 0.6], [2.6, 0.038, 0.6], [1.6, 0.038, 0.5], [2.4, 0.038, 0.58],
      [2.0, 0.038, 0.6], [1.8, 0.038, 0.55], [2.6, 0.038, 0.6], [2.2, 0.038, 0.58],
      [1.8, 0.038, 0.55], [2.4, 0.038, 0.6], [2.0, 0.038, 0.58], [2.6, 0.038, 0.6],
      [2.2, 0.038, 0.6], [1.8, 0.038, 0.55],
    ];
    const pColors = ['#C8A97A', '#A08050', '#D4B88A', '#8A6030'];

    for (let i = 0; i < PCNT; i++) {
      const [pw, ph, pd] = pSizes[i];
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pColors[i % 4]),
        map: i % 2 === 0 ? texOak.clone() : texPanelWood.clone(),
        roughness: 0.44 + Math.random() * 0.1, metalness: 0,
      });
      mat.map!.repeat.set(pw * 0.6, 0.9);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, pd), mat);
      mesh.castShadow = true; mesh.receiveShadow = true;

      const edgeMat = new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.55 });
      [0, 1].forEach((si) => {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, 0.003), edgeMat);
        edge.position.z = si === 0 ? pd / 2 + 0.0015 : -pd / 2 - 0.0015; mesh.add(edge);
      });

      const splayX = (i % 3 - 1) * 0.05 + (Math.random() - 0.5) * 0.03;
      const splayRY = (i - PCNT / 2) * 0.035 + (Math.random() - 0.5) * 0.02;
      mesh.userData.stackPos = new THREE.Vector3(splayX, i * 0.052 + 0.2, (Math.random() - 0.5) * 0.04);
      mesh.userData.stackRot = new THREE.Euler(0, splayRY, (Math.random() - 0.5) * 0.01);

      const angle = (i / PCNT) * Math.PI * 2 + 0.3;
      const radius = 2.8 + (i % 4) * 0.6;
      mesh.userData.explodePos = new THREE.Vector3(
        Math.cos(angle) * radius,
        0.3 + Math.abs(Math.sin(i * 0.9)) * 2.2,
        Math.sin(angle) * radius * 0.55 - 0.8,
      );
      mesh.userData.explodeRot = new THREE.Euler(
        (Math.random() - 0.5) * Math.PI * 0.8,
        angle + Math.PI * 0.5 + (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * Math.PI * 0.6,
      );

      mesh.position.copy(mesh.userData.stackPos);
      mesh.rotation.copy(mesh.userData.stackRot);
      panelGroup.add(mesh);
      panelMeshes.push(mesh);
    }

    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0, roughness: 1, depthWrite: false }),
    );
    shadowMesh.rotation.x = -Math.PI / 2; shadowMesh.position.set(-0.1, 0.001, 0.08);
    panelGroup.add(shadowMesh);

    // ═══════════════════════════════════════
    // KITCHEN
    // ═══════════════════════════════════════
    const kitchen = new THREE.Group(); scene.add(kitchen);
    const BH = 0.87, BD = 0.58, BY = BH / 2;
    const UH = 0.72, UD = 0.35;
    const UY = BH + 0.45 + UH / 2;
    const WALL_Z = -4.18;

    function brassHandle(parent: THREE.Group, cx: number, cy: number, cz: number, length = 0.3, horiz = true) {
      const bar = new THREE.Mesh(
        horiz ? new THREE.BoxGeometry(length, 0.01, 0.014) : new THREE.BoxGeometry(0.01, length, 0.014),
        matBrass,
      );
      bar.position.set(cx, cy, cz); parent.add(bar);
      const offsets = horiz ? [[-length / 2, 0], [length / 2, 0]] : [[0, -length / 2], [0, length / 2]];
      offsets.forEach(([ox, oy]) => {
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.038, 8), matBrass);
        pin.rotation.z = Math.PI / 2;
        pin.position.set(cx + ox, cy + oy, cz - 0.022); parent.add(pin);
      });
    }

    function makeBase(cx: number, type = 'door', w = 0.6) {
      const g = new THREE.Group();
      const pz = WALL_Z + BD / 2;
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, BH, BD), matCarcass);
      box.castShadow = true; box.receiveShadow = true; g.add(box);
      const tk = new THREE.Mesh(new THREE.BoxGeometry(w - 0.002, 0.1, BD * 0.12), new THREE.MeshStandardMaterial({ color: 0x0c0a07, roughness: 0.85 }));
      tk.position.set(0, -BH / 2 + 0.05, BD / 2 - BD * 0.06); g.add(tk);
      for (const sx of [-1, 1]) {
        const rv = new THREE.Mesh(new THREE.BoxGeometry(0.003, BH, BD), new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 1 }));
        rv.position.set(sx * (w / 2 - 0.0015), 0, 0); g.add(rv);
      }
      if (type === 'door') {
        const cnt = w > 0.7 ? 2 : 1;
        for (let di = 0; di < cnt; di++) {
          const dw = cnt === 2 ? w / 2 - 0.008 : w - 0.016;
          const dx = cnt === 2 ? (di === 0 ? -w / 4 : w / 4) : 0;
          const door = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.005, BH - 0.022, 0.019), matLower);
          door.position.set(dx, 0, BD / 2 + 0.0105); door.castShadow = true; g.add(door);
          brassHandle(g, dx, -BH * 0.28, BD / 2 + 0.025, Math.min(dw - 0.12, 0.28));
        }
      } else if (type === 'drawer') {
        const rows = 3;
        const dh = (BH - 0.05) / rows - 0.012;
        for (let r = 0; r < rows; r++) {
          const dy = -BH / 2 + 0.025 + r * (dh + 0.012) + dh / 2;
          const dr = new THREE.Mesh(new THREE.BoxGeometry(w - 0.016, dh, 0.02), matLower);
          dr.position.set(0, dy, BD / 2 + 0.011); dr.castShadow = true; g.add(dr);
          brassHandle(g, 0, dy, BD / 2 + 0.027, Math.min(w - 0.14, 0.25));
        }
      } else if (type === 'sink') {
        const ff = new THREE.Mesh(new THREE.BoxGeometry(w - 0.016, 0.12, 0.019), matLower);
        ff.position.set(0, BH / 2 - 0.07, BD / 2 + 0.0105); ff.castShadow = true; g.add(ff);
        brassHandle(g, 0, BH / 2 - 0.07, BD / 2 + 0.026, Math.min(w - 0.12, 0.28));
      }
      g.position.set(cx, BY, pz);
      return g;
    }

    function makeUpper(cx: number, type = 'door', w = 0.6) {
      const g = new THREE.Group();
      const pz = WALL_Z + UD / 2;
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, UH, UD), matCarcass);
      box.castShadow = true; box.receiveShadow = true; g.add(box);
      for (const sy of [-1, 1]) {
        const rv = new THREE.Mesh(new THREE.BoxGeometry(w, 0.003, UD), new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 1 }));
        rv.position.set(0, sy * (UH / 2 - 0.0015), 0); g.add(rv);
      }
      const cnt = w > 0.7 ? 2 : 1;
      for (let di = 0; di < cnt; di++) {
        const dw = cnt === 2 ? w / 2 - 0.007 : w - 0.015;
        const dx = cnt === 2 ? (di === 0 ? -w / 4 : w / 4) : 0;
        if (type === 'glass') {
          const frame = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.005, UH - 0.022, 0.018), matUpper);
          frame.position.set(dx, 0, UD / 2 + 0.01); frame.castShadow = true; g.add(frame);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.06, UH - 0.07, 0.005), matGlass);
          glass.position.set(dx, 0, UD / 2 + 0.014); g.add(glass);
          [[0, UH / 2 - 0.022], [0, -UH / 2 + 0.022]].forEach(([, fy]) => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.005, 0.022, 0.018), matUpper);
            rail.position.set(dx, fy!, UD / 2 + 0.01); g.add(rail);
          });
          brassHandle(g, dx + (cnt === 2 ? (di === 0 ? dw / 2 - 0.06 : -dw / 2 + 0.06) : 0), -UH * 0.3, UD / 2 + 0.024, 0.2);
        } else {
          const door = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.005, UH - 0.022, 0.018), matUpper);
          door.position.set(dx, 0, UD / 2 + 0.01); door.castShadow = true; g.add(door);
          brassHandle(g, dx + (cnt === 2 ? (di === 0 ? dw / 2 - 0.06 : -dw / 2 + 0.06) : 0), -UH * 0.3, UD / 2 + 0.024, 0.2);
        }
      }
      const led = new THREE.Mesh(new THREE.BoxGeometry(w - 0.02, 0.015, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xfff8e0, roughness: 0.8, emissive: 0xfff8e0, emissiveIntensity: 0 }));
      led.userData.isEmissive = true;
      led.position.set(0, -UH / 2 - 0.008, UD / 2 - 0.02); g.add(led);
      g.position.set(cx, UY, pz);
      return g;
    }

    function makeTall(cx: number) {
      const TW = 0.6, TH = 2.38, TD = 0.6;
      const pz = WALL_Z + TD / 2;
      const g = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(TW, TH, TD), matCarcass);
      box.castShadow = true; box.receiveShadow = true; g.add(box);
      const doorHeights = [TH * 0.35, TH * 0.35, TH * 0.22];
      const doorY = [TH * 0.28, -TH * 0.06, -TH * 0.37];
      doorHeights.forEach((dh, i) => {
        const door = new THREE.Mesh(new THREE.BoxGeometry(TW - 0.016, dh - 0.01, 0.02), matLower);
        door.position.set(0, doorY[i], TD / 2 + 0.011); door.castShadow = true; g.add(door);
        brassHandle(g, TW * 0.28, doorY[i], TD / 2 + 0.026, 0.24);
      });
      const tk = new THREE.Mesh(new THREE.BoxGeometry(TW, 0.1, TD * 0.12), new THREE.MeshStandardMaterial({ color: 0x0c0a07, roughness: 0.85 }));
      tk.position.set(0, -TH / 2 + 0.05, TD / 2 - TD * 0.06); g.add(tk);
      g.position.set(cx, TH / 2, pz);
      return g;
    }

    function makeCountertop(cx: number, totalW: number) {
      const g = new THREE.Group();
      const depth = BD + 0.06;
      const pz = WALL_Z + depth / 2 + 0.01;
      const top = new THREE.Mesh(new THREE.BoxGeometry(totalW, 0.04, depth), matMarble);
      top.castShadow = true; top.receiveShadow = true; g.add(top);
      const fe = new THREE.Mesh(new THREE.BoxGeometry(totalW, 0.038, 0.045),
        new THREE.MeshStandardMaterial({ map: texCalacatta.clone(), roughness: 0.03, metalness: 0.02, color: 0xf0ede9 }));
      fe.position.z = depth / 2 + 0.022; g.add(fe);
      const bs = new THREE.Mesh(new THREE.BoxGeometry(totalW, 0.65, 0.015), matTile);
      bs.position.set(0, 0.36, -depth / 2 + 0.007); bs.receiveShadow = true; g.add(bs);
      g.position.set(cx, BH + 0.02, pz - depth / 2 + depth / 2);
      return g;
    }

    function makeSink(cx: number) {
      const pz = WALL_Z + BD / 2;
      const g = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.022, 0.38), matSteel);
      ring.castShadow = true; g.add(ring);
      const basin = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.19, 0.30),
        new THREE.MeshStandardMaterial({ color: 0x111010, roughness: 0.35, metalness: 0.18, side: THREE.BackSide }));
      basin.position.y = -0.095; g.add(basin);
      const drain = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.008, 16),
        new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.2, metalness: 0.85 }));
      drain.position.set(0.1, -0.19, 0); g.add(drain);
      const tapBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), matSteel);
      tapBase.position.set(0, 0.03, -0.08); g.add(tapBase);
      const tapRiser = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 8), matSteel);
      tapRiser.position.set(0, 0.18, -0.08); g.add(tapRiser);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.18, 8), matSteel);
      neck.rotation.z = -Math.PI * 0.42; neck.position.set(0.06, 0.255, -0.08); g.add(neck);
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.025, 8), matSteel);
      spout.position.set(0.13, 0.19, -0.08); g.add(spout);
      g.position.set(cx, BH + 0.042, pz);
      return g;
    }

    function makeCooktop(cx: number) {
      const pz = WALL_Z + BD / 2;
      const g = new THREE.Group();
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.012, 0.52),
        new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.04, metalness: 0.8 }));
      top.castShadow = true; g.add(top);
      const border = new THREE.Mesh(new THREE.BoxGeometry(0.61, 0.008, 0.53),
        new THREE.MeshStandardMaterial({ color: 0x888078, roughness: 0.15, metalness: 0.85 }));
      border.position.y = -0.002; g.add(border);
      const bpos = [[-0.17, 0, -0.1], [0.17, 0, -0.1], [-0.17, 0, 0.1], [0.17, 0, 0.1]];
      bpos.forEach(([bx, , bz], bi) => {
        const r = bi < 2 ? 0.095 : 0.075;
        const outer = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 28),
          new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.65 }));
        outer.rotation.x = Math.PI / 2; outer.position.set(bx, 0.008, bz); g.add(outer);
        const mid = new THREE.Mesh(new THREE.TorusGeometry(r * 0.62, 0.007, 8, 20),
          new THREE.MeshStandardMaterial({ color: 0x2e2e2e, roughness: 0.35, metalness: 0.55 }));
        mid.rotation.x = Math.PI / 2; mid.position.set(bx, 0.01, bz); g.add(mid);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.006, 12),
          new THREE.MeshStandardMaterial({ color: 0x444438, roughness: 0.4, metalness: 0.5 }));
        cap.position.set(bx, 0.009, bz); g.add(cap);
      });
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.006, 0.055),
        new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.1, metalness: 0.75 }));
      bar.position.set(0, 0.007, 0.248); g.add(bar);
      for (let k = 0; k < 4; k++) {
        const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.022, 10),
          new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.2, metalness: 0.72 }));
        kn.rotation.z = Math.PI / 2; kn.position.set(-0.21 + k * 0.14, 0.013, 0.248); g.add(kn);
        const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 8), matBrass);
        tip.rotation.z = Math.PI / 2; tip.position.set(-0.21 + k * 0.14 + 0.011, 0.013, 0.248); g.add(tip);
      }
      g.position.set(cx, BH + 0.044, pz);
      return g;
    }

    function makeHood(cx: number) {
      const pz = WALL_Z + UD / 2 + 0.03;
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.38, 0.46),
        new THREE.MeshStandardMaterial({ color: 0x1a1a18, roughness: 0.12, metalness: 0.78 }));
      g.add(body);
      const tbox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x161614, roughness: 0.18, metalness: 0.72 }));
      tbox.position.y = 0.465; g.add(tbox);
      const duct = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.1, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x141412, roughness: 0.22, metalness: 0.7 }));
      duct.position.y = 1.22; g.add(duct);
      const ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.032, 0.038),
        new THREE.MeshStandardMaterial({ color: 0x111110, roughness: 0.08, metalness: 0.8 }));
      ctrl.position.set(0, -0.165, 0.22); g.add(ctrl);
      for (let b = 0; b < 3; b++) {
        const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.005, 8), matBrass);
        btn.rotation.x = Math.PI / 2; btn.position.set(-0.08 + b * 0.08, -0.165, 0.242); g.add(btn);
      }
      const led2 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.01, 0.035),
        new THREE.MeshStandardMaterial({ color: 0xfffae8, roughness: 0.5, emissive: 0xfffae8, emissiveIntensity: 0 }));
      led2.userData.isEmissive = true; led2.position.set(0, -0.192, 0.2); g.add(led2);
      for (let v = 0; v < 5; v++) {
        const vl = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.004, 0.008),
          new THREE.MeshStandardMaterial({ color: 0x0e0e0c, roughness: 0.4, metalness: 0.6 }));
        vl.position.set(0, -0.14 + v * 0.012, 0.225); g.add(vl);
      }
      g.position.set(cx, UY + 0.12, pz);
      return g;
    }

    // ═══════════════════════════════════════
    // KITCHEN LAYOUT
    // ═══════════════════════════════════════
    const UNITS: [string, number][] = [
      ['tall', 0.6], ['door', 0.6], ['drawer', 0.6], ['door', 0.6], ['sink', 0.8],
      ['door', 0.6], ['drawer', 0.6], ['cooktop', 0.8], ['door', 0.6], ['door', 0.6],
    ];
    const totalKitchenW = UNITS.reduce((s, u) => s + u[1], 0);
    let curX = -totalKitchenW / 2;
    const pieces: THREE.Group[] = [];
    const basePositions: { cx: number; w: number; type: string }[] = [];

    UNITS.forEach(([type, w]) => {
      const cx = curX + w / 2;
      basePositions.push({ cx, w, type });
      if (type === 'tall') pieces.push(makeTall(cx));
      else if (type === 'cooktop') pieces.push(makeBase(cx, 'door', w));
      else pieces.push(makeBase(cx, type, w));
      curX += w;
    });

    const firstBaseIdx = 1;
    const lastBaseIdx = UNITS.length - 1;
    const ctLeft = basePositions[firstBaseIdx].cx - basePositions[firstBaseIdx].w / 2;
    const ctRight = basePositions[lastBaseIdx].cx + basePositions[lastBaseIdx].w / 2;
    const ctWidth = ctRight - ctLeft;
    const ctCenterX = ctLeft + ctWidth / 2;
    pieces.push(makeCountertop(ctCenterX, ctWidth));

    const sinkBP = basePositions.find(b => b.type === 'sink')!;
    pieces.push(makeSink(sinkBP.cx));

    const ctBP = basePositions.find(b => b.type === 'cooktop')!;
    pieces.push(makeCooktop(ctBP.cx));
    pieces.push(makeHood(ctBP.cx));

    const upperLayout = [
      { idx: 1, type: 'glass' }, { idx: 2, type: 'door' }, { idx: 3, type: 'glass' },
      { idx: 5, type: 'glass' }, { idx: 6, type: 'door' },
      { idx: 8, type: 'door' }, { idx: 9, type: 'glass' },
    ];
    upperLayout.forEach(({ idx, type }) => {
      const bp = basePositions[idx];
      pieces.push(makeUpper(bp.cx, type, bp.w));
    });

    // Backsplash
    const tileH = UY - UH / 2 - (BH + 0.06) - 0.04;
    const tileStrip = new THREE.Mesh(new THREE.BoxGeometry(ctWidth, tileH + 0.05, 0.02), matTile);
    tileStrip.position.set(ctCenterX, (BH + 0.06) + tileH / 2, WALL_Z + 0.01);
    tileStrip.receiveShadow = true;
    kitchen.add(tileStrip);

    pieces.forEach((p) => {
      p.userData.finalPos = p.position.clone();
      p.userData.finalRotY = p.rotation.y;
      p.visible = false;
      kitchen.add(p);
    });

    // ═══════════════════════════════════════
    // PARTICLES
    // ═══════════════════════════════════════
    const PCNT_P = 280;
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(PCNT_P * 3);
    const pSpd = new Float32Array(PCNT_P);
    for (let i = 0; i < PCNT_P; i++) {
      pArr[i * 3] = (Math.random() - 0.5) * 16;
      pArr[i * 3 + 1] = Math.random() * 6;
      pArr[i * 3 + 2] = (Math.random() - 0.5) * 12;
      pSpd[i] = 0.0008 + Math.random() * 0.0025;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const pMat2 = new THREE.PointsMaterial({ color: 0xc4a882, size: 0.022, transparent: true, opacity: 0.3 });
    const particles = new THREE.Points(pGeo, pMat2);
    scene.add(particles);

    // ═══════════════════════════════════════
    // SCROLL & MATH
    // ═══════════════════════════════════════
    let rawP = 0, smoothP = 0;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const map = (v: number, i0: number, i1: number, o0: number, o1: number) => o0 + (o1 - o0) * clamp((v - i0) / (i1 - i0), 0, 1);
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const easeOutBack = (t: number) => { const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    const easeInOutQuart = (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    const handleScroll = () => {
      const scrollSpace = scrollSpaceRef.current;
      if (!scrollSpace) return;
      const TOTAL = scrollSpace.offsetHeight - window.innerHeight;
      rawP = Math.min(1, Math.max(0, window.scrollY / Math.max(1, TOTAL)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Camera keyframes
    const camKeys = [
      { t: 0.00, pos: [0, 4.2, 14], look: [0, 1.2, 0] },
      { t: 0.10, pos: [0, 3.0, 11], look: [0, 1.5, 0] },
      { t: 0.20, pos: [2, 2.5, 9], look: [-0.5, 1.2, -1] },
      { t: 0.32, pos: [-2.5, 2.2, 8], look: [0.5, 1.0, -2] },
      { t: 0.44, pos: [4, 1.9, 7], look: [-1.5, 1.2, -3] },
      { t: 0.56, pos: [-2, 1.75, 5.5], look: [1, 1.3, -3.5] },
      { t: 0.68, pos: [1.5, 1.6, 4.5], look: [-0.5, 1.35, -3.8] },
      { t: 0.80, pos: [0, 1.55, 3.8], look: [0, 1.5, -3.9] },
      { t: 0.90, pos: [-1.2, 1.5, 3.3], look: [0.8, 1.6, -3.9] },
      { t: 1.00, pos: [0, 1.4, 3.0], look: [0, 1.55, -4.0] },
    ];
    function getCam(t: number) {
      let idx = 0;
      for (let k = 0; k < camKeys.length - 1; k++) { if (t >= camKeys[k].t) idx = k; }
      idx = Math.min(idx, camKeys.length - 2);
      const a = camKeys[idx], b = camKeys[idx + 1];
      const f = easeInOutSine(clamp((t - a.t) / (b.t - a.t), 0, 1));
      return {
        pos: a.pos.map((v, j) => lerp(v, b.pos[j], f)),
        look: a.look.map((v, j) => lerp(v, b.look[j], f)),
      };
    }

    // Piece start offsets
    const startOffsets = pieces.map((p, i) => {
      const angle = (i / pieces.length) * Math.PI * 2 + 0.4;
      const r = 3.5 + (i % 5) * 0.7;
      return {
        x: p.userData.finalPos.x + Math.cos(angle) * r,
        y: p.userData.finalPos.y + 2.8 + (i % 6) * 0.35,
        z: p.userData.finalPos.z + Math.sin(angle) * r * 0.65 + 4.5,
        rx: (i % 2 === 0 ? 1 : -1) * (0.2 + Math.random() * 0.3),
        ry: angle + (Math.random() - 0.5) * 0.5,
        rz: (i % 3 === 0 ? 1 : -1) * (0.15 + Math.random() * 0.25),
      };
    });

    // Phases
    const phases = [
      { label: 'Camera <em>goală</em>', desc: 'Spațiu pur. Posibilitate infinită.', range: [0, 0.18], dot: 0 },
      { label: 'Plăci <em>premium</em>', desc: 'Materialele aterizează.', range: [0.18, 0.38], dot: 1 },
      { label: 'Asamblare <em>în curs</em>', desc: 'Fiecare piesă la locul ei.', range: [0.38, 0.78], dot: 2 },
      { label: 'La <em>milimetru.</em>', desc: 'Bucătărie completă — Milimetric.', range: [0.78, 1.0], dot: 3 },
    ];
    let curPhase = -1;

    // ═══════════════════════════════════════
    // ANIMATION LOOP
    // ═══════════════════════════════════════
    const clock = new THREE.Clock();
    let time = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta(); time += dt;
      smoothP += (rawP - smoothP) * 0.055;
      const p = smoothP;



      // Camera
      const cp = getCam(p);
      camera.position.set(cp.pos[0], cp.pos[1], cp.pos[2]);
      camera.lookAt(cp.look[0], cp.look[1], cp.look[2]);

      // Particles
      const pa = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PCNT_P; i++) {
        pa[i * 3 + 1] += pSpd[i];
        if (pa[i * 3 + 1] > 6.5) pa[i * 3 + 1] = 0;
        pa[i * 3] += Math.sin(time * 0.25 + i * 0.3) * 0.0006;
        pa[i * 3 + 2] += Math.cos(time * 0.18 + i * 0.5) * 0.0004;
      }
      pGeo.attributes.position.needsUpdate = true;
      pMat2.opacity = 0.2 + Math.sin(time * 0.4) * 0.08;
      particles.rotation.y = time * 0.012;

      // Panels
      const panelAppear = map(p, 0.10, 0.30, 0, 1);
      const panelExplode = map(p, 0.28, 0.52, 0, 1);
      const panelExitGlobal = map(p, 0.50, 0.78, 0, 1);
      panelGroup.visible = p > 0.08 && p < 0.82;

      if (panelGroup.visible) {
        const groupRise = easeOutBack(clamp(map(p, 0.10, 0.26, 0, 1), 0, 1));
        panelGroup.position.y = lerp(-1.5, 0, groupRise);
        panelGroup.position.x = Math.sin(time * 0.3) * 0.008;

        panelMeshes.forEach((pm, i) => {
          const delay2 = i / PCNT * 0.6;
          const lAppear = easeOutBack(clamp(map(panelAppear, delay2, delay2 + 0.55, 0, 1), 0, 1));
          const lExplode = easeInOutQuart(clamp(map(panelExplode, delay2 * 0.3, delay2 * 0.3 + 0.65, 0, 1), 0, 1));
          const exitPhase = i % 2 === 0 ? 0 : 0.5;
          const exitDelay = (i / PCNT) * 0.30 + (exitPhase / PCNT) * 0.08;
          const exitDur = 0.38;
          const lExit = easeInOutSine(clamp(map(panelExitGlobal, exitDelay, exitDelay + exitDur, 0, 1), 0, 1));
          const ex = pm.userData.explodePos;
          const pmMaterial = pm.material as THREE.MeshStandardMaterial;

          if (lExplode < 0.02) {
            pm.position.set(pm.userData.stackPos.x, pm.userData.stackPos.y * lAppear, pm.userData.stackPos.z);
            pm.rotation.set((1 - lAppear) * 0.08 * (i % 2 === 0 ? 1 : -1), pm.userData.stackRot.y, (1 - lAppear) * 0.06 * (i % 3 === 0 ? 1 : -1));
            pmMaterial.opacity = lAppear;
            pmMaterial.transparent = lAppear < 0.99;
            if (lAppear > 0.5) pm.position.y += Math.sin(time * 0.9 + i * 0.45) * 0.0035;
            pm.scale.set(1, 1, 1);
          } else {
            const airX = lerp(pm.userData.stackPos.x, ex.x, lExplode);
            const airY = lerp(pm.userData.stackPos.y, ex.y, lExplode);
            const airZ = lerp(pm.userData.stackPos.z, ex.z, lExplode);
            const exitDirX = ex.x * 1.6;
            const exitDirY = ex.y + 3.5;
            const exitDirZ = ex.z + 2.0;
            pm.position.set(lerp(airX, exitDirX, lExit), lerp(airY, exitDirY, lExit), lerp(airZ, exitDirZ, lExit));
            pm.rotation.set(
              lerp(0, pm.userData.explodeRot.x, lExplode),
              lerp(pm.userData.stackRot.y, pm.userData.explodeRot.y, lExplode),
              lerp(0, pm.userData.explodeRot.z, lExplode),
            );
            if (lExplode > 0.2) {
              const spinSpeed = lerp(1.0, 0.0, lExit * lExit);
              pm.rotation.y += dt * (0.55 + i * 0.055) * (i % 2 === 0 ? 1 : -1) * spinSpeed;
              pm.rotation.x += dt * (0.30 + i * 0.038) * (i % 3 === 0 ? 1 : -1) * spinSpeed;
            }
            const sc = lerp(1.0, 0.75, lExit);
            pm.scale.set(sc, sc, sc);
            pmMaterial.opacity = clamp(1.0 - lExit, 0, 1);
            pmMaterial.transparent = true;
          }
        });
        (shadowMesh.material as THREE.MeshStandardMaterial).opacity = panelAppear * 0.28 * (1 - panelExplode * 0.8);
      }

      // Kitchen assembly
      const asmT = map(p, 0.40, 0.90, 0, 1);
      pieces.forEach((pc, i) => {
        const waveDelay = (i / pieces.length) * 0.55;
        const lt = clamp(map(asmT, waveDelay, waveDelay + 0.42, 0, 1), 0, 1);
        const ltEasedPos = easeOutBack(lt);
        const ltEasedRot = easeOutCubic(lt);
        const ltEasedY = easeOutQuart(lt);
        if (lt > 0.008) {
          pc.visible = true;
          const so = startOffsets[i];
          pc.position.set(lerp(so.x, pc.userData.finalPos.x, ltEasedPos), lerp(so.y, pc.userData.finalPos.y, ltEasedY), lerp(so.z, pc.userData.finalPos.z, ltEasedPos));
          pc.rotation.set(lerp(so.rx, 0, ltEasedRot), lerp(so.ry, pc.userData.finalRotY || 0, ltEasedRot), lerp(so.rz, 0, ltEasedRot));
        } else {
          pc.visible = false;
        }
      });

      // Final lighting
      const finalT = easeInOutSine(map(p, 0.82, 1.0, 0, 1));
      ledLight.intensity = lerp(0.5, 3.5, finalT);
      kitchen.traverse((child: THREE.Object3D) => {
        if (child.userData && child.userData.isEmissive && child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).emissiveIntensity = finalT * 0.95;
        }
      });

      // UI updates
      const heroEl = heroRef.current;
      const phaseEl = phaseRef.current;
      const progEl2 = progRef.current;
      const progFillEl = progFillRef.current;
      const progNumEl = progNumRef.current;
      const dotsEl = dotsRef.current;
      const finalEl = finalRef.current;
      const phaseTitleEl = phaseTitleRef.current;
      const phaseDescEl2 = phaseDescRef.current;

      if (heroEl) {
        if (p > 0.07) heroEl.classList.add('hidden');
        else heroEl.classList.remove('hidden');
      }

      let ph = 0;
      phases.forEach((phase, i) => { if (p >= phase.range[0]) ph = i; });

      if (phaseEl) phaseEl.classList.toggle('show', p > 0.04 && p < 0.95);
      if (progEl2) progEl2.classList.toggle('show', p > 0.05);
      if (dotsEl) dotsEl.classList.toggle('show', p > 0.05);

      if (ph !== curPhase) {
        curPhase = ph;
        if (phaseTitleEl) {
          phaseTitleEl.style.opacity = '0';
          phaseTitleEl.style.transform = 'translateY(10px)';
          setTimeout(() => {
            if (phaseTitleEl) {
              phaseTitleEl.innerHTML = phases[ph].label;
              if (phaseDescEl2) phaseDescEl2.textContent = phases[ph].desc;
              phaseTitleEl.style.transition = 'opacity 0.55s ease,transform 0.55s ease';
              phaseTitleEl.style.opacity = '1';
              phaseTitleEl.style.transform = 'translateY(0)';
            }
          }, 60);
        }
        dotRefs.current.forEach((d, i) => {
          if (d) d.classList.toggle('active', i === phases[ph].dot);
        });
      }

      if (progFillEl) progFillEl.style.height = (p * 100).toFixed(1) + '%';
      if (progNumEl) progNumEl.textContent = Math.round(p * 100) + '%';
      if (finalEl) finalEl.classList.toggle('show', p > 0.94);

      renderer.render(scene, camera);
    }

    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach((m: THREE.Material) => m.dispose());
          else child.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div className="hero-scene-wrapper">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div ref={scrollSpaceRef} className="hero-scroll-space" />

      <div ref={uiRef} className="hero-ui">
        {/* Hero center text */}
        <div ref={heroRef} className="hero-text">
          <p className="hero-tag">Mobilier la comandă · Cluj Napoca</p>
          <h1 className="hero-h1">
            Fiecare piesă<br /><em>intenționată.</em>
          </h1>
          <p className="hero-sub">Urmărește cum prind viață ideile tale</p>
          <div className="hero-scroll-cue">
            <span>Scroll</span>
            <div className="hero-scroll-line" />
          </div>
        </div>

        {/* Phase indicator */}
        <div ref={phaseRef} className="hero-phase">
          <div ref={phaseTitleRef} className="hero-phase-title">
            Camera <em>goală</em>
          </div>
          <div ref={phaseDescRef} className="hero-phase-desc">
            Spațiu pur. Posibilitate infinită.
          </div>
        </div>

        {/* Progress */}
        <div ref={progRef} className="hero-prog">
          <div className="hero-prog-track">
            <div ref={progFillRef} className="hero-prog-fill" />
          </div>
          <div ref={progNumRef} className="hero-prog-num">0%</div>
        </div>

        {/* Dots */}
        <div ref={dotsRef} className="hero-dots">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              ref={(el) => { if (el) dotRefs.current[i] = el; }}
              className={`hero-dot${i === 0 ? ' active' : ''}`}
            />
          ))}
        </div>

        {/* Final CTA */}
        <div ref={finalRef} className="hero-final">
          <h2>
            La milimetru,<br /><em>la locul lui.</em>
          </h2>
          <p>Design · Proiectare · Execuție</p>
          <Link href="/configurator" className="hero-cta">
            Solicită ofertă gratuită
          </Link>
        </div>
      </div>
    </div>
  );
}
