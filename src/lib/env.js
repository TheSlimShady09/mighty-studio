/**
 * Environment probes and shared motion primitives.
 * Everything here is framework-agnostic so hooks stay thin.
 */

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

/** GSAP-flavoured easing curves — the JS twins of the CSS cubic-beziers. */
export const Ease = {
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outQuint: t => 1 - Math.pow(1 - t, 5),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
};

/**
 * One requestAnimationFrame loop for the whole app. Every animated module
 * subscribes to it, so a page with a 3D hero, parallax and scroll-linked
 * motion still only drives a single rAF.
 */
export const Ticker = (() => {
  const subs = new Set();
  let running = false;
  let last = 0;

  function frame(now) {
    const dt = Math.min(64, now - last);
    last = now;
    subs.forEach(fn => fn(dt, now));
    running = subs.size > 0;
    if (running) requestAnimationFrame(frame);
  }

  return {
    add(fn) {
      subs.add(fn);
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      }
    },
    remove(fn) {
      subs.delete(fn);
    }
  };
})();

/** Collapse a burst of events into one per animation frame. */
export function throttleRAF(fn) {
  let queued = false;
  let lastArgs = null;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...lastArgs);
    });
  };
}

/** Join truthy class names. */
export const cx = (...parts) => parts.filter(Boolean).join(' ');
