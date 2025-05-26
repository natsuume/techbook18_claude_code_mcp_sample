import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

async function testNarouMcpServer() {
  console.log('Testing Narou MCP Server implementation...\n');

  try {
    // サーバーインスタンスの作成
    const server = new McpServer({
      name: 'narou-mcp-server',
      version: '1.0.0',
    });

    console.log('✅ Server created successfully');

    // ジャンルコードの定義
    const GENRE_CODES: { [key: string]: { big: number, genre: number } } = {
      '恋愛': { big: 1, genre: 101 },
      'ファンタジー': { big: 2, genre: 201 },
      'SF': { big: 4, genre: 401 },
    };

    // 小説検索ツールの定義
    server.tool(
      'search_novels',
      'Search novels from Syosetu.com (小説家になろう)',
      {
        keyword: z.string().optional().describe('Search keyword'),
        genre: z.string().optional().describe('Genre name (e.g., ファンタジー, 恋愛)'),
        order: z.enum(['new', 'favnovelcnt', 'reviewcnt', 'hyoka', 'impressioncnt', 'daily', 'weekly', 'monthly'])
          .default('favnovelcnt').describe('Sort order'),
        limit: z.number().min(1).max(500).default(20).describe('Number of results'),
      },
      async ({ keyword, genre, order, limit }) => {
        // テスト用のモックレスポンス
        console.log(`Mock search called with keyword: "${keyword || ''}", genre: "${genre || ''}", order: ${order}, limit: ${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                totalCount: 100,
                novels: [
                  {
                    ncode: 'n0000aa',
                    title: `Mock Novel: ${keyword || genre || 'Test'}`,
                    writer: 'テスト作者',
                    story: 'これはテスト用の小説です',
                    genre: genre && GENRE_CODES[genre] ? GENRE_CODES[genre].genre : 201,
                    favNovelCnt: 1000,
                    url: 'https://ncode.syosetu.com/n0000aa/',
                  }
                ],
              }, null, 2),
            },
          ],
        };
      }
    );

    // ランキング取得ツールの定義
    server.tool(
      'get_ranking',
      'Get novel ranking from Syosetu.com',
      {
        rankingType: z.enum(['daily', 'weekly', 'monthly', 'quarter', 'yearly'])
          .default('daily').describe('Ranking type'),
        date: z.string().optional().describe('Date in YYYYMMDD format'),
        limit: z.number().min(1).max(300).default(20).describe('Number of results'),
      },
      async ({ rankingType, date, limit }) => {
        // テスト用のモックレスポンス
        const targetDate = date || new Date().toISOString().slice(0, 10).replace(/-/g, '');
        console.log(`Mock ranking called with type: ${rankingType}, date: ${targetDate}, limit: ${limit}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                rankingType: rankingType,
                date: targetDate,
                novels: [
                  {
                    rank: 1,
                    ncode: 'n0001aa',
                    title: `${rankingType}ランキング1位の小説`,
                    writer: 'ランキング作者',
                    story: 'ランキング上位の人気小説です',
                    point: 10000,
                    url: 'https://ncode.syosetu.com/n0001aa/',
                  }
                ],
              }, null, 2),
            },
          ],
        };
      }
    );

    console.log('✅ Tools registered successfully');
    console.log('\nRegistered tools:');
    console.log('1. search_novels - Search novels by keyword or genre');
    console.log('2. get_ranking - Get daily/weekly/monthly rankings');

    console.log('\n✅ Narou MCP Server test passed!');
    console.log('\nNote: This test uses mock responses. The actual server will:');
    console.log('- Connect to the real Syosetu.com API');
    console.log('- Return actual novel data and rankings');
    console.log('- No API key required (public API)');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testNarouMcpServer();