# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このディレクトリは、MCP (Model Context Protocol) サーバーの基本実装例です。文字列を指定回数繰り返すシンプルなtoolを提供するMCPサーバーで、技術書のサンプルコードとして使用されています。

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発モードで実行（ホットリロード付き）
npm run dev

# TypeScriptをコンパイル
npm run build

# ビルド済みのコードを実行
npm start

# テストを実行
npm test

# MCPプロトコル統合テスト
npm run test:mcp

# Claude Code統合テスト（環境によっては手動で実行）
npm run test:integration

# コードのLint実行
npm run lint

# コードのLint修正（自動修正可能な問題）
npm run lint:fix
```

## アーキテクチャ

### MCPサーバー実装
- `src/index.ts`: StdioServerTransportを使用したMCPサーバー
  - `repeat_string` tool: 文字列を指定回数繰り返すツール
    - パラメータ: text (string), count (number 0-100)
  - 標準入出力を使用したプロセス間通信

### テスト構造
- `test/test.ts`: 基本的な動作確認
  - サーバープロセスの起動確認
  - toolの呼び出しとレスポンス検証
- `test/mcp-protocol-test.ts`: MCPプロトコルレベルの統合テスト
  - initialize/tools.list/tools.call メソッドの動作確認
  - JSON-RPC通信の検証
- `test/integration-test.sh`: Claude Code CLIとの統合テスト
  - MCP Serverの追加・実行・削除の確認
- `test/manual-test.md`: 手動テスト手順書

## 開発時の注意点

1. **MCPサーバーの動作確認**
   - 開発時は`npm run dev`で起動し、標準入出力でのメッセージ送受信を確認
   - MCP仕様に準拠したJSON-RPCメッセージ形式を使用

2. **型安全性**
   - Zodスキーマを使用してtoolの入出力を定義
   - TypeScriptの厳格モードが有効

3. **サンプルコードとしての役割**
   - このコードは教材として使用されるため、シンプルで理解しやすい実装を心がける
   - 新機能追加時は、MCPの基本概念を説明できる範囲に留める

4. **コード品質管理**
   - ESLintを使用してコード品質を維持
   - 新しいコードを追加する前に`npm run lint`を実行してエラーがないことを確認
   - 自動修正可能な問題は`npm run lint:fix`で修正

5. **テストの実行**
   - 基本的な動作確認: `npm test`
   - MCPプロトコル統合テスト: `npm run test:mcp`
   - Claude Code統合テスト: `npm run test:integration`（環境によっては手動実行）
   - raw modeエラーが発生する場合は`test/manual-test.md`を参照