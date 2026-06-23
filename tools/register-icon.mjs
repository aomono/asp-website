// register-icon ― Asterio icon museum 登録ツール（§4 案A: PNG正本 + vtracerでSVG）
// 使い方(CLI):
//   node tools/register-icon.mjs --png <path> --id unten-001 --name 運転 \
//     --name-en driving --tags 車,運転,移動 --category 行動 --description "車を運転する人"
// プログラムからは registerIcon({...}) を呼ぶ（image-gen 側フックの接続点）。
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  vectorize,
  ColorMode,
  Hierarchical,
  PathSimplifyMode,
} from '@neplex/vectorizer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FILES_DIR = join(ROOT, 'icons', 'files');
const LEDGER = join(ROOT, 'icons', 'icons.json');

// アイコン向けに調整（過剰なパス分割を抑制）。
const VECTORIZE_CONFIG = {
  colorMode: ColorMode.Color,
  colorPrecision: 6,
  filterSpeckle: 4,
  spliceThreshold: 45,
  cornerThreshold: 60,
  hierarchical: Hierarchical.Stacked,
  mode: PathSimplifyMode.Spline,
  layerDifference: 16,
  lengthThreshold: 5,
  maxIterations: 2,
  pathPrecision: 5,
};

async function readLedger() {
  try {
    return JSON.parse(await readFile(LEDGER, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * アイコンを台帳に登録する。
 * @returns {Promise<object>} 追加された台帳エントリ
 */
export async function registerIcon({
  pngPath,
  id,
  name,
  nameEn = '',
  tags = [],
  category = '',
  description = '',
  source = 'gemini',
  createdAt,
}) {
  if (!pngPath) throw new Error('pngPath is required');
  if (!id) throw new Error('id is required');
  if (!name) throw new Error('name is required');

  const pngBuf = await readFile(pngPath);
  await mkdir(FILES_DIR, { recursive: true });

  // PNG（正本）を配置
  await writeFile(join(FILES_DIR, `${id}.png`), pngBuf);

  // 案A: PNG -> SVG ベクター化（ベストエフォート。失敗時はPNGのみ登録）
  const files = { png: `/icons/files/${id}.png` };
  try {
    const svg = await vectorize(pngBuf, VECTORIZE_CONFIG);
    await writeFile(join(FILES_DIR, `${id}.svg`), svg, 'utf8');
    files.svg = `/icons/files/${id}.svg`;
  } catch (e) {
    console.warn(`[warn] SVG変換失敗 ${id}: ${e.message} → PNGのみで登録`);
  }

  // 台帳に追記（同idは置換）
  const ledger = await readLedger();
  const entry = {
    id,
    name,
    name_en: nameEn,
    tags,
    category,
    description,
    files: files.svg ? { svg: files.svg, png: files.png } : { png: files.png },
    source,
    brand_neutral: true,
    created_at: createdAt ?? new Date().toISOString().slice(0, 10),
  };
  const idx = ledger.findIndex((x) => x.id === id);
  if (idx >= 0) ledger[idx] = entry;
  else ledger.push(entry);
  await writeFile(LEDGER, JSON.stringify(ledger, null, 2) + '\n', 'utf8');
  console.log(`[ok] registered ${id}${entry.files.svg ? ' (svg+png)' : ' (png only)'}`);
  return entry;
}

// ---- CLI ----
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i].replace(/^--/, '');
    out[k] = argv[i + 1];
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs(process.argv.slice(2));
  registerIcon({
    pngPath: a.png,
    id: a.id,
    name: a.name,
    nameEn: a['name-en'],
    tags: a.tags ? a.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
    category: a.category,
    description: a.description,
    source: a.source,
    createdAt: a['created-at'],
  }).catch((e) => {
    console.error('[error]', e.message);
    process.exit(1);
  });
}
