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
- **両Routerで実装** — 全ての機能・画面において、App Router と Pages Router の両方で実装する。比較学習のため。Pages Router 版は `/sample` 以下のURLで提供（`/` 等との競合を避ける）

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
├── docs/
│   └── NEXTJS_ROUTER_RULES.md   # App Router / Pages Router のルール詳細
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
│   ├── pages/                   # Next.js Pages Router（学習比較用・全機能を両方で実装）
│   │   ├── _app.tsx             #   全ページ共通ラッパー（CartProvider、フォント等）
│   │   ├── _document.tsx        #   HTML骨組み（lang、Head等）
│   │   ├── sample.tsx           #   書籍一覧（/sample）
│   │   └── sample/
│   │       ├── books/[id].tsx   #   書籍詳細（/sample/books/[id]）
│   │       └── cart.tsx         #   カート（/sample/cart）
│   ├── components/              # 再利用可能なUIコンポーネント（両Routerで共有）
│   │   ├── Header.tsx           #   ナビバー + カートバッジ
│   │   ├── BookCard.tsx         #   書籍カード（一覧用）
│   │   ├── BookCardAmazon.tsx   #   Amazon風書籍カード
│   │   ├── CampaignBanner.tsx   #   キャンペーンバナー（propsでデータ受け取り）
│   │   ├── CampaignBannerWithData.tsx # App Router用（コンポーネント内でデータ取得）
│   │   ├── CartItem.tsx         #   カート内の1アイテム行
│   │   └── CartSummary.tsx      #   合計金額 + チェックアウトボタン（placeholder）
│   ├── contexts/                # React Context
│   │   └── CartContext.tsx       #   カート状態管理（Context + localStorage）
│   ├── data/                    # 静的データ
│   │   ├── books.json           #   シードデータ（6冊）
│   │   └── campaign.json        #   キャンペーン情報（MVP 0.5 比較学習用）
│   └── types/                   # TypeScript型定義
│       └── index.ts             #   Book, CartItem
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

### App Router と Pages Router の共存ルール

Next.jsは `app/` と `pages/` を同じプロジェクト内で共存できる。使い分けは**ページ単位**で決まる。

**ルールの詳細**: [docs/NEXTJS_ROUTER_RULES.md](docs/NEXTJS_ROUTER_RULES.md) に予約名・ファイルパスとURLの対応・export default の説明などをまとめている。

- `app/` 内のファイル → App Routerのルールで動く
- `pages/` 内のファイル → Pages Routerのルールで動く
- `components/` は共有 → どちらのページからもimportできる
- **同じURLパスを両方に定義することはできない**（例: `app/page.tsx` と `pages/index.tsx` は競合する）

### 両RouterでのURL対応（全機能・全画面を両方で実装）

| 機能 | App Router（URL） | Pages Router（URL） |
|------|-------------------|---------------------|
| 書籍一覧 | `/` | `/sample` |
| 書籍詳細 | `/books/[id]` | `/sample/books/[id]` |
| カート | `/cart` | `/sample/cart` |

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

### MVP 0.5: Pages Routerとの比較学習
**ゴール**: 同じ「書籍一覧」をPages Routerで書き、App Routerとの違いを体感する
**学ぶこと**: Pages Routerの書き方、getServerSideProps、App Routerとの違い

ステップ:
1. `src/pages/sample.tsx` — Pages Routerで書籍一覧ページを作成（`/sample` でアクセス）
2. App Router版（`src/app/page.tsx`）と並べて書き方の違いを比較
3. 動作確認（`http://localhost:3000/sample`）

**比較ポイント**（書籍一覧のみでは体感しづらい点あり。複数データ取得の違いは MVP 0.6 で体感）:
- App Router: Server Componentで `import books from "../data/books.json"` と直接importできる
- Pages Router: `getServerSideProps` でデータを取得し、propsとしてコンポーネントに渡す
- App Router: デフォルトがServer Component
- Pages Router: デフォルトがClient Component（全てブラウザに送られる）

### MVP 0.6: Pages Router vs App Router 深掘り（機能ごとに体感）

**方針**: 感じやすい機能ごとに体感する。感じにくい違いは別途、今後やる。

