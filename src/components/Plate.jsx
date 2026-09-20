import { useMemo } from 'react';

/**
 * Every "photograph" on the page is generated, so the build ships with no
 * image assets. Four composition families cut light out of black; subjects are
 * filled with a directional gradient so they read as modelled form, not glow.
 *
 * All randomness is resolved once, in a memo keyed by recipe index — a plate
 * must look identical across re-renders (the coverflow re-renders constantly).
 */

const RECIPES = [
  { kind: 'figure', freq: '0.008 0.019', oct: 4, warp: 30, soft: 11, key: [0.38, 0.34], r: 0.66, amb: 0.38, rot: -8,  bars: 0, light: [0.08, 0.02, 0.92, 0.95] },
  { kind: 'arch',   freq: '0.011 0.005', oct: 3, warp: 16, soft: 6,  key: [0.66, 0.26], r: 0.6,  amb: 0.3,  rot: 0,   bars: 4, light: [0.95, 0.1, 0.1, 0.9] },
  { kind: 'smoke',  freq: '0.006 0.014', oct: 5, warp: 54, soft: 18, key: [0.5, 0.44],  r: 0.7,  amb: 0.34, rot: 18,  bars: 0, light: [0.2, 0.0, 0.85, 1.0] },
  { kind: 'still',  freq: '0.018 0.018', oct: 2, warp: 12, soft: 7,  key: [0.42, 0.52], r: 0.56, amb: 0.26, rot: 0,   bars: 2, light: [0.14, 0.06, 0.9, 0.94] },
  { kind: 'figure', freq: '0.005 0.012', oct: 4, warp: 40, soft: 14, key: [0.62, 0.4],  r: 0.62, amb: 0.32, rot: 11,  bars: 3, light: [0.92, 0.04, 0.1, 0.9] },
  { kind: 'arch',   freq: '0.014 0.008', oct: 3, warp: 20, soft: 8,  key: [0.32, 0.3],  r: 0.64, amb: 0.34, rot: -4,  bars: 6, light: [0.05, 0.15, 0.95, 0.85] },
  { kind: 'smoke',  freq: '0.007 0.007', oct: 5, warp: 46, soft: 16, key: [0.5, 0.3],   r: 0.72, amb: 0.36, rot: -24, bars: 0, light: [0.5, 0.0, 0.5, 1.0] },
  { kind: 'figure', freq: '0.009 0.013', oct: 4, warp: 26, soft: 12, key: [0.44, 0.32], r: 0.58, amb: 0.3,  rot: 3,   bars: 1, light: [0.9, 0.08, 0.12, 0.92] }
];

/** Deterministic pseudo-random so a given plate always looks the same. */
function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Resolve every random value up front, returning plain geometry data. */
function buildSpec(idx) {
  const r = RECIPES[idx % RECIPES.length];
  const seed = (idx * 977 + 13) % 9973;
  const rand = rng(seed + 1);
  const sweepAngle = Math.round(rand() * 180);

  let subject;
  if (r.kind === 'figure') {
    subject = { kind: 'figure', lean: (rand() * 9 - 4.5).toFixed(1) };
  } else if (r.kind === 'arch') {
    subject = {
      kind: 'arch',
      split: 190 + Math.round(rand() * 190),
      horizon: 300 + Math.round(rand() * 190)
    };
  } else if (r.kind === 'still') {
    const cx = 250 + Math.round(rand() * 100);
    const cy = 370 + Math.round(rand() * 70);
    const rr = 140 + Math.round(rand() * 50);
    subject = { kind: 'still', cx, cy, rr, hx: cx - rr * 0.36, hy: cy - rr * 0.44 };
  } else {
    subject = {
      kind: 'smoke',
      ax: 262 + Math.round(rand() * 76),
      ay: 370 + Math.round(rand() * 80),
      arx: 150 + Math.round(rand() * 40),
      ary: 210 + Math.round(rand() * 60),
      bx: 210 + Math.round(rand() * 180),
      by: 260 + Math.round(rand() * 240)
    };
  }

  const shafts = [];
  for (let i = 0; i < r.bars; i++) {
    shafts.push({
      x: Math.round(rand() * 560) + 20,
      w: 1 + Math.round(rand() * 5),
      o: (0.06 + rand() * 0.22).toFixed(3)
    });
  }

  return { r, seed, sweepAngle, subject, shafts };
}

