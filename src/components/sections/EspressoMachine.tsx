import { useEffect, useRef } from "react";

/*
 * Real espresso stream physics:
 * - Two streams from a double-spout portafilter converge into one "mouse tail"
 * - First 1-2 seconds: brilliant golden-amber crema at the top
 * - As the shot progresses the stream darkens to espresso brown
 * - The stream has a slight organic wobble — not perfectly straight
 * - Stream STOPS instantly when pouring stops (no coasting)
 *
 * Technique: stroke-dashoffset reveal. dashOffset is ONLY modified inside the
 * scroll handler, so the stream is frozen the moment scrolling ceases.
 */

const GROWTH_RATIO = 2.0; // SVG units revealed per px of scroll

// Main stream path — starts at left spout (38,90), convergence by y≈140,
// then a gentle oscillating descent all the way to y≈2620.
const MAIN_D = `
  M 38 90
  C 36 106 40 118 43 128
  C 45 133 46 136 47 140
  C 47 150 45 165 43 182
  C 41 199 45 216 47 230
  C 49 244 51 260 49 276
  C 47 292 43 308 43 322
  C 43 336 47 354 49 368
  C 51 382 51 398 49 412
  C 47 426 43 442 43 456
  C 43 470 47 488 49 502
  C 51 516 51 532 49 546
  C 47 560 43 576 43 590
  C 43 604 47 622 49 636
  C 51 650 51 666 49 680
  C 47 694 43 710 43 724
  C 43 738 47 756 49 770
  C 51 784 51 800 49 814
  C 47 828 43 844 43 858
  C 43 872 47 890 49 904
  C 51 918 51 934 49 948
  C 47 962 43 978 43 992
  C 43 1006 47 1024 49 1038
  C 51 1052 51 1068 49 1082
  C 47 1096 43 1112 43 1126
  C 43 1140 47 1158 49 1172
  C 51 1186 51 1202 49 1216
  C 47 1230 43 1246 43 1260
  C 43 1274 47 1292 49 1306
  C 51 1320 51 1336 49 1350
  C 47 1364 43 1380 43 1394
  C 43 1408 47 1426 49 1440
  C 51 1454 51 1470 49 1484
  C 47 1498 43 1514 43 1528
  C 43 1542 47 1560 49 1574
  C 51 1588 51 1604 49 1618
  C 47 1632 43 1648 43 1662
  C 43 1676 47 1694 49 1708
  C 51 1722 51 1738 49 1752
  C 47 1766 43 1782 43 1796
  C 43 1810 47 1828 49 1842
  C 51 1856 51 1872 49 1886
  C 47 1900 43 1916 43 1930
  C 43 1944 47 1962 49 1976
  C 51 1990 51 2006 49 2020
  C 47 2034 43 2050 43 2064
  C 43 2078 47 2096 49 2110
  C 51 2124 51 2140 49 2154
  C 47 2168 43 2184 43 2198
  C 43 2212 47 2230 49 2244
  C 51 2258 51 2274 49 2288
  C 47 2302 43 2318 43 2332
  C 43 2346 47 2364 49 2378
  C 51 2392 51 2408 49 2422
  C 47 2436 43 2452 43 2466
  C 43 2480 47 2498 49 2512
  C 51 2526 51 2542 49 2556
  C 47 2570 45 2582 47 2600
`.trim();

// Right spout stream — short path from right hole (62,90) converging to merge at (47,140)
const RIGHT_D = `
  M 62 90
  C 64 106 60 118 57 128
  C 55 133 51 136 47 140
`.trim();

