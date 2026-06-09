# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動 (build後に実行)
npm run lint     # ESLint実行
npx tsc --noEmit # 型チェックのみ（ビルドなし）
```

## Architecture

シングルページの Next.js App Router アプリ。バックエンド・APIなし。

- **`app/page.tsx`** — アプリ本体。`"use client"` コンポーネントで、Todo の状態管理・UI・イベントハンドラがすべてここに収まっている
- **`app/layout.tsx`** — HTML シェル。メタデータとダークモード背景色を定義
- **`app/globals.css`** — Tailwind v4 のインポートのみ

### データの永続化

外部DBやAPIは使っていない。`localStorage` の `"todos"` キーに `Todo[]` を JSON でそのまま保存・読み込みしている。

### `Todo` 型

```ts
type Todo = { id: number; text: string; done: boolean }
```

`id` は `Date.now()` で生成するため、ミリ秒単位の一意性を前提としている。

## スタイリング

Tailwind CSS v4 を使用。ダークモード固定（`bg-gray-900` ベース）で、システム設定には追従しない。チェックボックスはネイティブ `<input type="checkbox">` ではなく、SVG チェックマーク付きの `<button>` で実装している。
