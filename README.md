# Focus Timer — Kids YouTube Timer App

子ども向けのYouTube視聴時間を管理するカウントダウンタイマーアプリです。
1日3回のセッション制限をメダルで可視化し、自然にスクリーンタイムをコントロールします。

## 機能

- **カウントダウンタイマー** — 1秒〜30分で設定可能
- **メダル制限** — 1日3セッションまで。タイマーが完了するたびにメダルが消費される
- **日次リセット** — 深夜0時に自動でリセット。`localStorage` に状態を保存するため、ページを閉じても翌日まで持続
- **アラーム音** — タイマー完了時に心地よいチャイム音（Web Audio API、iOS対応）
- **秘密リセット** — 画面右下の目立たないボタンで保護者が全状態をリセット可能
- **PWA対応** — ホーム画面に追加してスタンドアロンアプリとして使用可能

## 使い方

1. 時間セレクターで視聴時間を選択（1分〜30分）
2. ▶ ボタンでタイマースタート
3. タイマーが0になるとチャイムが鳴り、メダルが1つ消費される
4. 3つのメダルをすべて使い切ると、翌日まで使用不可

> **保護者向け：** 右下の隅に半透明のボタンがあります。タップするとメダルを含む全状態をリセットできます。

## セットアップ

```bash
pnpm install
pnpm dev          # 開発サーバー
pnpm test         # Vitest でテスト実行
pnpm lint         # ESLint
pnpm build        # 静的サイト生成 (out/)
```

## デプロイ

`main` ブランチに push すると、GitHub Actions が以下を実行します。

1. `pnpm install` → `pnpm lint` → `pnpm test`
2. 上記がすべて通った場合のみ `pnpm build`（静的書き出し）
3. `out/` を GitHub Pages にデプロイ

ワークフロー定義: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

公開 URL: `https://<github-user>.github.io/v0-kids-youtube-timer-app/`

> GitHub Pages を初めて有効化する場合は、リポジトリの Settings → Pages → "Source" を "GitHub Actions" に設定してください。

## 技術スタック

- [Next.js 16](https://nextjs.org/)（`output: "export"` で静的書き出し）+ React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Radix UI)
- Web Audio API（外部音声ファイル不使用）
- Vitest + @testing-library/react
