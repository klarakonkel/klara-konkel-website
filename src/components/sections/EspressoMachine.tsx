import { useEffect, useRef } from "react";

/*
 * Two-mode coffee physics — DROP (reading) / STREAM (scrolling)
 * Cup at bottom of viewport fills as drops are absorbed; overflows when full.
 */

// ─── Stream / physics constants ───────────────────────────────────
const PANEL_W      = 110;
const GRAVITY      = 0.13;
const MAX_VY       = 9.0;
const SPOUT_L      = 38;
const SPOUT_R      = 62;
const SPOUT_Y      = 92;
const DROP_R       = 3.5;
const STREAM_GAP   = 32;
const DROP_GAP     = 14;
const ENTER_STREAM = 4.5;
const EXIT_STREAM  = 2.0;
const MAX_DX       = 12;

// ─── Cup geometry (screen-relative, px) ──────────────────────────
// Cup is positioned at bottom of viewport; GTOP computed dynamically.
const CX        = 52;     // center x
const C_OW_TOP  = 74;     // outer width at rim
const C_OW_BOT  = 62;     // outer width at base (cup tapers inward)
const C_IW_TOP  = 63;     // inner width at rim   (= OW - 2×wall)
const C_IW_BOT  = 51;     // inner width at base
const C_H       = 52;     // cup height
const C_WALL    = 5.5;    // ceramic wall thickness
const C_GTOP_OFF = 118;   // px from bottom of screen to cup rim

// Derived (don't depend on h)
const G_GLEFT       = CX - C_IW_TOP / 2;   // 52 - 31.5 = 20.5
const G_GRIGHT      = CX + C_IW_TOP / 2;   // 52 + 31.5 = 83.5
const MAX_FILL      = C_H - C_WALL * 2 - 3; // ≈ 38 px inner fill height
const FILL_PER_DROP = 0.20;

interface Drop {
  x: number; y: number;
  vy: number; vx: number;
  r: number;
  stream: boolean;
  overflow: boolean;
}

// ─── Stream rendering helpers ─────────────────────────────────────

function pathThrough(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  offsetX = 0,
) {
  ctx.moveTo(pts[0].x + offsetX, pts[0].y);
  if (pts.length === 2) { ctx.lineTo(pts[1].x + offsetX, pts[1].y); return; }
  let mx = (pts[0].x + pts[1].x) / 2 + offsetX;
  let my = (pts[0].y + pts[1].y) / 2;
  ctx.lineTo(mx, my);
  for (let i = 1; i < pts.length - 1; i++) {
    const nx = (pts[i].x + pts[i + 1].x) / 2 + offsetX;
    const ny = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x + offsetX, pts[i].y, nx, ny);
  }
  ctx.lineTo(pts[pts.length - 1].x + offsetX, pts[pts.length - 1].y);
}

