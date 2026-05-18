import { useEffect, useRef } from "react";

/*
 * Physics-based espresso stream renderer on Canvas.
 *
 * While scrolling  → drops spawn at the portafilter spout.
 * Slow scroll      → sparse drips (individual teardrop shapes).
 * Fast scroll      → dense drops that touch → rendered as a continuous stream.
 * Scroll stops     → source closes instantly; existing liquid keeps falling under gravity.
 *
 * Rendering layers (bottom → top inside the fixed panel):
 *   1. <canvas>  — physics particles / stream
 *   2. <svg>     — chrome machine head (covers the spout origin)
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const PANEL_W    = 110;   // CSS px
const GRAVITY    = 0.13;
const MAX_VY     = 9;
const SPOUT_X    = 52;    // horizontal centre between the two spout holes
const SPOUT_Y    = 91;    // vertical position of spout exit in CSS px
const DROP_R     = 3.5;   // half-width of the stream / drop radius
const GAP_THRESH = 14;    // max y-gap (px) for two drops to be "connected"

// Espresso colour stops (y relative to SPOUT_Y)
const CREMA_Y  = 0;    // golden crema at very top
const AMBER_Y  = 50;   // amber transition
const MID_Y    = 160;  // warm medium
const DARK_Y   = 400;  // full dark espresso

function espressoColor(y: number, alpha: number): string {
  const dy = y - SPOUT_Y;
  if (dy < AMBER_Y)  return `rgba(214,140,28,${alpha})`;
  if (dy < MID_Y)    return `rgba(168,82,20,${alpha})`;
  if (dy < DARK_Y)   return `rgba(120,52,14,${alpha})`;
  return                     `rgba(84,34,10,${alpha})`;
}

interface Drop {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function drawDrop(ctx: CanvasRenderingContext2D, p: Drop) {
  const rx = p.r;
  // elongate vertically based on falling speed so fast drops look like teardrops
  const ry = Math.min(p.r * (1 + Math.abs(p.vy) * 0.22), p.r * 2.4);

  ctx.save();
  ctx.translate(p.x, p.y);

  const grad = ctx.createRadialGradient(-rx * 0.35, -ry * 0.35, 0, 0, 0, Math.max(rx, ry));
  grad.addColorStop(0,   espressoColor(p.y - 20, 0.95));
  grad.addColorStop(0.5, espressoColor(p.y,       0.90));
  grad.addColorStop(1,   espressoColor(p.y + 30,  0.80));

  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

function drawStreamSegment(ctx: CanvasRenderingContext2D, seg: Drop[]) {
  if (seg.length === 0) return;
  if (seg.length === 1) { drawDrop(ctx, seg[0]); return; }

  const pts = seg;
  const y0  = pts[0].y;
  const yN  = pts[pts.length - 1].y;

  // ── main stream body (thick smooth stroke) ──
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  if (pts.length === 2) {
    ctx.lineTo(pts[1].x, pts[1].y);
  } else {
    // midpoint-smooth quadratic bezier through all nodes
    let mx = (pts[0].x + pts[1].x) / 2;
    let my = (pts[0].y + pts[1].y) / 2;
    ctx.lineTo(mx, my);
    for (let i = 1; i < pts.length - 1; i++) {
      const nx = (pts[i].x + pts[i + 1].x) / 2;
      const ny = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, nx, ny);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  }

  const mainGrad = ctx.createLinearGradient(0, y0, 0, yN + 40);
  mainGrad.addColorStop(0,    'rgba(214,140,28,0.93)');  // crema
  mainGrad.addColorStop(0.06, 'rgba(185,100,24,0.92)');  // amber
  mainGrad.addColorStop(0.20, 'rgba(148,68,18,0.91)');   // warm brown
  mainGrad.addColorStop(0.50, 'rgba(110,46,14,0.90)');   // medium espresso
  mainGrad.addColorStop(1,    'rgba(76,30,10,0.88)');    // dark

  ctx.strokeStyle = mainGrad;
  ctx.lineWidth   = DROP_R * 2;         // ~7 px — realistic stream width
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.stroke();

  // ── highlight shimmer (thin, lighter, right edge, fades with depth) ──
  ctx.beginPath();
  const shiftX = DROP_R * 0.55;
  ctx.moveTo(pts[0].x + shiftX, pts[0].y);
  if (pts.length === 2) {
    ctx.lineTo(pts[1].x + shiftX, pts[1].y);
  } else {
    let mx = (pts[0].x + pts[1].x) / 2 + shiftX;
    let my = (pts[0].y + pts[1].y) / 2;
    ctx.lineTo(mx, my);
    for (let i = 1; i < pts.length - 1; i++) {
      const nx = (pts[i].x + pts[i + 1].x) / 2 + shiftX;
      const ny = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x + shiftX, pts[i].y, nx, ny);
    }
    ctx.lineTo(pts[pts.length - 1].x + shiftX, pts[pts.length - 1].y);
  }

  const fadeEnd = Math.min(y0 + 280, yN);
  const hlGrad  = ctx.createLinearGradient(0, y0, 0, fadeEnd);
  hlGrad.addColorStop(0,    'rgba(248,195,80,0.75)');
  hlGrad.addColorStop(0.15, 'rgba(225,155,55,0.55)');
  hlGrad.addColorStop(0.40, 'rgba(195,110,38,0.28)');
  hlGrad.addColorStop(0.70, 'rgba(165,80,25,0.08)');
  hlGrad.addColorStop(1,    'rgba(140,60,18,0)');

  ctx.strokeStyle = hlGrad;
  ctx.lineWidth   = 1.4;
  ctx.stroke();
}

// ─── Component ────────────────────────────────────────────────────────────────

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

    const drops: Drop[]  = [];
    let scrollVel        = 0;
    let isScrolling      = false;
    let lastScrollY      = window.scrollY;
    let framesSinceSpawn = 0;
    let stopTimer: ReturnType<typeof setTimeout>;
    let rafId: number;

    function spawn() {
      const wobble = (Math.random() - 0.5) * 2;
      drops.push({
        x:  SPOUT_X + wobble,
        y:  SPOUT_Y,
        vy: 0.55 + Math.random() * 0.45,
        vx: wobble * 0.06,
        r:  DROP_R + (Math.random() - 0.5) * 0.6,
      });
    }

    function onScroll() {
      const y   = window.scrollY;
      scrollVel = Math.abs(y - lastScrollY);
      lastScrollY = y;
      isScrolling = true;
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => { isScrolling = false; scrollVel = 0; }, 120);
    }

    function frame() {
      // ── Spawn ──
      if (isScrolling) {
        // interval: 13 frames at vel≈1 (drips) → 2 frames at vel≥11 (stream)
        const interval = Math.max(2, Math.round(14 - scrollVel));
        framesSinceSpawn++;
        if (framesSinceSpawn >= interval) {
          framesSinceSpawn = 0;
          spawn();
          if (scrollVel > 9) spawn(); // extra drop at very fast scroll
        }
      }

      // ── Physics ──
      for (const d of drops) {
        d.vy  = Math.min(d.vy + GRAVITY, MAX_VY);
        d.y  += d.vy;
        d.x  += d.vx;
        d.vx *= 0.95;
      }

      // prune off-screen
      for (let i = drops.length - 1; i >= 0; i--) {
        if (drops[i].y > h + 12) drops.splice(i, 1);
      }

      // ── Render ──
      ctx.clearRect(0, 0, PANEL_W, h);

      // sort top→bottom so segment detection is correct
      drops.sort((a, b) => a.y - b.y);

      // group consecutive drops that are within GAP_THRESH of each other
      const segs: Drop[][] = [];
      let cur: Drop[] = [];

      for (let i = 0; i < drops.length; i++) {
        if (i === 0) {
          cur.push(drops[i]);
        } else if (drops[i].y - drops[i - 1].y <= GAP_THRESH) {
          cur.push(drops[i]);
        } else {
          segs.push(cur);
          cur = [drops[i]];
        }
      }
      if (cur.length > 0) segs.push(cur);

      for (const seg of segs) {
        if (seg.length === 1) drawDrop(ctx, seg[0]);
        else drawStreamSegment(ctx, seg);
      }

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

      {/* Physics stream — behind machine SVG */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />

      {/* Chrome machine head — covers stream origin, always on top */}
      <svg
        viewBox="0 0 110 108"
        width="110"
        height="108"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {/* Horizontal chrome reflection */}
          <linearGradient id="chrH" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#686868" />
            <stop offset="16%"  stopColor="#d4d4d4" />
            <stop offset="34%"  stopColor="#acacac" />
            <stop offset="54%"  stopColor="#f0f0f0" />
            <stop offset="74%"  stopColor="#c0c0c0" />
            <stop offset="100%" stopColor="#7a7a7a" />
          </linearGradient>

          <linearGradient id="chrH2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#545454" />
            <stop offset="28%"  stopColor="#c0c0c0" />
            <stop offset="55%"  stopColor="#e8e8e8" />
            <stop offset="80%"  stopColor="#a8a8a8" />
            <stop offset="100%" stopColor="#6c6c6c" />
          </linearGradient>

          <linearGradient id="chrH3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#888" />
            <stop offset="45%"  stopColor="#dcdcdc" />
            <stop offset="75%"  stopColor="#c4c4c4" />
            <stop offset="100%" stopColor="#8a8a8a" />
          </linearGradient>

          <radialGradient id="shower" cx="50%" cy="45%" r="52%">
            <stop offset="0%"   stopColor="#606060" />
            <stop offset="55%"  stopColor="#404040" />
            <stop offset="100%" stopColor="#242424" />
          </radialGradient>

          {/* Very soft drop shadow under machine */}
          <filter id="machShadow" x="-5%" y="-5%" width="110%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ── Group head block (extends above viewport for cut-view feel) ── */}
        <rect x="0" y="-32" width="100" height="74" rx="5"
              fill="url(#chrH)" filter="url(#machShadow)" />
        {/* Surface highlight line */}
        <rect x="6" y="-32" width="88" height="4" rx="2"
              fill="white" opacity="0.20" />
        {/* Bolt detail TL */}
        <circle cx="10" cy="-12" r="3.8" fill="#4a4a4a" />
        <circle cx="10" cy="-12" r="2.0" fill="#333"    />
        <line x1="8.6" y1="-12" x2="11.4" y2="-12" stroke="#555" strokeWidth="0.7" />
        <line x1="10" y1="-13.4" x2="10" y2="-10.6" stroke="#555" strokeWidth="0.7" />
        {/* Bolt detail TR */}
        <circle cx="90" cy="-12" r="3.8" fill="#4a4a4a" />
        <circle cx="90" cy="-12" r="2.0" fill="#333"    />
        <line x1="88.6" y1="-12" x2="91.4" y2="-12" stroke="#555" strokeWidth="0.7" />
        <line x1="90" y1="-13.4" x2="90" y2="-10.6" stroke="#555" strokeWidth="0.7" />

        {/* ── Shower screen (bottom face of group head) ── */}
        <ellipse cx="50" cy="42" rx="48" ry="9" fill="#484848" />
        <ellipse cx="50" cy="42" rx="42" ry="7" fill="#363636" />
        <ellipse cx="50" cy="42" rx="35" ry="5.5" fill="url(#shower)" />

        {/* Shower screen perforations */}
        {[36,42,48,54,60,66].map(cx =>
          [39, 43].map(cy => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.1"
                    fill="#191919" opacity="0.85" />
          ))
        )}

        {/* ── Portafilter collar ── */}
        <path d="M 8 44 Q 6 57 10 61 L 90 61 Q 94 57 92 44 Z"
              fill="url(#chrH2)" />
        <line x1="8"  y1="52.5" x2="92" y2="52.5"
              stroke="white" strokeWidth="0.5" opacity="0.22" />

        {/* ── Portafilter basket ── */}
        <path d="M 12 61 Q 10 80 16 84 L 84 84 Q 90 80 88 61 Z"
              fill="url(#chrH3)" />
        <ellipse cx="50" cy="84" rx="34" ry="5.5" fill="#9e9e9e" />
        <ellipse cx="50" cy="84" rx="28" ry="4.0" fill="#8a8a8a" />

        {/* ── Spout exit holes ── */}
        <ellipse cx="38" cy="88.5" rx="4.8" ry="3.2" fill="#2c2c2c" />
        <ellipse cx="62" cy="88.5" rx="4.8" ry="3.2" fill="#2c2c2c" />
        <ellipse cx="38" cy="88.5" rx="2.8" ry="1.9" fill="#111" />
        <ellipse cx="62" cy="88.5" rx="2.8" ry="1.9" fill="#111" />

        {/* ── Handle collar ── */}
        <ellipse cx="88" cy="72" rx="5" ry="7.5" fill="#6c6c6c" />
        {/* Handle rod */}
        <path d="M 88 65.5 Q 96 64 106 67 Q 120 70 132 76"
              stroke="#1e1e1e" strokeWidth="9"   fill="none" strokeLinecap="round" />
        <path d="M 91 65   Q 98 63 108 66 Q 120 69 130 74"
              stroke="#2e2e2e" strokeWidth="6.5" fill="none" strokeLinecap="round" />
        <path d="M 92 64   Q 100 62 110 65 Q 120 68 128 72"
              stroke="#666"   strokeWidth="1.3" fill="none" strokeLinecap="round"
              opacity="0.55" />
      </svg>
    </div>
  );
}
