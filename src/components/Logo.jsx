import logoSrc from '../assets/logo.png';
import { cx } from '../lib/env';

/**
 * The studio mark, drawn as a CSS mask rather than an <img>.
 *
 * The artwork is a single alpha channel, so it is painted in `currentColor`:
 * white on the dark sections, black on the light panels, with no second file
 * and no inversion filter.
 */
export default function Logo({ className = '', label = 'Mighty, photography and more' }) {
  return (
    <span
      className={cx('logo', className)}
      role="img"
      aria-label={label}
      style={{ '--logo': `url(${logoSrc})` }}
    />
  );
}
