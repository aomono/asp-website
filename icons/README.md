# Asterio Icon Museum (`/icons`)

Asterio 社内のアイコン検索ライブラリ（Noun Project 型）。検索・プレビュー・DLができる。
issue: aomono/asp-website#2 ／ 設計=きおい・実装=ASP Tech。

公開URL（Vercel・asp-website に同居）: `https://www.asterio-sp.com/icons/`

## 構成
```
icons/
  index.html        … 検索SPA（バニラJS・依存なし）。icons.json を読み込んで表示。
  icons.json        … アイコン台帳（§3スキーマの配列）
  files/<id>.png    … PNG（正本）
  files/<id>.svg    … vtracer で生成したSVG（案A・ベストエフォート）
tools/
  register-icon.mjs … 登録ツール（PNG→vtracerでSVG→配置→台帳追記）
  seed.mjs          … 初期6点の投入スクリプト
  package.json      … @neplex/vectorizer (WASM vtracer)
```

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
- 案A: **PNGを正本**として保存し、vtracer でSVGを自動生成（失敗時はPNGのみ登録＝warning）。
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
- **MVP（本PR）**: icons.json＋検索＋プレビュー＋DL。既存6点を初期投入。登録は半手動。
- Phase2: image-gen→registerIcon の自動登録フック（きおい）。
- Phase3: SVG品質向上（単純アイコンはLLM直接SVG=案Bを部分採用）、利用統計・お気に入り等。