**参考**: [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security), [Next.js Security Update Dec 2025](https://nextjs.org/blog/security-update-2025-12-11), [CVE-2025-66478](https://nextjs.org/cve-2025-66478)

---

#### 機能ごとの体感マップ

| 機能 | 体感しやすい違い | 実施タイミング |
|------|------------------|----------------|
| **カート** | Server/Client のファイル分離（layout vs _app、`"use client"` の必要性） | MVP 2 でカート機能を実装する際 |
| **書籍詳細 + おすすめ** | 複数データ取得の制限（ページ単位 vs コンポーネント単位） | MVP 1 でおすすめセクションを追加する際 |
| **認証・マイページ** | props 漏洩、searchParams の信頼性、Server Action の認可、router.push の XSS | 認証を実装する MVP |
| **検索** | searchParams の信頼性、SSR | 検索機能を実装する MVP |

---

#### カート（MVP 2 で実施）

**体感するもの**: Server/Client のファイル分離。クリックなどの操作にはブラウザで動くコードが必要。App Router では必要な部分だけ `"use client"` で分離するが、Pages Router では全ファイルがブラウザに送られる。

- **App Router**: layout.tsx はサーバーのみ。AddToCartButton、Header（カートバッジ）は `"use client"` で別ファイルに分離。ブラウザに送るのはその部分だけ。
- **Pages Router**: _app.tsx も sample.tsx も全てブラウザに送られる。分離の概念がない。

**実装の流れ**: MVP 2 でカート機能を実装する際、App Router 版では AddToCartButton.tsx と Header.tsx に `"use client"` を付けて Client Component として分離。Pages Router 版（`pages/books/[id].tsx` など）も作成し、layout vs _app、ファイル分離の有無を比較する。

---

#### 書籍詳細 + おすすめ（MVP 1 で実施）

**体感するもの**: 複数データ取得の制限。1ページに「書籍詳細」と「おすすめ書籍」の2種類のデータが必要になる。

- **Pages Router** (`pages/books/[id].tsx`): getServerSideProps で書籍詳細とおすすめの両方を取得し、props で渡す必要がある
- **App Router** (`app/books/[id]/page.tsx`): 書籍詳細は page で取得、おすすめは RecommendationList コンポーネントが自分で取得できる

**実装の流れ**: MVP 1 で書籍詳細ページを作る際、おすすめセクションを追加。Pages Router 版も `pages/books/[id].tsx` で作成し、両方の書き方の違いを比較する。

---

#### 認証・マイページ（認証実装時に実施）

**体感するもの**: props 漏洩、searchParams の信頼性、Server Action の認可、router.push の XSS。

- **props 漏洩**: ユーザー情報を props で渡すと HTML に含まれる
- **searchParams**: `?isAdmin=true` で管理者表示を試すと改ざん可能。認可は cookie/session で検証
- **Server Action**: 認証・認可を Server Action 内で必ず行う
- **router.push**: ログイン後のリダイレクト先をユーザー入力由来にすると XSS の危険

---

#### 検索（検索機能実装時に実施）

**体感するもの**: searchParams の信頼性、SSR。

- **searchParams**: 検索クエリはクライアントが改ざん可能。サーバー側でバリデーション・サニタイズ
- **SSR**: 検索結果はリクエストごとに異なるため SSR が適している

---

#### 感じにくい違い（別途、今後やる）

以下の違いは現在の機能では体感しづらい。余裕があれば別途デモや計測で確認する。

| 違い | 体感方法 |
|------|----------|
| Server Component のバンドル削減 | DevTools でクライアント JS のサイズを比較 |
| ストリーミング | 遅い API を意図的に使い、Suspense で段階表示を確認 |
| レイアウトのネスト | 複数セグメントで異なる layout を持つページを構築 |
| CVE 系の脆弱性 | バージョン確認の習慣、公式アドバイザリの定期確認 |

---

#### 参考リンク

- [Next.js Data Security ガイド](https://nextjs.org/docs/app/guides/data-security)
- [Next.js Security Update (Dec 2025)](https://nextjs.org/blog/security-update-2025-12-11)
- [CVE-2025-66478 アドバイザリ](https://nextjs.org/cve-2025-66478)
- [getServerSideProps（props の扱い）](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props)

---

### MVP 1: 書籍詳細ページへの遷移
**ゴール**: カードをクリックすると詳細ページに遷移する。おすすめセクションを追加し、**MVP 0.6「複数データ取得の制限」を体感**する。
**学ぶこと**: 動的ルーティング (`/books/[id]`), Next.js Link, notFound(), 複数データ取得（ページ単位 vs コンポーネント単位）

ステップ:
1. **App Router** `src/app/books/[id]/page.tsx` — 詳細ページ作成（動的ルートの仕組みを理解）
2. BookCardにLinkを追加して遷移できるようにする（App Router は `/books/[id]`、Pages Router は `/sample/books/[id]` へ）
3. 存在しないIDへのアクセス時に404を返す処理
4. おすすめセクションを追加 — 同じ著者の他書籍やランダム3冊を表示。App Router では RecommendationList が自分でデータ取得、Pages Router では getServerSideProps で両方取得する違いを体感
5. **Pages Router** `src/pages/sample/books/[id].tsx` — 同じ機能を Pages Router で実装
6. 動作確認（`/books/[id]` と `/sample/books/[id]` の両方）

### MVP 2: カートに追加できる
**ゴール**: "Add to Cart"ボタンでカートにアイテムが追加され、ヘッダーにバッジ表示
**学ぶこと**: Client Component vs Server Component, React Context, useState, localStorage, Props vs State の違い

ステップ:
1. `src/types/index.ts` — CartItem型を追加
2. `src/contexts/CartContext.tsx` — カート状態管理を作成（State でカートの中身を管理）
3. `src/components/Header.tsx` — ナビバー + カートバッジ
4. **App Router** `src/app/layout.tsx` — CartProviderとHeaderを組み込み
5. **App Router** `src/app/books/[id]/AddToCartButton.tsx` — Client Componentとしてカート追加ボタン
6. **Pages Router** `src/pages/_app.tsx` — CartProviderとHeaderを組み込み
7. **Pages Router** `src/pages/sample/books/[id].tsx` — AddToCartButton を組み込み（Pages Router では Client Component の分離なし）
8. 動作確認（`/books/[id]` と `/sample/books/[id]` の両方で追加 → バッジ更新 → リロードで復元）

**学習ポイント**: カートの追加機能を通じて、State（自分で変更できるデータ）と Props（親から渡される読み取り専用データ）の違いを体感する。あわせて、ハイドレーションエラーを体験する：localStorage はサーバーに存在しないため、SSR 時にサーバーとクライアントで異なる内容をレンダリングするとエラーが発生する。意図的に `typeof window` チェックなしで実装してエラーを確認し、その後で正しい実装に修正する。**MVP 0.6「Server/Client ファイル分離」** を体感：App Router では AddToCartButton を `"use client"` で分離、Pages Router では分離なし。

### MVP 3: カートページで管理できる
**ゴール**: カート内のアイテム一覧、数量変更、削除、合計金額表示
**学ぶこと**: イベントハンドリング, 状態更新, 条件付きレンダリング, `.map()` における `key` の重要性

ステップ:
1. `src/components/CartItem.tsx` — カート内1アイテム行（数量+/- と削除）
2. `src/components/CartSummary.tsx` — 合計金額表示
3. **App Router** `src/app/cart/page.tsx` — カートページ（空表示 / アイテム一覧 + サマリー）
4. **Pages Router** `src/pages/sample/cart.tsx` — 同じ機能を Pages Router で実装（`/sample/cart`）
5. 動作確認（`/cart` と `/sample/cart` の両方）

**学習ポイント**: カートのアイテム削除・数量変更を通じて、`.map()` で並べたリストに `key` が必要な理由を実感する（key がないとReactがどの要素を更新・削除すべきか区別できず、意図しない動作になる）

### MVP 4（将来）: APIルート
**ゴール**: `/api/books` と `/api/books/[id]` のREST APIエンドポイント
**学ぶこと**: Next.js Route Handlers, REST API, HTTPステータスコード, TypeScriptジェネリクス

**学習ポイント**: APIレスポンスの型定義にジェネリクス（`<T>`）を導入する。`ApiResponse<Book>` や `ApiResponse<Book[]>` のように、同じレスポンス構造で中身の型だけ変えられる仕組みを体験し、型の再利用性を学ぶ

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

**App Router（`/`, `/books/[id]`, `/cart`）**
1. `npm run dev` でdev server起動
2. `http://localhost:3000/` — 6冊の書籍がグリッド表示される
3. 書籍カードクリック → `/books/[id]` に遷移、詳細が表示される
4. "Add to Cart"ボタン → ヘッダーのカートバッジが更新される
5. `/cart` — カート内のアイテムが表示、数量変更・削除が動作する
6. ブラウザリロード → カートの内容がlocalStorageから復元される
7. `/books/999` — 404ページが表示される

**Pages Router（`/sample`, `/sample/books/[id]`, `/sample/cart`）**
8. `http://localhost:3000/sample` — 6冊の書籍がグリッド表示される
9. 書籍カードクリック → `/sample/books/[id]` に遷移、詳細が表示される
10. "Add to Cart"ボタン → ヘッダーのカートバッジが更新される
11. `/sample/cart` — カート内のアイテムが表示、数量変更・削除が動作する
12. `/sample/books/999` — 404ページが表示される

**共通**
13. `curl http://localhost:3000/api/books` — JSONが返る
14. `npx tsc --noEmit` — 型エラーなし

## 10. レンダリング戦略マップ

### 方針
ページの特性に応じてレンダリング方式を使い分ける。学習目的として意図的に複数の方式を採用し、大規模ECサイトへの拡張を見据える。

### レンダリング方式の概要

| 方式 | 略称 | HTMLを生成するタイミング | 向いているページ |
|---|---|---|---|
| Static Site Generation | SSG | ビルド時（デプロイ前） | 内容がほぼ変わらないページ |
| Incremental Static Regeneration | ISR | ビルド時 + 一定間隔で再生成 | たまに更新されるページ |
| Server-Side Rendering | SSR | リクエストごとに毎回 | 常に最新データが必要なページ |
| Client-Side Rendering | CSR | ブラウザで描画 | ユーザー固有のデータ・操作が多いページ |

```
                  ビルド時                    リクエスト時
                    │                            │
   SSG ────────── HTML生成・保存 ──────────→ そのまま返す（最速）
   ISR ────────── HTML生成・保存 ──────────→ 期限切れなら裏で再生成
   SSR ─────────────────────────────────→ 毎回サーバーでHTML生成
   CSR ─────────────────────────────────→ 空HTMLを返す → ブラウザでJS実行してデータ取得・描画
```

### 本プロジェクトでの使い分け

| ページ | URL | レンダリング | 理由 |
|---|---|---|---|
| 書籍一覧（トップ） | `/` | **SSG** | 書籍データはビルド時に確定。最速で表示したい |
| 書籍詳細 | `/books/[id]` | **ISR** | 基本は静的でよいが、レビューや在庫が更新される想定 |
| 検索結果 | `/search` | **SSR** | 検索クエリに応じて毎回異なる結果を返す |
| カート | `/cart` | **CSR** | ユーザー固有のデータ。SEO不要。localStorageから読む |
| 特集・キャンペーン | `/features/[slug]` | **SSG** | マーケティングページ。ビルド時に静的生成 |
| マイページ | `/mypage` | **CSR** | ユーザー固有。認証後にクライアントで取得 |
| 管理画面 | `/admin` | **CSR（SPA的）** | 内部ツール。SEO不要。高いインタラクティブ性 |

### Next.js App Routerでの実現方法

```tsx
// SSG — デフォルト（何も指定しなければ静的生成）
// app/page.tsx
export default function Home() { ... }

// SSG + 動的ルート — generateStaticParamsでビルド時にページ生成
// app/books/[id]/page.tsx
export async function generateStaticParams() {
  return books.map(book => ({ id: book.id }));
}

// ISR — revalidateで再生成間隔を指定（秒）
// app/books/[id]/page.tsx
export const revalidate = 3600; // 1時間ごとに再生成

// SSR — キャッシュしない設定
// app/search/page.tsx
export const dynamic = 'force-dynamic'; // 毎回サーバーで実行

// CSR — "use client" + useEffect でクライアント側データ取得
// app/cart/page.tsx
"use client";
export default function CartPage() {
  useEffect(() => { /* localStorageから取得 */ }, []);
}
```

## 11. 将来の拡張（MVP後）

### 機能拡張
- データベース導入（PostgreSQL + Prisma）
- 認証（NextAuth.js） — 実装時に **MVP 0.6「認証・マイページ」** の体感を実施
- 決済（Stripe）
- 画像最適化（next/image + 外部ストレージ）
- 検索・フィルタリング機能（SSRで実装）
- テスト（Jest + React Testing Library）
- **レスポンシブ対応（書籍一覧）**: 画面幅を狭くしたときに BookCard のサイズが小さくなりすぎないよう、最小幅（minmax）を設定し、横スクロールで全カードを閲覧できるようにする

### 大規模ECサイトへの拡張ロードマップ
- 検索ページ（SSR） — クエリパラメータに応じた動的レンダリングを体験。**MVP 0.6「検索」** の体感と合わせて実施
- 特集ページ（SSG） — ビルド時の静的生成とデプロイの関係を体験
- マイページ（CSR） — 認証付きクライアントサイドレンダリングを体験。**MVP 0.6「認証・マイページ」** の体感と合わせて実施
- 管理画面（CSR/SPA的） — 高インタラクティブなページの構築を体験
- ISRの導入 — 書籍詳細ページで静的生成+定期再生成を体験
