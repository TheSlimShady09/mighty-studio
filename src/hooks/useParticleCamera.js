import { useEffect } from 'react';
import { Ticker, isCoarsePointer, prefersReducedMotion, throttleRAF } from '../lib/env';
import cameraSrc from '../assets/camera.jpg';

const MAX_PARTICLES = 22000;
const LUMA_FLOOR = 42; // below this the source is background, not camera
const REPEL_RADIUS = 130; // px around the pointer
const REPEL_FORCE = 2.6;
const SPRING = 0.016; // pull back towards the resting position
const DAMPING = 0.9;

/**
 * The camera is the photograph itself, taken apart.
 *
 * The source is already a point cloud on black, so the background is removed
 * by luminance rather than by any masking: pixels darker than the floor are
 * simply never turned into particles, which leaves the canvas transparent.
 * Positions and brightness are read straight off the photograph, so the shape
 * is the one in the file; the pointer then pushes those points apart and a
 * spring walks them home.
 */
export function useParticleCamera(canvasRef, hostRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const reduced = prefersReducedMotion();
    const coarse = isCoarsePointer();

    let disposed = false;
    let img = null;
    let W = 0;
    let H = 0;
    let count = 0;
    let ox, oy, px, py, vx, vy, br;
    let image = null;
    let buf32 = null;
    let running = false;
    const pointer = { x: -9999, y: -9999 };

    function build() {
      if (!img) return;

      const rect = host.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
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

      const keep = candidates > MAX_PARTICLES ? MAX_PARTICLES / candidates : 1;
      const budget = Math.min(candidates, MAX_PARTICLES);

      ox = new Float32Array(budget);
      oy = new Float32Array(budget);
      px = new Float32Array(budget);
      py = new Float32Array(budget);
      vx = new Float32Array(budget);
      vy = new Float32Array(budget);
      br = new Uint8Array(budget);

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
          n++;
        }
      }
      count = n;

      image = ctx.createImageData(W, H);
      buf32 = new Uint32Array(image.data.buffer);
      render();
    }

    function render() {
      buf32.fill(0);
      for (let i = 0; i < count; i++) {
        const x = px[i] | 0;
        const y = py[i] | 0;
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        // little-endian ABGR: white, with the photograph's own brightness
        buf32[y * W + x] = (br[i] << 24) | 0x00ffffff;
      }
      ctx.putImageData(image, 0, 0);
    }

    function step() {
      const mx = pointer.x;
      const my = pointer.y;
      const r2 = REPEL_RADIUS * REPEL_RADIUS;

      for (let i = 0; i < count; i++) {
        const dx = px[i] - mx;
        const dy = py[i] - my;
        const d2 = dx * dx + dy * dy;

        if (d2 < r2 && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const f = (1 - d / REPEL_RADIUS) * REPEL_FORCE;
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

    const onResize = throttleRAF(build);
    const onMove = e => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

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
        if (reduced || coarse) return;
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerleave', onLeave);
        Ticker.add(step);
        running = true;
      });

    return () => {
      disposed = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      if (running) Ticker.remove(step);
    };
  }, [canvasRef, hostRef]);
}
