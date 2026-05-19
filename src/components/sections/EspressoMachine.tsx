import { useEffect, useRef } from "react";

/*
 * Two-mode coffee physics
 * ─────────────────────────────────────────────────────────────────
 * DROP mode  (reading pace, smoothVel < 2)
 *   Spawn every 11-15 frames → initial gap ~15-20 px → each drop falls
 *   independently, never crosses DROP_GAP=14 threshold → renders as
 *   individual teardrop shapes.
 *
 * STREAM mode  (browsing pace, smoothVel > 4.5)
 *   Spawn every 2-3 frames → initial gap ~2-3 px.
 *   As drops accelerate, the gap between consecutive stream drops grows
 *   at 0.39 px/frame until both reach MAX_VY, giving a maximum stable
 *   gap of ~27.5 px — well below STREAM_GAP=32, so they ALWAYS stay
 *   in the same segment and render as one continuous bezier stroke.
 *
 * Scroll stops → isScrolling=false → no new spawns → existing liquid
 *   falls under gravity until it exits the viewport (gravity continues).
 *
 * Mixed stream/drop pairs never connect (thresh=Infinity) so a slowing-
 * down transition never causes a stray drop to join a moving stream.
 *
 * Two spouts (SPOUT_L=38, SPOUT_R=62) spawn independently each interval.
 * dx≤MAX_DX gate prevents diagonal merging between the two streams.
 *
 * Glass at GTOP absorbs drops; overflows from rim sides when full.
 */

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
const MAX_DX       = 12;   // x-proximity gate — prevents cross-stream merging

// Glass geometry (screen coords, px)
const GCX      = 52;    // glass centre x
const GW_TOP   = 46;    // glass inner width at rim
const GW_BOT   = 40;    // glass inner width at base
const GH       = 52;    // glass inner height
const GWALL    = 2.5;   // wall thickness
const GTOP     = 270;   // y of the rim (screen px)
const GBOT     = GTOP + GH;

// Computed rim inner edges
const G_GLEFT  = GCX - GW_TOP / 2;   // 52 - 23 = 29
const G_GRIGHT = GCX + GW_TOP / 2;   // 52 + 23 = 75

const MAX_FILL     = GH - 4;   // px of coffee fill height (leaves a thin crema layer)
const FILL_PER_DROP = 0.18;    // px of fill added per absorbed drop

interface Drop {
  x: number; y: number;
  vy: number; vx: number;
  r: number;
  stream: boolean;
  overflow: boolean;
}

// ─── Glass geometry helpers ───────────────────────────────────────

function gwx(side: -1 | 1, y: number): number {
  const t     = Math.min(1, Math.max(0, (y - GTOP) / GH));
  const halfW = GW_TOP / 2 + (GW_BOT / 2 - GW_TOP / 2) * t;
  return GCX + side * halfW;
}

// ─── Canvas helpers ───────────────────────────────────────────────

