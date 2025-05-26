import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// サーバーインスタンスの作成
const server = new McpServer({
  name: 'my-mcp-server',
  version: '1.0.0',
});

// ツールの定義
server.tool(
  'repeat_string',
  'Repeat a string a specified number of times',
  {
    text: z.string().describe('The text to repeat'),
    count: z.number().int().min(0).max(100).describe('Number of times to repeat the text'),
  },
  (args) => {
    const { text, count } = args;
    const repeated = text.repeat(count);

    return {
      content: [
        {
          type: 'text',
          text: repeated,
        },
      ],
    };
  }
)

// 標準入出力によるメッセージの受付を開始
const transport = new StdioServerTransport();

server.connect(transport).catch(console.error);
