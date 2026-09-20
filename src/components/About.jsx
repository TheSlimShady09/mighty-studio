import { ABOUT_SPECS, STATS } from '../lib/content';
import { useParallax } from '../hooks/useParallax';
import { useScroll3D } from '../hooks/useScrollProgress';
import { useReveal } from '../hooks/useReveal';
import { useCountUp } from '../hooks/useCountUp';
import { cx } from '../lib/env';
import { useLang } from '../lib/i18n';
import Reveal, { Lines } from './Reveal';
import Plate from './Plate';

function Stat({ value, suffix = '', label, shown }) {
  const n = useCountUp(value, shown);
  return (
    <div className="stat">
      <b>
        {n}
        {n === value ? suffix : ''}
      </b>
      <span>{label}</span>
    </div>
  );
}

function Stats() {
  const [ref, shown] = useReveal();
  const { pick } = useLang();
  return (
    <div ref={ref} data-reveal="" className={cx('stats', shown && 'is-in')} style={{ '--d': '120ms' }}>
      {STATS.map(s => (
        <Stat key={s.en} value={s.value} suffix={s.suffix} label={pick(s)} shown={shown} />
      ))}
    </div>
  );
}

export default function About() {
  const [frameRef, layerRef] = useParallax(0.16);
  useScroll3D(frameRef, { max: 10, depth: 90 });
  const { t, pick } = useLang();

  return (
    <section className="section" id="about">
      <div className="shell">
        <Reveal as="p" variant="fade" className="eyebrow">
          {t.about.eyebrow}
        </Reveal>

        <div className="grid12 about__grid" style={{ marginTop: 'clamp(2rem,4vw,3.5rem)' }}>
          <div className="about__copy">
            <Lines as="h2" className="about__statement title" lines={t.about.title} />

            <Reveal as="p" className="lead measure" delay={120}>
              {t.about.lead}
            </Reveal>

            <Reveal as="p" className="muted measure" delay={200}>
              {t.about.body}
            </Reveal>
          </div>

          <Reveal as="figure" variant="depth" className="about__media" delay={160}>
            <div className="frame" ref={frameRef}>
              <div className="frame__layer" ref={layerRef}>
                <Plate idx={4} uid="about" />
              </div>
              <div className="frame__grade" />
            </div>
          </Reveal>
        </div>

        {/* what each discipline actually includes */}
        <div className="specs">
          {ABOUT_SPECS.map((spec, i) => {
            const c = pick(spec);
            return (
              <Reveal className="spec" key={spec.id} delay={i * 110}>
                <h3 className="spec__title">{c.title}</h3>
                <ul className="spec__list">
                  {c.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>

        <Stats />
      </div>
    </section>
  );
}
