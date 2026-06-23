// 初期投入: 既存6アイコンを台帳に登録する（register-icon 経由でSVGも生成）。
// 実行: node tools/seed.mjs
import { registerIcon } from './register-icon.mjs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILES = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'icons', 'files');
const D = '2026-06-23';

const seeds = [
  { pngPath: `${FILES}/unten-001.png`, id: 'unten-001', name: '運転', nameEn: 'driving',
    tags: ['車', '運転', '移動', 'ドライブ', '行動'], category: '行動', description: '車を運転する人' },
  { pngPath: `${FILES}/kosodate-001.png`, id: 'kosodate-001', name: '子育て', nameEn: 'parenting',
    tags: ['子育て', '育児', '親子', '家族', '子ども'], category: '家族', description: '子どもと手をつなぐ親' },
  { pngPath: `${FILES}/ryoko-001.png`, id: 'ryoko-001', name: '旅行', nameEn: 'travel',
    tags: ['旅行', '出張', 'スーツケース', '飛行機', '移動'], category: '行動', description: 'スーツケースと飛行機（旅行・出張）' },
  { pngPath: `${FILES}/kaimono-001.png`, id: 'kaimono-001', name: '買い物', nameEn: 'shopping',
    tags: ['買い物', 'ショッピング', 'EC', 'オンライン', 'スマホ', '決済'], category: '行動', description: 'スマホで買い物（オンラインショッピング）' },
  { pngPath: `${FILES}/hanbai-001.png`, id: 'hanbai-001', name: '販売チャネル', nameEn: 'sales channel',
    tags: ['販売', '店舗', 'チャネル', '小売', '流通'], category: 'ビジネス', description: '店舗（販売チャネル）' },
  { pngPath: `${FILES}/igyoshu-001.png`, id: 'igyoshu-001', name: '異業種の取引', nameEn: 'cross-industry deal',
    tags: ['取引', '異業種', '連携', '提携', 'B2B', '協業'], category: 'ビジネス', description: '異業種間の取引・連携' },
];

for (const s of seeds) {
  await registerIcon({ ...s, source: 'gemini', createdAt: D });
}
console.log(`\nseeded ${seeds.length} icons.`);
