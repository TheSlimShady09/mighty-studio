# MIGHTY STUDIO — React

Version React (Vite) e faqes. Versioni origjinal me një skedar të vetëm ruhet te
`../index.html` dhe nuk është prekur.

## Komandat

```bash
npm install     # një herë
npm run dev     # http://127.0.0.1:4321
npm run build   # prodhim → dist/
npm run preview # shikon build-in e prodhimit
```

## Struktura

```
src/
  main.jsx              React root
  App.jsx               montimi i faqes + bllokimi i scroll-it
  components/
    Loader.jsx          preloader
    Nav.jsx             nav sticky, menu mobile, progress
    Hero.jsx            wordmark + canvas i tymit
    Marquee.jsx         shiriti lëvizës
    About.jsx           teksti, statistikat, imazhi me parallax
    Work.jsx            galeria 3D coverflow
    Services.jsx        Services + Process
    Contact.jsx         formulari me validim
    Footer.jsx
    Reveal.jsx          <Reveal> dhe <Lines> për animimet në scroll
    Plate.jsx           "fotografitë" proceduriale si SVG
  hooks/
    useLoader.js        progresi, gate te document.fonts.ready
    useSmoke.js         skena Three.js + GLSL (import dinamik)
    useReveal.js        një IntersectionObserver i përbashkët
    useCountUp.js       numëruesit e statistikave
    useParallax.js      thellësia e imazhit
    useCoverflow.js     scroll / drag / tastierë / butona
    useScrollState.js   nav sticky, progress, seksioni aktiv
    useCursor.js        kursori i personalizuar
  lib/
    env.js              Ticker i vetëm rAF, easing, helpers
    shaders.js          GLSL vertex + fragment
    content.js          i gjithë teksti dhe të dhënat
  styles/               CSS i ndarë sipas seksionit, importuar nga index.css
```

## Shënime

- **Three.js ngarkohet me `import()` dinamik**, kështu që bundle-i fillestar mbetet
  ~263 kB dhe faqja është e përdorshme para se të mbërrijë kodi 3D. Nëse dështon,
  klasa `no-webgl` ndez haze-n CSS si zëvendësim.
- **Një lak i vetëm rAF** (`lib/env.js`) ushqen tymin, parallax-in dhe kursorin.
- **Coverflow**: indeksi është state i React; transformimet shkruhen direkt në
  nyje gjatë drag-ut, që të mos presë render.
- `prefers-reduced-motion` respektohet kudo.
