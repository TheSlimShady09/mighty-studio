import { useEffect } from 'react';
import { Ticker, isCoarsePointer, prefersReducedMotion, throttleRAF } from '../lib/env';
import cameraSrc from '../assets/camera.jpg';

const MAX_PARTICLES = 22000;
const LUMA_FLOOR = 42; // below this the source is background, not camera
const REPEL_RADIUS = 130; // px around the pointer
const REPEL_FORCE = 2.6;
const SPRING = 0.016; // pull back towards the resting position
const DAMPING = 0.9;

// The scatter is finished before the hero has fully left, so the whole of it
// happens where it can still be seen.
const SPAN = 0.82;

/**
 * The camera is the photograph itself, taken apart.
 *
 * The source is already a point cloud on black, so the background is removed
 * by luminance rather than by any masking: pixels darker than the floor are
 * simply never turned into particles, which leaves the canvas transparent.
 * Positions and brightness are read straight off the photograph, so the shape
 * is the one in the file; the pointer then pushes those points apart and a
 * spring walks them home.
 *
 * Scrolling off the hero pulls the cloud apart and drops it down into the
 * page. Every particle's flight is a pure function of the scroll position —
 * no velocity is accumulated for it — so scrolling back up runs the same
 * arithmetic backwards and the camera reassembles exactly as it was.
 *
 * `api` is filled with `{ setProgress }` for the hero to drive.
 */
