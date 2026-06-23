// 2トーン再配色SVG変換 ― 白背景PNG → 透過PNG + 再配色可能な2トーンSVG
// 濃色レイヤー = currentColor / 淡色レイヤー = var(--icon-accent)
import sharp from 'sharp';
import {
  vectorize,
  ColorMode,
  Hierarchical,
  PathSimplifyMode,
} from '@neplex/vectorizer';

const WHITE_TLOW = 24; // これ未満の白との距離 → 完全透過
const WHITE_THIGH = 64; // これ超 → 完全不透明（間はアンチエイリアス）
const LUM_SPLIT = 140; // 濃淡レイヤーの輝度しきい値

const BIN = {
  colorMode: ColorMode.Binary,
  colorPrecision: 6,
  filterSpeckle: 4,
  spliceThreshold: 45,
  cornerThreshold: 60,
  hierarchical: Hierarchical.Stacked,
  mode: PathSimplifyMode.Spline,
  layerDifference: 16,
  lengthThreshold: 5,
  maxIterations: 2,
  pathPrecision: 3,
};

async function readRGBA(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

const rawToPng = (data, w, h, channels) =>
  sharp(Buffer.from(data), { raw: { width: w, height: h, channels } }).png().toBuffer();

/** 白背景を透過にする */
export async function transparentize(buf) {
  const { data, w, h } = await readRGBA(buf);
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
    const dist = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
    let na;
    if (dist <= WHITE_TLOW) na = 0;
    else if (dist >= WHITE_THIGH) na = 255;
    else na = Math.round((255 * (dist - WHITE_TLOW)) / (WHITE_THIGH - WHITE_TLOW));
    out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b;
    out[i * 4 + 3] = Math.min(a, na);
  }
  return rawToPng(out, w, h, 4);
}

/** 透過PNG → 濃/淡の2マスク（黒地on白） */
async function toMasks(transparentBuf) {
  const { data, w, h } = await readRGBA(transparentBuf);
  const dark = Buffer.alloc(w * h * 3, 255);
  const light = Buffer.alloc(w * h * 3, 255);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
    if (a < 128) continue;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const t = lum < LUM_SPLIT ? dark : light;
    t[i * 3] = 0; t[i * 3 + 1] = 0; t[i * 3 + 2] = 0;
  }
  return { dark: await rawToPng(dark, w, h, 3), light: await rawToPng(light, w, h, 3) };
}

function dims(svg) {
  const m = svg.match(/width="(\d+(?:\.\d+)?)"\s+height="(\d+(?:\.\d+)?)"/);
  return m ? [m[1], m[2]] : ['100', '100'];
}
function layer(svg, fill) {
  let inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  inner = inner.replace(/\s*fill="[^"]*"/g, '').replace(/<!--[\s\S]*?-->/g, '');
  return inner ? `<g fill="${fill}">${inner}</g>` : '';
}

/** 白背景PNG → { transparentPng, svg(再配色可能2トーン) } */
export async function to2tone(buf) {
  const transparentPng = await transparentize(buf);
  const { dark, light } = await toMasks(transparentPng);
  const darkSvg = await vectorize(dark, BIN);
  const lightSvg = await vectorize(light, BIN);
  const [w, h] = dims(darkSvg);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor">` +
    layer(lightSvg, 'var(--icon-accent, #9cc4e8)') +
    layer(darkSvg, 'currentColor') +
    `</svg>`;
  return { transparentPng, svg };
}
