#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// MCPサーバーインスタンスの作成
const server = new McpServer({
  name: 'dummy-workflow-test',
  version: '1.0.0',
});

// ツールの定義
server.tool(
  'dummy_tool',
  'ワークフロー検証用のダミーツール',
  {
    message: z.string().describe('表示するメッセージ'),
  },
  (args) => {
    return {
      content: [
        {
          type: 'text',
          text: `ダミーツールが実行されました: ${args.message}`,
        },
      ],
    };
  }
);

// サーバーの起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Dummy workflow test MCP server started');
}

main().catch((error) => {
  console.error('サーバーの起動に失敗しました:', error);
  process.exit(1);
});