export default function EspressoMachine() {
  const mainRef    = useRef<SVGPathElement>(null);
  const cremaRef   = useRef<SVGPathElement>(null);
  const rightRef   = useRef<SVGPathElement>(null);
  const rightCrRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const main    = mainRef.current;
    const crema   = cremaRef.current;
    const right   = rightRef.current;
    const rightCr = rightCrRef.current;
    if (!main) return;

    // Measure real path lengths so dasharray is exact
    const mainLen  = main.getTotalLength();
    const rightLen = right ? right.getTotalLength() : 0;

    let mainOffset  = mainLen;
    let rightOffset = rightLen;
    let lastScrollY = window.scrollY;
    let rafId: number;

    const setDash = (el: SVGPathElement | null, arr: number, off: number) => {
      if (!el) return;
      el.style.strokeDasharray  = `${arr}`;
      el.style.strokeDashoffset = `${off}`;
    };

    setDash(main,    mainLen,  mainLen);
    setDash(crema,   mainLen,  mainLen);
    setDash(right,   rightLen, rightLen);
    setDash(rightCr, rightLen, rightLen);

    function onScroll() {
      const y     = window.scrollY;
      const delta = Math.abs(y - lastScrollY);
      lastScrollY = y;

      const grow = delta * GROWTH_RATIO;
      mainOffset  = Math.max(0, mainOffset  - grow);
      rightOffset = Math.max(0, rightOffset - grow);

      // Apply immediately — no lerp, stream stops the instant scrolling does
      setDash(main,    mainLen,  mainOffset);
      setDash(crema,   mainLen,  mainOffset);
      setDash(right,   rightLen, rightOffset);
      setDash(rightCr, rightLen, rightOffset);
    }

    // rAF only needed to ensure smooth 60fps DOM sync on rapid scroll
    function frame() {
      rafId = requestAnimationFrame(frame);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="espresso-panel" aria-hidden="true">
      <svg
        viewBox="0 0 110 2650"
        width="110"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          {/* ── Chrome gradients ── */}
          <linearGradient id="chrome1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#6a6a6a" />
            <stop offset="18%"  stopColor="#d8d8d8" />
            <stop offset="36%"  stopColor="#b0b0b0" />
            <stop offset="55%"  stopColor="#f2f2f2" />
            <stop offset="75%"  stopColor="#c0c0c0" />
            <stop offset="100%" stopColor="#808080" />
          </linearGradient>

          <linearGradient id="chrome2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#505050" />
            <stop offset="25%"  stopColor="#b8b8b8" />
            <stop offset="50%"  stopColor="#e8e8e8" />
            <stop offset="75%"  stopColor="#a0a0a0" />
            <stop offset="100%" stopColor="#686868" />
          </linearGradient>

          <linearGradient id="chrome3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#888" />
            <stop offset="40%"  stopColor="#e0e0e0" />
            <stop offset="70%"  stopColor="#c8c8c8" />
            <stop offset="100%" stopColor="#909090" />
          </linearGradient>

          <linearGradient id="chromeDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4a4a4a" />
            <stop offset="100%" stopColor="#282828" />
          </linearGradient>

          <radialGradient id="showerScreen" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#555" />
            <stop offset="60%"  stopColor="#3a3a3a" />
            <stop offset="100%" stopColor="#222" />
          </radialGradient>

          {/*
           * ── Espresso stream gradient ──
           * gradientUnits="userSpaceOnUse" pins colours to absolute SVG y‑coords:
           *   y=90   →  brilliant golden crema  (first drops)
           *   y=180  →  amber                   (crema body)
           *   y=360  →  warm brown              (transition)
           *   y=700+ →  dark espresso
           */}
          <linearGradient id="espresso" x1="0" y1="90" x2="0" y2="900"
                          gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#F0C040" />
            <stop offset="4%"   stopColor="#D8900A" />
            <stop offset="12%"  stopColor="#B06818" />
            <stop offset="28%"  stopColor="#8B4513" />
            <stop offset="60%"  stopColor="#6B3010" />
            <stop offset="100%" stopColor="#4A1E08" />
          </linearGradient>

          {/* Crema highlight — same y range but fades to transparent */}
          <linearGradient id="cremaHL" x1="0" y1="90" x2="0" y2="380"
                          gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FFE080" stopOpacity="0.90" />
            <stop offset="15%"  stopColor="#EAA828" stopOpacity="0.70" />
            <stop offset="40%"  stopColor="#C87818" stopOpacity="0.40" />
            <stop offset="80%"  stopColor="#A05818" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#8B4513" stopOpacity="0"    />
          </linearGradient>

          {/* Organic texture filter — subtle turbulence gives the rope/twist look */}
          <filter id="streamFx" x="-15%" y="0%" width="130%" height="100%"
                  colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.08 0.6"
                          numOctaves="3" seed="7" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
            <feBlend in="SourceGraphic" in2="gray" mode="overlay" result="blended" />
            <feComposite in="blended" in2="SourceGraphic" operator="in" />
            <feGaussianBlur stdDeviation="0.4" />
          </filter>

          {/* Soft glow around stream tip */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/*
         * ── MACHINE (group head + portafilter, close-crop / cut view) ──
         *
         * The group head rectangle extends above y=0 so the top is clipped
         * by the viewport — giving the "cut view, only seeing the spout" look.
         *)
         */}

        {/* Group head main block — extends above y=0 */}
        <rect x="2" y="-28" width="96" height="72" rx="6"
              fill="url(#chrome1)" />
        {/* Top surface highlight */}
        <rect x="8" y="-28" width="84" height="5" rx="2"
              fill="white" opacity="0.18" />
        {/* Screw detail top-left */}
        <circle cx="12" cy="-10" r="3.5" fill="url(#chromeDark)" />
        <circle cx="12" cy="-10" r="1.5" fill="#444" />
        {/* Screw detail top-right */}
        <circle cx="88" cy="-10" r="3.5" fill="url(#chromeDark)" />
        <circle cx="88" cy="-10" r="1.5" fill="#444" />

        {/* Group head bottom face / gasket ring */}
        <ellipse cx="50" cy="44" rx="46" ry="9" fill="#4a4a4a" />
        <ellipse cx="50" cy="44" rx="40" ry="7" fill="#383838" />

        {/* Shower screen disc */}
        <ellipse cx="50" cy="44" rx="34" ry="5.5" fill="url(#showerScreen)" />
        {/* Shower screen holes (4×4 grid impression) */}
        {[38,44,50,56,62].map(cx =>
          [42,46].map(cy => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9"
                    fill="#1a1a1a" opacity="0.8" />
          ))
        )}

        {/* ── Portafilter collar (locks into group head) ── */}
        <path d="M 10 46 Q 8 58 12 62 L 88 62 Q 92 58 90 46 Z"
              fill="url(#chrome2)" />
        {/* Collar seam */}
        <line x1="10" y1="54" x2="90" y2="54"
              stroke="white" strokeWidth="0.5" opacity="0.25" />

        {/* ── Portafilter basket body ── */}
        <path d="M 14 62 Q 12 80 18 84 L 82 84 Q 88 80 86 62 Z"
              fill="url(#chrome3)" />
        {/* Basket base ellipse */}
        <ellipse cx="50" cy="84" rx="32" ry="5.5" fill="#9a9a9a" />
        <ellipse cx="50" cy="84" rx="26" ry="4" fill="#888" />

        {/* Spout outlet holes */}
        <ellipse cx="38" cy="88" rx="4.5" ry="3" fill="#282828" />
        <ellipse cx="62" cy="88" rx="4.5" ry="3" fill="#282828" />
        {/* Spout openings (dark interior) */}
        <ellipse cx="38" cy="88" rx="2.5" ry="1.8" fill="#111" />
        <ellipse cx="62" cy="88" rx="2.5" ry="1.8" fill="#111" />

        {/* ── Portafilter handle (extends off-right edge) ── */}
        {/* Handle collar */}
        <ellipse cx="86" cy="72" rx="6" ry="8" fill="#707070" />
        {/* Handle rod */}
        <path d="M 86 65 Q 92 64 102 66 Q 116 68 128 74"
              stroke="#1c1c1c" strokeWidth="9" fill="none" strokeLinecap="round" />
        {/* Handle rubber texture */}
        <path d="M 89 64.5 Q 96 63 106 65 Q 118 67 126 72"
              stroke="#2e2e2e" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Handle highlight */}
        <path d="M 90 63 Q 98 62 108 64 Q 118 66 124 70"
              stroke="#666" strokeWidth="1.2" fill="none" strokeLinecap="round"
              opacity="0.6" />

        {/* ── COFFEE STREAMS (scroll-driven via strokeDashoffset) ── */}

        {/*
         * Right-spout short stream — converges from (62,90) to (47,140)
         * Reveals at the same pixel-growth rate as the main stream.
         */}
        <path ref={rightRef}
              d={RIGHT_D}
              fill="none" stroke="url(#espresso)"
              strokeWidth="3.5" strokeLinecap="round"
              filter="url(#streamFx)" />
        <path ref={rightCrRef}
              d={RIGHT_D}
              fill="none" stroke="url(#cremaHL)"
              strokeWidth="1.8" strokeLinecap="round"
              filter="url(#glow)" />

        {/*
         * Main stream — from left spout (38,90) down through ~2600 SVG units.
         * Layer order: dark body first, golden crema shimmer on top.
         *)
         */}
        <path ref={mainRef} d={MAIN_D}
              fill="none" stroke="url(#espresso)"
              strokeWidth="4" strokeLinecap="round"
              filter="url(#streamFx)" />
        <path ref={cremaRef} d={MAIN_D}
              fill="none" stroke="url(#cremaHL)"
              strokeWidth="2" strokeLinecap="round"
              filter="url(#glow)" />
      </svg>
    </div>
  );
}
