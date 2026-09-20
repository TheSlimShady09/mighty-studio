import { useEffect } from 'react';

/**
 * The loader, the mobile menu and the lightbox can all want the page frozen at
 * once. A counter means whichever releases last is the one that unlocks, so
 * they never fight over the class.
 */
let holders = 0;

function acquire() {
  holders += 1;
  document.body.classList.add('is-locked');
}

function release() {
  holders = Math.max(0, holders - 1);
  if (holders === 0) document.body.classList.remove('is-locked');
}

export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    acquire();
    return release;
  }, [active]);
}
