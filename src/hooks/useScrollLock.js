import { useEffect } from 'react';

/**
 * The mobile menu and the lightbox can both want the page frozen at once.
 * A counter means whichever releases last is the one that unlocks, so they
 * never fight over the class.
 *
 * `overflow:hidden` alone does not hold on iOS Safari — the page keeps
 * scrolling under the overlay — so the body is pinned with `position:fixed`
 * at its current offset and put back exactly where it was on release.
 */
let holders = 0;
let savedY = 0;

function acquire() {
  holders += 1;
  if (holders > 1) return;
  savedY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.style.top = `-${savedY}px`;
  document.body.classList.add('is-locked');
}

function release() {
  holders = Math.max(0, holders - 1);
  if (holders > 0) return;
  document.body.classList.remove('is-locked');
  document.body.style.top = '';
  // restored without smoothing, or the page would glide back to where it was
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, savedY);
  html.style.scrollBehavior = prev;
}

export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    acquire();
    return release;
  }, [active]);
}
