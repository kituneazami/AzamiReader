# Azami Reader

Azami Readerは、画像ファイルやPDFファイルを閲覧できるElectronベースのデスクトップアプリケーションです。主にDL販売されている同人誌などの閲覧に最適化されています。


## 使い方

1. アプリケーションを起動
2. 「フォルダを開く」ボタンでマンガや電子書籍が保存されているフォルダを選択
3. ライブラリ画面でフォルダまたはPDFファイルをクリックして閲覧
4. 設定アイコンから除外パターンや言語設定を変更可能

### 対象フォルダ内のディレクトリ構成

```
ComicFolder
├── Comic1
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   └── ...
├── Comic2
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   └── ...
├── Comic3.pdf
└── ...
```

### キーボードショートカット

- **矢印キー（←/→）**: ページ送り・戻し
- **Esc**: ライブラリに戻る

## 主な機能

- 📚 **ライブラリ管理**: フォルダ内のサブディレクトリを一覧表示し、簡単にアクセス
- 🖼️ **画像ビューア**: 複数の画像ファイルを連続して閲覧
- 📄 **PDFビューア**: PDFファイルの閲覧に対応（暫定バージョン）
- 🔍 **検索機能**: ライブラリ内のフォルダを検索
- ⭐ **お気に入り**: よく読むフォルダをお気に入りに登録
- 🚫 **除外パターン**: 不要なフォルダを非表示にするフィルタ機能


## 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite
- **デスクトップ**: Electron
- **PDF表示**: react-pdf
- **国際化**: i18next, react-i18next
- **仮想化**: react-window, react-virtualized-auto-sizer

## 必要要件

- Node.js (推奨: v18以上)
- npm または yarn

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/kituneazami/AzamiReader.git
cd AzamiReader

# 依存関係をインストール
npm install
```

## 開発

### 開発サーバーの起動

```bash
# Electronアプリとして起動
npm run electron

# Webブラウザで開発（Viteのみ）
npm run dev
```

### ビルド

```bash
# Webアプリケーションのビルド
npm run build

# Electronアプリケーションのビルド
npm run electron:build
```

ビルドされたアプリケーションは `release` フォルダに出力されます。

### その他のコマンド

```bash
# ESLintによるコード検証
npm run lint

# プレビュー
npm run preview
```

## プロジェクト構成

```
AzamiViewer/
├── electron/           # Electronメインプロセス
├── src/
│   ├── components/    # Reactコンポーネント
│   ├── locales/       # 多言語対応の翻訳ファイル
│   ├── styles/        # CSSスタイル
│   ├── i18n.ts        # i18n設定
│   ├── types.ts       # TypeScript型定義
│   └── App.tsx        # メインアプリケーション
├── public/            # 静的ファイル
├── docs/              # ドキュメント
└── dist/              # ビルド出力（Web）
```

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。


## 開発者向け情報

### ESLint設定の拡張

本番環境向けアプリケーションを開発する場合は、型を考慮したLintルールを有効にすることを推奨します：

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // より厳格なルールの場合
      // tseslint.configs.strictTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

### ビルド設定

Electron Builderの設定は `package.json` の `build` セクションで管理されています。現在の設定：

- **App ID**: com.azami.reader
- **製品名**: Azami Reader
- **出力形式**: ZIP（Windows）
- **出力先**: release/

## トラブルシューティング

### PDFが表示されない場合

PDF Workerが正しく読み込まれているか確認してください。`public/pdf.worker.min.mjs` が存在することを確認してください。

### フォルダが読み込まれない場合

Electronのファイルシステムアクセス権限を確認してください。また、ブラウザコンソールでエラーメッセージを確認してください。

