# Claude Code Test Fixer Action

GitHub Actionを使用して、失敗したテストを自動的に修正するサンプル実装です。

## 概要

このアクションは、CI/CDパイプラインでテストが失敗した際に：
1. 失敗したテストのログを取得
2. Claude Codeを使用してエラーを分析
3. 自動的にコードを修正
4. 修正をコミット・プッシュ

## セットアップ

1. リポジトリのSecretsに`ANTHROPIC_API_KEY`を設定
2. `.github/workflows/`ディレクトリにワークフローファイルを配置
3. アクションのコードをリポジトリに配置

## 使用方法

ワークフローファイルで`workflow_run`イベントを使用して、テスト失敗時に自動実行されるように設定します。

## 必要な権限

- `contents: write` - コードの修正とコミット
- `pull-requests: write` - PR関連の操作
- `actions: read` - ワークフローログの読み取り
- `checks: read` - チェック結果の読み取り

## カスタマイズ

`extractFailedTests`関数のパターンを変更することで、異なるテストフレームワークに対応できます。