function Subject({ s, fill }) {
  if (s.kind === 'figure') {
    return (
      <g transform={`rotate(${s.lean} 300 470)`}>
        <path d="M262 352 h76 v74 h-76 z" fill={fill} />
        <ellipse cx="300" cy="286" rx="74" ry="88" fill={fill} />
        <path d="M188 800 C188 570 226 438 300 396 C374 438 412 570 412 800 Z" fill={fill} />
        <path d="M236 800 C236 580 262 462 300 420" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.5" />
        <path d="M300 200 C350 210 370 252 364 300" fill="none" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.34" />
        <path d="M412 800 C408 620 386 502 342 440" fill="none" stroke="#000000" strokeWidth="26" opacity="0.42" />
      </g>
    );
  }

  if (s.kind === 'arch') {
    return (
      <g>
        <rect x="0" y="0" width={s.split} height="800" fill={fill} opacity="0.85" />
        <rect x={s.split} y="0" width="3" height="800" fill="#FFFFFF" opacity="0.75" />
        <rect x={s.split + 3} y="0" width={600 - s.split} height="800" fill="#000000" opacity="0.5" />
        <path d={`M0 ${s.horizon + 120} L600 ${s.horizon - 90} L600 800 L0 800 Z`} fill="#000000" opacity="0.72" />
        <rect x="0" y={s.horizon} width="600" height="2" fill="#FFFFFF" opacity="0.3" />
      </g>
    );
  }

  if (s.kind === 'still') {
    return (
      <g>
        <ellipse cx={s.cx} cy={s.cy + s.rr + 30} rx={s.rr * 1.3} ry="24" fill="#000000" opacity="0.8" />
        <circle cx={s.cx} cy={s.cy} r={s.rr} fill={fill} />
        <circle cx={s.cx} cy={s.cy} r={s.rr} fill="none" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.4" />
        <ellipse cx={s.hx} cy={s.hy} rx={s.rr * 0.17} ry={s.rr * 0.11} fill="#FFFFFF" opacity="0.7"
                 transform={`rotate(-28 ${s.hx} ${s.hy})`} />
        <rect x="0" y={s.cy + s.rr + 26} width="600" height="800" fill="#000000" opacity="0.55" />
      </g>
    );
  }

  // smoke — coiling volumes, kept well inside the frame
  return (
    <g>
      <ellipse cx={s.ax} cy={s.ay} rx={s.arx} ry={s.ary} fill={fill} opacity="0.9" />
      <ellipse cx={s.bx} cy={s.by} rx="96" ry="140" fill={fill} opacity="0.55" />
      <path d="M180 800 C220 600 260 520 300 380" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.22" />
    </g>
  );
}

/**
 * One high-contrast monochrome plate.
 * @param {number} idx     recipe index (wraps)
 * @param {string} uid     unique id prefix — SVG defs are document-global
 * @param {string} quality 'full', or 'low' for grid thumbnails: fewer octaves
 *                         and no grain pass, since feTurbulence is rasterised
 *                         on the CPU and a wall of plates adds up.
 */
export default function Plate({ idx = 0, uid, quality = 'full' }) {
  const { r, seed, sweepAngle, subject, shafts } = useMemo(() => buildSpec(idx), [idx]);
  const L = r.light;
  const light = quality === 'low';
  const octaves = light ? Math.max(2, r.oct - 2) : r.oct;
  const blur = light ? +(r.soft * 0.7).toFixed(1) : r.soft;

  return (
    <svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`lit${uid}`} x1={L[0]} y1={L[1]} x2={L[2]} y2={L[3]}>
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
          <stop offset="26%" stopColor="#C7C7C7" stopOpacity="0.62" />
          <stop offset="58%" stopColor="#4A4A4A" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id={`key${uid}`} cx={r.key[0]} cy={r.key[1]} r={r.r}>
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
          <stop offset="40%" stopColor="#8A8A8A" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`sweep${uid}`} gradientTransform={`rotate(${sweepAngle} 0.5 0.5)`}>
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="48%" stopColor="#8A8A8A" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`vig${uid}`} cx="0.5" cy="0.46" r="0.8">
          <stop offset="40%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
        </radialGradient>
        <filter id={`warp${uid}`} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={r.freq} numOctaves={octaves} seed={seed} result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale={r.warp} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={blur} />
        </filter>
        {!light && (
          <filter id={`grain${uid}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="3" seed={seed + 7} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        )}
      </defs>

      <rect width="600" height="800" fill="#000000" />
      <rect width="600" height="800" fill={`url(#key${uid})`} opacity={r.amb} />
      <g transform={`rotate(${r.rot} 300 400)`}>
        <g filter={`url(#warp${uid})`}>
          <Subject s={subject} fill={`url(#lit${uid})`} />
        </g>
        {shafts.map((b, i) => (
          <rect key={i} x={b.x} y="-60" width={b.w} height="920" fill={`url(#sweep${uid})`} opacity={b.o} />
        ))}
      </g>
      <rect width="600" height="800" fill={`url(#vig${uid})`} />
      {!light && (
        <rect width="600" height="800" filter={`url(#grain${uid})`} opacity="0.2" style={{ mixBlendMode: 'overlay' }} />
      )}
    </svg>
  );
}
