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

シェルスクリプトを格納します。

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