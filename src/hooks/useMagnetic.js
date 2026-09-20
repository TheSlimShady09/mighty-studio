import { useEffect } from 'react';
import { isCoarsePointer, lerp, prefersReducedMotion, throttleRAF, Ticker } from '../lib/env';

const RADIUS = 110; // px at which a control starts reaching for the pointer
const PULL = 0.34; // how far it travels toward it

/**
 * Round controls marked [data-magnet] lean toward the pointer as it passes.
 * One listener measures the handful of magnets per frame and eases each one,
 * so the effect survives elements mounting and unmounting (the lightbox).
 */
export function useMagnetic() {
  useEffect(() => {
    if (prefersReducedMotion() || isCoarsePointer()) return undefined;

    const state = new WeakMap();
    let px = -9999;
    let py = -9999;

    const onMove = throttleRAF(e => {
      px = e.clientX;
      py = e.clientY;
    });

    const tick = () => {
      const magnets = document.querySelectorAll('[data-magnet]');
      magnets.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.hypot(dx, dy);

        const near = dist < RADIUS + Math.max(r.width, r.height) / 2;
        const tx = near ? dx * PULL : 0;
        const ty = near ? dy * PULL : 0;

        const cur = state.get(el) || { x: 0, y: 0 };
        cur.x = lerp(cur.x, tx, 0.18);
        cur.y = lerp(cur.y, ty, 0.18);
        state.set(el, cur);

        el.style.transform =
          Math.abs(cur.x) < 0.05 && Math.abs(cur.y) < 0.05
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
