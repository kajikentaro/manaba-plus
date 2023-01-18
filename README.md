# <img src="./public/icons/manabaPlusIcon_128.png" width="45" align="left"> Manaba Plus

中央大学 Manaba をもっと便利に使うための Chrome 拡張機能です。

## Install

[Chrome Web Store](https://chrome.google.com/webstore/detail/manaba-downloader/aeidkdokanbhoefbgaadaicdmggdeegf?hl=ja)

## Feature

- コンテンツ自動ダウンロード  
  各教科のコースコンテンツにある全てのファイルを差分タウンロード。自動でフォルダ別に整理されます。
- 未提出課題検索  
  各教科のみ提出課題をトップページに色分け表示します。
- ドロップ提出  
  レポートをドラッグ&ドロップで提出

### YouTube 紹介動画

| <a href="https://www.youtube.com/watch?v=BmCXfWZzhks" rel="some text"><img src="http://img.youtube.com/vi/BmCXfWZzhks/mqdefault.jpg"></a> |
| ----------------------------------------------------------------------------------------------------------------------------------------- |

## Development

### 手順

1. [Node.js](https://nodejs.org/ja/download/)をインストールします
2. このリポジトリをクローンします  
   `git clone https://github.com/kajikentaro/manaba-plus`
3. ディレクトリを移動します  
   `cd manaba-plus`
4. npm の依存関係をインストールします  
   `npm install`
5. 開発用のビルドを行います  
   `npm run watch`  
   build ディレクトリの中に結果が格納されます.
6. インストール  
   [Chrome Extensions](chrome://extensions/)の Developer mode を ON にし、build ディレクトリをドラックアンドドロップします。
7. Hacking.
8. 本番用ビルドを行います  
   `npm run build`  
   build.zip が生成されます. Warning や Error が出ていないことを確認します.
9. 良い機能ができたらプルリクエストを送ってください

### 各ファイルについて

- `src/`  
  `src`直下の各 ts ファイルは、Manaba-Plus の機能をそれぞれ 1 つずつ担っています。詳細はファイル先頭のコメントを確認してください
- `src/module/`
  `src/*.ts`から使用するモジュールです
- `public/`  
  画像や html ファイルなど, Webpack でコンパイルを行わないファイルを配置します.`build`ディレクトリに直接コピーされます.
- `public/manifest.json`  
  Chrome 拡張機能の設定ファイルです.
- `.eslintrc.js`  
  ESLint の設定ファイルです
- `tsconfig.json`  
  TypeScript の設定ファイルです
- `config/`  
  Webpack の設定ファイルです.

### Contribution

1. Fork it ( https://github.com/kajikentaro/manaba-plus )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

## Acknowledgments

[Chrome-Extension-Cli](https://github.com/dutiyesh/chrome-extension-cli) を利用して作成されました。
