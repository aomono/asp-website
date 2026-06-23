# Asterio Icon Museum (`/icons`)

Asterio 社内のアイコン検索ライブラリ（Noun Project 型）。検索・プレビュー・DLができる。
issue: aomono/asp-website#2 ／ 設計=きおい・実装=ASP Tech。

公開URL（Vercel・asp-website に同居）: `https://www.asterio-sp.com/icons/`

## 構成
```
icons/
  index.html          … 検索SPA（バニラJS・依存なし）。icons.json を読み込み、SVGをインライン描画。
                        カラーピッカーで全アイコンを再配色できる。
  icons.json          … アイコン台帳（§3スキーマの配列）
  files/<id>.png      … 透過PNG（白背景を除去した正本）
  files/<id>.svg      … 再配色可能な2トーンSVG（濃色=currentColor / 淡色=var(--icon-accent)）
tools/
  vectorize-2tone.mjs … 変換ロジック（白背景除去→2色マスク分解→vtracer→再配色SVG合成）
  register-icon.mjs   … 登録ツール（変換→配置→台帳追記）
  seed.mjs            … 初期6点の投入スクリプト
  sources/<id>.png    … 元の白背景PNG（再生成用ソース）
  package.json        … @neplex/vectorizer (WASM vtracer) + sharp
```

### 再配色のしくみ（案③）
- SVGは2レイヤー：濃色 `fill="currentColor"`、淡色 `fill="var(--icon-accent, #9cc4e8)"`。
- 利用側で `color` と `--icon-accent` を変えれば、2トーンを保ったまま任意色に再配色できる（透過）。
- museum はベース色を選ぶと淡色を自動導出。SVGコピー/DLは選択中の色を焼き込んで書き出す。

## 台帳スキーマ（icons.json の1要素）
```json
{
  "id": "unten-001",
  "name": "運転",
  "name_en": "driving",
  "tags": ["車","運転","移動"],
  "category": "行動",
  "description": "車を運転する人",
  "files": { "svg": "/icons/files/unten-001.svg", "png": "/icons/files/unten-001.png" },
  "source": "gemini",
  "brand_neutral": true,
  "created_at": "2026-06-23"
}
```
検索はクライアントサイド（name/name_en/tags/category/description を対象）。件数が増えたら分割 or 簡易API化。

## アイコンの登録（半手動・MVP）
```bash
cd tools && npm install      # 初回のみ（@neplex/vectorizer）

# CLI
node tools/register-icon.mjs \
  --png /path/to/icon.png --id ryoko-002 --name 旅行 --name-en travel \
  --tags 旅行,出張,移動 --category 行動 --description "スーツケースと飛行機"
```
- 入力＝白背景PNG。**透過PNG**（正本）＋**再配色可能な2トーンSVG**を自動生成（失敗時はPNGのみ＝warning）。
- 実行後 `git add -A && git commit && git push` すると Vercel が自動デプロイ → サイトに反映。

### プログラムから（image-gen 側フックの接続点 = §5）
```js
import { registerIcon } from './tools/register-icon.mjs';
await registerIcon({ pngPath, id, name, nameEn, tags, category, description });
```
- **きおい担当**: image-gen でアイコン生成→人間OKゲート→`registerIcon()` を呼ぶフック＋メタの言語化。
- **ASP Tech担当**: 本ツール（変換・配置・台帳追記）と検索SPA。

## 留意（§9）
- ブランドニュートラル（特定ブランド表記を焼き込まない）／文字を焼き込んだアイコンは不可。
- 社内利用。`/icons` を非公開にしたい場合は Vercel 側で Basic 認証/middleware を追加（MVPは現状の公開設定）。

## フェーズ
- **MVP**: icons.json＋検索＋プレビュー＋DL。既存6点を初期投入。登録は半手動。
- **透過＆再配色対応（本PR）**: 白背景除去で透過化、2トーンを保ったまま `currentColor`+`--icon-accent` で再配色可能に。museum にカラーピッカー追加。
- Phase2: image-gen→registerIcon の自動登録フック（きおい）。透過背景でのアイコン生成が望ましい。
- Phase3: SVG品質向上（単純アイコンはLLM直接SVG=案Bを部分採用）、利用統計・お気に入り等。
