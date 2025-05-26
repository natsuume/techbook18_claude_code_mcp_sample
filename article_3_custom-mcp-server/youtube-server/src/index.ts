// src/youtube-server.ts
import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// YouTube API型定義
interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  throw new Error('YOUTUBE_API_KEY environment variable is required');
}

const server = new McpServer({
  name: 'youtube-mcp-server',
  version: '1.0.0',
});

// 動画検索ツール
server.tool(
  'search_videos',
  'Search YouTube videos based on a query',
  {
    query: z.string().describe('Search query'),
    maxResults: z.number().min(1).max(50).default(10).describe('Maximum number of results'),
  },
  async ({ query, maxResults }) => {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');

    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', query);
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('key', YOUTUBE_API_KEY);

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json() as YouTubeSearchResponse;
      const videos = data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(videos, undefined, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching videos: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// チャンネルの最新動画取得ツール
server.tool(
  'get_channel_videos',
  'Get recent videos from a YouTube channel',
  {
    channelId: z.string().describe('YouTube channel ID'),
    maxResults: z.number().min(1).max(50).default(10).describe('Maximum number of results'),
  },
  async ({ channelId, maxResults }) => {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');

    url.searchParams.append('part', 'snippet');
    url.searchParams.append('channelId', channelId);
    url.searchParams.append('type', 'video');
    url.searchParams.append('order', 'date');
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('key', YOUTUBE_API_KEY);

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json() as YouTubeSearchResponse;
      const videos = data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(videos, undefined, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching channel videos: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error('YouTube MCP server started');
}

main().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});