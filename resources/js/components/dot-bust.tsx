import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

/*
 * DotBust: a 3D bust drawn as glowing dots (three.js), adapted from the
 * MotionSites "Dot Portrait" design to sit inside a box (the TrekMitra footer).
 * A GLB model is sampled into dots, a ring loader shows the download, the dots
 * fly into place, the cursor becomes a light and the head turns toward it.
 *
 * Changes from the original full-screen version:
 * - fills its parent box instead of the whole screen; no hidden cursor; page
 *   scrolling on phones still works
 * - transparent background, so it sits on the footer colour
 * - no name, tagline, logo or pill text (the footer has its own)
 * - only starts when it scrolls near the screen, and pauses when off screen
 *
 * Install: npm i three   (TypeScript: npm i -D @types/three)
 * The model's leaf and visor details in buildDots() are tuned to the default model.
 * Pass `image` to build the dots from a photo instead of a 3D model.
 */

const DEFAULT_GLB =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261115_071021_742152ba-5554-4270-9dc5-286bcff36a1a.glb';
const N = 66000;

type Phase = 'loading' | 'ready' | 'error';

interface Built {
  pos: Float32Array;
  nor: Float32Array;
  part: Float32Array;
  shade: Float32Array;
  rand: Float32Array;
  gMin: number;
  gMax: number;
}

/* ---------------- shaders ---------------- */
const bustVS = /* glsl */ `
attribute vec3 aNormal;attribute float aRand;attribute vec2 aShade;attribute float aPart;
uniform float uTime,uAssemble,uSize,uGlint,uShine,uRingRadius;uniform vec2 uHead;uniform vec3 uLight,uRingCenter;
varying float vB,vA,vShine,vGlint,vLens;
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
void main(){
 float head=smoothstep(-1.3,-.6,position.y);
 mat3 R=rotY(uHead.x*(.25+.75*head))*rotX(uHead.y*head);
 vec3 pivot=vec3(0.,-1.,0.);
 vec3 home=R*(position-pivot)+pivot;vec3 n=normalize(R*aNormal);
 vec3 turned=home;
 home+=n*sin(uTime*1.4+aRand*60.)*.006;
 float r2=fract(sin(aRand*91.7)*43758.5453);
 float t=clamp((uAssemble-aRand*.45)/.55,0.,1.);
 float e=t<.5?4.*t*t*t:1.-pow(-2.*t+2.,3.)/2.;
 float ang=aRand*6.2831853;
 vec3 start=uRingCenter+vec3(cos(ang),sin(ang),0.)*uRingRadius*(1.+(r2-.5)*.06);
 vec3 pos=mix(start,home,e)+vec3(sin(aRand*40.+uTime*.3),cos(aRand*31.),.9+r2*1.4)*sin(e*3.14159265)*.45;
 vec3 toL=uLight-pos;
 float lit=max(dot(n,normalize(toL)),0.)/(1.+dot(toL,toL)*.32);
 float key=max(dot(n,normalize(vec3(-.5,.6,.7))),0.);
 float facing=normalize(mat3(viewMatrix)*n).z;
 float rim=pow(1.-abs(facing),3.);
 float b=.3+key*.22+lit*1.5+rim*.14;
 b*=mix(.55,1.,smoothstep(-.3,.25,facing));
 b*=aShade.x>0.?1.+aShade.x*.7:1.+aShade.x*.5;
 b+=aShade.y*(.26+key*.3);
 if(aPart>.5&&aPart<1.5)b*=.9;
 if(aPart>1.5)b*=.78;
 if(aPart>2.5)b*=.7;
 b*=.7+r2*.5;
 float glint=0.;
 if(aPart>.5){glint=1.-smoothstep(0.,.09,abs(position.x-uGlint));b+=glint*1.2;}
 float band=turned.y-turned.x*.5-uShine;
 float shine=exp(-band*band*4.);
 b+=shine*1.3;
 vB=b;vA=mix(.75,1.,e);vShine=shine;vGlint=glint;vLens=aPart>2.5?1.:0.;
 vec4 mv=viewMatrix*vec4(pos,1.);
 gl_Position=projectionMatrix*mv;
 gl_PointSize=uSize*(.45+r2*r2*1.3)*(1.+shine*.6)/-mv.z;
}`;
const bustFS = /* glsl */ `
uniform vec3 uInk,uBlue,uCream;varying float vB,vA,vShine,vGlint,vLens;
void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;
 float a=exp(-16.*r*r)*vA;
 vec3 ink=mix(uInk,uCream,vShine*.6);ink=mix(ink,uBlue,vLens*.6);ink=mix(ink,uBlue,vGlint*.7);
 gl_FragColor=vec4(ink*vB*a,min(1.,vB*a));}`;