function drawDrop(ctx: CanvasRenderingContext2D, p: Drop) {
  const rx = p.r;
  const ry = Math.min(p.r * (1 + Math.abs(p.vy) * 0.2), p.r * 2.2);
  ctx.save();
  ctx.translate(p.x, p.y);
  const g = ctx.createRadialGradient(-rx * 0.4, -ry * 0.4, 0, 0, 0, Math.max(rx, ry));
  g.addColorStop(0,   'rgba(220,148,30,0.95)');
  g.addColorStop(0.4, 'rgba(158,74,18,0.92)');
  g.addColorStop(1,   'rgba(80,32,10,0.82)');
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

function drawSegment(ctx: CanvasRenderingContext2D, seg: Drop[]) {
  if (seg.length === 0) return;
  if (seg.length === 1) { drawDrop(ctx, seg[0]); return; }
  const y0 = seg[0].y;
  const yN = seg[seg.length - 1].y;
  ctx.beginPath();
  pathThrough(ctx, seg);
  const gMain = ctx.createLinearGradient(0, y0, 0, yN + 50);
  gMain.addColorStop(0,    'rgba(218,144,30,0.94)');
  gMain.addColorStop(0.05, 'rgba(188,102,24,0.93)');
  gMain.addColorStop(0.18, 'rgba(152,70,18,0.92)');
  gMain.addColorStop(0.45, 'rgba(112,48,14,0.91)');
  gMain.addColorStop(1,    'rgba(72,28,9,0.89)');
  ctx.strokeStyle = gMain;
  ctx.lineWidth   = DROP_R * 2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.stroke();
  const hlFadeY = Math.min(y0 + 250, yN);
  if (y0 < hlFadeY) {
    ctx.beginPath();
    pathThrough(ctx, seg, DROP_R * 0.5);
    const gHL = ctx.createLinearGradient(0, y0, 0, hlFadeY);
    gHL.addColorStop(0,    'rgba(252,200,82,0.70)');
    gHL.addColorStop(0.18, 'rgba(228,160,56,0.50)');
    gHL.addColorStop(0.45, 'rgba(198,112,38,0.22)');
    gHL.addColorStop(0.75, 'rgba(168,82,26,0.06)');
    gHL.addColorStop(1,    'rgba(140,60,18,0)');
    ctx.strokeStyle = gHL;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }
}

function buildSegs(drops: Drop[]): Drop[][] {
  if (drops.length === 0) return [];
  const sorted = [...drops].sort((a, b) => a.y - b.y);
  const segs: Drop[][] = [];
  let cur: Drop[]      = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const dy   = curr.y - prev.y;
    const dx   = Math.abs(curr.x - prev.x);
    const thr  =
      (curr.stream   && prev.stream)   ? STREAM_GAP :
      (curr.overflow && prev.overflow) ? DROP_GAP   :
      (!curr.stream && !curr.overflow &&
       !prev.stream && !prev.overflow) ? DROP_GAP   : Infinity;
    if (dy <= thr && dx <= MAX_DX) { cur.push(curr); }
    else { segs.push(cur); cur = [curr]; }
  }
  segs.push(cur);
  return segs;
}

// ─── Component ────────────────────────────────────────────────────

