import { useEffect, useState } from 'react';
import { Ticker, isCoarsePointer, lerp, prefersReducedMotion, throttleRAF } from '../lib/env';
import { FRAG, VERT } from '../lib/shaders';

/** Two stacked planes: a broad far haze and a nearer, sparser wisp layer. */
const LAYERS = [
  { z: -0.6, scale: 2.3, seed: 11.0, contrast: 1.35, opacity: 0.92, amp: 0.10, beam: 0.30, seg: 48, blend: 'normal', over: 1.35, oct: 5, warp2: true },
  { z: 0.9,  scale: 4.4, seed: 57.0, contrast: 2.10, opacity: 0.42, amp: 0.16, beam: 0.14, seg: 32, blend: 'add',    over: 1.15, oct: 3, warp2: false }
];

const FOV = 58;

function planeSize(dist, fov, aspect, over) {
  const h = 2 * Math.tan(((fov * Math.PI) / 180) / 2) * dist;
  return { w: h * aspect * over, h: h * over };
}

/** Builds the scene and returns its teardown. */
function startScene(THREE, canvas, host) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
  } catch {
    return null;
  }

  renderer.setClearColor(0x000000, 0);
  // The haze is soft by nature, so it renders below native resolution and is
  // upscaled by CSS. Halves the fill cost with no visible difference.
  renderer.setPixelRatio(1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, 2.4);

  const layers = LAYERS.map(def => {
    const geometry = new THREE.PlaneGeometry(1, 1, def.seg, def.seg);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: [`#define OCT ${def.oct}`, def.warp2 ? '#define WARP2' : '', FRAG].join('\n'),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: def.blend === 'add' ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: Math.random() * 40 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uAspect: { value: 1 },
        uScale: { value: def.scale },
        uSeed: { value: def.seed },
        uContrast: { value: def.contrast },
        uOpacity: { value: def.opacity },
        uBeam: { value: def.beam },
        uAmp: { value: def.amp }
      }
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = def.z;
    mesh.renderOrder = def.blend === 'add' ? 2 : 1;
    scene.add(mesh);
    return {
      mesh,
      geometry,
      material,
      dist: camera.position.z - def.z,
      over: def.over,
      baseScale: def.scale,
      baseOpacity: def.opacity
    };
  });

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let quality = 0.72;
  let probeFrames = 0;
  let probeCost = 0;
  let probed = false;
  let active = false;

  function resize() {
    const w = window.innerWidth;
    const h = host.offsetHeight || window.innerHeight;
    const aspect = w / h;

    renderer.setSize(Math.round(w * quality), Math.round(h * quality), false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    // On a portrait screen the noise field would otherwise be magnified,
    // flooding the frame with grey. Zoom out and thin it instead.
    const narrow = aspect < 1 ? Math.pow(1 / aspect, 0.6) : 1;
    layers.forEach(l => {
      const s = planeSize(l.dist, FOV, aspect, l.over);
      l.mesh.scale.set(s.w, s.h, 1);
      l.material.uniforms.uAspect.value = aspect;
      l.material.uniforms.uScale.value = l.baseScale * narrow;
      l.material.uniforms.uOpacity.value =
        l.baseOpacity * (aspect < 1 ? Math.max(0.68, aspect) : 1);
    });

    render(0);
  }

  function render(dt) {
    mouse.x = lerp(mouse.x, mouse.tx, 0.045);
    mouse.y = lerp(mouse.y, mouse.ty, 0.045);

    layers.forEach((l, i) => {
      l.material.uniforms.uTime.value += dt * 0.001 * (i === 0 ? 1 : 1.35);
      l.material.uniforms.uMouse.value.set(
        mouse.x * (i === 0 ? 1 : 1.9),
        mouse.y * (i === 0 ? 1 : 1.9)
      );
    });

    camera.position.x = mouse.x * 0.09;
    camera.position.y = mouse.y * 0.06;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    // One-shot quality probe: if the first frames are expensive, drop the
    // buffer again rather than shipping a stuttering hero.
    if (!probed && dt > 0) {
      probeCost += dt;
      if (++probeFrames >= 30) {
        probed = true;
        if (probeCost / probeFrames > 26 && quality > 0.45) {
          quality = 0.45;
          resize();
        }
      }
    }
  }

  const play = () => {
    if (!active && !prefersReducedMotion()) {
      active = true;
      Ticker.add(render);
    }
  };
  const pause = () => {
    if (active) {
      active = false;
      Ticker.remove(render);
    }
  };

  const onResize = throttleRAF(resize);
  window.addEventListener('resize', onResize, { passive: true });

  const onPointerMove = e => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  if (!isCoarsePointer()) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  // Only run while the hero is on screen, and never in a hidden tab.
  const io = new IntersectionObserver(
    entries => entries.forEach(en => (en.isIntersecting && !document.hidden ? play() : pause())),
    { threshold: 0.01 }
  );
  io.observe(host);

  const onVisibility = () => {
    if (document.hidden) pause();
    else if (host.getBoundingClientRect().bottom > 0) play();
  };
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  canvas.classList.add('is-live');
  if (prefersReducedMotion()) render(0); // one static frame, no loop
  else play();

  return () => {
    pause();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    layers.forEach(l => {
      l.geometry.dispose();
      l.material.dispose();
      scene.remove(l.mesh);
    });
    renderer.dispose();
    canvas.classList.remove('is-live');
  };
}

/**
 * Renders the hero's volumetric smoke with custom GLSL.
 *
 * Three.js is imported dynamically so it lands in its own chunk: the page,
 * type and gallery are interactive before the 3D code arrives, and if it never
 * arrives the `no-webgl` class switches on the CSS haze fallback instead.
 */
export function useSmoke(canvasRef, hostRef) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return undefined;

    let disposed = false;
    let teardown = null;

    const fail = () => {
      setSupported(false);
      document.documentElement.classList.add('no-webgl');
    };

    import('three')
      .then(THREE => {
        if (disposed) return;
        teardown = startScene(THREE, canvas, host);
        if (!teardown) fail();
        else document.documentElement.classList.remove('no-webgl');
      })
      .catch(fail);

    return () => {
      disposed = true;
      if (teardown) teardown();
    };
  }, [canvasRef, hostRef]);

  return supported;
}
