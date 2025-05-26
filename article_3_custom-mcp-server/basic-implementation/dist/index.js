"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
// サーバーインスタンスの作成
const server = new mcp_js_1.McpServer({
    name: 'my-mcp-server',
    version: '1.0.0',
});
// ツールの定義
server.tool('get_current_time', 'Get the current time in ISO format', {}, // パラメータなし
async () => {
    const currentTime = new Date().toISOString();
    return {
        content: [
            {
                type: 'text',
                text: `Current time: ${currentTime}`,
            },
        ],
    };
});
// サーバーの起動
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('MCP server started');
}
main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
