import { useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Showcase from './components/Showcase';
import Portfolio from './components/Portfolio';
import { Process, Services } from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useScrollLock } from './hooks/useScrollLock';
import { useScrollVelocity } from './hooks/useScrollProgress';
import { useMagnetic } from './hooks/useMagnetic';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // The menu and the lightbox share one lock counter, so whichever releases
  // last is the one that unlocks the page.
  useScrollLock(menuOpen);

  // Publishes --vel on <html>; sections lean into the direction of travel.
  useScrollVelocity();

  // Round controls reach for the pointer as it passes.
  useMagnetic();

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <Nav open={menuOpen} setOpen={setMenuOpen} />

      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Showcase />
        <Portfolio />
        <Services />
        <Process />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
