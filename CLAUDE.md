# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`task-kanban` — `create-next-app` でスキャフォルドされた Next.js 16（App Router, Turbopack）+ TypeScript + Tailwind CSS v4 プロジェクト。`.claude/settings.local.json` で `supabase` MCP サーバーを有効化している（現時点ではまだ利用コードはない）。

## 技術スタック
- Next.js
- TypeScript
- Supabase
- Vitest + Testing Library（テスト）
- Vercel (デプロイ)

## コマンド

- `npm run dev` — 開発サーバー起動（Turbopack）
- `npm run build` — プロダクションビルド
- `npm run start` — プロダクションビルドの実行
- `npm run lint` — ESLint（flat config、`eslint.config.mjs`）
- `npm test` — テストを1回実行（Vitest）
- `npm run test:watch` — Vitest をウォッチモードで実行
- 単一のテストファイルのみ実行する場合: `npx vitest run src/app/page.test.tsx`

テストは Vitest + React Testing Library（jsdom 環境）。設定は `vitest.config.mts`、グローバルセットアップは `vitest.setup.ts`（`@testing-library/jest-dom` を読み込み）。テストファイルは対象コードと同じディレクトリに `*.test.ts(x)` として置く。

## ディレクトリ構成

```
.
├── .claude/              # Claude Code 設定（settings.local.json で supabase MCP を有効化）
├── public/                # 静的アセット（svg 等）
├── src/
│   ├── app/               # App Router のルート・レイアウト・ページ
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── page.test.tsx  # テストは対象コードと同じディレクトリに配置
│   │   └── globals.css
│   ├── lib/
│   │   └── supabase.ts    # Supabaseクライアントと接続確認関数（checkSupabaseConnection）
│   └── instrumentation.ts # サーバ起動時にSupabase接続状況を確認するフック（register）
├── AGENTS.md              # next dev が自動生成・更新（削除しないこと）
├── CLAUDE.md
├── eslint.config.mjs      # ESLint flat config
├── next.config.ts
├── tsconfig.json
├── vitest.config.mts      # Vitest 設定
└── vitest.setup.ts        # グローバルセットアップ（@testing-library/jest-dom）
```

## アーキテクチャ

- `src/app/` — App Router のルート・レイアウト・ページ（ファイルベースルーティング）
- パスエイリアス `@/*` は `src/*` を指す（`tsconfig.json`、`vitest.config.mts` 双方で設定済み）
- Tailwind CSS v4 は `@tailwindcss/turbopack` 経由で設定（`next.config.ts` の `turbopack.rules` で `*.css` に適用）。グローバルスタイルは `src/app/globals.css`
- `next.config.ts` で `cacheComponents` と `partialPrefetching` を有効化している（Next.js 16 の新機能。挙動がデフォルトと異なる前提でコードを書くこと）
- `src/app/layout.tsx` は `LayoutProps<"/">` のような Next.js 16 で生成される型付きルートヘルパーを使用する（App Router の型安全なルート記述）

## コーディングルール
- 変更後は必ず'npm test'でテストが通ることを確認してください
- 変更は1つの関心事に絞り、小さい単位で行ってください
- 指示された範囲以外のコードを変更しないでください

## コーディング規約
- コンポーネントは関数コンポーネントで記述してください
- 変数名・関数名はキャメルケースで書いてください
- コミットメッセージは日本語で書いてください

## テストルール
- 網羅性：正常系・異常系・境界値を検討してください
- 保守性：実装の内部構造ではなくユーザから見たふるまいをテストしてください
- 可読性：テスト名に条件と期待する結果を明示してください
- 独立性：テスト間で状態を共有しないでください
- 状態遷移：画面遷移の順方向・逆方向を検証してください
- モック方針：外部依存のみモック化してください

## 禁止事項
- consol.logを本番コードに残さないでください
- 既存のテストを削除しないでください
- any型を使用しないでください

## MCP活用ルール
- Next.js・Supabase・Vitestなどの最新仕様はContext7　MCPを使って公式ドキュメントを確認してください。

## Supabase接続
- 環境変数のキーは.env.exampleファイルを参考にする
- 実際の値は.env.localファイルに記載されている前提とする（`.env*`は`.gitignore`済みでコミットされない）
- Next.jsサーバの起動時にSupabaseへの接続状況をコンソールログに表示する
- Supabaseプロジェクトの情報はMCPで確認する

### 実装の考え方
- SupabaseへのアクセスはすべてSupabase公式クライアントライブラリ（`@supabase/supabase-js`）経由で行う。プロジェクト全体で共有できるよう、クライアントの生成処理は1か所（`src/lib`配下）にまとめてある
- そこには「実際にSupabaseへ問い合わせて、応答が返ってくるか」を確認するための小さな接続チェック処理も用意してある。まだデータベースにテーブルを作っていなくても使える、軽量な疎通確認のみを行う
- Next.jsのサーバが起動するタイミングで一度だけ実行される仕組み（instrumentation）を使って、起動直後にこの接続チェックを自動実行している。サーバ起動中は常にSupabaseへ接続できる状態かを把握できる
- ログの出し方：接続に成功した場合は何も出力しない。接続に失敗した場合のみ、原因調査のためのエラーログを出力する
- `.env.example`に書かれている接続先URLはSupabaseの管理画面（ダッシュボード）のページURLであり、実際にプログラムから接続すべきAPIのURLとは異なる。`.env.local`には管理画面のURLではなく、実際のAPIエンドポイントのURLを設定すること
- 対象のSupabaseプロジェクトや、URL・接続キーなどの情報はMCP経由で確認できる（プロジェクト名: `Task-Kanban`、リージョン: `ap-southeast-2`）

## 備考

- これは Next.js 16 であり、以前のバージョンと破壊的変更がある。`AGENTS.md`（`next dev` が自動生成・更新するファイルで削除しないこと）は、古い Next.js の前提でコードを書く前に `node_modules/next/dist/docs/` の該当ガイドを読むよう指示している。
- このマシンでは、Windows の Application Control ポリシーにより `@next/swc-win32-x64-msvc` のネイティブバイナリの読み込みがブロックされ、Next.js は WASM 版の SWC にフォールバックする。警告は出るが `next build` / `next dev` は問題なく動作する。