const lightVS = /* glsl */ `uniform vec3 uLight;uniform float uOn,uSize;
void main(){vec4 mv=viewMatrix*vec4(uLight,1.);gl_Position=projectionMatrix*mv;gl_PointSize=240.*uSize*uOn/-mv.z;}`;
const lightFS = /* glsl */ `uniform float uOn;
void main(){float r=2.*length(gl_PointCoord-.5);if(r>1.)discard;
 float core=1.-smoothstep(.08,.14,r);float glow=exp(-4.*r)*.45+exp(-12.*r)*.7;
 float l=(core+glow)*uOn;gl_FragColor=vec4(vec3(l),min(1.,l));}`;
const dustVS = /* glsl */ `attribute float aRand;uniform float uTime,uSize,uOn;varying float vB;
void main(){vec3 p=position;p.y=mod(p.y+uTime*(.03+aRand*.05)+6.,12.)-6.;p.x+=sin(uTime*.2+aRand*40.)*.15;
 vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 gl_PointSize=22.*uSize*(.5+aRand)/-mv.z;vB=(.1+aRand*.18)*uOn;}`;
const dustFS = /* glsl */ `uniform vec3 uInk;varying float vB;
void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float a=vB*exp(-16.*r*r);gl_FragColor=vec4(uInk*a,min(1.,a));}`;

