/**
 * Custom GLSL for the hero: slow volumetric smoke and light.
 * Compiled twice — once per haze layer — with OCT / WARP2 defines.
 */

export const VERT = `
precision highp float;
uniform float uTime;
uniform float uAmp;
varying vec2  vUv;
varying float vWave;

void main() {
  vUv = uv;
  vec3 p = position;
  // slow breathing displacement — gives the haze real parallax in depth
  float w = sin(p.x * 1.7 + uTime * 0.13) * cos(p.y * 2.1 - uTime * 0.09)
          + 0.5 * sin((p.x + p.y) * 0.9 + uTime * 0.07);
  p.z += w * uAmp;
  vWave = w;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const FRAG = `
precision highp float;
uniform float uTime;
uniform vec2  uMouse;
uniform float uAspect;
uniform float uScale;
uniform float uSeed;
uniform float uContrast;
uniform float uOpacity;
uniform float uBeam;
varying vec2  vUv;
varying float vWave;

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p + uSeed) * 43758.5453123);
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                 dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
             mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                 dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(1.62, 1.18, -1.18, 1.62);
  for (int i = 0; i < OCT; i++) {
    sum += amp * gnoise(p);
    p = rot * p;
    amp *= 0.52;
  }
  return sum;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * uScale;
  p += uMouse * 0.22;

  float t = uTime * 0.04;

  // three-pass domain warping → curling volumetric smoke
  vec2 q = vec2(fbm(p + vec2(0.0, t)),
                fbm(p + vec2(5.2, 1.3 - t)));
  #ifdef WARP2
    vec2 r = vec2(fbm(p + 2.8 * q + vec2(1.7, 9.2) + 0.21 * t),
                  fbm(p + 2.8 * q + vec2(8.3, 2.8) - 0.17 * t));
    float f = fbm(p + 3.2 * r);
  #else
    float f = fbm(p + 2.6 * q + vec2(0.0, 0.12 * t));
  #endif

  float d = clamp(f * 0.5 + 0.5, 0.0, 1.0);
  d = pow(d, uContrast);

  // key light falloff, nudged by the pointer
  vec2 c = (vUv - vec2(0.5 + uMouse.x * 0.05, 0.52 + uMouse.y * 0.035)) * vec2(1.28, 1.0);
  float key = exp(-dot(c, c) * 4.0);

  // a single soft shaft of light raking down the frame
  float shaft = smoothstep(0.46, 0.0, abs(vUv.x - 0.5 - 0.09 * sin(uTime * 0.06)))
              * smoothstep(1.0, 0.12, vUv.y) * uBeam;

  float g = d * key * 1.55 + d * 0.1 + shaft * d + vWave * 0.035;
  g = clamp(g, 0.0, 1.0);

  // edge fade so the plane never shows a seam
  float edge = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x)
             * smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);

  float a = g * edge * uOpacity;

  // 8-bit dither kills gradient banding on near-black
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  // a hair of warmth, so the haze reads candlelit rather than clinical
  gl_FragColor = vec4(vec3(g + dither) * vec3(1.0, 0.979, 0.947), a);
}
`;
