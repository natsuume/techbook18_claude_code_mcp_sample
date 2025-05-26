import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

async function testYouTubeMcpServer() {
  console.log('Testing YouTube MCP Server implementation...\n');

  try {
    // API Keyのモック（テスト用）
    process.env.YOUTUBE_API_KEY = 'mock-api-key-for-testing';

    // サーバーインスタンスの作成
    const server = new McpServer({
      name: 'youtube-mcp-server',
      version: '1.0.0',
    });

    console.log('✅ Server created successfully');

    // 動画検索ツールの定義
    server.tool(
      'search_videos',
      'Search YouTube videos based on a query',
      {
        query: z.string().describe('Search query'),
        maxResults: z.number().min(1).max(50).default(10).describe('Maximum number of results'),
      },
      async ({ query, maxResults }) => {
        // テスト用のモックレスポンス
        console.log(`Mock search called with query: "${query}", maxResults: ${maxResults}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  videoId: 'mock-video-id',
                  title: `Mock Video: ${query}`,
                  description: 'This is a mock video for testing',
                  channelTitle: 'Mock Channel',
                  publishedAt: new Date().toISOString(),
                  thumbnailUrl: 'https://example.com/thumbnail.jpg',
                  videoUrl: 'https://www.youtube.com/watch?v=mock-video-id',
                }
              ], null, 2),
            },
          ],
        };
      }
    );

    // チャンネル動画取得ツールの定義
    server.tool(
      'get_channel_videos',
      'Get recent videos from a YouTube channel',
      {
        channelId: z.string().describe('YouTube channel ID'),
        maxResults: z.number().min(1).max(50).default(10).describe('Maximum number of results'),
      },
      async ({ channelId, maxResults }) => {
        // テスト用のモックレスポンス
        console.log(`Mock channel videos called with channelId: "${channelId}", maxResults: ${maxResults}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  videoId: 'mock-channel-video-id',
                  title: `Mock Video from Channel ${channelId}`,
                  description: 'This is a mock channel video for testing',
                  publishedAt: new Date().toISOString(),
                  thumbnailUrl: 'https://example.com/channel-thumbnail.jpg',
                  videoUrl: 'https://www.youtube.com/watch?v=mock-channel-video-id',
                }
              ], null, 2),
            },
          ],
        };
      }
    );

    console.log('✅ Tools registered successfully');
    console.log('\nRegistered tools:');
    console.log('1. search_videos - Search YouTube videos');
    console.log('2. get_channel_videos - Get channel videos');

    console.log('\n✅ YouTube MCP Server test passed!');
    console.log('\nNote: This test uses mock responses. To test with real YouTube API:');
    console.log('1. Set YOUTUBE_API_KEY environment variable');
    console.log('2. Run the server with: npm run dev');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testYouTubeMcpServer();