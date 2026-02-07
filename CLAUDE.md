# Bookstore MVP — 対話型学習プラン

## 1. プロジェクト概要

本のECサイトのMVPを、学びながら対話的に構築する。
ユーザーが自分でコードを書き、Claudeはガイド・レビュー・質問への回答を担当する。

**対象**: 初心者エンジニア向け
**方針**: ミニマムかつ簡易的なアーキテクチャで実装し、後にリアーキテクチャを予定
**スコープ**: 認証・決済は後回し。書籍の閲覧とカート機能に絞る

## 2. 進め方のルール

- **ユーザーがコードを書く** — Claudeは実装しない
- **1ステップずつ対話** — 各ステップで「やること」「学ぶこと」を説明 → ユーザーが実行 → 結果を確認・レビュー
- **小さなMVP単位** — 動くものを少しずつ積み上げる

## 3. 技術スタックと選定理由

| 技術 | 役割 | 選定理由 |
|---|---|---|
| Next.js (App Router) | フレームワーク | React公式推奨。ルーティング・SSR・API Routeを一つで提供 |
| TypeScript | 型安全 | 型定義により初心者でもデータ構造を明確に把握できる |
| Tailwind CSS | スタイリング | Next.jsに組み込み済み。CSSファイル管理不要でコンポーネント内で完結 |
| JSONファイル | データストア | DB不要。MVPでは十分。後からDB移行も容易 |
| React Context + localStorage | カート状態管理 | 外部ライブラリ不要。学習コスト最小。リロード時の永続化も実現 |
| npm | パッケージマネージャ | Node.js標準。追加インストール不要 |

### 採用しなかった選択肢と理由

| 不採用 | 理由 |
|---|---|
| Pages Router | 旧方式。App Routerが現在のNext.js推奨 |
| CSS Modules / styled-components | Tailwindの方がセットアップ簡単でNext.jsとの統合が標準 |
| Redux / Zustand | カート管理程度にはオーバースペック。Context APIで十分 |
| データベース (PostgreSQL等) | MVPにはJSONファイルで十分。インフラ不要 |
| next/image | MVPではplaceholderで代替。画像最適化は後から導入 |

## 4. アーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────────┐
│                  ブラウザ                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 一覧ページ │  │ 詳細ページ │  │カートページ│   │
│  │  (SSR)    │  │  (SSR)    │  │ (Client) │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│         │              │            │         │
│         └──────────────┼────────────┘         │
│                        │                      │
│              ┌─────────▼────────┐             │
│              │  CartContext      │             │
│              │  (localStorage)   │             │
│              └──────────────────┘             │
└─────────────────────────────────────────────┘
                        │
              ┌─────────▼────────┐
              │   Next.js Server  │
              │                   │
              │  ┌─────────────┐  │
              │  │  API Routes  │  │
              │  │ /api/books   │  │
              │  └──────┬──────┘  │
              │         │         │
              │  ┌──────▼──────┐  │
              │  │ books.json   │  │
              │  │ (データ)      │  │
              │  └─────────────┘  │
              └───────────────────┘
```

### Server Component / Client Component の分離方針

Next.js App Routerの重要な概念として、コンポーネントをServer ComponentとClient Componentに分離する。

- **Server Component（デフォルト）**: サーバーでレンダリング。データ取得に最適。JSバンドルに含まれない
- **Client Component（`"use client"`）**: ブラウザで実行。useState・onClickなどインタラクションが必要な場合のみ使用

```
ページ構成:
┌─────────────────────────────┐
│ layout.tsx (Server)          │
│  ├── CartProvider (Client)   │  ← Context提供のためClient
│  │   ├── Header (Client)     │  ← カートバッジ表示のためClient
│  │   └── page.tsx (Server)   │  ← データ取得のためServer
│  │       └── BookCard (Server)│  ← 表示のみなのでServer
│  │                           │
│  │   └── books/[id]/         │
│  │       ├── page.tsx (Server)│  ← データ取得のためServer
│  │       └── AddToCartButton │
│  │            (Client)       │  ← onClickのためClient
│  │                           │
│  │   └── cart/               │
│  │       └── page.tsx (Client)│ ← カート操作のためClient
└──┴───────────────────────────┘
```

**原則: Client Componentは必要最小限に。可能な限りServer Componentを使う。**

### データフロー

```
書籍データ:
  books.json → Server Component が直接import → ページに表示
  books.json → API Route が読み込み → JSON レスポンス（将来のクライアント連携用）

