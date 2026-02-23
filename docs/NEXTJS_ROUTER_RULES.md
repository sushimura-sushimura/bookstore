# Next.js ルーティングルール — App Router と Pages Router

このドキュメントは、Next.js の App Router と Pages Router のルールを明確にまとめたものである。

---

## 1. export default とは

### 定義

`export default` は、そのファイルの「メインの export」を表す。

- 1ファイルにつき1つだけ指定できる
- import するとき、名前を自由に付けられる

```tsx
// sample.tsx
export default function Sample() { ... }

// 他のファイルで import
import Sample from './sample';      // 任意の名前で受け取れる
import MyPage from './sample';      // これも同じ
```

### 名前付き export との違い

```tsx
// 名前付き export（複数可）
export function getServerSideProps() { ... }
export const config = { ... };

// import 時は { } と正確な名前が必要
import { getServerSideProps } from './sample';
```

### Next.js での役割

Next.js は**特定のファイル**から **default export** を取得する。その default export が「ページコンポーネント」や「カスタム App」として使われる。名前付き export は Next.js が決めた名前（`getServerSideProps` など）のときだけ特別扱いされる。

---

## 2. Pages Router のルール

### 2.1 ディレクトリ

- `pages/` 配下のファイルがルーティングの対象
- `src/pages/` を使う場合、`src` 直下に `pages` を置く

### 2.2 ルートになるファイル・ならないファイル

| ファイル | ルートになる？ | 役割 |
|----------|----------------|------|
| `index.tsx` | はい → `/` | トップページ |
| `sample.tsx` | はい → `/sample` | ページ |
| `books/[id].tsx` | はい → `/books/123` | 動的ルート |
| `_app.tsx` | **いいえ** | 全ページのラッパー。Next.js が自動で使う |
| `_document.tsx` | **いいえ** | HTML の骨組み。Next.js が自動で使う |
| `_error.tsx` | **いいえ** | エラーページ用。Next.js が自動で使う |
| `global.css` | **いいえ** | スタイル。ルートではない |

**ルール**: ファイル名が `_` で始まるもの、`.css` などのアセットはルートにならない。それ以外で React コンポーネントを default export するファイルがルートになる。

### 2.3 現在の pages/ の4ファイル

| ファイル | ルート | 説明 |
|----------|--------|------|
| `_app.tsx` | なし | 全ページを包む。ルートではない |
| `_document.tsx` | なし | HTML 骨組み。ルートではない |
| `sample.tsx` | `/sample` | この1つだけがルート |
| `global.css` | なし | スタイル。ルートではない |

### 2.4 ファイルパスと URL の対応

| ファイルパス | URL |
|--------------|-----|
| `pages/index.tsx` | `/` |
| `pages/sample.tsx` | `/sample` |
| `pages/about.tsx` | `/about` |
| `pages/books/index.tsx` | `/books` |
| `pages/books/[id].tsx` | `/books/123` |
| `pages/sample/books/[id].tsx` | `/sample/books/123` |

### 2.5 _app.tsx のルール

- **ファイル名**: `_app.tsx` でなければならない
- **配置**: `pages/_app.tsx`（または `src/pages/_app.tsx`）
- **export**: default export が1つ必要
- **関数名**: 自由（`App` でなくてもよい）
- **受け取る props**: Next.js が渡す `Component` と `pageProps`

```tsx
// Next.js がこのように呼び出す
// App(Component=Sample, pageProps={ books: [...] })

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

Next.js の処理:

1. アクセスされた URL から表示するページを決定
2. そのページの `getServerSideProps` があれば実行し、`props` を取得
3. その `props` を `pageProps` とする
4. そのページの default export を `Component` とする
5. `_app.tsx` の default export を `Component` と `pageProps` で呼び出す

### 2.6 getServerSideProps のルール

- **関数名**: `getServerSideProps` でなければならない
- **export**: 名前付き export（`export async function getServerSideProps`）
- **戻り値**: `{ props: { ... } }` の形式
- **渡り方**:
  - 戻り値の `props` が `pageProps` になる
  - Sample（このファイルの default export）が `Component` として _app に渡される
  - _app が `<Component {...pageProps} />` をレンダリングするので、`pageProps` が Sample に渡される

```tsx
export async function getServerSideProps() {
  return { props: { books: [...] } };
}