function pathThrough(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  offsetX = 0,
) {
  ctx.moveTo(pts[0].x + offsetX, pts[0].y);
  if (pts.length === 2) {
    ctx.lineTo(pts[1].x + offsetX, pts[1].y);
    return;
  }
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

function drawGlass(ctx: CanvasRenderingContext2D, coffeeLevel: number) {
  // coffeeLevel in px, measured from bottom of glass upward
  const fillH     = Math.min(coffeeLevel, MAX_FILL);
  const fillTopY  = GBOT - fillH;

  // Left/right inner wall x at fill top and at bottom
  const lTop  = gwx(-1, fillTopY);
  const rTop  = gwx(1,  fillTopY);
  const lBot  = gwx(-1, GBOT);
  const rBot  = gwx(1,  GBOT);

  // ── Coffee fill ──
  if (fillH > 0) {
    ctx.save();
    // Trapezoid clip matching the inner glass walls
    ctx.beginPath();
    ctx.moveTo(lTop, fillTopY);
    ctx.lineTo(rTop, fillTopY);
    ctx.lineTo(rBot, GBOT);
    ctx.lineTo(lBot, GBOT);
    ctx.closePath();
    ctx.clip();

    const gFill = ctx.createLinearGradient(0, fillTopY, 0, GBOT);
    gFill.addColorStop(0,   'rgba(188,102,24,0.92)');  // amber crema at surface
    gFill.addColorStop(0.08,'rgba(140,62,16,0.94)');
    gFill.addColorStop(0.35,'rgba(96,40,12,0.96)');
    gFill.addColorStop(1,   'rgba(56,22,6,0.98)');
    ctx.fillStyle = gFill;
    ctx.fillRect(lBot - 2, fillTopY, rBot - lBot + 4, fillH);

    // Crema shimmer layer at top
    if (fillH > 3) {
      const cremaH = Math.min(8, fillH * 0.25);
      const gCrema = ctx.createLinearGradient(0, fillTopY, 0, fillTopY + cremaH);
      gCrema.addColorStop(0,   'rgba(224,158,42,0.75)');
      gCrema.addColorStop(0.5, 'rgba(200,124,32,0.50)');
      gCrema.addColorStop(1,   'rgba(180,98,24,0)');
      ctx.fillStyle = gCrema;
      ctx.fillRect(lTop - 1, fillTopY, rTop - lTop + 2, cremaH);
    }
    ctx.restore();
  }

  // ── Glass walls ──
  const outerLTop = gwx(-1, GTOP) - GWALL;
  const outerRTop = gwx(1,  GTOP) + GWALL;
  const outerLBot = gwx(-1, GBOT) - GWALL;
  const outerRBot = gwx(1,  GBOT) + GWALL;

  const gGlass = ctx.createLinearGradient(outerLTop, 0, outerRTop, 0);
  gGlass.addColorStop(0,    'rgba(180,210,240,0.55)');
  gGlass.addColorStop(0.12, 'rgba(220,235,255,0.45)');
  gGlass.addColorStop(0.45, 'rgba(200,225,250,0.18)');
  gGlass.addColorStop(0.88, 'rgba(220,235,255,0.38)');
  gGlass.addColorStop(1,    'rgba(160,200,235,0.50)');

  // Left wall
  ctx.beginPath();
  ctx.moveTo(outerLTop, GTOP);
  ctx.lineTo(gwx(-1, GTOP), GTOP);
  ctx.lineTo(gwx(-1, GBOT), GBOT);
  ctx.lineTo(outerLBot, GBOT);
  ctx.closePath();
  ctx.fillStyle = gGlass;
  ctx.fill();

  // Right wall
  ctx.beginPath();
  ctx.moveTo(gwx(1, GTOP), GTOP);
  ctx.lineTo(outerRTop, GTOP);
  ctx.lineTo(outerRBot, GBOT);
  ctx.lineTo(gwx(1, GBOT), GBOT);
  ctx.closePath();
  ctx.fillStyle = gGlass;
  ctx.fill();

  // Bottom
  ctx.beginPath();
  ctx.moveTo(outerLBot, GBOT);
  ctx.lineTo(outerRBot, GBOT);
  ctx.lineTo(outerRBot, GBOT + GWALL);
  ctx.lineTo(outerLBot, GBOT + GWALL);
  ctx.closePath();
  ctx.fillStyle = 'rgba(180,210,240,0.50)';
  ctx.fill();

  // Glass outline
  ctx.beginPath();
  ctx.moveTo(outerLTop, GTOP);
  ctx.lineTo(outerLBot, GBOT + GWALL);
  ctx.lineTo(outerRBot, GBOT + GWALL);
  ctx.lineTo(outerRTop, GTOP);
  ctx.strokeStyle = 'rgba(200,225,255,0.60)';
  ctx.lineWidth   = 0.8;
  ctx.stroke();

  // Left-wall specular reflection
  ctx.beginPath();
  ctx.moveTo(outerLTop + 1.5, GTOP + 4);
  ctx.lineTo(outerLBot + 1.2, GBOT - 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth   = 1.2;
  ctx.stroke();
}

// ─── Segment builder ─────────────────────────────────────────────

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
      (curr.stream && prev.stream)       ? STREAM_GAP :
      (curr.overflow && prev.overflow)   ? DROP_GAP   :
      (!curr.stream && !curr.overflow &&
       !prev.stream && !prev.overflow)   ? DROP_GAP   : Infinity;

    if (dy <= thr && dx <= MAX_DX) {
      cur.push(curr);
    } else {
      segs.push(cur);
      cur = [curr];
    }
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

    const drops: Drop[] = [];
    let coffeeLevel     = 0;
    let smoothVel       = 0;
    let inStreamMode    = false;
    let isScrolling     = false;
    let lastScrollY     = window.scrollY;
    let lastSpawnFrame  = 0;
    let frame_n         = 0;
    let stopTimer: ReturnType<typeof setTimeout>;
    let rafId: number;

    function spawn(stream: boolean) {
      for (const sx of [SPOUT_L, SPOUT_R]) {
        const w = (Math.random() - 0.5) * 2.2;
        drops.push({
          x:        sx + w,
          y:        SPOUT_Y,
          vy:       0.5 + Math.random() * 0.45,
          vx:       w * 0.05,
          r:        DROP_R + (Math.random() - 0.5) * 0.5,
          stream,
          overflow: false,
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

      // ── Spawn ──
      if (isScrolling) {
        let interval: number;
        if (inStreamMode) {
          interval = smoothVel > 8 ? 2 : 3;
        } else {
          interval = Math.max(11, Math.round(18 - smoothVel * 2));
        }
        if (frame_n - lastSpawnFrame >= interval) {
          lastSpawnFrame = frame_n;
          spawn(inStreamMode);
        }
      }

      // ── Overflow spawn when glass is full ──
      if (coffeeLevel >= MAX_FILL && isScrolling && frame_n % 3 === 0) {
        const ovfY = GTOP + 1;
        for (const [sx, vx] of [
          [gwx(-1, GTOP), -0.6],
          [gwx(1,  GTOP),  0.6],
        ] as [number, number][]) {
          drops.push({
            x: sx, y: ovfY,
            vy: 0.8 + Math.random() * 0.4,
            vx: vx + (Math.random() - 0.5) * 0.25,
            r:  2.5,
            stream: false, overflow: true,
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

      // ── Absorb drops into glass ──
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (d.overflow) continue;
        if (d.y >= GTOP && d.x >= G_GLEFT && d.x <= G_GRIGHT) {
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
      drawGlass(ctx, coffeeLevel);
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

  return (
    <div className="espresso-panel" aria-hidden="true">

      {/* Physics stream canvas — behind the machine SVG */}
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
        <rect x="0" y="-32" width="100" height="74" rx="5"
              fill="url(#cH1)" />
        <rect x="5" y="-28" width="90" height="3.5" rx="1.5"
              fill="white" opacity="0.22" />
        <rect x="0" y="28" width="100" height="14" rx="0"
              fill="url(#cShadow)" />

        <circle cx="10" cy="-10" r="4.2" fill="#404040" />
        <circle cx="10" cy="-10" r="2.4" fill="#2e2e2e" />
        <line x1="8.3" y1="-10" x2="11.7" y2="-10"
              stroke="#585858" strokeWidth="0.8" />
        <line x1="10" y1="-11.7" x2="10" y2="-8.3"
              stroke="#585858" strokeWidth="0.8" />
        <circle cx="90" cy="-10" r="4.2" fill="#404040" />
        <circle cx="90" cy="-10" r="2.4" fill="#2e2e2e" />
        <line x1="88.3" y1="-10" x2="91.7" y2="-10"
              stroke="#585858" strokeWidth="0.8" />
        <line x1="90" y1="-11.7" x2="90" y2="-8.3"
              stroke="#585858" strokeWidth="0.8" />

        {/* ── SHOWER SCREEN ── */}
        <ellipse cx="50" cy="42" rx="49" ry="9"   fill="#464646" />
        <ellipse cx="50" cy="42" rx="44" ry="7.5" fill="#383838" />
        <ellipse cx="50" cy="42" rx="37" ry="6"   fill="url(#shower)" />
        {[35, 41, 47, 53, 59, 65].flatMap((cx, col) =>
          [39, 43].map((cy, row) => (
            <circle key={`${col}-${row}`} cx={cx} cy={cy} r="1.2"
                    fill="#141414" opacity="0.9" />
          ))
        )}

        {/* ── PORTAFILTER MOUNTING LUGS ── */}
        <path d="M 4 43 L 18 43 L 18 52 Q 15 56 10 55 Q 5 54 4 50 Z"
              fill="url(#cH2)" />
        <line x1="4" y1="48" x2="18" y2="48"
              stroke="white" strokeWidth="0.4" opacity="0.28" />
        <path d="M 96 43 L 82 43 L 82 52 Q 85 56 90 55 Q 95 54 96 50 Z"
              fill="url(#cH2)" />
        <line x1="96" y1="48" x2="82" y2="48"
              stroke="white" strokeWidth="0.4" opacity="0.28" />

        {/* ── PORTAFILTER COLLAR ── */}
        <path d="M 8 46 Q 6 59 10 63 L 90 63 Q 94 59 92 46 Z"
              fill="url(#cH2)" />
        <line x1="8" y1="54" x2="92" y2="54"
              stroke="white" strokeWidth="0.55" opacity="0.20" />

        {/* ── PORTAFILTER BASKET ── */}
        <path d="M 12 63 Q 10 82 17 86 L 83 86 Q 90 82 88 63 Z"
              fill="url(#cH3)" />
        <ellipse cx="50" cy="86" rx="33" ry="5.5" fill="#9c9c9c" />
        <ellipse cx="50" cy="86" rx="27" ry="4.0" fill="#888888" />
        <line x1="50" y1="64" x2="50" y2="85"
              stroke="white" strokeWidth="0.8" opacity="0.10" />

        {/* ── SPOUT EXIT HOLES ── */}
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
              stroke="#5a5a5a" strokeWidth="1.4" fill="none" strokeLinecap="round"
              opacity="0.60" />
        <ellipse cx="-30" cy="78" rx="4.5" ry="3" fill="#868686" />
        <ellipse cx="-30" cy="78" rx="2.5" ry="1.6" fill="#6a6a6a" />
      </svg>
    </div>
  );
}
