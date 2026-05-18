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
 */

const PANEL_W      = 110;
const GRAVITY      = 0.13;
const MAX_VY       = 9.0;
const SPOUT_X      = 52;
const SPOUT_Y      = 92;
const DROP_R       = 3.5;          // half-width of stream / drop radius
const STREAM_GAP   = 32;           // px — max stable stream-drop gap is ~27.5
const DROP_GAP     = 14;           // px — drops with initial gap ~15-20 stay sep.
const ENTER_STREAM = 4.5;          // smoothVel threshold to enter stream mode
const EXIT_STREAM  = 2.0;          // smoothVel threshold to exit stream mode

interface Drop {
  x: number; y: number;
  vy: number; vx: number;
  r: number;
  stream: boolean;
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

  // ── Main stream body ──
  ctx.beginPath();
  pathThrough(ctx, seg);
  const gMain = ctx.createLinearGradient(0, y0, 0, yN + 50);
  gMain.addColorStop(0,    'rgba(218,144,30,0.94)');   // golden crema
  gMain.addColorStop(0.05, 'rgba(188,102,24,0.93)');   // amber
  gMain.addColorStop(0.18, 'rgba(152,70,18,0.92)');    // warm
  gMain.addColorStop(0.45, 'rgba(112,48,14,0.91)');    // medium espresso
  gMain.addColorStop(1,    'rgba(72,28,9,0.89)');      // dark roast
  ctx.strokeStyle = gMain;
  ctx.lineWidth   = DROP_R * 2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.stroke();

  // ── Crema highlight shimmer: right edge, fades below first ~250 px ──
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
    let smoothVel        = 0;
    let inStreamMode     = false;
    let isScrolling      = false;
    let lastScrollY      = window.scrollY;
    let lastSpawnFrame   = 0;
    let frame_n          = 0;
    let stopTimer: ReturnType<typeof setTimeout>;
    let rafId: number;

    function spawn(stream: boolean) {
      const w = (Math.random() - 0.5) * 2.2;
      drops.push({
        x: SPOUT_X + w,
        y: SPOUT_Y,
        vy: 0.5 + Math.random() * 0.45,
        vx: w * 0.05,
        r:  DROP_R + (Math.random() - 0.5) * 0.5,
        stream,
      });
    }

