# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`task-kanban` — `create-next-app` でスキャフォルドされた Next.js 16（App Router, Turbopack）+ TypeScript + Tailwind CSS v4 プロジェクト。UIコンポーネントは shadcn/ui（`npx shadcn@latest init`で導入済み）を使用する。`.claude/settings.local.json` で `supabase` MCP サーバーを有効化している。

## 技術スタック
- Next.js
- TypeScript
- Supabase
- shadcn/ui（UIコンポーネント。style: `radix-nova`、baseColor: `neutral`。コンポーネント追加は`npx shadcn@latest add <component>`）
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
│   │   ├── globals.css
│   │   └── tasks/
│   │       ├── page.tsx           # /tasks ルート。TaskBoardをレンダリングするだけ
│   │       ├── task-board.tsx     # タスクのCRUD UI本体（Client Component）
│   │       └── task-board.test.tsx
│   ├── components/
│   │   └── ui/            # shadcn/ui CLIで生成されたコンポーネント（`npx shadcn@latest add`で追加。手動で直接編集しない）
│   ├── lib/
│   │   ├── supabase.ts    # Supabaseクライアントと接続確認関数（checkSupabaseConnection）
│   │   ├── tasks.ts       # tasksテーブルへのCRUD関数（fetchTasks/createTask/updateTask/deleteTask）
│   │   ├── tasks.test.ts
│   │   └── utils.ts       # shadcn/uiの`cn`をre-export（実体は`cn`パッケージ）
│   ├── test-support/
│   │   └── supabaseQueryMock.ts # Supabaseクエリビルダーのテスト用フェイク（createFakeQueryBuilder）
│   └── instrumentation.ts # サーバ起動時にSupabase接続状況を確認するフック（register）
├── AGENTS.md              # next dev が自動生成・更新（削除しないこと）
├── CLAUDE.md
├── components.json        # shadcn/ui CLIの設定（style/baseColor/aliases等。手動で直接編集しない）
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
- DBアクセス（`src/lib/tasks.ts`）とUI（`src/app/tasks/task-board.tsx`）を分離している。UIコンポーネントは`@supabase/supabase-js`を直接import せず、必ず`src/lib`配下の関数経由でデータ操作を行う
- `src/lib/tasks.ts`のCRUD関数はDB行（snake_case）とアプリ側の型（camelCase）をそれぞれ`TaskRow`/`Task`として分離し、`mapRowToTask`で変換する。Supabaseエラーは握り潰さず、`throw new Error("〜に失敗しました: ${error.message}")`の形で日本語メッセージに変換して呼び出し元に伝える
- `task-board.tsx`は追加・編集・削除のそれぞれに独立した loading/error の state を持つ（`isAdding`/`addError`、`isUpdating`/`updateError`、`isDeleting`/`deleteError`）。削除は即実行せず、確認用のインライン状態（`confirmingDeleteId`）を経由する
- エラーメッセージは`role="alert"`を付けたテキストで表示する（テストから`getByRole("alert")`で検証できるようにするため）
- UIコンポーネントの追加は`npx shadcn@latest add <component>`で行い、`src/components/ui/`配下に生成する。生成後のコードは基本的に手動で書き換えない（再度`add`すると上書きされる前提のコードのため）
- `src/app/globals.css`のテーマ変数（`--background`/`--primary`等）はshadcn/uiのCSS変数方式で管理されている。独自の色を追加する場合もこの変数方式に合わせる
- `cn`（クラス名結合ユーティリティ）は`src/lib/utils.ts`経由でimportする（実体は`cn`パッケージの再exportであり、`clsx`/`tailwind-merge`を直接importしない）

## デザインルール（UI）

