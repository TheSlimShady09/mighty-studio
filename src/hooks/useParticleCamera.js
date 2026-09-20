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
const SPAN = 0.7;

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
 * The canvas is the whole viewport, not the camera's own box, so scrolling off
 * the hero throws the points across the page rather than trapping them in a
 * square. Every particle's flight is a pure function of the scroll position —
 * no velocity is accumulated for it — so scrolling back up runs the same
 * arithmetic backwards and the camera reassembles exactly as it was.
 *
 * Two things keep a viewport-sized canvas affordable. Only the rectangle that
 * has ink in it is cleared and uploaded, so the cost follows the cloud rather
 * than the screen; and the physics loop is stopped outright once the hero has
 * left, because a loop that runs behind a section nobody is looking at is a
 * loop that steals frames from the section they are looking at.
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
    // Linear in the density, not squared: the extra points are there to hold
    // the shape on a sharp screen, and the scatter has to move all of them.
    const budgetMax = Math.round(MAX_PARTICLES * dpr);
    const repelR = REPEL_RADIUS * dpr;

    let disposed = false;
    let img = null;
    let VW = 0; // canvas, in device pixels: the viewport
    let VH = 0;
    let count = 0;
    let ox, oy, px, py, vx, vy, br, sx, sy, dl;
    let image = null;
    let buf32 = null;
    let running = false;
    let progress = 0; // 0 while the hero is held, 1 once it has left
    let hostDocX = 0; // the camera's box, in document space
    let hostDocY = 0;
    let spreadX = 0;
    let spreadY = 0;
    let fall = 0;
    // the rectangle that currently has ink in it
    let dirty = null;
    const pointer = { x: -9999, y: -9999 };

    function build() {
      if (!img) return;

      const rect = host.getBoundingClientRect();
      const hostW = Math.max(1, Math.round(rect.width * dpr));
      const hostH = Math.max(1, Math.round(rect.height * dpr));
      hostDocX = Math.round((rect.left + window.scrollX) * dpr);
      hostDocY = Math.round((rect.top + window.scrollY) * dpr);

      VW = Math.max(1, Math.round(window.innerWidth * dpr));
      VH = Math.max(1, Math.round(window.innerHeight * dpr));
      canvas.width = VW;
      canvas.height = VH;

      // The photograph is sampled at the size of its own box, off-screen, so
      // the point cloud keeps the camera's proportions whatever the canvas
      // around it happens to be.
      const off = document.createElement('canvas');
      off.width = hostW;
      off.height = hostH;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return;

      // contain-fit, so the camera is never cropped or stretched
      const scale = Math.min(hostW / img.width, hostH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      octx.drawImage(img, (hostW - dw) / 2, (hostH - dh) / 2, dw, dh);
      const src = octx.getImageData(0, 0, hostW, hostH).data;

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
      sy = new Float32Array(budget); // scatter direction, down the page
      dl = new Float32Array(budget); // how late this one lets go

      const cx = hostW / 2;
      let n = 0;
      for (let y = 0; y < hostH && n < budget; y++) {
        for (let x = 0; x < hostW && n < budget; x++) {
          const i = (y * hostW + x) * 4;
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

          // Mostly a function of where the point sits, with only a little
          // randomness on top: neighbours then travel together and the camera
          // tears open as it goes, instead of turning to noise on the first
          // frame.
          sx[n] = ((x - cx) / (hostW * 0.5)) * 0.95 + (Math.random() * 2 - 1) * 0.32;
          sy[n] = Math.random() * 0.5 - 0.12;
          // The bottom of the camera lets go first, so the dissolve sweeps up
          // the picture rather than all of it leaving at once.
          dl[n] = (1 - y / hostH) * 0.7 + Math.random() * 0.3;
          n++;
        }
      }
      count = n;

      spreadX = VW * 0.22;
      spreadY = VH * 0.06;
      fall = VH * 3;

      image = ctx.createImageData(VW, VH);
      buf32 = new Uint32Array(image.data.buffer);
      dirty = null;
      render();
    }

    /** Wipe last frame's rectangle, rather than the whole screen. */
    function clearDirty() {
      if (!dirty) return;
      for (let y = dirty.y0; y < dirty.y1; y++) {
        const row = y * VW;
        buf32.fill(0, row + dirty.x0, row + dirty.x1);
      }
    }

    function render() {
      if (!buf32) return;
      clearDirty();

      const pp = progress <= 0 ? 0 : progress >= SPAN ? 1 : progress / SPAN;
      // the camera's box travels with the page; the canvas does not
      const offX = hostDocX - Math.round(window.scrollX * dpr);
      const offY = hostDocY - Math.round(window.scrollY * dpr);

      let nx0 = VW;
      let ny0 = VH;
      let nx1 = 0;
      let ny1 = 0;

      const mark = (x, y) => {
        if (x < nx0) nx0 = x;
        if (y < ny0) ny0 = y;
        if (x >= nx1) nx1 = x + 1;
        if (y >= ny1) ny1 = y + 1;
      };

      if (pp === 0) {
        // held: the camera as photographed, and no per-particle arithmetic
        for (let i = 0; i < count; i++) {
          const x = (px[i] + offX) | 0;
          const y = (py[i] + offY) | 0;
          if (x < 0 || y < 0 || x >= VW || y >= VH) continue;
          // little-endian ABGR: white, with the photograph's own brightness
          buf32[y * VW + x] = (br[i] << 24) | 0x00ffffff;
          mark(x, y);
        }
      } else if (reduced) {
        // Reduced motion gets the same exit without the flight: it simply goes.
        const k = 1 - pp;
        for (let i = 0; i < count; i++) {
          const x = (px[i] + offX) | 0;
          const y = (py[i] + offY) | 0;
          if (x < 0 || y < 0 || x >= VW || y >= VH) continue;
          buf32[y * VW + x] = ((br[i] * k) << 24) | 0x00ffffff;
          mark(x, y);
        }
      } else {
        // A single pixel moving fast reads as noise, not as motion, so each
        // point in flight also paints where it was a moment ago. Drawn tail
        // first, so the bright head is the one that survives a collision.
        const trail = animate ? 3 : 1;
        for (let i = 0; i < count; i++) {
          const lead = dl[i] * 0.42;
          const t = (pp - lead) / (1 - lead);

          if (t >= 1) continue; // gone off the foot of the page

          if (t <= 0) {
            const x = (px[i] + offX) | 0;
            const y = (py[i] + offY) | 0;
            if (x < 0 || y < 0 || x >= VW || y >= VH) continue;
            buf32[y * VW + x] = (br[i] << 24) | 0x00ffffff;
            mark(x, y);
            continue;
          }

          const inv = 1 - t;
          // a small flare as each point detaches, then out
          let head = br[i] * inv * (1 + 1.4 * t * inv);
          if (head > 255) head = 255;

          for (let k = trail - 1; k >= 0; k--) {
            const tk = t - k * 0.03;
            if (tk <= 0) continue;
            // A thrown object, not an explosion: the sideways travel is even,
            // and gravity is what takes the point off the foot of the page.
            const x = (px[i] + offX + sx[i] * tk * spreadX) | 0;
            const y = (py[i] + offY + sy[i] * tk * spreadY + tk * tk * fall) | 0;
            if (x < 0 || y < 0 || x >= VW || y >= VH) continue;
            const a = (k === 0 ? head : head * (k === 1 ? 0.46 : 0.2)) | 0;
            buf32[y * VW + x] = (a << 24) | 0x00ffffff;
            mark(x, y);
          }
        }
      }

      // upload the union of what was painted and what was wiped
      const drew = nx1 > nx0;
      let ux0 = drew ? nx0 : 0;
      let uy0 = drew ? ny0 : 0;
      let ux1 = drew ? nx1 : 0;
      let uy1 = drew ? ny1 : 0;
      if (dirty) {
        if (!drew) {
          ux0 = dirty.x0;
          uy0 = dirty.y0;
          ux1 = dirty.x1;
          uy1 = dirty.y1;
        } else {
          if (dirty.x0 < ux0) ux0 = dirty.x0;
          if (dirty.y0 < uy0) uy0 = dirty.y0;
          if (dirty.x1 > ux1) ux1 = dirty.x1;
          if (dirty.y1 > uy1) uy1 = dirty.y1;
        }
      }
      if (ux1 > ux0 && uy1 > uy0) {
        ctx.putImageData(image, 0, 0, ux0, uy0, ux1 - ux0, uy1 - uy0);
      }
      dirty = drew ? { x0: nx0, y0: ny0, x1: nx1, y1: ny1 } : null;
    }

    function step() {
      const mx = pointer.x;
      const my = pointer.y;
      const r2 = repelR * repelR;
      // the pointer is in viewport space; the particles are in the box's
      const offX = hostDocX - Math.round(window.scrollX * dpr);
      const offY = hostDocY - Math.round(window.scrollY * dpr);

      for (let i = 0; i < count; i++) {
        const dx = px[i] + offX - mx;
        const dy = py[i] + offY - my;
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

    function wake() {
      if (running || !animate || !buf32) return;
      Ticker.add(step);
      running = true;
    }

    function sleep() {
      if (!running) return;
      Ticker.remove(step);
      running = false;
    }

    const redraw = throttleRAF(render);
    const onResize = throttleRAF(build);
    const onMove = e => {
      pointer.x = e.clientX * dpr;
      pointer.y = e.clientY * dpr;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    // The hero drives this on every scroll frame. Once the hero has gone the
    // loop is stopped outright: it was costing a full frame's arithmetic
    // behind every section further down the page.
    if (api) {
      api.current = {
        setProgress(v) {
          const next = v < 0 ? 0 : v > 1 ? 1 : v;
          if (next === progress) return;
          progress = next;
          if (next >= 1) {
            sleep();
            redraw(); // one last pass, to wipe what is left
          } else {
            wake();
            if (!animate) redraw();
          }
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
        window.addEventListener('scroll', redraw, { passive: true });
        if (!animate) return;
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerleave', onLeave);
        if (progress < 1) wake();
      });

    return () => {
      disposed = true;
      if (api) api.current = null;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', redraw);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      sleep();
    };
  }, [canvasRef, hostRef, api]);
}
