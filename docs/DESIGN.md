# ASP コーポレートサイト刷新 設計仕様書

- 日付: 2026-07-08
- 対象: `aomono/asp-website` の `index.html`（トップページ）全面刷新
- クライアント: Asterio Strategy Partners（戦略コンサルファーム、2025年2月設立）
- 目的: 「AIの限界」と言えるレベルの高品質コーポレートサイト。公開前提（noindex解除は別ステップ）

## コンセプト

**"Structured Intelligence" — サイト自体が戦略思考を実演する。**
ASPの差別化は「答えを与えるのではなく、答えを導く"構造化する力"を組織に移植する」こと。サイトはこれを体験として見せる。ヒーローで経営の"問い(ISSUE)"がイシューツリーへ構造化され"答え(ANSWER)"に至る様をライブ描画する。

## スコープ

- `index.html` のみ全面刷新。`icons/`（アイコン館）・`tools/`・`asp-logo.png` は変更しない
- 会社概要・役員などの事実情報、および核メッセージは現行を踏襲。英語のタグライン・補助コピーは新規作成可
- フォームは現行の Formspree エンドポイント（`https://formspree.io/f/xbdzkkva`）を踏襲
- `noindex` は残す（公開判断は別途）。ただし公開に備え OGP/構造化データを整備

## 技術方針

- **単一の静的サイト（ビルド不要）＋ CDN**。現行の Vercel 静的配信と `/icons` 同居を壊さない
- ヒーローの核演出は **Canvas 2D**（イシューツリー。WebGLより軽量・堅牢で概念に忠実）
- スクロール演出は **GSAP + ScrollTrigger + Lenis**（CDN）。`prefers-reduced-motion` で静的フォールバック
- 依存追加は CDN のみ（package.json をルートに置かない = 静的配信維持）

## ビジュアル言語

- 配色: インク `#080A1A` / ネイビー `#1B2057` / ペーパー `#F5F4EF` / ミスト `#B9BEDA` / アクセント赤 `#C41E3A`（現行ブランド継承）。導入はダーク→本文は明るいペーパー基調
- 書体: `Cormorant Garamond`（英・ディスプレイセリフ）× `Noto Serif JP`（和文セリフ）× `IBM Plex Mono`（ラベル/数値/ナビ = 分析的アクセント）
- 質感: グレイン、ヴィネット、ラジアルグロウ。写真は使わず完全タイポ＋生成グラフィック

## 構成（1ページ・スクロール体験）

1. **Hero** — Canvas イシューツリー（ISSUE→構造化→ANSWER）＋ "Build strategic thinking within."
2. **The Problem** — 従来ファームの3つの構造的限界（01 ナレッジ流出 / 02 育成機会逸失 / 03 実行段階の失速）をキネティックに
3. **The Asterio Model** — 「答え」でなく「答えを導く力」。依存モデル→自走モデルへの変化を可視化
4. **By the Numbers** — 1/3–1/6コスト・100%社内蓄積・6-12ヶ月をカウントアップ
5. **Comparison** — 従来ファーム vs Asterioモデルの対比（コスト/育成/ナレッジ/期間/実行力/将来ニーズ）
6. **Vision & Mission** — コンサル不要な自走組織を増やす / 戦略的思考のDNAを根づかせる
7. **Company** — 会社名・所在地・設立・役員（白倉誠, 櫻井佑介, 鍋島覚）・資本金・事業内容・連絡先
8. **Contact** — Formspree フォーム（お名前/会社名/メール/電話/相談内容/メッセージ）

共通: スクロール追従ナビ、フッター。

## モーション設計

- ページロード: ヒーローの staggered reveal（タグライン行が下からせり上がり、ツリーが形成）
- スクロール: 各セクションのテキスト/要素が ScrollTrigger でフェード＋せり上がり。数値はカウントアップ
- マイクロ: ナビ hover、ツリーのマウス視差、比較表のホバー強調
- `prefers-reduced-motion: reduce` で全アニメを無効化し最終状態を静的表示

## アクセシビリティ / 品質

- セマンティックHTML（header/nav/main/section/footer）、alt、フォーム label、キーボード操作
- コントラスト確保（ダーク上の本文はミスト以上の明度）
- OGP（og:title/description/image/url）、favicon、JSON-LD（Organization）を整備（公開準備）
- モバイル: ツリーは上部/背景に退避し本文の可読性を優先

## 検証

Playwright で全セクションをデスクトップ（1440）・モバイル（390）で目視確認。フォーム送信先・リンク・reduced-motion を確認。