export default function EspressoMachine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const h   = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width        = PANEL_W * dpr;
    canvas.height       = h * dpr;
    canvas.style.width  = `${PANEL_W}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Dynamic cup geometry
    const GTOP = h - C_GTOP_OFF;
    const GBOT = GTOP + C_H;

    // Helpers: outer & inner x-edges at any y in [GTOP, GBOT]
    const tFrac = (y: number) => Math.min(1, Math.max(0, (y - GTOP) / C_H));
    const outerLeft  = (y: number) => CX - (C_OW_TOP / 2 + (C_OW_BOT / 2 - C_OW_TOP / 2) * tFrac(y));
    const outerRight = (y: number) => CX + (C_OW_TOP / 2 + (C_OW_BOT / 2 - C_OW_TOP / 2) * tFrac(y));
    const innerLeft  = (y: number) => CX - (C_IW_TOP / 2 + (C_IW_BOT / 2 - C_IW_TOP / 2) * tFrac(y));
    const innerRight = (y: number) => CX + (C_IW_TOP / 2 + (C_IW_BOT / 2 - C_IW_TOP / 2) * tFrac(y));

    // ─── Draw espresso cup ──────────────────────────────────────────
    function drawCup(coffeeLevel: number) {
      const rimY       = GTOP;
      const baseY      = GBOT;
      const innerRimY  = rimY  + C_WALL;
      const innerBaseY = baseY - C_WALL;

      // ── Drop shadow under saucer ──
      ctx.beginPath();
      ctx.ellipse(CX + 3, baseY + 22, C_OW_BOT / 2 + 8, 5, 0, 0, Math.PI * 2);
      const gDropShadow = ctx.createRadialGradient(CX+3, baseY+22, 0, CX+3, baseY+22, C_OW_BOT/2+8);
      gDropShadow.addColorStop(0,   'rgba(0,0,0,0.22)');
      gDropShadow.addColorStop(0.6, 'rgba(0,0,0,0.08)');
      gDropShadow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = gDropShadow;
      ctx.fill();

      // ── Saucer ──
      const saucerY  = baseY + 5;
      const saucerRX = C_OW_BOT / 2 + 13;  // ≈ 44
      const saucerRY = 7.5;

      // Saucer body (top half visible)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(CX, saucerY, saucerRX, saucerRY, 0, 0, Math.PI * 2);
      const gSaucer = ctx.createLinearGradient(CX - saucerRX, 0, CX + saucerRX, 0);
      gSaucer.addColorStop(0,    'hsl(28,18%,78%)');
      gSaucer.addColorStop(0.1,  'hsl(28,14%,94%)');
      gSaucer.addColorStop(0.42, 'hsl(28,10%,98%)');
      gSaucer.addColorStop(0.75, 'hsl(28,13%,94%)');
      gSaucer.addColorStop(1,    'hsl(28,18%,80%)');
      ctx.fillStyle = gSaucer;
      ctx.fill();
      // Saucer rim highlight
      ctx.beginPath();
      ctx.ellipse(CX - 3, saucerY - 2, saucerRX - 5, saucerRY - 2, -0.05, Math.PI * 1.15, Math.PI * 1.85);
      ctx.strokeStyle = 'rgba(255,255,255,0.70)';
      ctx.lineWidth   = 1.4;
      ctx.stroke();
      // Raised centre ring of saucer
      ctx.beginPath();
      ctx.ellipse(CX, saucerY - 1, 20, 4.5, 0, 0, Math.PI * 2);
      const gRing = ctx.createLinearGradient(CX - 20, 0, CX + 20, 0);
      gRing.addColorStop(0,   'hsl(28,20%,80%)');
      gRing.addColorStop(0.3, 'hsl(28,12%,95%)');
      gRing.addColorStop(0.7, 'hsl(28,12%,95%)');
      gRing.addColorStop(1,   'hsl(28,20%,80%)');
      ctx.fillStyle = gRing;
      ctx.fill();
      ctx.restore();

      // ── Cup outer body ──
      const gCeramic = ctx.createLinearGradient(outerLeft(rimY), 0, outerRight(rimY), 0);
      gCeramic.addColorStop(0,    'hsl(28,22%,74%)');
      gCeramic.addColorStop(0.07, 'hsl(28,16%,91%)');
      gCeramic.addColorStop(0.28, 'hsl(28,10%,98%)');
      gCeramic.addColorStop(0.68, 'hsl(28,10%,97%)');
      gCeramic.addColorStop(0.93, 'hsl(28,16%,90%)');
      gCeramic.addColorStop(1,    'hsl(28,22%,72%)');

      ctx.beginPath();
      ctx.moveTo(outerLeft(rimY),  rimY);
      ctx.lineTo(outerRight(rimY), rimY);
      ctx.lineTo(outerRight(baseY), baseY);
      ctx.lineTo(outerLeft(baseY),  baseY);
      ctx.closePath();
      ctx.fillStyle = gCeramic;
      ctx.fill();

      // Vertical gradient overlay (subtle shading top→bottom)
      const gVert = ctx.createLinearGradient(0, rimY, 0, baseY);
      gVert.addColorStop(0,   'rgba(255,255,255,0.04)');
      gVert.addColorStop(0.5, 'rgba(255,255,255,0)');
      gVert.addColorStop(1,   'rgba(0,0,0,0.10)');
      ctx.beginPath();
      ctx.moveTo(outerLeft(rimY),  rimY);
      ctx.lineTo(outerRight(rimY), rimY);
      ctx.lineTo(outerRight(baseY), baseY);
      ctx.lineTo(outerLeft(baseY),  baseY);
      ctx.closePath();
      ctx.fillStyle = gVert;
      ctx.fill();

      // ── Coffee fill (clipped to inner cup trapezoid) ──
      const fillH    = Math.min(coffeeLevel, MAX_FILL);
      if (fillH > 0) {
        const fillTopY = innerBaseY - fillH;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(innerLeft(innerRimY),   innerRimY);
        ctx.lineTo(innerRight(innerRimY),  innerRimY);
        ctx.lineTo(innerRight(innerBaseY), innerBaseY);
        ctx.lineTo(innerLeft(innerBaseY),  innerBaseY);
        ctx.closePath();
        ctx.clip();

        // Dark espresso fill
        const gFill = ctx.createLinearGradient(0, fillTopY, 0, innerBaseY);
        gFill.addColorStop(0,    'rgba(196,114,28,0.96)');
        gFill.addColorStop(0.12, 'rgba(148,64,16,0.97)');
        gFill.addColorStop(0.4,  'rgba(96,38,10,0.98)');
        gFill.addColorStop(1,    'rgba(54,18,4,0.99)');
        ctx.fillStyle = gFill;
        const fillXL = innerLeft(innerBaseY)  - 1;
        const fillXR = innerRight(innerBaseY) + 1;
        ctx.fillRect(fillXL, fillTopY, fillXR - fillXL, innerBaseY - fillTopY);

        // Crema shimmer at surface
        if (fillH > 4) {
          const cremaH = Math.min(10, fillH * 0.24);
          const gCrema = ctx.createLinearGradient(0, fillTopY, 0, fillTopY + cremaH);
          gCrema.addColorStop(0,    'rgba(228,164,50,0.82)');
          gCrema.addColorStop(0.45, 'rgba(198,126,32,0.48)');
          gCrema.addColorStop(1,    'rgba(170,96,22,0)');
          ctx.fillStyle = gCrema;
          const cxL = innerLeft(fillTopY)  - 1;
          const cxR = innerRight(fillTopY) + 1;
          ctx.fillRect(cxL, fillTopY, cxR - cxL, cremaH);
        }

        ctx.restore();
      }

      // ── Inner cup shadow at rim (depth illusion) ──
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(innerLeft(innerRimY),  innerRimY);
      ctx.lineTo(innerRight(innerRimY), innerRimY);
      ctx.lineTo(innerRight(innerRimY + 18), innerRimY + 18);
      ctx.lineTo(innerLeft(innerRimY + 18),  innerRimY + 18);
      ctx.closePath();
      const gInner = ctx.createLinearGradient(0, innerRimY, 0, innerRimY + 18);
      gInner.addColorStop(0,   'rgba(0,0,0,0.30)');
      gInner.addColorStop(0.5, 'rgba(0,0,0,0.10)');
      gInner.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = gInner;
      ctx.fill();
      ctx.restore();

      // ── Rim ──
      // Thick rim ellipse at top
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(CX, rimY + 1.5, C_OW_TOP / 2 - 1, 4.5, 0, 0, Math.PI * 2);
      const gRim = ctx.createLinearGradient(CX - C_OW_TOP/2, 0, CX + C_OW_TOP/2, 0);
      gRim.addColorStop(0,    'hsl(28,20%,76%)');
      gRim.addColorStop(0.15, 'hsl(28,14%,94%)');
      gRim.addColorStop(0.5,  'hsl(28,10%,99%)');
      gRim.addColorStop(0.85, 'hsl(28,14%,94%)');
      gRim.addColorStop(1,    'hsl(28,20%,76%)');
      ctx.fillStyle = gRim;
      ctx.fill();
      // Rim top highlight
      ctx.beginPath();
      ctx.ellipse(CX - 2, rimY + 0.5, C_OW_TOP / 2 - 4, 2.5, -0.04, Math.PI * 1.1, Math.PI * 1.9);
      ctx.strokeStyle = 'rgba(255,255,255,0.80)';
      ctx.lineWidth   = 1.4;
      ctx.stroke();
      ctx.restore();

      // ── Handle (D-loop, right side) ──
      const hMidY  = rimY + C_H * 0.44;
      const hStartY = hMidY - 12;
      const hEndY   = hMidY + 12;
      const hBaseX  = outerRight(hMidY) - 1;
      const hTipX   = hBaseX + 16;

      // Handle drop shadow
      ctx.beginPath();
      ctx.moveTo(hBaseX + 1, hStartY + 1);
      ctx.bezierCurveTo(hTipX + 2, hStartY + 1, hTipX + 2, hEndY + 1, hBaseX + 1, hEndY + 1);
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth   = 5.5;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Handle ceramic body
      ctx.beginPath();
      ctx.moveTo(hBaseX, hStartY);
      ctx.bezierCurveTo(hTipX, hStartY, hTipX, hEndY, hBaseX, hEndY);
      const gHandle = ctx.createLinearGradient(hBaseX, 0, hTipX, 0);
      gHandle.addColorStop(0,    'hsl(28,20%,80%)');
      gHandle.addColorStop(0.25, 'hsl(28,12%,95%)');
      gHandle.addColorStop(0.6,  'hsl(28,12%,94%)');
      gHandle.addColorStop(1,    'hsl(28,20%,82%)');
      ctx.strokeStyle = gHandle;
      ctx.lineWidth   = 5.5;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Handle inner specular
      ctx.beginPath();
      ctx.moveTo(hBaseX, hStartY + 1.5);
      ctx.bezierCurveTo(hTipX - 4, hStartY + 1.5, hTipX - 4, hEndY - 1.5, hBaseX, hEndY - 1.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.60)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // ── Outer cup outline ──
      ctx.beginPath();
      ctx.moveTo(outerLeft(rimY),   rimY);
      ctx.lineTo(outerRight(rimY),  rimY);
      ctx.lineTo(outerRight(baseY), baseY);
      ctx.lineTo(outerLeft(baseY),  baseY);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(150,130,110,0.22)';
      ctx.lineWidth   = 0.75;
      ctx.stroke();
    }

    // ─── Physics ──────────────────────────────────────────────────
    const drops: Drop[] = [];
    let coffeeLevel   = 0;
    let smoothVel     = 0;
    let inStreamMode  = false;
    let isScrolling   = false;
    let lastScrollY   = window.scrollY;
    let lastSpawnFrame = 0;
    let frame_n       = 0;
    let stopTimer: ReturnType<typeof setTimeout>;
    let rafId: number;

    function spawn(stream: boolean) {
      for (const sx of [SPOUT_L, SPOUT_R]) {
        const w = (Math.random() - 0.5) * 2.2;
        drops.push({
          x: sx + w, y: SPOUT_Y,
          vy: 0.5 + Math.random() * 0.45,
          vx: w * 0.05,
          r: DROP_R + (Math.random() - 0.5) * 0.5,
          stream, overflow: false,
        });
      }
    }

    function onScroll() {
      const y  = window.scrollY;
      const dv = Math.abs(y - lastScrollY);
      lastScrollY = y;
      smoothVel   = smoothVel * 0.62 + dv * 0.38;
      isScrolling = true;
      if (smoothVel > ENTER_STREAM) inStreamMode = true;
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => { isScrolling = false; }, 120);
    }

    function frame() {
      frame_n++;

      if (!isScrolling) {
        smoothVel *= 0.86;
        if (smoothVel < EXIT_STREAM) inStreamMode = false;
        if (smoothVel < 0.3)        smoothVel = 0;
      }

      // ── Spawn coffee ──
      if (isScrolling) {
        const interval = inStreamMode
          ? (smoothVel > 8 ? 2 : 3)
          : Math.max(11, Math.round(18 - smoothVel * 2));
        if (frame_n - lastSpawnFrame >= interval) {
          lastSpawnFrame = frame_n;
          spawn(inStreamMode);
        }
      }

      // ── Overflow from cup rim when full ──
      if (coffeeLevel >= MAX_FILL && isScrolling && frame_n % 3 === 0) {
        for (const [sx, vx] of [
          [innerLeft(GTOP + C_WALL) + 1, -0.55],
          [innerRight(GTOP + C_WALL) - 1,  0.55],
        ] as [number, number][]) {
          drops.push({
            x: sx, y: GTOP + C_WALL + 1,
            vy: 0.7 + Math.random() * 0.4,
            vx: vx + (Math.random() - 0.5) * 0.25,
            r: 2.4, stream: false, overflow: true,
          });
        }
      }

      // ── Physics ──
      for (const d of drops) {
        d.vy  = Math.min(d.vy + GRAVITY, MAX_VY);
        d.y  += d.vy;
        d.x  += d.vx;
        d.vx *= 0.95;
      }

      // ── Absorb drops into cup ──
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (d.overflow) continue;
        if (d.y >= GTOP + C_WALL && d.x >= G_GLEFT && d.x <= G_GRIGHT) {
          coffeeLevel = Math.min(MAX_FILL, coffeeLevel + FILL_PER_DROP);
          drops.splice(i, 1);
        }
      }

      // ── Remove off-screen ──
      for (let i = drops.length - 1; i >= 0; i--) {
        if (drops[i].y > h + 12) drops.splice(i, 1);
      }

      // ── Render ──
      ctx.clearRect(0, 0, PANEL_W, h);

      const regular  = drops.filter(d => !d.overflow);
      const overflow = drops.filter(d =>  d.overflow);

      for (const seg of buildSegs(regular))  drawSegment(ctx, seg);
      drawCup(coffeeLevel);
      for (const seg of buildSegs(overflow)) drawSegment(ctx, seg);

      rafId = requestAnimationFrame(frame);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    rafId = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(stopTimer);
    };
  }, []);

  // ─── JSX ──────────────────────────────────────────────────────────
  return (
    <div className="espresso-panel" aria-hidden="true">

      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />

      <svg
        viewBox="0 0 110 108"
        width="110"
        height="108"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="cH1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#5e5e5e" />
            <stop offset="12%"  stopColor="#d0d0d0" />
            <stop offset="28%"  stopColor="#a8a8a8" />
            <stop offset="48%"  stopColor="#eeeeee" />
            <stop offset="66%"  stopColor="#c0c0c0" />
            <stop offset="82%"  stopColor="#f4f4f4" />
            <stop offset="100%" stopColor="#787878" />
          </linearGradient>
          <linearGradient id="cH2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#4e4e4e" />
            <stop offset="22%"  stopColor="#bcbcbc" />
            <stop offset="48%"  stopColor="#e8e8e8" />
            <stop offset="72%"  stopColor="#b0b0b0" />
            <stop offset="100%" stopColor="#666666" />
          </linearGradient>
          <linearGradient id="cH3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#6a6a6a" />
            <stop offset="35%"  stopColor="#d8d8d8" />
            <stop offset="62%"  stopColor="#c4c4c4" />
            <stop offset="100%" stopColor="#828282" />
          </linearGradient>
          <radialGradient id="shower" cx="48%" cy="44%" r="54%">
            <stop offset="0%"   stopColor="#686868" />
            <stop offset="50%"  stopColor="#424242" />
            <stop offset="100%" stopColor="#202020" />
          </radialGradient>
          <linearGradient id="cShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#000" stopOpacity="0"    />
            <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* ── GROUP HEAD ── */}
        <rect x="0" y="-32" width="100" height="74" rx="5" fill="url(#cH1)" />
        <rect x="5" y="-28" width="90" height="3.5" rx="1.5" fill="white" opacity="0.22" />
        <rect x="0" y="28"  width="100" height="14" fill="url(#cShadow)" />

        <circle cx="10" cy="-10" r="4.2" fill="#404040" />
        <circle cx="10" cy="-10" r="2.4" fill="#2e2e2e" />
        <line x1="8.3" y1="-10" x2="11.7" y2="-10" stroke="#585858" strokeWidth="0.8" />
        <line x1="10"  y1="-11.7" x2="10" y2="-8.3" stroke="#585858" strokeWidth="0.8" />
        <circle cx="90" cy="-10" r="4.2" fill="#404040" />
        <circle cx="90" cy="-10" r="2.4" fill="#2e2e2e" />
        <line x1="88.3" y1="-10" x2="91.7" y2="-10" stroke="#585858" strokeWidth="0.8" />
        <line x1="90"   y1="-11.7" x2="90" y2="-8.3" stroke="#585858" strokeWidth="0.8" />

        {/* ── SHOWER SCREEN ── */}
        <ellipse cx="50" cy="42" rx="49" ry="9"   fill="#464646" />
        <ellipse cx="50" cy="42" rx="44" ry="7.5" fill="#383838" />
        <ellipse cx="50" cy="42" rx="37" ry="6"   fill="url(#shower)" />
        {[35, 41, 47, 53, 59, 65].flatMap((cx, col) =>
          [39, 43].map((cy, row) => (
            <circle key={`${col}-${row}`} cx={cx} cy={cy} r="1.2" fill="#141414" opacity="0.9" />
          ))
        )}

        {/* ── PORTAFILTER LUGS ── */}
        <path d="M 4 43 L 18 43 L 18 52 Q 15 56 10 55 Q 5 54 4 50 Z" fill="url(#cH2)" />
        <line x1="4" y1="48" x2="18" y2="48" stroke="white" strokeWidth="0.4" opacity="0.28" />
        <path d="M 96 43 L 82 43 L 82 52 Q 85 56 90 55 Q 95 54 96 50 Z" fill="url(#cH2)" />
        <line x1="96" y1="48" x2="82" y2="48" stroke="white" strokeWidth="0.4" opacity="0.28" />

        {/* ── PORTAFILTER COLLAR ── */}
        <path d="M 8 46 Q 6 59 10 63 L 90 63 Q 94 59 92 46 Z" fill="url(#cH2)" />
        <line x1="8" y1="54" x2="92" y2="54" stroke="white" strokeWidth="0.55" opacity="0.20" />

        {/* ── PORTAFILTER BASKET ── */}
        <path d="M 12 63 Q 10 82 17 86 L 83 86 Q 90 82 88 63 Z" fill="url(#cH3)" />
        <ellipse cx="50" cy="86" rx="33" ry="5.5" fill="#9c9c9c" />
        <ellipse cx="50" cy="86" rx="27" ry="4.0" fill="#888888" />
        <line x1="50" y1="64" x2="50" y2="85" stroke="white" strokeWidth="0.8" opacity="0.10" />

        {/* ── SPOUT HOLES ── */}
        <ellipse cx="38" cy="90" rx="5.0" ry="3.2" fill="#2a2a2a" />
        <ellipse cx="62" cy="90" rx="5.0" ry="3.2" fill="#2a2a2a" />
        <ellipse cx="38" cy="90" rx="2.8" ry="1.8" fill="#0e0e0e" />
        <ellipse cx="62" cy="90" rx="2.8" ry="1.8" fill="#0e0e0e" />

        {/* ── HANDLE — LEFT SIDE ── */}
        <ellipse cx="22" cy="74" rx="6.5" ry="8.5" fill="#707070" />
        <ellipse cx="22" cy="74" rx="4.5" ry="6"   fill="#5a5a5a" />
        <path d="M 22 66 Q 10 64 -2 68 Q -16 72 -30 78"
              stroke="#161616" strokeWidth="11" fill="none" strokeLinecap="round" />
        <path d="M 22 66 Q 10 64 -2 68 Q -16 72 -30 78"
              stroke="#272727" strokeWidth="8"  fill="none" strokeLinecap="round" />
        {[-6, -2, 2, 6, 10].map(dx => (
          <path key={dx}
                d={`M ${22+dx} ${65+dx*0.08} Q ${10+dx} ${63+dx*0.08} ${-2+dx} ${67+dx*0.08}`}
                stroke="#333" strokeWidth="0.6" fill="none" opacity="0.45" />
        ))}
        <path d="M 21 64.5 Q 9 62.5 -3 66.5 Q -15 70 -28 75.5"
              stroke="#5a5a5a" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.60" />
        <ellipse cx="-30" cy="78" rx="4.5" ry="3"   fill="#868686" />
        <ellipse cx="-30" cy="78" rx="2.5" ry="1.6" fill="#6a6a6a" />
      </svg>
    </div>
  );
}
