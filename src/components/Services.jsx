import { useRef } from 'react';
import { PROCESS, SERVICES } from '../lib/content';
import { useScroll3D } from '../hooks/useScrollProgress';
import { useLang } from '../lib/i18n';
import Reveal from './Reveal';

const pad = n => String(n).padStart(2, '0');

export function Services() {
  const listRef = useRef(null);
  useScroll3D(listRef, { max: 6, depth: 50 });
  const { t, pick } = useLang();

  return (
    <section className="section" id="services">
      <div className="shell">
        <Reveal as="p" variant="fade" className="eyebrow">
          {t.services.eyebrow}
        </Reveal>
        <Reveal
          as="h2"
          className="title"
          delay={80}
          style={{ margin: '1rem 0 clamp(2.5rem,5vw,4rem)' }}
        >
          {t.services.title[0]}
          <br />
          {t.services.title[1]}
        </Reveal>

        <div className="svc" ref={listRef}>
          {SERVICES.map((service, i) => {
            const c = pick(service);
            return (
              <Reveal
                as="article"
                variant="open"
                className="svc__row"
                delay={i * 110}
                tabIndex={0}
                key={service.id}
              >
                <span className="svc__idx">{pad(i + 1)}</span>
                <h3 className="svc__name">{c.name}</h3>
                <p className="svc__desc">{c.desc}</p>
                <div className="svc__tags">
                  {c.tags.map(tag => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Process() {
  const gridRef = useRef(null);
  useScroll3D(gridRef, { max: 9, depth: 80 });
  const { t, pick } = useLang();

  return (
    <section className="section section--tight" id="process">
      <div className="shell">
        <Reveal as="p" variant="fade" className="eyebrow">
          {t.process.eyebrow}
        </Reveal>
        <div className="process" ref={gridRef} style={{ marginTop: 'clamp(2rem,4vw,3rem)' }}>
          {PROCESS.map((item, i) => {
            const c = pick(item);
            return (
              <Reveal variant="flip" className="process__step" delay={i * 90} key={item.step}>
                <b>{item.step}</b>
                <h4>{c.title}</h4>
                <p>{c.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
