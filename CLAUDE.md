# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このリポジトリは「Claude Code × MCP」技術書のサンプルコード集です。Model Context Protocol (MCP) サーバーの実装例を提供し、Claude Codeとの統合方法を示しています。

## アーキテクチャ

### MCPサーバー実装パターン
すべてのMCPサーバーは以下の共通パターンに従います：

1. **通信方式**: 標準入出力（stdio）経由のJSON-RPC
2. **SDK**: `@modelcontextprotocol/sdk` v1.0.8
3. **スキーマ定義**: Zodによる型安全な実装
4. **エラーハンドリング**: McpErrorクラスを使用した統一的なエラー処理

### ディレクトリ構成
```
article_3_custom-mcp-server/
├── basic-implementation/    # 基本的な文字列操作ツール
├── dummy-workflow-test/     # GitHub Actionsワークフロー検証用
├── narou-server/           # 小説家になろうAPI連携
├── recipe-server/          # レシピ検索（Webスクレイピング）
└── youtube-server/         # YouTube Data API v3統合
```

### GitHub Actions

Claude公式のGitHub Actionsおよび、書籍サンプル用のカスタムアクションを使用して、CI/CDパイプラインを構築しています。

## 開発コマンド

### 共通コマンド
すべてのMCPサーバープロジェクトで以下のコマンドが利用可能：

```bash
# セットアップ
npm install              # 依存関係のインストール

# 開発
npm run dev             # TypeScriptを直接実行（tsx使用）
npm run build           # dist/にJavaScriptをビルド
npm start               # ビルド済みサーバーを起動

# 品質管理
npm test                # テスト実行
npm run lint            # ESLintチェック
npm run lint:fix        # ESLint自動修正

# Claude Code連携
npm run test:claude-code  # Claude Codeでの実動作確認テスト
```

### 単一テストの実行
特定のテストケースのみ実行する場合：
```bash
npm test -- --grep "特定のテスト名"
```

## 新規MCPサーバー実装時の手順

1. **既存実装を参考にする**
   - `basic-implementation/`が最もシンプルな実装例
   - 必要なファイル構成をコピー

2. **必須ファイル**
   - `src/index.ts`: サーバー実装
   - `test/test.ts`: テストコード
   - `package.json`: 統一されたスクリプト定義
   - `tsconfig.json`: TypeScript設定
   - `eslint.config.mjs`: リンター設定

3. **実装のポイント**
   - ツール定義は必ずZodスキーマで型定義
   - エラーは`McpError`でラップ
   - 非同期処理は適切にawaitを使用
   - 環境変数が必要な場合はREADMEに明記

## テスト戦略

### ユニットテスト
- Mochaフレームワークを使用
- 各ツールの正常系・異常系をカバー
- 外部APIはモック化を検討

### Claude Code統合テスト
`test:claude-code`スクリプトで実際のClaude Codeとの動作確認：
1. MCPサーバーをClaude Codeに登録
2. 実際のツール呼び出しをテスト
3. レスポンスの検証

## 注意事項

- **APIキー管理**: 環境変数で管理し、コードにハードコードしない
- **エラーメッセージ**: 日本語で分かりやすく記述
- **ログ出力**: console.errorのみ使用（stdoutは通信用）
- **型安全性**: TypeScriptの厳格モードを維持