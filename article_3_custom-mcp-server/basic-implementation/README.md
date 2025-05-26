# Basic MCP Server Implementation

最小限のMCP Serverの実装例です。現在時刻を返すシンプルなツールを持つサーバーです。

## セットアップ

```bash
npm install
```

## 実行方法

### 開発モード
```bash
npm run dev
```

### ビルドして実行
```bash
npm run build
npm start
```

### テスト実行
```bash
npm test
```

## Claude for Desktop設定例

`config.json`に以下のように追加：

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"]
    }
  }
}
```