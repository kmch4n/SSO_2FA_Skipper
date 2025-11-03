# SSO 2FA Skipper

<div align="center">

![Logo](extension/images/logo.png)

**同志社大学のWebシングルサインオン2段階認証を自動化**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://www.google.com/chrome/)
[![Latest Release](https://img.shields.io/github/v/release/kmch4n/SSO_2FA_Skipper)](https://github.com/kmch4n/SSO_2FA_Skipper/releases/latest)

[English](README.md) | [日本語](README_ja.md)

</div>

---

## 🎯 概要

SSO 2FA Skipperは、同志社大学のWebシングルサインオンシステムの2段階認証プロセスを自動化するChrome拡張機能です。画像マトリクス認証のステップを自動的に処理することで、ログインプロセスを効率化します。

## ⚡ 機能

- **ワンクリックログイン**: ボタン一つでSSO認証フロー全体を実行
- **自動ページ遷移**: 認証プロセス中のページ遷移をシームレスに処理
- **安全な認証情報保存**: Chromeのストレージに認証情報を安全に保存
- **使いやすいインターフェース**: 現在のユーザー表示と設定への素早いアクセスを備えた直感的なポップアップ

## ⚙️ 事前準備

**重要:** この拡張機能を使用する前に、2段階認証の設定を行ってください：

1. SSOシステムに手動でログイン
2. 2段階認証の設定画面に移動
3. 認証方法を**画像マトリクス**に設定
4. 認証画像として**ロゴマーク（三角形アイコン）**を選択
5. **3回クリック**するように設定

この設定を行わないと、拡張機能は認証プロセスを自動化できません。

## 📦 インストール

### ステップ1: 拡張機能をダウンロード

**[📥 最新リリースをダウンロード](https://github.com/kmch4n/SSO_2FA_Skipper/releases/latest)**

1. [Releasesページ](https://github.com/kmch4n/SSO_2FA_Skipper/releases/latest)にアクセス
2. 最新リリースパッケージをダウンロード
3. ダウンロードしたファイルを解凍

### ステップ2: Chromeに読み込む

1. Chromeを開き、`chrome://extensions/`にアクセス
2. 右上の**デベロッパーモード**を有効にする
3. **パッケージ化されていない拡張機能を読み込む**をクリック
4. 解凍した`extension`フォルダを選択

### ステップ3: 認証情報を設定

1. Chromeツールバーの拡張機能アイコンをクリック
2. ポップアップ下部の**Settings**をクリック
3. ログインIDとパスワードを入力
4. **Save**をクリック

## 🚀 使い方

1. 拡張機能アイコンをクリック
2. **Open SSO Page**をクリックしてログインページに移動
3. **Execute Login**をクリック
4. 拡張機能が自動的に2段階認証プロセスを完了します

これだけです！拡張機能が認証情報の入力から正しい画像マトリクスの選択まで、すべてを処理します。

## ⚠️ セキュリティに関する注意

**重要:** この拡張機能はChromeの同期ストレージに認証情報を保存します。信頼できるデバイスで、ご自身のアカウントにのみ使用してください。このツールの使用により生じるセキュリティ上の問題や不利益について、作者は一切の責任を負いません。

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は[LICENSE](LICENSE)ファイルをご覧ください。

## ⚖️ 免責事項

このツールは利便性と教育目的のために提供されています。バイパスする2段階認証システムは、作者によって「単なる形式的なもの」と説明されています。ご自身の責任で使用し、所属機関の利用規約を遵守してください。
