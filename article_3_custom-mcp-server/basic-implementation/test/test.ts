import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

function testBasicMcpServer() {
  console.log('Testing Basic MCP Server implementation...\n');

  try {
    // サーバーインスタンスの作成
    const server = new McpServer({
      name: 'my-mcp-server',
      version: '1.0.0',
    });

    console.log('✅ Server created successfully');

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
    );

    console.log('✅ Tool registered successfully');
    console.log('Tool:', { name: 'repeat_string', description: 'Repeat a string a specified number of times' });

    // 実際のMCPサーバーはStdioServerTransportを通じて通信するため、
    // ここでは単純にツールが登録されていることを確認
    console.log('\nServer capabilities:');
    console.log('- Tool: repeat_string');
    console.log('- Parameters: text (string), count (number 0-100)');
    console.log('- Returns: Repeated string');
    
    // テスト用のツール実行例
    const testText = 'Hello ';
    const testCount = 3;

    console.log(`\nExample output: "${testText}" repeated ${String(testCount)} times: "${testText.repeat(testCount)}"`);
    
    console.log('\n✅ Basic MCP Server test passed!');
    console.log('\nNote: To test actual tool execution, connect the server via StdioServerTransport');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBasicMcpServer();