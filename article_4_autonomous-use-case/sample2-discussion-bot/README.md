# Claude Discussion Bot Action

GitHub Discussionsを通じてClaude Codeと対話できるようにするサンプル実装です。

## 概要

このアクションは：
1. 特定のカテゴリまたは`@claude-code`メンションを含むDiscussionを検知
2. Claude Codeが質問や要望を分析
3. 適切な回答をDiscussionに投稿
4. 必要に応じてコード生成やPR作成を実行

## セットアップ

1. リポジトリのSecretsに`ANTHROPIC_API_KEY`を設定
2. Discussionsで「claude-code-help」カテゴリを作成（オプション）
3. ワークフローファイルを`.github/workflows/`に配置

## 使用方法

### Discussionでの使用例

- 新しいDiscussionを作成し、本文に`@claude-code`を含める
- または「claude-code-help」カテゴリでDiscussionを作成
- Claude Codeが自動的に応答します

### PR作成の指示

コードの実装を依頼する場合、Claude Codeは自動的にPRを作成することもできます。

## 必要な権限

- `discussions: write` - Discussionへの返信
- `contents: write` - コードの作成とコミット
- `pull-requests: write` - PR作成

## カスタマイズ

- `buildContext`関数でコンテキストの構築方法を変更
- `processWithClaude`関数でシステムプロンプトをカスタマイズ
- PR作成時のファイルパス決定ロジックを改善