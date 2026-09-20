import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '../hooks/useScrollLock';
import { PORTFOLIO_FILTERS } from '../lib/content';
import { cx, prefersReducedMotion } from '../lib/env';
import { useLang } from '../lib/i18n';

const EXIT_MS = 620;

/**
 * Full-screen detail view.
 *
 * The frame does not fade in: it flies out of the card that was clicked and
 * settles into place, then flies back into it on close. `originRect` is the
 * card's position at the moment of the click, and the frame is played from
 * there with a FLIP transform.
 */
export default function Lightbox({ item, index, total, originRect, onClose, onPrev, onNext }) {
  const frameRef = useRef(null);
  const closeRef = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const { t, pick } = useLang();
  const open = Boolean(item);

  useScrollLock(open);

  /** Transform that maps the frame onto the originating card. */
  const originTransform = useCallback(() => {
    const el = frameRef.current;
    if (!el || !originRect) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const dx = originRect.left + originRect.width / 2 - (r.left + r.width / 2);
    const dy = originRect.top + originRect.height / 2 - (r.top + r.height / 2);
    const sx = originRect.width / r.width;
    const sy = originRect.height / r.height;
    return `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
  }, [originRect]);

  // play in, from the card
  useLayoutEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const el = frameRef.current;
    const from = originTransform();
    if (!el || !from) return;

    el.style.transition = 'none';
    el.style.transform = from;
    const raf = requestAnimationFrame(() => {
      el.style.transition = `transform ${EXIT_MS + 160}ms var(--e-out-expo)`;
      el.style.transform = '';
    });
    return () => cancelAnimationFrame(raf);
  }, [open, originTransform]);

  const requestClose = useCallback(() => {
    if (leaving) return;
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    const el = frameRef.current;
    const back = originTransform();
    if (el && back) {
      el.style.transition = `transform ${EXIT_MS}ms var(--e-out-expo)`;
      el.style.transform = back;
    }
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      onClose();
    }, EXIT_MS);
  }, [leaving, onClose, originTransform]);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();

    const onKey = e => {
      if (e.key === 'Escape') requestClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, requestClose, onPrev, onNext]);

  const c = pick(item);
  const categoryLabel = pick(PORTFOLIO_FILTERS.find(f => f.key === item?.category));

  if (!open) return null;

  // Portalled to <body>: the portfolio section is a light panel with its own
  // stacking context, which would otherwise trap the overlay beneath the nav.
  return createPortal(
    <div
      className={cx('lightbox', leaving && 'is-leaving')}
      role="dialog"
      aria-modal="true"
      aria-label={`${c.title}, ${c.client}`}
      onClick={e => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div className="lightbox__inner">
        <figure className="lightbox__frame" ref={frameRef}>
          <img src={item.src} alt={c.alt} />
        </figure>

        <div className="lightbox__meta">
          <p className="lightbox__count">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
          <h3 className="lightbox__title">{c.title}</h3>
          <dl className="lightbox__facts">
            <div>
              <dt>{t.portfolio.client}</dt>
              <dd>{c.client}</dd>
            </div>
            <div>
              <dt>{t.portfolio.discipline}</dt>
              <dd>{categoryLabel}</dd>
            </div>
            <div>
              <dt>{t.portfolio.year}</dt>
              <dd>{item.year}</dd>
            </div>
          </dl>

          <div className="lightbox__nav">
            <button type="button" onClick={onPrev} aria-label={t.portfolio.prev} data-magnet>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 4 7 12l8 8" />
              </svg>
            </button>
            <button type="button" onClick={onNext} aria-label={t.portfolio.next} data-magnet>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 4l8 8-8 8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button
        className="lightbox__close"
        type="button"
        onClick={requestClose}
        ref={closeRef}
        aria-label={t.portfolio.close}
        data-magnet
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>
    </div>,
    document.body
  );
}