export default function Sample({ books }) {
  // books は pageProps.books として渡される
}
```

### 2.7 _document.tsx のルール

- **ファイル名**: `_document.tsx` でなければならない
- **配置**: `pages/_document.tsx`
- **export**: default export が1つ必要
- **必須要素**: `<Html>`, `<Head>`, `<Main>`, `<NextScript>` を `next/document` から import して使用

---

## 3. App Router のルール

### 3.1 ディレクトリ

- `app/` 配下のファイルがルーティングの対象
- `src/app/` を使う場合、`src` 直下に `app` を置く

### 3.2 ルートになるファイル・ならないファイル

| ファイル | ルートになる？ | 役割 |
|----------|----------------|------|
| `page.tsx` | **はい** | そのフォルダの URL に対応するページ |
| `layout.tsx` | **いいえ** | そのフォルダ以下の共通レイアウト。ルートではない |
| `loading.tsx` | **いいえ** | ローディング UI |
| `error.tsx` | **いいえ** | エラー UI |
| `globals.css` | **いいえ** | スタイル |

**ルール**: `page.tsx`（または `page.js`）だけがルートになる。`layout.tsx` はルートにならない。

### 3.3 Next.js が「どれをレンダリングするか」の決め方

**URL からファイルパスを逆算する。**

| アクセスURL | Next.js の処理 |
|-------------|----------------|
| `/` | `app/page.tsx` を探す → ある → これをレンダリング |
| `/sample` | `app/sample/page.tsx` を探す → あるかどうかで決まる |
| `/books/123` | `app/books/[id]/page.tsx` を探す → ある → これをレンダリング |

**手順**:

1. URL をパスに変換: `/` → `app/`, `/books/123` → `app/books/[id]/`
2. そのパスに `page.tsx` があるか確認
3. ある → その `page.tsx` の default export をレンダリング
4. 親フォルダの `layout.tsx` があれば、その `children` として包む

### 3.4 現在の app/ の構成

| ファイル | ルート | 説明 |
|----------|--------|------|
| `page.tsx` | `/` | トップページ。これがレンダリングされる |
| `layout.tsx` | なし | 全ページを包む。`page.tsx` が `children` として渡される |
| `globals.css` | なし | スタイル |

`/` にアクセスしたときの流れ:

1. Next.js が `app/page.tsx` を特定
2. `app/layout.tsx` が `app/page.tsx` を `children` で包む
3. `layout` の `children` に `page` の内容が入る
4. レンダリング結果をブラウザに送る

### 3.5 page.tsx のルール

- **ファイル名**: `page.tsx` または `page.js` でなければならない
- **配置**: ルートにしたいフォルダ直下
- **export**: default export が1つ必要
- **データ取得**: ファイル内で直接 import または fetch。getServerSideProps は使わない

### 3.6 layout.tsx のルール

- **ファイル名**: `layout.tsx` または `layout.js` でなければならない
- **export**: default export が1つ必要
- **受け取る props**: `children`（子の page または layout の内容）
- **ルート layout**: `app/layout.tsx` は `<html>` と `<body>` を定義する必要がある

---

## 4. 対応関係まとめ

| 役割 | App Router | Pages Router |
|------|------------|--------------|
| ルートになるファイル | `page.tsx` | `index.tsx`, `sample.tsx` など（`_` で始まらないもの） |
| ルートにならない共通ラッパー | `layout.tsx` | `_app.tsx` |
| HTML 骨組み | `layout.tsx` 内で `<html>`, `<body>` を書く | `_document.tsx` |
| ページへのデータ渡し | ページ内で直接 import/fetch | `getServerSideProps` の `props` → `pageProps` |
| 共通ラッパーへの渡し方 | `children` | `Component` と `pageProps` |

---

## 5. 予約名・予約ファイル一覧

### Pages Router

| 名前 | 種類 | 必須 |
|------|------|------|
| `_app.tsx` | ファイル名 | カスタム App を使う場合 |
| `_document.tsx` | ファイル名 | カスタム Document を使う場合 |
| `getServerSideProps` | 関数名 | サーバーでデータ取得する場合 |
| `getStaticProps` | 関数名 | ビルド時にデータ取得する場合 |

### App Router

| 名前 | 種類 | 必須 |
|------|------|------|
| `page.tsx` | ファイル名 | ルートを作る場合 |
| `layout.tsx` | ファイル名 | レイアウトを使う場合 |
| `metadata` | export 名 | メタデータを設定する場合 |