/* ---------------- dot building ---------------- */
function buildDots(gltf: { scene: THREE.Object3D }): Built {
  let mesh: THREE.Mesh | undefined;
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => {
    if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh;
  });
  if (!mesh) throw new Error('no mesh in model');
  const geo = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
  if (!geo.attributes.normal) geo.computeVertexNormals();
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build();

  // Candidates
  const C = N * 5;
  const cp = new Float32Array(C * 3);
  const cn = new Float32Array(C * 3);
  const P = new THREE.Vector3();
  const Nn = new THREE.Vector3();
  for (let i = 0; i < C; i++) {
    sampler.sample(P, Nn);
    cp[i * 3] = P.x; cp[i * 3 + 1] = P.y; cp[i * 3 + 2] = P.z;
    cn[i * 3] = Nn.x; cn[i * 3 + 1] = Nn.y; cn[i * 3 + 2] = Nn.z;
  }

  // Leaf sprig + even-density bust pool
  const isLeaf = (i: number) => {
    const x = cp[i * 3], y = cp[i * 3 + 1], z = cp[i * 3 + 2];
    return x > 0.13 && y > 0.6 && (x - 0.02) ** 2 + (z + 0.06) ** 2 > 0.035;
  };
  const VS = 0.022;
  const vk = (i: number) =>
    ((Math.floor(cp[i * 3] / VS) + 512) * 1024 + Math.floor(cp[i * 3 + 1] / VS) + 512) * 1024 +
    Math.floor(cp[i * 3 + 2] / VS) + 512;
  const leaf: number[] = [];
  const vox = new Map<number, number>();
  for (let i = 0; i < C; i++) {
    if (isLeaf(i)) leaf.push(i);
    else {
      const k = vk(i);
      vox.set(k, (vox.get(k) || 0) + 1);
    }
  }
  const leafKept = leaf.slice(0, Math.floor(leaf.length * 0.6));
  const VISOR = 950 + 380 + 140 + 1500 + 140;
  const need = N - VISOR - leafKept.length;
  const counts = [...vox.values()];
  let cap = 1;
  for (; cap < 10000; cap++) {
    let s = 0;
    for (const c of counts) s += Math.min(c, cap);
    if (s >= 1.8 * need) break;
  }
  const taken = new Map<number, number>();
  const pool: number[] = [];
  for (let i = 0; i < C; i++) {
    if (isLeaf(i)) continue;
    const k = vk(i);
    const t = taken.get(k) || 0;
    if (t < cap) {
      taken.set(k, t + 1);
      pool.push(i);
    }
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  const bust = pool.slice(0, need);

  // Visor: front height map of the face
  const H = new Map<number, number>();
  for (let i = 0; i < C; i++) {
    const x = cp[i * 3], y = cp[i * 3 + 1];
    if (cn[i * 3 + 2] >= 0.2 && x > -0.32 && x < 0.32 && y > 0.2 && y < 0.45) {
      const k = Math.floor(x / 0.01) * 1000 + Math.floor(y / 0.01);
      const z = cp[i * 3 + 2];
      const old = H.get(k);
      if (old === undefined || z > old) H.set(k, z);
    }
  }
  const fh = (x: number, y: number) => {
    let m = -Infinity;
    const a = Math.floor(x / 0.01), b = Math.floor(y / 0.01);
    for (let u = -1; u <= 1; u++)
      for (let v = -1; v <= 1; v++) {
        const h = H.get((a + u) * 1000 + b + v);
        if (h !== undefined && h > m) m = h;
      }
    return m;
  };
  const W = 0.215, CL = 0.028;
  const top = (x: number) => 0.378 - 0.022 * (x / W) ** 2;
  const low = (x: number) => 0.282 + 0.032 * Math.exp(-((x / 0.034) ** 2)) + 0.026 * (x / W) ** 4;
  let front = -Infinity;
  for (let x = -0.06; x <= 0.0601; x += 0.01)
    for (let y = 0.3; y <= 0.3601; y += 0.01) front = Math.max(front, fh(x, y));
  front += CL;
  let wrap = Infinity;
  for (let x = -W; x <= W + 1e-9; x += 0.01) {
    if (Math.abs(x) < 0.05) continue;
    let nd = -Infinity;
    for (let y = low(x); y <= top(x); y += 0.005) nd = Math.max(nd, fh(x, y));
    if (isFinite(nd)) wrap = Math.min(wrap, (front - nd - 0.7 * CL) / (x * x));
  }
  if (!isFinite(front) || !isFinite(wrap) || wrap < 0) wrap = 2.4;
  const lz = (x: number) => front - wrap * x * x;
  const R = Math.random;
  const J = () => (R() - 0.5) * 0.006;
  const V: number[][] = [];
  const add = (x: number, y: number, z: number, p: number, nx: number) =>
    V.push([x + J(), y + J(), z + J(), p, nx]);
  for (let i = 0; i < 950; i++) { const x = (R() * 2 - 1) * W; add(x, top(x) - R() * R() * 0.016, lz(x) + 0.004, 2, x); }
  for (let i = 0; i < 380; i++) { const x = (R() * 2 - 1) * W; add(x, low(x), lz(x) + 0.002, 2, x); }
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < 70; i++) { const x = s * W; add(x, low(x) + R() * (top(x) - low(x)), lz(x), 2, x); }
    for (let i = 0; i < 70; i++) { const t = R(); add(s * (W + 0.03 * t), top(W) - 0.008, lz(W) - 0.15 * t, 2, s * W); }
  }
  for (let i = 0; i < 1500; i++) { const x = (R() * 2 - 1) * W; add(x, low(x) + R() * (top(x) - low(x)), lz(x), 3, x); }

  // Assemble (model units)
  const pos = new Float32Array(N * 3);
  const nor = new Float32Array(N * 3);
  const part = new Float32Array(N);
  let n = 0;
  const put = (x: number, y: number, z: number, nx: number, ny: number, nz: number, p: number) => {
    pos[n * 3] = x; pos[n * 3 + 1] = y; pos[n * 3 + 2] = z;
    nor[n * 3] = nx; nor[n * 3 + 1] = ny; nor[n * 3 + 2] = nz;
    part[n++] = p;
  };
  for (const i of bust) put(cp[i * 3], cp[i * 3 + 1], cp[i * 3 + 2], cn[i * 3], cn[i * 3 + 1], cn[i * 3 + 2], 0);
  for (const i of leafKept) put(cp[i * 3], cp[i * 3 + 1], cp[i * 3 + 2], cn[i * 3], cn[i * 3 + 1], cn[i * 3 + 2], 1);
  for (const v of V) {
    const nx = 2 * wrap * v[4], l = Math.hypot(nx, 1);
    put(v[0], v[1], v[2], nx / l, 0, 1 / l, v[3]);
  }
  const total = n;

  // Ridge (stands proud / sits in a crease) and thin (loose strands)
  const RR = 0.03;
  const gk = (a: number, b: number, c: number) => ((a + 512) * 1024 + b + 512) * 1024 + c + 512;
  const g = new Map<number, number[]>();
  for (let i = 0; i < C / 2; i++) {
    const k = gk(Math.floor(cp[i * 3] / RR), Math.floor(cp[i * 3 + 1] / RR), Math.floor(cp[i * 3 + 2] / RR));
    let a = g.get(k);
    if (!a) g.set(k, (a = []));
    a.push(i);
  }
  const ridge = new Float32Array(total);
  const cnt = new Float32Array(total);
  for (let d = 0; d < total; d++) {
    const x = pos[d * 3], y = pos[d * 3 + 1], z = pos[d * 3 + 2];
    const a = Math.floor(x / RR), b = Math.floor(y / RR), c = Math.floor(z / RR);
    let k = 0, sx = 0, sy = 0, sz = 0;
    for (let u = -1; u <= 1; u++)
      for (let v = -1; v <= 1; v++)
        for (let w = -1; w <= 1; w++) {
          const l = g.get(gk(a + u, b + v, c + w));
          if (!l) continue;
          for (const i of l) {
            const dx = cp[i * 3] - x, dy = cp[i * 3 + 1] - y, dz = cp[i * 3 + 2] - z;
            if (dx * dx + dy * dy + dz * dz <= RR * RR) { k++; sx += dx; sy += dy; sz += dz; }
          }
        }
    cnt[d] = k;
    ridge[d] = k ? -((sx * nor[d * 3] + sy * nor[d * 3 + 1] + sz * nor[d * 3 + 2]) / k) / RR : 0;
  }
  const abs = Float32Array.from(ridge, Math.abs).sort();
  const p90 = abs[Math.floor(total * 0.9)] || 1;
  const med = Float32Array.from(cnt).sort()[total >> 1] || 1;
  const shade = new Float32Array(total * 2);
  for (let d = 0; d < total; d++) {
    shade[d * 2] = Math.max(-1, Math.min(1, ridge[d] / p90));
    shade[d * 2 + 1] = Math.max(0, Math.min(1, 1 - cnt[d] / (0.55 * med)));
  }

  // World space
  let gMin = Infinity, gMax = -Infinity;
  for (let d = 0; d < total; d++) {
    pos[d * 3] *= 2.8;
    pos[d * 3 + 1] = pos[d * 3 + 1] * 2.8 - 0.68;
    pos[d * 3 + 2] *= 2.8;
    if (part[d] > 0) {
      gMin = Math.min(gMin, pos[d * 3]);
      gMax = Math.max(gMax, pos[d * 3]);
    }
  }
  const rand = Float32Array.from({ length: total }, Math.random);
  return { pos, nor, part, shade, rand, gMin, gMax };
}