- 画面の構成単位は shadcn/ui の `Card`（`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`/`CardAction`）でまとめる。フォーム1つ・一覧の各アイテム1つにつき `Card` 1枚を対応させる
- ボタンは `Button` の `variant` で役割を使い分ける。主要アクション（追加・更新）は `default`、キャンセルなど補助的な操作は `outline`、削除など破壊的な操作は `destructive`
- フォーム入力は `Label` + `Input`/`Textarea`/`Select` の組み合わせで作る。`Label` の `htmlFor` と対象コントロールの `id` は必ず一致させる（テストで `getByLabelText` を使うため）
- 選択肢（ステータスなど）は shadcn/ui の `Select`（Radixベース）を使う。ネイティブの `<select>` は使わない
- エラーメッセージ・確認メッセージ（例: 削除確認）は `Alert` + `AlertTitle`/`AlertDescription` で表示する。`Alert` は `role="alert"` を標準で持つため、個別に `role` 属性を付与する必要はない
- ステータスなどのラベル表示には `Badge` を使う。色分けが必要な場合は `variant="outline"` をベースに `className` でTailwindの色クラスを上書きする（`cn` はtailwind-merge相当のため、後から渡したクラスが安全に優先される）
- 配色はできる限り `globals.css` のCSS変数（`--primary`/`--destructive`/`--muted` 等）に乗せたトークンベースのクラス（`bg-primary`など）を使う。Tailwindの生の色クラス（例: `bg-amber-100`）はBadgeの差し色など限定的な用途にとどめ、画面全体のトーンはトークン経由にする
- ページ全体のレイアウトは `max-w-2xl` 程度の中央寄せカラムとし、背景は `bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-black dark:to-zinc-900` のグラデーションを基調にする
- shadcn/uiの `Select` など Radix ベースのコンポーネントをVitestでテストする場合、jsdomに `hasPointerCapture`/`releasePointerCapture`/`scrollIntoView`/`ResizeObserver` のポリフィルが必要（`vitest.setup.ts` に追加済み）。`userEvent.selectOptions` は使えないため、トリガーをクリックしてから `getByRole("option", { name })` をクリックする形でテストする

## データモデル（Supabase）

- `tasks`テーブル（マイグレーション`20261021171558_create_tasks_table`で作成。RLS有効）
  - `id uuid` PK, デフォルト `gen_random_uuid()`
  - `title text` NOT NULL, CHECK `char_length(btrim(title)) > 0`（空白のみの入力はDB側でも拒否される）
  - `description text` NULLABLE
  - `status text` デフォルト `'todo'`, CHECK `status IN ('todo','in_progress','done')`
  - `created_at` / `updated_at` `timestamptz`, デフォルト `now()`（`updated_at`はアプリ側の`updateTask`で明示的に更新している。DBトリガーはない）
- RLSポリシーは現状 `public` ロールに対して SELECT/INSERT/UPDATE/DELETE をすべて無条件許可（`tasks_select_public`など）。ユーザー認証・所有者ごとのアクセス制御は未実装。認証機能を追加する際は、このポリシーを見直す必要がある
- スキーマ変更はSupabase MCPの`apply_migration`で行い、`list_migrations`で適用済みマイグレーションを確認できる。手動で管理画面からテーブルを変更しない

## コーディングルール
- 変更後は必ず'npm test'でテストが通ることを確認してください
- 変更は1つの関心事に絞り、小さい単位で行ってください
- 指示された範囲以外のコードを変更しないでください

## コーディング規約
- コンポーネントは関数コンポーネントで記述してください
- 変数名・関数名はキャメルケースで書いてください
- コミットメッセージは日本語で書いてください
- プロンプトでの会話はすべて日本語で行ってください

## テストルール
- 網羅性：正常系・異常系・境界値を検討してください
- 保守性：実装の内部構造ではなくユーザから見たふるまいをテストしてください
- 可読性：テスト名に条件と期待する結果を明示してください
- 独立性：テスト間で状態を共有しないでください
- 状態遷移：画面遷移の順方向・逆方向を検証してください
- モック方針：外部依存のみモック化してください
- Supabaseをモックする場合は`src/test-support/supabaseQueryMock.ts`の`createFakeQueryBuilder`を使う。`vi.mock("@/lib/supabase")`で`supabase.from`をモックし、`createFakeQueryBuilder({ data, error })`が返すフェイクビルダーを返す。新しいクエリメソッド（`select`/`insert`/`update`/`delete`/`eq`/`order`/`single`）が増えた場合はこのファイルに追記する

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
