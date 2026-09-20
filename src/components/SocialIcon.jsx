/**
 * Monochrome brand glyphs, drawn on a 24×24 grid and inheriting currentColor
 * so they invert with the panel around them.
 */
const PATHS = {
  instagram: (
    <>
      <rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </>
  ),
  facebook: (
    <path
      d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2C11.54 2 9.68 3.66 9.68 6.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.03.28-1.73 1.76-1.73Z"
      fill="currentColor"
    />
  ),
  whatsapp: (
    <>
      <path
        d="M12 2.4a9.6 9.6 0 0 0-8.2 14.6L2.4 21.6l4.7-1.35A9.6 9.6 0 1 0 12 2.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M16.9 14.3c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.19.28-.72.9-.88 1.09-.16.19-.33.21-.6.07-.28-.14-1.18-.44-2.24-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.12.28-.33.42-.49.14-.16.19-.28.28-.47.1-.18.05-.35-.02-.49-.07-.14-.62-1.51-.86-2.07-.22-.54-.45-.47-.62-.48h-.53c-.19 0-.49.07-.74.35-.26.28-.97.95-.97 2.31 0 1.36 1 2.68 1.14 2.87.14.19 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.75.11.53-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.11-.25-.18-.53-.32Z"
        fill="currentColor"
      />
    </>
  ),
  tiktok: (
    <path
      d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1 0-5.18c.27 0 .52.04.76.12V9.7a5.72 5.72 0 0 0-.76-.05 5.69 5.69 0 1 0 5.69 5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.25-1.48Z"
      fill="currentColor"
    />
  )
};

export default function SocialIcon({ name }) {
  const glyph = PATHS[name];
  if (!glyph) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {glyph}
    </svg>
  );
}