カートデータ:
  ユーザー操作 → CartContext (useState) → 画面更新
                         ↕
                    localStorage → リロード時に復元
```

## 5. ディレクトリ構成

```
bookstore/
├── CLAUDE.md                    # 本ドキュメント（アーキテクチャ + 学習プラン）
├── src/
│   ├── app/                     # Next.js App Router（ルーティング）
│   │   ├── layout.tsx           #   ルートレイアウト（CartProvider + Header）
│   │   ├── page.tsx             #   書籍一覧ページ（トップ）
│   │   ├── globals.css          #   Tailwindディレクティブのみ
│   │   ├── books/[id]/          #   書籍詳細（動的ルート）
│   │   │   ├── page.tsx         #     詳細ページ（Server Component）
│   │   │   └── AddToCartButton.tsx #  カート追加ボタン（Client Component）
│   │   ├── cart/                #   カート
│   │   │   └── page.tsx         #     カートページ
│   │   └── api/books/           #   APIエンドポイント（将来用）
│   │       ├── route.ts         #     GET /api/books
│   │       └── [id]/route.ts    #     GET /api/books/[id]
│   ├── components/              # 再利用可能なUIコンポーネント
│   │   ├── Header.tsx           #   ナビバー + カートバッジ
│   │   ├── BookCard.tsx         #   書籍カード（一覧用）
│   │   ├── CartItem.tsx         #   カート内の1アイテム行
│   │   └── CartSummary.tsx      #   合計金額 + チェックアウトボタン（placeholder）
│   ├── contexts/                # React Context
│   │   └── CartContext.tsx       #   カート状態管理（Context + localStorage）
│   ├── data/                    # 静的データ
│   │   └── books.json           #   シードデータ（6冊）
│   └── types/                   # TypeScript型定義
│       └── index.ts             #   Book, CartItem
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

### ディレクトリ設計の意図

| ディレクトリ | 責務 | 配置基準 |
|---|---|---|
| `app/` | ルーティング + ページ | URLに対応するファイルのみ |
| `components/` | 再利用可能UI | 複数ページで使う or ページから分離したいもの |
| `contexts/` | グローバル状態 | アプリ全体で共有する状態 |
| `data/` | 静的データ | JSONファイル（将来はDB移行） |
| `types/` | 型定義 | 複数ファイルで共有する型 |

## 6. データモデル

```typescript
// src/types/index.ts

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;       // 日本円（整数）— 浮動小数点の問題を回避
  description: string;
  image: string;       // 画像パスまたはplaceholder URL
};

type CartItem = {
  book: Book;          // Book全体を保持（正規化しない — MVPではシンプルさ優先）
  quantity: number;
};
```

### データモデルの設計判断

- **`id: string`**: 数値でなく文字列にすることで、将来UUIDやSlugに移行しやすい
- **`price: number`（整数）**: `1980` = ¥1,980。浮動小数点の丸め問題を回避
- **`CartItem.book: Book`**: IDだけ持って都度lookupするのではなく、Book全体を保持。正規化よりシンプルさを優先（データ量が少ないMVPでは問題にならない）

## 7. MVP段階と実装ステップ

### MVP 0: プロジェクト初期化 + 静的な書籍一覧表示
**ゴール**: ブラウザで6冊の書籍がグリッド表示される
**学ぶこと**: create-next-app, プロジェクト構造, Server Component, Tailwind CSS基礎, JSONデータの扱い

ステップ:
1. `create-next-app` でプロジェクト初期化 → 生成されたファイルの役割を理解
2. `src/types/index.ts` — Book型を定義 → TypeScriptの型について学ぶ
3. `src/data/books.json` — 6冊分のシードデータ作成
4. `src/app/globals.css` — クリーンアップ（Tailwindディレクティブのみに）
5. `src/app/layout.tsx` — ルートレイアウトをシンプルに整理
6. `src/components/BookCard.tsx` — 書籍カードコンポーネント作成
7. `src/app/page.tsx` — 一覧ページでBookCardを並べて表示
8. `npm run dev` で動作確認

