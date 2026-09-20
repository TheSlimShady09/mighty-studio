import { useEffect } from 'react';
import { isCoarsePointer, lerp, prefersReducedMotion, throttleRAF, Ticker } from '../lib/env';

const RADIUS = 110; // px at which a control starts reaching for the pointer
const PULL = 0.34; // how far it travels toward it

/**
 * Round controls marked [data-magnet] lean toward the pointer as it passes.
 * One listener measures the handful of magnets per frame and eases each one,
 * so the effect survives elements mounting and unmounting (the lightbox).
 *
 * The frame does nothing unless there is something to do. The magnets only
 * exist while the lightbox is open, and even then only a pointer that has
 * moved, or a control still easing back, is worth a measurement — otherwise
 * this would be a layout read and a style write per control, sixty times a
 * second, for the whole life of the page.
 */
export function useMagnetic() {
  useEffect(() => {
    if (prefersReducedMotion() || isCoarsePointer()) return undefined;

    const state = new WeakMap();
    let px = -9999;
    let py = -9999;
    let moved = false; // the pointer has moved since the last frame
    let settling = false; // something is still easing towards its target

    const onMove = throttleRAF(e => {
      px = e.clientX;
      py = e.clientY;
      moved = true;
    });

    const tick = () => {
      if (!moved && !settling) return;
      moved = false;

      const magnets = document.querySelectorAll('[data-magnet]');
      if (!magnets.length) {
        settling = false;
        return;
      }

      // Every rect is read before anything is written. Interleaving the two
      // makes each read flush the write before it, which is a full layout per
      // control rather than one for the group.
      const rects = [];
      magnets.forEach(el => rects.push(el.getBoundingClientRect()));

      settling = false;
      magnets.forEach((el, i) => {
        const r = rects[i];
        const dx = px - (r.left + r.width / 2);
        const dy = py - (r.top + r.height / 2);
        const near = Math.hypot(dx, dy) < RADIUS + Math.max(r.width, r.height) / 2;
        const tx = near ? dx * PULL : 0;
        const ty = near ? dy * PULL : 0;

        const cur = state.get(el) || { x: 0, y: 0 };
        cur.x = lerp(cur.x, tx, 0.18);
        cur.y = lerp(cur.y, ty, 0.18);
        state.set(el, cur);

        const rest = Math.abs(cur.x) < 0.05 && Math.abs(cur.y) < 0.05;
        if (!rest || Math.abs(cur.x - tx) > 0.05 || Math.abs(cur.y - ty) > 0.05) settling = true;

        el.style.transform = rest
          ? ''
          : `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0)`;
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    Ticker.add(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      Ticker.remove(tick);
      document.querySelectorAll('[data-magnet]').forEach(el => {
        el.style.transform = '';
      });
    };
  }, []);
}