export function useParticleCamera(canvasRef, hostRef, api) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();
    // The cloud only runs a physics loop for a fine pointer. Where it is
    // static it costs nothing per frame, so it is sampled at the screen's own
    // density instead — on a phone that is the difference between a soft
    // smear and single, sharp points.
    const animate = !reduced && !coarse;
    const dpr = animate ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const budgetMax = Math.round(MAX_PARTICLES * dpr * dpr);
    const repelR = REPEL_RADIUS * dpr;

    let disposed = false;
    let img = null;
    let W = 0;
    let H = 0;
    let count = 0;
    let ox, oy, px, py, vx, vy, br, sx, sy, dl;
    let image = null;
    let buf32 = null;
    let running = false;
    let progress = 0; // 0 while the hero is held, 1 once it has left
    let spreadX = 0;
    let spreadY = 0;
    let fall = 0;
    const pointer = { x: -9999, y: -9999 };

    function build() {
      if (!img) return;

      const rect = host.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width * dpr));
      H = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = W;
      canvas.height = H;

      // contain-fit, so the camera is never cropped or stretched
      const scale = Math.min(W / img.width, H / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, dx, dy, dw, dh);
      const src = ctx.getImageData(0, 0, W, H).data;

      // one pass to count what is actually lit, so the thinning factor is
      // known before anything is allocated
      let candidates = 0;
      for (let i = 0; i < src.length; i += 4) {
        const luma = (src[i] * 299 + src[i + 1] * 587 + src[i + 2] * 114) / 1000;
        if (luma > LUMA_FLOOR) candidates++;
      }

      const keep = candidates > budgetMax ? budgetMax / candidates : 1;
      const budget = Math.min(candidates, budgetMax);

      ox = new Float32Array(budget);
      oy = new Float32Array(budget);
      px = new Float32Array(budget);
      py = new Float32Array(budget);
      vx = new Float32Array(budget);
      vy = new Float32Array(budget);
      br = new Uint8Array(budget);
      sx = new Float32Array(budget); // scatter direction, across
      sy = new Float32Array(budget); // scatter direction, down the frame
      dl = new Float32Array(budget); // how late this one lets go

      const cx = W / 2;
      let n = 0;
      for (let y = 0; y < H && n < budget; y++) {
        for (let x = 0; x < W && n < budget; x++) {
          const i = (y * W + x) * 4;
          const luma = (src[i] * 299 + src[i + 1] * 587 + src[i + 2] * 114) / 1000;
          if (luma <= LUMA_FLOOR) continue;
          // thinning at random, never on a grid: a grid would beat against
          // the dot pattern already in the photograph
          if (keep < 1 && Math.random() > keep) continue;
          ox[n] = x;
          oy[n] = y;
          px[n] = x;
          py[n] = y;
          // thinning costs density, so the surviving points carry a little
          // more light: on screen this matches the photograph's weight
          const lifted = luma * 1.5;
          br[n] = lifted > 255 ? 255 : lifted;

          // Scatter outward from the middle, with enough randomness that the
          // cloud never reads as a grid coming apart.
          sx[n] = (Math.random() * 2 - 1) * 0.85 + ((x - cx) / (W * 0.5)) * 0.45;
          sy[n] = Math.random() * 0.8 - 0.15;
          // The bottom of the camera lets go first, so the picture falls into
          // the page rather than all of it leaving at once.
          dl[n] = (1 - y / H) * 0.55 + Math.random() * 0.45;
          n++;
        }
      }
      count = n;

      spreadX = W * 0.5;
      spreadY = H * 0.28;
      fall = H * 1.9;

      image = ctx.createImageData(W, H);
      buf32 = new Uint32Array(image.data.buffer);
      render();
    }

    function render() {
      if (!buf32) return;
      buf32.fill(0);

      const pp = progress <= 0 ? 0 : progress >= SPAN ? 1 : progress / SPAN;

      // held: the camera as photographed, and no per-particle arithmetic
      if (pp === 0) {
        for (let i = 0; i < count; i++) {
          const x = px[i] | 0;
          const y = py[i] | 0;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          // little-endian ABGR: white, with the photograph's own brightness
          buf32[y * W + x] = (br[i] << 24) | 0x00ffffff;
        }
        ctx.putImageData(image, 0, 0);
        return;
      }

      // Reduced motion gets the same exit without the flight: it simply goes.
      if (reduced) {
        const k = 1 - pp;
        for (let i = 0; i < count; i++) {
          const x = px[i] | 0;
          const y = py[i] | 0;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          buf32[y * W + x] = ((br[i] * k) << 24) | 0x00ffffff;
        }
        ctx.putImageData(image, 0, 0);
        return;
      }

      for (let i = 0; i < count; i++) {
        const lead = dl[i] * 0.45;
        const t = (pp - lead) / (1 - lead);

        if (t <= 0) {
          const x = px[i] | 0;
          const y = py[i] | 0;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          buf32[y * W + x] = (br[i] << 24) | 0x00ffffff;
          continue;
        }
        if (t >= 1) continue; // gone into the page

        const inv = 1 - t;
        const drift = 1 - inv * inv; // lateral spread eases out
        const grav = t * t; // the fall accelerates
        const x = (px[i] + sx[i] * drift * spreadX) | 0;
        const y = (py[i] + sy[i] * drift * spreadY + grav * fall) | 0;
        if (x < 0 || y < 0 || x >= W || y >= H) continue;

        // a small flare as each point detaches, then out
        let a = br[i] * inv * (1 + 2 * t * inv);
        if (a > 255) a = 255;
        buf32[y * W + x] = (a << 24) | 0x00ffffff;
      }
      ctx.putImageData(image, 0, 0);
    }

    function step() {
      const mx = pointer.x;
      const my = pointer.y;
      const r2 = repelR * repelR;

      for (let i = 0; i < count; i++) {
        const dx = px[i] - mx;
        const dy = py[i] - my;
        const d2 = dx * dx + dy * dy;

        if (d2 < r2 && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const f = (1 - d / repelR) * REPEL_FORCE;
          vx[i] += (dx / d) * f;
          vy[i] += (dy / d) * f;
        }

        vx[i] = (vx[i] + (ox[i] - px[i]) * SPRING) * DAMPING;
        vy[i] = (vy[i] + (oy[i] - py[i]) * SPRING) * DAMPING;
        px[i] += vx[i];
        py[i] += vy[i];
      }
      render();
    }

    const redraw = throttleRAF(render);
    const onResize = throttleRAF(build);
    const onMove = e => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) * dpr;
      pointer.y = (e.clientY - rect.top) * dpr;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    // The hero drives this on every scroll frame. Where a physics loop is
    // already running it only stores the value; where there is none, it asks
    // for a redraw, so a still page stays still.
    if (api) {
      api.current = {
        setProgress(v) {
          const next = v < 0 ? 0 : v > 1 ? 1 : v;
          if (next === progress) return;
          progress = next;
          if (!animate) redraw();
        }
      };
    }

    const loader = new Image();
    loader.decoding = 'async';
    loader.src = cameraSrc;
    loader
      .decode()
      .catch(() => new Promise(res => {
        loader.onload = res;
        loader.onerror = res;
      }))
      .then(() => {
        if (disposed || !loader.naturalWidth) return;
        img = loader;
        build();
        window.addEventListener('resize', onResize, { passive: true });
        if (!animate) return;
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerleave', onLeave);
        Ticker.add(step);
        running = true;
      });

    return () => {
      disposed = true;
      if (api) api.current = null;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      if (running) Ticker.remove(step);
    };
  }, [canvasRef, hostRef, api]);
}