/* ---------------- dots from a photo ---------------- */
// Turns a photo into a relief of dots: brighter = closer and denser; depth and
// normals come from the photo's light and shadow. Best with the background removed.
function buildFromImage(img: HTMLImageElement): Built {
  const SW = 260;
  const SH = Math.max(1, Math.round((SW * img.naturalHeight) / img.naturalWidth));
  const c = document.createElement('canvas');
  c.width = SW;
  c.height = SH;
  const x = c.getContext('2d', { willReadFrequently: true });
  if (!x) throw new Error('no canvas');
  x.drawImage(img, 0, 0, SW, SH);
  const px = x.getImageData(0, 0, SW, SH).data;
  const lum = new Float32Array(SW * SH);
  const alp = new Float32Array(SW * SH);
  for (let i = 0; i < SW * SH; i++) {
    alp[i] = px[i * 4 + 3] / 255;
    lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
  }
  const L = (i: number, j: number) => lum[Math.min(SH - 1, Math.max(0, j)) * SW + Math.min(SW - 1, Math.max(0, i))];

  // World size similar to the default bust: about 2.6 units tall, centred near the camera target.
  const worldH = 2.6;
  const scale = worldH / SH;
  const DEPTH = 0.55;
  const P: number[] = [], Nn: number[] = [], S: number[] = [];
  for (let j = 0; j < SH; j++) {
    for (let i = 0; i < SW; i++) {
      const k = j * SW + i;
      const a = alp[k];
      if (a < 0.1) continue;
      const l = lum[k];
      // Several dots per pixel in bright areas, fewer in dark ones.
      const n = Math.random() < (0.22 + l * 1.1) * a ? 1 : 0;
      for (let m = 0; m < n; m++) {
        const jx = i + Math.random() - 0.5;
        const jy = j + Math.random() - 0.5;
        const gx = L(i + 1, j) - L(i - 1, j);
        const gy = L(i, j + 1) - L(i, j - 1);
        const nl = Math.hypot(gx * 3, gy * 3, 1);
        P.push((jx - SW / 2) * scale, -(jy - SH / 2) * scale - 0.15, (l - 0.4) * DEPTH + (Math.random() - 0.5) * 0.02);
        Nn.push((-gx * 3) / nl, (gy * 3) / nl, 1 / nl);
        S.push((l - 0.5) * 1.6, 0);
      }
    }
  }
  const total = Math.min(P.length / 3, 70000);
  const pos = Float32Array.from(P.slice(0, total * 3));
  const nor = Float32Array.from(Nn.slice(0, total * 3));
  const shade = Float32Array.from(S.slice(0, total * 2));
  const part = new Float32Array(total);
  const rand = Float32Array.from({ length: total }, Math.random);
  return { pos, nor, part, shade, rand, gMin: 0, gMax: 0 };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image failed'));
    img.src = url;
  });
}

