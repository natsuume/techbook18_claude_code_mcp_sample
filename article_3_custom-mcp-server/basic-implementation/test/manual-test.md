# MCP Server 手動統合テスト手順

このドキュメントでは、MCP Serverの統合テストを手動で実行する手順を説明します。

## 前提条件

- claude code CLIがインストールされていること
- Node.jsとnpmがインストールされていること
- このプロジェクトの依存関係がインストールされていること（`npm install`実行済み）

## テスト手順

### 1. MCP Serverの追加

以下のコマンドを実行して、MCP Serverをclaude codeに追加します：

```bash
# プロジェクトディレクトリに移動
cd /path/to/basic-implementation

# MCP Serverを追加（実際のコマンド構文はclaude code mcp --helpで確認）
claude code mcp add my-mcp-server
```

追加時に以下の情報を指定：
- 名前: my-mcp-server
- コマンド: tsx src/index.ts

### 2. MCP Serverの動作確認

#### 対話モードでのテスト

```bash
# claude codeを起動
claude code

# 以下のプロンプトを入力
# "MCPツールのrepeat_stringを使って、'Hello 'を3回繰り返してください。"
```

期待される結果：
- "Hello Hello Hello "という出力が得られること

#### 非対話モードでのテスト

```bash
# 非対話モードで実行
echo "MCPツールのrepeat_stringを使って、'Hello 'を3回繰り返してください。" | claude code -q
```

### 3. MCP Serverの削除

```bash
# MCP Serverを削除
claude code mcp remove my-mcp-server

# リストで削除されたことを確認
claude code mcp list
```

## トラブルシューティング

### Raw mode エラーが発生する場合

現在の環境で`Raw mode is not supported`というエラーが発生する場合は、以下を試してください：

1. 通常のターミナル（WSL内ではなく）で実行
2. 環境変数`CI=true`を設定して実行
3. PTY（擬似端末）を使用して実行

### MCP Serverが応答しない場合

1. `npm run dev`でサーバーが正常に起動することを確認
2. エラーログを確認
3. TypeScriptのコンパイルエラーがないことを確認（`npm run lint`）

## 自動テストスクリプト

`test/integration-test.sh`に自動テストスクリプトが用意されていますが、環境によってはraw modeエラーのため実行できない場合があります。その場合は上記の手動テスト手順に従ってください。