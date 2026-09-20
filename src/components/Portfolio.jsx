import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PORTFOLIO, PORTFOLIO_FILTERS } from '../lib/content';
import { cx, isCoarsePointer, prefersReducedMotion } from '../lib/env';
import { useLang } from '../lib/i18n';
import Reveal from './Reveal';
import Lightbox from './Lightbox';

export default function Portfolio() {
  const [filter, setFilter] = useState('all');
  const [openIndex, setOpenIndex] = useState(-1);
  const { t, pick } = useLang();

  const items = useMemo(
    () => (filter === 'all' ? PORTFOLIO : PORTFOLIO.filter(p => p.category === filter)),
    [filter]
  );

  const nodes = useRef(new Map());
  const rects = useRef(new Map());
  const gridRef = useRef(null);
  const [originRect, setOriginRect] = useState(null);

  /**
   * FLIP: measure where each surviving card was, let React re-flow the grid,
   * then play it back from the old position. Filtering reads as the grid
   * rearranging itself rather than snapping.
   */
  const capture = useCallback(() => {
    if (prefersReducedMotion()) return;
    rects.current.clear();
    nodes.current.forEach((el, id) => {
      if (el) rects.current.set(id, el.getBoundingClientRect());
    });
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || rects.current.size === 0) return;

    nodes.current.forEach((el, id) => {
      if (!el) return;
      const prev = rects.current.get(id);
      if (!prev) return;
      const next = el.getBoundingClientRect();
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      if (!dx && !dy) return;

      el.style.transition = 'none';
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 760ms var(--e-out-expo)';
        el.style.transform = '';
      });
    });
    rects.current.clear();
  }, [filter]);

  /**
   * Cards lean toward the pointer and carry a specular sweep that tracks it.
   * One delegated listener drives the whole grid, writing custom properties
   * the card's own transition reads, so nothing re-renders while you move.
   */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion() || isCoarsePointer()) return undefined;

    const reset = card => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--lift', '0px');
    };

    const onMove = e => {
      const card = e.target.closest('.pcard');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      card.style.setProperty('--rx', `${((0.5 - py) * 11).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((px - 0.5) * 13).toFixed(2)}deg`);
      card.style.setProperty('--lift', '-6px');
    };

    const onOut = e => {
      const card = e.target.closest?.('.pcard');
      if (card && !card.contains(e.relatedTarget)) reset(card);
    };

    grid.addEventListener('pointermove', onMove);
    grid.addEventListener('pointerout', onOut);
    return () => {
      grid.removeEventListener('pointermove', onMove);
      grid.removeEventListener('pointerout', onOut);
    };
  }, []);

  const choose = nextFilter => {
    if (nextFilter === filter) return;
    capture();
    setFilter(nextFilter);
  };

  const open = (i, id) => {
    const card = nodes.current.get(id);
    setOriginRect(card ? card.getBoundingClientRect() : null);
    setOpenIndex(i);
  };

  const close = useCallback(() => {
    setOpenIndex(-1);
    setOriginRect(null);
  }, []);

  const stepTo = useCallback(
    delta =>
      setOpenIndex(i => {
        const n = (i + delta + items.length) % items.length;
        const card = nodes.current.get(items[n]?.id);
        if (card) setOriginRect(card.getBoundingClientRect());
        return n;
      }),
    [items]
  );
  const prev = useCallback(() => stepTo(-1), [stepTo]);
  const next = useCallback(() => stepTo(1), [stepTo]);

  const countFor = key =>
    key === 'all' ? PORTFOLIO.length : PORTFOLIO.filter(p => p.category === key).length;

  return (
    <section className="section portfolio section--light" id="portfolio">
      <div className="shell">
        <div className="portfolio__head">
          <div>
            <Reveal as="p" variant="fade" className="eyebrow">
              {t.portfolio.eyebrow}
            </Reveal>
            <Reveal as="h2" className="title portfolio__title" delay={80}>
              {t.portfolio.title}
            </Reveal>
          </div>
          <Reveal as="p" variant="right" className="lead portfolio__intro" delay={140}>
            {t.portfolio.intro}
          </Reveal>
        </div>

        <Reveal
          className="portfolio__filters"
          delay={80}
          role="tablist"
          aria-label={t.portfolio.filterLabel}
        >
          {PORTFOLIO_FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={cx('chip', filter === f.key && 'is-on')}
              onClick={() => choose(f.key)}
            >
              {pick(f)}
              <span className="chip__count">{countFor(f.key)}</span>
            </button>
          ))}
        </Reveal>

        <div className="portfolio__grid" role="list" ref={gridRef}>
          {items.map((item, i) => {
            const c = pick(item);
            const category = PORTFOLIO_FILTERS.find(f => f.key === item.category);
            return (
              <Reveal
                key={item.id}
                as="article"
                variant="clip"
                delay={Math.min(i, 5) * 70}
                role="listitem"
                className={cx(
                  'pcard',
                  item.size === 'tall' && 'is-tall',
                  item.size === 'wide' && 'is-wide'
                )}
              >
                <button
                  className="pcard__hit"
                  type="button"
                  onClick={() => open(i, item.id)}
                  aria-label={`${t.portfolio.open}: ${c.title}, ${c.client}, ${item.year}`}
                  ref={el => {
                    if (el) nodes.current.set(item.id, el.closest('.pcard'));
                    else nodes.current.delete(item.id);
                  }}
                >
                  <span className="pcard__art">
                    <img src={item.src} alt={c.alt} loading="lazy" decoding="async" />
                  </span>
                  <span className="pcard__veil" />
                  <span className="pcard__gleam" aria-hidden="true" />
                  <span className="pcard__body">
                    <span className="pcard__title">{c.title}</span>
                    <span className="pcard__sub">
                      {c.client}, {item.year}
                    </span>
                  </span>
                  <span className="pcard__cat">{pick(category)}</span>
                  <span className="pcard__view">{t.portfolio.view}</span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Lightbox
        item={openIndex > -1 ? items[openIndex] : null}
        index={openIndex}
        total={items.length}
        originRect={originRect}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </section>
  );
}