async function download(url: string, signal: AbortSignal, onProgress: (p: number) => void): Promise<ArrayBuffer> {
  const res = await fetch(url, { signal });
  if (!res.ok || !res.body) throw new Error('download failed');
  const len = Number(res.headers.get('Content-Length')) || 0;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onProgress(len ? got / len : Math.min(0.95, got / 1.5e6));
  }
  const buf = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) { buf.set(c, o); o += c.length; }
  return buf.buffer;
}

/* ---------------- ring geometry (static) ---------------- */
const RING = Array.from({ length: 96 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2 - Math.PI / 2;
  return { cx: (92 * Math.cos(a)).toFixed(2), cy: (92 * Math.sin(a)).toFixed(2) };
});

/* ---------------- component ---------------- */
export interface DotBustProps {
  /** URL of the GLB bust. Must allow CORS; best kept in your own public/ folder. */
  src?: string;
  /** Use a photo instead of a 3D model (e.g. /images/quote-portrait.png). Takes priority over src. */
  image?: string;
  /** Dot colours: base, accent (glints) and highlight. */
  ink?: string;
  accent?: string;
  cream?: string;
  className?: string;
  /** Accessible description of the picture. */
  label?: string;
}

export default function DotBust({
  src = DEFAULT_GLB,
  image,
  ink = '#ccfbf1',
  accent = '#14b8a6',
  cream = '#fffbf5',
  className = '',
  label = 'A bust drawn in glowing dots',
}: DotBustProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [near, setNear] = useState(false);

  // Only download and start once the box is close to the screen.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: '400px 0px' });
    io.observe(box);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !near) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ac = new AbortController();
    let cancelled = false;
    let cleanup = () => {};
    setPhase('loading');
    setProgress(0);

    (async () => {
      let D: Built;
      if (image) {
        setProgress(0.4);
        const img = await loadImage(image);
        if (cancelled) return;
        D = buildFromImage(img);
      } else {
        const buf = await download(src, ac.signal, (p) => !cancelled && setProgress(p));
        const gltf = await new GLTFLoader().parseAsync(buf, '');
        if (cancelled) return;
        D = buildDots(gltf);
      }
      setProgress(1);
      if (!reduced) await new Promise((r) => setTimeout(r, 380));
      if (cancelled) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      stage.appendChild(canvas);

      const TAN = Math.tan(Math.PI / 12);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      const target = new THREE.Vector3(0, -0.15, 0);
      const scene = new THREE.Scene();
      const light = new THREE.Vector3(-1.4, 1.2, 1.6);
      const head = new THREE.Vector2();
      const U = {
        uTime: { value: 0 },
        uAssemble: { value: reduced ? 1 : 0 },
        uSize: { value: (image ? 19 : 26) * dpr },
        uGlint: { value: -9 },
        uShine: { value: 99 },
        uHead: { value: head },
        uLight: { value: light },
        uRingCenter: { value: target.clone() },
        uRingRadius: { value: 1 },
        uInk: { value: new THREE.Color(ink) },
        uBlue: { value: new THREE.Color(accent) },
        uCream: { value: new THREE.Color(cream) },
      };
      const mat = (vs: string, fs: string, u: Record<string, THREE.IUniform>) =>
        new THREE.ShaderMaterial({
          vertexShader: vs,
          fragmentShader: fs,
          uniforms: u,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });

      // 1. Bust
      const bg = new THREE.BufferGeometry();
      bg.setAttribute('position', new THREE.BufferAttribute(D.pos, 3));
      bg.setAttribute('aNormal', new THREE.BufferAttribute(D.nor, 3));
      bg.setAttribute('aRand', new THREE.BufferAttribute(D.rand, 1));
      bg.setAttribute('aShade', new THREE.BufferAttribute(D.shade, 2));
      bg.setAttribute('aPart', new THREE.BufferAttribute(D.part, 1));
      const bustMat = mat(bustVS, bustFS, U);

      // 2. Cursor light
      const lightU = { uLight: { value: light }, uOn: { value: reduced ? 1 : 0 }, uSize: { value: dpr } };
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
      const lightMat = mat(lightVS, lightFS, lightU);

      // 3. Dust
      const dg = new THREE.BufferGeometry();
      const DUST = 260;
      const dp = new Float32Array(DUST * 3);
      const dr = new Float32Array(DUST);
      for (let i = 0; i < DUST; i++) {
        dp[i * 3] = -9 + Math.random() * 18;
        dp[i * 3 + 1] = -6 + Math.random() * 12;
        dp[i * 3 + 2] = -6 + Math.random() * 8;
        dr[i] = Math.random();
      }
      dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
      dg.setAttribute('aRand', new THREE.BufferAttribute(dr, 1));
      const dustU = { uTime: U.uTime, uSize: { value: dpr }, uOn: { value: reduced ? 1 : 0 }, uInk: U.uInk };
      const dustMat = mat(dustVS, dustFS, dustU);

      for (const [geo, m] of [[dg, dustMat], [bg, bustMat], [lg, lightMat]] as const) {
        const pts = new THREE.Points(geo, m);
        pts.frustumCulled = false;
        scene.add(pts);
      }

      const resize = () => {
        const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const dist = Math.max(2.35 / TAN, 1.7 / (TAN * camera.aspect));
        camera.position.set(0, -0.15, dist);
        camera.lookAt(target);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        U.uRingRadius.value = 92 * ((2 * dist * TAN) / h);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(stage);
      resize();

      // Pointer
      let ptrType: string | null = null;
      let lastTouch = -9999;
      const ndc = new THREE.Vector2();
      const setPtr = (e: PointerEvent) => {
        const r = stage.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
        ptrType = e.pointerType || 'mouse';
        lastTouch = performance.now();
      };
      const clearPtr = () => { ptrType = null; };
      window.addEventListener('pointermove', setPtr, { passive: true });
      window.addEventListener('pointerdown', setPtr, { passive: true });
      window.addEventListener('blur', clearPtr);
      document.documentElement.addEventListener('pointerleave', clearPtr);

      let t = 0;
      let last = performance.now();
      let ready = false;
      const tgt = new THREE.Vector3();
      const ray = new THREE.Vector3();
      const loop = (now: number) => {
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        if (!reduced) t += dt;
        const k = (rate: number) => (reduced ? 1 : 1 - Math.exp(-dt * rate));
        U.uTime.value = reduced ? 0 : t;
        U.uAssemble.value = reduced ? 1 : Math.min(1, t / 2.6);
        if (!ready && U.uAssemble.value > 0.55) {
          ready = true;
          setPhase('ready');
        }
        lightU.uOn.value += ((reduced ? 1 : Math.min(1, 1.6 * U.uAssemble.value)) - lightU.uOn.value) * k(4);
        dustU.uOn.value += (1 - dustU.uOn.value) * k(0.8);

        const active = ptrType !== null && (ptrType !== 'touch' || performance.now() - lastTouch < 1500);
        let hx: number, hy: number;
        if (active) {
          ray.set(ndc.x, ndc.y, 0.5).unproject(camera).sub(camera.position).normalize();
          tgt.copy(camera.position).addScaledVector(ray, (2.6 - camera.position.z) / ray.z);
          hx = 0.5 * ndc.x;
          hy = 0.18 * ndc.y;
        } else {
          const tt = reduced ? 0 : t;
          tgt.set(1.9 * Math.sin(0.45 * tt), 0.5 + 0.8 * Math.cos(0.33 * tt), 2.6);
          hx = 0.35 * Math.sin(0.45 * tt);
          hy = 0.12 * Math.cos(0.33 * tt);
        }
        light.lerp(tgt, k(5));
        if (!reduced) {
          const kh = k(active ? 3 : 1.5);
          head.x += (hx - head.x) * kh;
          head.y += (-hy - head.y) * kh;
          const s = (t - 2.34) / 2.2;
          U.uShine.value = s >= 0 && s <= 1 ? 2.8 - (1 - (1 - s) ** 2) * 7.4 : 99;
          const ph = (t - 4.6) % 4.2;
          U.uGlint.value = t >= 4.6 && ph < 0.9 ? D.gMin - 0.15 + (D.gMax - D.gMin + 0.3) * (ph / 0.9) : -9;
        }
        renderer.render(scene, camera);
      };
      // Run only while the box is on screen.
      let running = false;
      const vis = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !running) {
          last = performance.now();
          renderer.setAnimationLoop(loop);
          running = true;
        } else if (!e.isIntersecting && running) {
          renderer.setAnimationLoop(null);
          running = false;
        }
      });
      vis.observe(stage);

      cleanup = () => {
        vis.disconnect();
        renderer.setAnimationLoop(null);
        ro.disconnect();
        window.removeEventListener('pointermove', setPtr);
        window.removeEventListener('pointerdown', setPtr);
        window.removeEventListener('blur', clearPtr);
        document.documentElement.removeEventListener('pointerleave', clearPtr);
        [bg, lg, dg].forEach((x) => x.dispose());
        [bustMat, lightMat, dustMat].forEach((x) => x.dispose());
        renderer.dispose();
        canvas.remove();
      };
      if (cancelled) cleanup();
    })().catch((e) => {
      if (!cancelled && e?.name !== 'AbortError') {
        console.error(e);
        setPhase('error');
      }
    });

    return () => {
      cancelled = true;
      ac.abort();
      cleanup();
    };
  }, [src, image, near, ink, accent, cream]);

  const pct = Math.round(Math.min(1, progress) * 100);

  return (
    <div
      ref={boxRef}
      role="img"
      aria-label={label}
      className={`relative overflow-hidden ${className}`}
      data-phase={phase}
    >
      <div className="absolute inset-0" ref={stageRef} aria-hidden="true" />

      {phase !== 'ready' && (
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center text-[#fffbf5]"
          role="progressbar"
          aria-label="Loading the dots"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          {phase !== 'error' && (
            <svg viewBox="-110 -110 220 220" className="absolute h-[70%] w-[70%] overflow-visible" aria-hidden="true">
              {RING.map((d, i) => (
                <circle
                  key={i}
                  cx={d.cx}
                  cy={d.cy}
                  r={i / 96 < progress ? 2.2 : 1.6}
                  fill={i / 96 < progress ? '#fffbf5' : 'rgba(255,251,245,0.18)'}
                />
              ))}
            </svg>
          )}
          <span className="relative text-sm tabular-nums opacity-80">{phase === 'error' ? 'Could not load' : `${String(pct).padStart(3, '0')}`}</span>
        </div>
      )}
    </div>
  );
}
