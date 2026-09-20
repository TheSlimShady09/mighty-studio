import { useReveal } from '../hooks/useReveal';
import { cx } from '../lib/env';

/**
 * Wraps children in a scroll-reveal. `variant` maps to the [data-reveal]
 * values in CSS: '' (rise), 'fade', 'depth', 'left', 'right'.
 */
export default function Reveal({
  as: Tag = 'div',
  variant = '',
  delay = 0,
  className = '',
  style,
  children,
  ref: _ignoredRef, // the hook owns the ref; never let a caller overwrite it
  ...rest
}) {
  const [ref, shown] = useReveal();

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      className={cx(className, shown && 'is-in')}
      style={delay ? { ...style, '--d': `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * A headline that reveals line by line, each line clipped by its own mask.
 * Pass an array of strings or nodes.
 */
export function Lines({
  as: Tag = 'h2',
  lines,
  className = '',
  variant = 'fade',
  delay = 0,
  ref: _ignoredRef,
  ...rest
}) {
  const [ref, shown] = useReveal();

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-lines=""
      className={cx('lines', className, shown && 'is-in')}
      style={delay ? { '--d': `${delay}ms` } : undefined}
      {...rest}
    >
      {lines.map((line, i) => (
        <span className="line" key={i}>
          <span style={{ '--d': `${i * 110}ms` }}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
