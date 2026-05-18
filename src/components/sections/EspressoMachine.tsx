import { useEffect, useRef } from "react";

const STREAM_LENGTH = 2400;
const GROWTH_RATIO = 2.2;
const MAX_GROWTH_PER_FRAME = 18;
const STOP_DELAY = 150;

export default function EspressoMachine() {
  const streamRef = useRef<SVGPathElement>(null);
  const highlightRef = useRef<SVGPathElement>(null);
  const dripRef = useRef<SVGCircleElement>(null);
  const cupFillRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    let dashOffset = STREAM_LENGTH;
    let targetOffset = STREAM_LENGTH;
    let lastScrollY = window.scrollY;
    let rafId: number;
    let stopTimer: ReturnType<typeof setTimeout>;
    let isPouring = false;

    const stream = streamRef.current;
    const highlight = highlightRef.current;
    const drip = dripRef.current;
    const cupFill = cupFillRef.current;

    if (!stream || !highlight) return;

    stream.style.strokeDasharray = `${STREAM_LENGTH}`;
    stream.style.strokeDashoffset = `${STREAM_LENGTH}`;
    highlight.style.strokeDasharray = `${STREAM_LENGTH}`;
    highlight.style.strokeDashoffset = `${STREAM_LENGTH}`;

    function setPouring(v: boolean) {
      isPouring = v;
      if (drip) {
        drip.style.opacity = v ? "1" : "0.4";
        drip.style.animationPlayState = v ? "running" : "paused";
      }
    }

    function onScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;

      const growth = Math.min(Math.abs(delta) * GROWTH_RATIO, MAX_GROWTH_PER_FRAME);
      targetOffset = Math.max(0, targetOffset - growth);

      setPouring(true);
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => setPouring(false), STOP_DELAY);

      // cup fill progress — grows upward inside cup
      if (cupFill) {
        const progress = 1 - dashOffset / STREAM_LENGTH;
        const maxH = 22;
        const h = Math.min(maxH, progress * maxH * 2.5);
        cupFill.setAttribute("height", String(h));
        cupFill.setAttribute("y", String(30 - h));
      }
    }

    function frame() {
      // lerp toward target
      dashOffset += (targetOffset - dashOffset) * 0.12;
      if (Math.abs(dashOffset - targetOffset) < 0.2) dashOffset = targetOffset;

      stream.style.strokeDashoffset = `${dashOffset}`;
      highlight.style.strokeDashoffset = `${dashOffset}`;

      // move drip to tip of visible stream
      if (drip && isPouring) {
        const progress = 1 - dashOffset / STREAM_LENGTH;
        const tipY = 310 + progress * STREAM_LENGTH * 0.42;
        drip.setAttribute("cy", String(Math.min(tipY, 310 + STREAM_LENGTH * 0.42)));
      }

      rafId = requestAnimationFrame(frame);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(stopTimer);
    };
  }, []);

  return (
    <div
      className="espresso-panel"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 3000"
        width="200"
        height="3000"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          {/* Steam gradient */}
          <linearGradient id="machineBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e2e2e" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
          <linearGradient id="streamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5a2f0f" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#7a4520" stopOpacity="1" />
            <stop offset="100%" stopColor="#5a2f0f" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="highlightGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c8814a" stopOpacity="0" />
            <stop offset="40%" stopColor="#d4935e" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c8814a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="100%" stopColor="#222" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── STEAM WANDS (always animating) ── */}
        <g opacity="0.7">
          <path d="M148 60 Q152 50 150 35 Q148 20 152 8" stroke="#ccc" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur="2.4s" repeatCount="indefinite" begin="0s" />
            <animate attributeName="d" values="M148 60 Q152 50 150 35 Q148 20 152 8;M148 60 Q154 48 151 33 Q149 18 153 5;M148 60 Q152 50 150 35 Q148 20 152 8" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M152 60 Q157 48 155 32 Q153 17 157 4" stroke="#bbb" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.5;0" dur="3.1s" repeatCount="indefinite" begin="0.7s" />
            <animate attributeName="d" values="M152 60 Q157 48 155 32 Q153 17 157 4;M152 60 Q159 46 156 30 Q154 15 158 2;M152 60 Q157 48 155 32 Q153 17 157 4" dur="3.1s" repeatCount="indefinite" />
          </path>
          <path d="M156 62 Q162 49 159 33 Q157 18 161 5" stroke="#aaa" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.4;0" dur="2.8s" repeatCount="indefinite" begin="1.4s" />
          </path>
        </g>

        {/* ── MACHINE BODY ── */}
        {/* Main body */}
        <rect x="18" y="68" width="148" height="190" rx="14" fill="url(#machineBody)" />
        {/* Top panel highlight */}
        <rect x="24" y="68" width="136" height="8" rx="4" fill="#3a3a3a" />
        {/* Front face inset */}
        <rect x="28" y="88" width="128" height="148" rx="8" fill="#252525" />
        {/* Brand strip */}
        <rect x="36" y="94" width="112" height="14" rx="4" fill="#1a1a1a" />
        <text x="92" y="104.5" textAnchor="middle" fontSize="6" fill="#888" fontFamily="Inter, sans-serif" letterSpacing="2">ESPRESSO</text>

        {/* ── PRESSURE GAUGE ── */}
        <circle cx="70" cy="140" r="22" fill="url(#gaugeGrad)" />
        <circle cx="70" cy="140" r="19" fill="none" stroke="#444" strokeWidth="1.5" />
        <circle cx="70" cy="140" r="16" fill="#1c1c1c" />
        {/* Gauge ticks */}
        {[...Array(9)].map((_, i) => {
          const angle = -140 + i * 35;
          const rad = (angle * Math.PI) / 180;
          const r1 = 13, r2 = 15;
          return (
            <line
              key={i}
              x1={70 + r1 * Math.cos(rad)} y1={140 + r1 * Math.sin(rad)}
              x2={70 + r2 * Math.cos(rad)} y2={140 + r2 * Math.sin(rad)}
              stroke="#555" strokeWidth="0.8"
            />
          );
        })}
        {/* Needle pointing to ~9 bar / perfect zone */}
        <line x1="70" y1="140" x2="70" y2="128" stroke="#e8543a" strokeWidth="1.5" strokeLinecap="round"
          transform="rotate(20 70 140)" />
        <circle cx="70" cy="140" r="2" fill="#888" />
        <text x="70" y="159" textAnchor="middle" fontSize="4.5" fill="#666" fontFamily="Inter, sans-serif">BAR</text>

        {/* ── BUTTONS ── */}
        <circle cx="118" cy="126" r="7" fill="#333" stroke="#444" strokeWidth="1" />
        <circle cx="118" cy="126" r="4" fill="#1a1a1a" />
        <circle cx="136" cy="126" r="5" fill="#2a6e3a" stroke="#3a8a4a" strokeWidth="0.8" />
        <circle cx="118" cy="144" r="5" fill="#222" stroke="#3a3a3a" strokeWidth="0.8" />
        <circle cx="136" cy="144" r="5" fill="#222" stroke="#3a3a3a" strokeWidth="0.8" />

        {/* ── STEAM WAND ARM ── */}
        <path d="M152 178 L166 178 Q174 178 174 186 L174 230" stroke="#444" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M174 230 L174 238" stroke="#666" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="174" cy="240" r="3" fill="#555" />

        {/* ── WATER TANK (right side detail) ── */}
        <rect x="152" y="90" width="14" height="60" rx="4" fill="#2a2a2a" stroke="#3a3a3a" strokeWidth="1" />
        <rect x="154" y="108" width="10" height="22" rx="2" fill="#0e2235" opacity="0.6" />
        <rect x="154" y="108" width="10" height="8" rx="2" fill="#1a4a6e" opacity="0.8" />

        {/* ── GROUP HEAD & PORTAFILTER ── */}
        <rect x="62" y="248" width="60" height="18" rx="6" fill="#333" />
        {/* portafilter handle */}
        <path d="M62 255 Q40 255 36 265 Q34 272 38 276" stroke="#3a2a1a" strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* portafilter collar */}
        <rect x="68" y="264" width="48" height="14" rx="5" fill="#2a2a2a" />
        {/* spout */}
        <path d="M84 278 L84 294 M100 278 L100 294" stroke="#222" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* spout tips */}
        <circle cx="84" cy="296" r="2.5" fill="#1a1a1a" />
        <circle cx="100" cy="296" r="2.5" fill="#1a1a1a" />

        {/* ── DRIP TRAY ── */}
        <rect x="28" y="258" width="128" height="8" rx="2" fill="#2a2a2a" />
        {/* Tray grid pattern */}
        {[0,1,2,3,4].map(i => (
          <rect key={i} x={32 + i * 24} y="258" width="1" height="8" fill="#333" />
        ))}
        <rect x="24" y="265" width="136" height="10" rx="3" fill="#222" />

        {/* ── COFFEE STREAM (scroll-driven) ── */}
        {/* Main stream — wavy bezier */}
        <path
          ref={streamRef}
          d={`M92 298
             C92 330 96 350 90 390
             C84 430 96 460 92 510
             C88 560 95 590 91 640
             C87 690 96 720 92 770
             C88 820 95 850 91 900
             C87 950 96 980 92 1030
             C88 1080 95 1110 91 1160
             C87 1210 96 1240 92 1290
             C88 1340 95 1370 91 1420
             C87 1470 96 1500 92 1550
             C88 1600 95 1630 91 1680
             C87 1730 96 1760 92 1810
             C88 1860 95 1890 91 1940
             C87 1990 96 2020 92 2070
             C88 2120 95 2150 91 2200
             C87 2250 96 2280 92 2300`}
          fill="none"
          stroke="url(#streamGrad)"
          strokeWidth="5.5"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        {/* Highlight shimmer on stream */}
        <path
          ref={highlightRef}
          d={`M92 298
             C92 330 96 350 90 390
             C84 430 96 460 92 510
             C88 560 95 590 91 640
             C87 690 96 720 92 770
             C88 820 95 850 91 900
             C87 950 96 980 92 1030
             C88 1080 95 1110 91 1160
             C87 1210 96 1240 92 1290
             C88 1340 95 1370 91 1420
             C87 1470 96 1500 92 1550
             C88 1600 95 1630 91 1680
             C87 1730 96 1760 92 1810
             C88 1860 95 1890 91 1940
             C87 1990 96 2020 92 2070
             C88 2120 95 2150 91 2200
             C87 2250 96 2280 92 2300`}
          fill="none"
          stroke="url(#highlightGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* ── DRIP DROP at tip ── */}
        <circle
          ref={dripRef}
          cx="92"
          cy="310"
          r="3.5"
          fill="#7a4520"
          opacity="0"
          style={{ transition: "opacity 0.2s" }}
        >
          <animate attributeName="r" values="3.5;4.5;3.5" dur="0.6s" repeatCount="indefinite" />
        </circle>

        {/* ── ESPRESSO CUP (bottom area, fills with scroll progress) ── */}
        <g transform="translate(60, 2560)">
          {/* saucer */}
          <ellipse cx="40" cy="32" rx="38" ry="5" fill="#2a2a2a" />
          {/* cup body */}
          <path d="M14 8 Q12 28 16 30 L64 30 Q68 28 66 8 Z" fill="#2e2e2e" stroke="#444" strokeWidth="1" />
          {/* cup fill (grows with scroll, clipped to cup interior) */}
          <clipPath id="cupClip">
            <path d="M14 8 Q12 28 16 30 L64 30 Q68 28 66 8 Z" />
          </clipPath>
          <rect
            ref={cupFillRef}
            x="14"
            y="30"
            width="52"
            height="0"
            fill="#6f3e1e"
            opacity="0.9"
            clipPath="url(#cupClip)"
          />
          {/* cup rim */}
          <ellipse cx="40" cy="8" rx="26" ry="4" fill="#3a3a3a" />
          {/* handle */}
          <path d="M64 14 Q78 14 78 22 Q78 30 64 30" stroke="#3a3a3a" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* foam highlight */}
          <ellipse cx="40" cy="8" rx="18" ry="2" fill="#c8a882" opacity="0.15" />
        </g>
      </svg>
    </div>
  );
}
