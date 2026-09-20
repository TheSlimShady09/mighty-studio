import { MARQUEE } from '../lib/content';
import { useLang } from '../lib/i18n';

/** The group is rendered twice so the -50% keyframe loops seamlessly. */
export default function Marquee() {
  const { lang } = useLang();
  const items = MARQUEE[lang] || MARQUEE.en;

  const group = (
    <div className="marquee__group">
      {items.map(item => (
        <span className="marquee__item" key={item}>
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {group}
        {group}
      </div>
    </div>
  );
}
