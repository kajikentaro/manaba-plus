# 開発ガイド

このページでは`Manaba Plus`の簡単な開発の手順と構成について説明しています。

## 前準備

初めて`Manaba Plus`の開発を始める場合は以下の流れで前準備を行ってください。

### ソフトウェアのインストール

以下をインストールしておいてください。

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)

### リポジトリをクローン

ターミナルでリポジトリを保存したい場所にcdコマンドで移動し、以下のコマンドを実行するか、URLをVS Codeに入力してクローンしてください。

```
$ git clone https://github.com/HotariTobu/manaba-plus
```

### パッケージのインストール

リポジトリのディレクトリをターミナルで開き、以下のコマンドを実行してください。

```
$ npm i
```

## 手順

`Manaba Plus`を開発するときは以下の流れをサイクルで行います。
コマンドはリポジトリのディレクトリで実行してください。

### Watchを開始する

以下のコマンドを実行してください。
ファイルの変更が監視されます。
`./dst`にビルド結果が格納されるので、[ブラウザで読み込んでおきます](../tips/test)。

```
$ npm run watch
```

### 変更を加える

ファイルを保存すると即座にビルドされます。
ファイルを新しく追加した場合はWatchからやり直してください。

### 変更を適用する

ブラウザで拡張機能を再読み込みしてください。

### フォーマットする

規則に沿っていないコードはコミットできないので、以下のコマンドでフォーマットを行ってください。

```
$ npm run format
```

## 構造

⭐がついているものは自動生成されるものなので、書き換えないでください。

### `./.git`⭐

Gitのデータが格納されています。

### `./.husky`

#### `./.husky/_/.gitignore`⭐

`./.husky/_/husky.sh`をリポジトリに含めないようにするための`.gitignore`です。

#### `./.husky/_/husky.sh`⭐

huskyのシェルスクリプトです。

#### `./.husky/pre-commit`

コミット前に実行されるシェルスクリプトです。

### `./build`

公開する圧縮ファイルが格納されます。

### `./config`

#### `./config/webpack.common.js`

開発用、公開用の共通のWebpackの設定です。

#### `./config/webpack.dev.js`

開発用のWebpackの設定です。

#### `./config/webpack.prod.js`

公開用のWebpackの設定です。

### `./docs`

GitHub Pagesで公開されるドキュメントのルートディレクトリです。

### `./dst`

ビルド結果が格納されます。

### `./hosts`

対応する学校の情報やURLパターンのファイルを格納するディレクトリです。

#### `./hosts/_.json`

テンプレートです。
新たな学校に対応する場合は、これを書き変えずにコピーしてください。

### `./node_modules`⭐

npmパッケージが格納されます。

### `./pre`

ビルド前に実行されるスクリプトを格納します。

### `./public`

ビルド時、`./dst`にそのままコピーされる静的アセットを格納します。

### `./public/common`

開発用、公開用の共通のアセットを格納します。

### `./public/dev`

開発用のアセットを格納します。

### `./public/prod`

公開用のアセットを格納します。

### `./scripts`

シェルスクリプトやPythonスクリプトを格納します。

### `./src`

ソースファイルを格納します。

### `./.auto-changelog`

auto-changelogの設定です。

### `./.eslintignore`

eslintの除外設定です。

### `./.eslintrc`

eslintの設定です。

### `./.gitignore`

Gitの除外設定です。

### `./lintstagedrc`

lint-stagedの設定です。

### `./.prettierignore`

prettierの除外設定です。

### `./.prettierrc`

prettierの設定です。

### `./.stylelintignore`

stylelintの除外設定です。

### `./.stylelintrc`

stylelintの設定です。

### `./CHANGELOG.md`

auto-changelogによって更新される変更履歴です。

### `./CONTRIBUTING.ja.md`

日本語の貢献ガイドです。

### `./CONTRIBUTING.md`

英語の貢献ガイドです。

### `./host-list.md`⭐

対応する学校の一覧です。

### `./icon-mp.svg`

SVG形式のアイコンです。

### `./LICENSE`

ライセンスです。

### `./package-lock.json`⭐

npmパッケージの依存関係が記録されます。

### `./package.json`

npmの設定です。
**バージョンを手動で書き換えないでください。**

### `./README.ja.md`

日本語のREADMEです。

### `./README.md`

英語のREADMEです。

### `./tsconfig.json`

TypeScriptの設定です。

## フォーマット

コードのフォーマットに以下のフォーマッター、リンターを使っています。

- Prettier
- ESLint
- Stylelint

これらのチェックを通らないとリポジトリにコミットできません。
コミット前にフォーマットを実行し、自動フォーマットできない部分はエラーメッセージで検索して修正してください。

## npmスクリプト

`./package.json/scripts`にはnpmスクリプトが定義されています。
npmスクリプトは以下の形式で実行することができます。

```
$ npm run 'script-name'
```

### prepare

npmパッケージをインストールした後に自動で実行されます。

### lint

コードのリント(静的解析)を行います。フォーマットは行われません。

### lint:prettier

Prettierによるリントを行います。

### lint:es

ESLintによるリントを行います。

### lint:style

Stylelintによるリントを行います。

### format

コードのフォーマットを行います。

### format:prettier

Prettierによるフォーマットを行います。

### format:es

ESLintによるフォーマットを行います。

### format:style

Stylelintによるフォーマットを行います。

### watch

WebpackによるWatchを開始します。

### prebuild

buildの前に自動で実行されます。

### build

Webpackによるビルドを行います。
`./dst/docs`が`./docs`にコピーされます。
`./dst/docs`は圧縮ファイルに含まれません。

### postbuild

buildの後に自動で実行されます。

### version

`./CHANGELOG.md`の更新を行います。
npmのバージョン系のコマンドと同時に自動で実行されます。

## バージョンの更新

バージョンを更新するにはnpmのコマンドを使用してください。
また、各ブランチをマージし、masterブランチにチェックアウトしてから行ってください。

### 大幅な変更がある場合

それはメジャーアップデートです。
以下のコマンドを実行してください。

```
$ npm version major
```

### 小規模の機能追加がある場合

それはマイナーアップデートです。
以下のコマンドを実行してください。

```
$ npm version minor
```

### 小さなバグ修正がある場合

それはパッチアップデートです。
以下のコマンドを実行してください。

```
$ npm version patch
```

## 公開

よくテストを行ってから以下の流れで公開を行ってください。

### ビルドする

以下のコマンドで公開用の圧縮ファイルを作成します。

```
$ npm run build
```

### 提出する

各ブラウザの拡張機能のストアに圧縮ファイルを送信してください。

<a href="https://github.com/HotariTobu/manaba-plus" class="github-corner" aria-label="View source on GitHub"><svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a><style>.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>