    function onScroll() {
      const y  = window.scrollY;
      const dv = Math.abs(y - lastScrollY);
      lastScrollY = y;
      // EMA smoothing so a single fast frame doesn't immediately lock stream mode
      smoothVel = smoothVel * 0.62 + dv * 0.38;
      isScrolling = true;
      if (smoothVel > ENTER_STREAM) inStreamMode = true;
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => { isScrolling = false; }, 120);
    }

    function frame() {
      frame_n++;

      // Decay velocity when not scrolling; exit stream mode when slow
      if (!isScrolling) {
        smoothVel *= 0.86;
        if (smoothVel < EXIT_STREAM) inStreamMode = false;
        if (smoothVel < 0.3)        smoothVel = 0;
      }

      // ── Spawn ──
      if (isScrolling) {
        let interval: number;
        if (inStreamMode) {
          // Dense: every 2–3 frames → initial gap 2–3 px → always connected
          interval = smoothVel > 8 ? 2 : 3;
        } else {
          // Sparse: every 11–15 frames → initial gap 15–20 px → individual drops
          interval = Math.max(11, Math.round(18 - smoothVel * 2));
        }
        if (frame_n - lastSpawnFrame >= interval) {
          lastSpawnFrame = frame_n;
          spawn(inStreamMode);
        }
      }

      // ── Physics ──
      for (const d of drops) {
        d.vy  = Math.min(d.vy + GRAVITY, MAX_VY);
        d.y  += d.vy;
        d.x  += d.vx;
        d.vx *= 0.95;
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        if (drops[i].y > h + 12) drops.splice(i, 1);
      }

      // ── Render ──
      ctx.clearRect(0, 0, PANEL_W, h);
      drops.sort((a, b) => a.y - b.y);

      // Segment detection with per-pair gap threshold:
      //   stream + stream → STREAM_GAP (32 px, always connected)
      //   drop  + drop   → DROP_GAP   (14 px, always separate)
      //   mixed          → Infinity   (never connect)
      const segs: Drop[][] = [];
      let cur: Drop[] = [];
      for (let i = 0; i < drops.length; i++) {
        if (i === 0) {
          cur.push(drops[i]);
        } else {
          const gap = drops[i].y - drops[i - 1].y;
          const ss  = drops[i].stream;
          const ps  = drops[i - 1].stream;
          const thr = (ss && ps) ? STREAM_GAP : (!ss && !ps) ? DROP_GAP : Infinity;
          if (gap <= thr) {
            cur.push(drops[i]);
          } else {
            segs.push(cur);
            cur = [drops[i]];
          }
        }
      }
      if (cur.length > 0) segs.push(cur);

      for (const seg of segs) drawSegment(ctx, seg);

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

      {/* Physics stream canvas — behind the machine SVG */}
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />

      {/*
       * Chrome portafilter / group head — "cut view" fixed at top-left.
       * Handle is on the LEFT: extends beyond x=0 so it's naturally
       * clipped by the viewport edge, giving a close-crop feel.
       * SVG overflow:visible so the group-head rect (y=-32) and handle
       * paths (x<0) render correctly within the fixed viewport bounds.
       */}
      <svg
        viewBox="0 0 110 108"
        width="110"
        height="108"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
      >
        <defs>
          {/* ── Chrome gradients ── */}
          {/* Main horizontal chrome reflection (3 bright bands) */}
          <linearGradient id="cH1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#5e5e5e" />
            <stop offset="12%"  stopColor="#d0d0d0" />
            <stop offset="28%"  stopColor="#a8a8a8" />
            <stop offset="48%"  stopColor="#eeeeee" />
            <stop offset="66%"  stopColor="#c0c0c0" />
            <stop offset="82%"  stopColor="#f4f4f4" />
            <stop offset="100%" stopColor="#787878" />
          </linearGradient>

          {/* Slightly different bands for the portafilter collar */}
          <linearGradient id="cH2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#4e4e4e" />
            <stop offset="22%"  stopColor="#bcbcbc" />
            <stop offset="48%"  stopColor="#e8e8e8" />
            <stop offset="72%"  stopColor="#b0b0b0" />
            <stop offset="100%" stopColor="#666666" />
          </linearGradient>

          {/* Basket — slightly warmer to differentiate */}
          <linearGradient id="cH3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#6a6a6a" />
            <stop offset="35%"  stopColor="#d8d8d8" />
            <stop offset="62%"  stopColor="#c4c4c4" />
            <stop offset="100%" stopColor="#828282" />
          </linearGradient>

          {/* Shower screen radial — dark centre for depth */}
          <radialGradient id="shower" cx="48%" cy="44%" r="54%">
            <stop offset="0%"   stopColor="#686868" />
            <stop offset="50%"  stopColor="#424242" />
            <stop offset="100%" stopColor="#202020" />
          </radialGradient>

          {/* Subtle inner-shadow gradient across bottom of group head */}
          <linearGradient id="cShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#000" stopOpacity="0"    />
            <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* ── GROUP HEAD (extends above viewport — cut view) ── */}
        <rect x="0" y="-32" width="100" height="74" rx="5"
              fill="url(#cH1)" />
        {/* Second highlight band (thin bright strip near top) */}
        <rect x="5" y="-28" width="90" height="3.5" rx="1.5"
              fill="white" opacity="0.22" />
        {/* Inner shadow at bottom of group head block */}
        <rect x="0" y="28" width="100" height="14" rx="0"
              fill="url(#cShadow)" />

        {/* Bolt / fastener — top-left */}
        <circle cx="10" cy="-10" r="4.2" fill="#404040" />
        <circle cx="10" cy="-10" r="2.4" fill="#2e2e2e" />
        <line x1="8.3" y1="-10" x2="11.7" y2="-10"
              stroke="#585858" strokeWidth="0.8" />
        <line x1="10" y1="-11.7" x2="10" y2="-8.3"
              stroke="#585858" strokeWidth="0.8" />
        {/* Bolt / fastener — top-right */}
        <circle cx="90" cy="-10" r="4.2" fill="#404040" />
        <circle cx="90" cy="-10" r="2.4" fill="#2e2e2e" />
        <line x1="88.3" y1="-10" x2="91.7" y2="-10"
              stroke="#585858" strokeWidth="0.8" />
        <line x1="90" y1="-11.7" x2="90" y2="-8.3"
              stroke="#585858" strokeWidth="0.8" />

        {/* ── SHOWER SCREEN (bottom face of group head) ── */}
        <ellipse cx="50" cy="42" rx="49" ry="9"   fill="#464646" />
        <ellipse cx="50" cy="42" rx="44" ry="7.5" fill="#383838" />
        <ellipse cx="50" cy="42" rx="37" ry="6"   fill="url(#shower)" />
        {/* Shower perforations — 2 rows of 6 */}
        {[35, 41, 47, 53, 59, 65].flatMap((cx, col) =>
          [39, 43].map((cy, row) => (
            <circle key={`${col}-${row}`} cx={cx} cy={cy} r="1.2"
                    fill="#141414" opacity="0.9" />
          ))
        )}

        {/* ── PORTAFILTER MOUNTING LUGS ──
             The two ears that twist-lock into the group head. */}
        {/* Left lug */}
        <path d="M 4 43 L 18 43 L 18 52 Q 15 56 10 55 Q 5 54 4 50 Z"
              fill="url(#cH2)" />
        <line x1="4" y1="48" x2="18" y2="48"
              stroke="white" strokeWidth="0.4" opacity="0.28" />
        {/* Right lug */}
        <path d="M 96 43 L 82 43 L 82 52 Q 85 56 90 55 Q 95 54 96 50 Z"
              fill="url(#cH2)" />
        <line x1="96" y1="48" x2="82" y2="48"
              stroke="white" strokeWidth="0.4" opacity="0.28" />

        {/* ── PORTAFILTER COLLAR ── */}
        <path d="M 8 46 Q 6 59 10 63 L 90 63 Q 94 59 92 46 Z"
              fill="url(#cH2)" />
        {/* Collar surface highlight */}
        <line x1="8" y1="54" x2="92" y2="54"
              stroke="white" strokeWidth="0.55" opacity="0.20" />

        {/* ── PORTAFILTER BASKET ──
             Tapered — wider at top, slightly narrower at base. */}
        <path d="M 12 63 Q 10 82 17 86 L 83 86 Q 90 82 88 63 Z"
              fill="url(#cH3)" />
        {/* Bottom rim ellipse */}
        <ellipse cx="50" cy="86" rx="33" ry="5.5" fill="#9c9c9c" />
        <ellipse cx="50" cy="86" rx="27" ry="4.0" fill="#888888" />
        {/* Subtle vertical highlight line down basket centre */}
        <line x1="50" y1="64" x2="50" y2="85"
              stroke="white" strokeWidth="0.8" opacity="0.10" />

        {/* ── SPOUT EXIT HOLES ── */}
        <ellipse cx="38" cy="90" rx="5.0" ry="3.2" fill="#2a2a2a" />
        <ellipse cx="62" cy="90" rx="5.0" ry="3.2" fill="#2a2a2a" />
        <ellipse cx="38" cy="90" rx="2.8" ry="1.8" fill="#0e0e0e" />
        <ellipse cx="62" cy="90" rx="2.8" ry="1.8" fill="#0e0e0e" />

        {/* ── HANDLE — LEFT SIDE ──
             Extends leftward beyond x=0; the viewport naturally clips it,
             giving the "handle disappears off-frame" cut-view effect. */}
        {/* Chrome collar ring where handle meets basket */}
        <ellipse cx="22" cy="74" rx="6.5" ry="8.5" fill="#707070" />
        <ellipse cx="22" cy="74" rx="4.5" ry="6"   fill="#5a5a5a" />
        {/* Handle main body — matte black rubber, curves left */}
        <path d="M 22 66 Q 10 64 -2 68 Q -16 72 -30 78"
              stroke="#161616" strokeWidth="11" fill="none" strokeLinecap="round" />
        {/* Rubber grip surface */}
        <path d="M 22 66 Q 10 64 -2 68 Q -16 72 -30 78"
              stroke="#272727" strokeWidth="8"  fill="none" strokeLinecap="round" />
        {/* Grip texture lines (subtle ridges on rubber) */}
        {[-6, -2, 2, 6, 10].map(dx => (
          <path key={dx}
                d={`M ${22+dx} ${65+dx*0.08} Q ${10+dx} ${63+dx*0.08} ${-2+dx} ${67+dx*0.08}`}
                stroke="#333" strokeWidth="0.6" fill="none" opacity="0.45" />
        ))}
        {/* Specular highlight on top edge of handle */}
        <path d="M 21 64.5 Q 9 62.5 -3 66.5 Q -15 70 -28 75.5"
              stroke="#5a5a5a" strokeWidth="1.4" fill="none" strokeLinecap="round"
              opacity="0.60" />
        {/* Chrome end-cap ring (partially off-screen, visible at x<0) */}
        <ellipse cx="-30" cy="78" rx="4.5" ry="3" fill="#868686" />
        <ellipse cx="-30" cy="78" rx="2.5" ry="1.6" fill="#6a6a6a" />
      </svg>
    </div>
  );
}