### MVP 1: 書籍詳細ページへの遷移
**ゴール**: カードをクリックすると詳細ページに遷移する
**学ぶこと**: 動的ルーティング (`/books/[id]`), Next.js Link, notFound()

ステップ:
1. `src/app/books/[id]/page.tsx` — 詳細ページ作成（動的ルートの仕組みを理解）
2. BookCardにLinkを追加して遷移できるようにする
3. 存在しないIDへのアクセス時に404を返す処理
4. 動作確認

### MVP 2: カートに追加できる
**ゴール**: "Add to Cart"ボタンでカートにアイテムが追加され、ヘッダーにバッジ表示
**学ぶこと**: Client Component vs Server Component, React Context, useState, localStorage

ステップ:
1. `src/types/index.ts` — CartItem型を追加
2. `src/contexts/CartContext.tsx` — カート状態管理を作成
3. `src/components/Header.tsx` — ナビバー + カートバッジ
4. `src/app/layout.tsx` — CartProviderとHeaderを組み込み
5. `src/app/books/[id]/AddToCartButton.tsx` — Client Componentとしてカート追加ボタン
6. 動作確認（追加 → バッジ更新 → リロードで復元）

### MVP 3: カートページで管理できる
**ゴール**: カート内のアイテム一覧、数量変更、削除、合計金額表示
**学ぶこと**: イベントハンドリング, 状態更新, 条件付きレンダリング

ステップ:
1. `src/components/CartItem.tsx` — カート内1アイテム行（数量+/- と削除）
2. `src/components/CartSummary.tsx` — 合計金額表示
3. `src/app/cart/page.tsx` — カートページ（空表示 / アイテム一覧 + サマリー）
4. 動作確認

### MVP 4（将来）: APIルート
**ゴール**: `/api/books` と `/api/books/[id]` のREST APIエンドポイント
**学ぶこと**: Next.js Route Handlers, REST API, HTTPステータスコード

## 8. 設計上のポイント・判断メモ

### Server Component / Client Component の分離
ページはServer Component、インタラクティブな部品（カート追加ボタン等）のみClient Componentにする。これによりJSバンドルサイズを最小化し、初回表示を高速に保つ。

### データ取得はServer Componentで直接import
MVPではAPIをfetchせず、`books.json`をServer Componentで直接importする。クライアントにデータ取得のコードが含まれないため、シンプルかつ高速。API Routeは外部連携や将来のクライアントサイドfetch用に別途用意する。

### 画像はplaceholder
MVPではdivの背景色+テキストで代替。`next/image` による画像最適化は後から導入予定。

### 価格はJPY整数
`1980`のように整数で管理。JavaScriptの浮動小数点問題（`0.1 + 0.2 !== 0.3`）を回避する。表示時にフォーマットする。

### localStorage によるカート永続化
SSR対応のため `typeof window` チェックと `isLoaded` ガードを入れる。ハイドレーションエラーを防ぐための工夫が必要。

## 9. 検証チェックリスト

MVP完成時に以下を全て確認する:

1. `npm run dev` でdev server起動
2. `http://localhost:3000/` — 6冊の書籍がグリッド表示される
3. 書籍カードクリック → `/books/[id]` に遷移、詳細が表示される
4. "Add to Cart"ボタン → ヘッダーのカートバッジが更新される
5. `/cart` — カート内のアイテムが表示、数量変更・削除が動作する
6. ブラウザリロード → カートの内容がlocalStorageから復元される
7. `/books/999` — 404ページが表示される
8. `curl http://localhost:3000/api/books` — JSONが返る
9. `npx tsc --noEmit` — 型エラーなし

## 10. 将来の拡張（MVP後）

- データベース導入（PostgreSQL + Prisma）
- 認証（NextAuth.js）
- 決済（Stripe）
- 画像最適化（next/image + 外部ストレージ）
- 検索・フィルタリング機能
- テスト（Jest + React Testing Library）
