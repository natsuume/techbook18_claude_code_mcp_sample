# Claude Documentation Updater Action

プルリクエストのマージ時に、自動的にドキュメントを更新するサンプル実装です。

## 概要

このアクションは：
1. マージされたPRの変更内容を分析
2. Claude Codeが必要なドキュメント更新を特定
3. API Reference、Configuration、Features、CHANGELOGを自動更新
4. 更新内容をGitHub Wikiとメインリポジトリにコミット

## セットアップ

1. リポジトリのSecretsに`ANTHROPIC_API_KEY`を設定
2. GitHub Wikiを有効化
3. ワークフローファイルを`.github/workflows/`に配置

## 更新対象

### API Reference (wiki/API-Reference.md)
- 新しいAPIエンドポイント
- 変更されたパラメータ
- 削除された機能

### Configuration (wiki/Configuration.md)
- 新しい設定オプション
- デフォルト値の変更
- パラメータの説明

### Features (wiki/Features.md)
- 新機能の説明
- 使用方法とサンプルコード

### CHANGELOG.md
- 破壊的変更の記録
- マイグレーションガイド

## 必要な権限

- `contents: write` - ドキュメントの更新とコミット
- `pull-requests: read` - PR情報の読み取り

## カスタマイズ

- `analyzeChangesWithClaude`のプロンプトを調整して分析精度を向上
- 各updateメソッドをカスタマイズしてドキュメント形式を変更
- 新しいドキュメントタイプの追加