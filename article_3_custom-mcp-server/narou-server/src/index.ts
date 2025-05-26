// src/narou-server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'narou-mcp-server',
  version: '1.0.0',
});

// API responseの型定義
interface NovelData {
  ncode: string;
  title: string;
  writer: string;
  story: string;
  genre: number;
  keyword: string;
  general_all_no: number;
  global_point: number;
  daily_point: number;
  weekly_point: number;
  monthly_point: number;
  yearly_point: number;
  fav_novel_cnt: number;
  impression_cnt: number;
  review_cnt: number;
  all_point: number;
}

interface ApiResponse {
  allcount: number;
}

type NovelApiResponse = [ApiResponse, ...NovelData[]];
type RankingApiResponse = [ApiResponse, ...NovelData[]];

// ジャンルコードの定義
const GENRE_CODES: Record<string, { big: number, genre: number }> = {
  '恋愛': { big: 1, genre: 101 },
  '異世界恋愛': { big: 1, genre: 102 },
  'ファンタジー': { big: 2, genre: 201 },
  'ハイファンタジー': { big: 2, genre: 201 },
  'ローファンタジー': { big: 2, genre: 202 },
  '文芸': { big: 3, genre: 301 },
  '純文学': { big: 3, genre: 301 },
  'ヒューマンドラマ': { big: 3, genre: 302 },
  'SF': { big: 4, genre: 401 },
  'VRゲーム': { big: 4, genre: 402 },
  'ミステリー': { big: 5, genre: 501 },
  'ホラー': { big: 5, genre: 502 },
};

// 小説検索ツール
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
    try {
      const params = new URLSearchParams();

      params.append('out', 'json');
      params.append('lim', limit.toString());
      params.append('order', order);

      if (keyword) {
        params.append('word', keyword);
      }

      if (genre && genre in GENRE_CODES) {
        params.append('genre', GENRE_CODES[genre].genre.toString());
      }

      const response = await fetch(`https://api.syosetu.com/novelapi/api/?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json() as NovelApiResponse;
      
      // 最初の要素は検索結果の総数なので除外
      const novels = data.slice(1).map((novel) => {
        const novelData = novel as NovelData;

        return {
          ncode: novelData.ncode,
          title: novelData.title,
          writer: novelData.writer,
          story: novelData.story,
          genre: novelData.genre,
          keywords: novelData.keyword,
          generalAllNo: novelData.general_all_no,  // 総合評価ポイント
          globalPoint: novelData.global_point,      // ブックマーク数
          dailyPoint: novelData.daily_point,        // 日間ポイント
          weeklyPoint: novelData.weekly_point,      // 週間ポイント
          monthlyPoint: novelData.monthly_point,    // 月間ポイント
          yearlyPoint: novelData.yearly_point,      // 年間ポイント
          favNovelCnt: novelData.fav_novel_cnt,    // ブックマーク数
          impressionCnt: novelData.impression_cnt,  // 感想数
          reviewCnt: novelData.review_cnt,          // レビュー数
          allPoint: novelData.all_point,            // 総合評価ポイント
          url: `https://ncode.syosetu.com/${novelData.ncode}/`,
        };
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              totalCount: data[0].allcount,
              novels: novels,
            }, undefined, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching novels: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ランキング取得ツール
server.tool(
  'get_ranking',
  'Get novel ranking from Syosetu.com',
  {
    rankingType: z.enum(['daily', 'weekly', 'monthly', 'quarter', 'yearly'])
      .default('daily').describe('Ranking type'),
    date: z.string().optional().describe('Date in YYYYMMDD format (defaults to yesterday)'),
    limit: z.number().min(1).max(300).default(20).describe('Number of results'),
  },
  async ({ rankingType, date, limit }) => {
    try {
      // 日付が指定されていない場合は昨日の日付を使用
      const targetDate = date ?? (() => {
        const yesterday = new Date();

        yesterday.setDate(yesterday.getDate() - 1);

        return yesterday.toISOString().slice(0, 10).replace(/-/g, '');
      })();

      const rankingTypeMap: Record<string, string> = {
        'daily': 'daily',
        'weekly': 'weekly',
        'monthly': 'monthly',
        'quarter': 'quarter',
        'yearly': 'yearly',
      };

      const response = await fetch(
        `https://api.syosetu.com/novelapi/api/?out=json&lim=${String(limit)}&order=${rankingTypeMap[rankingType]}point&rtype=${targetDate}-${rankingTypeMap[rankingType]}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json() as RankingApiResponse;
      const pointKey = `${rankingTypeMap[rankingType]}_point` as keyof NovelData;
      const novels = data.slice(1).map((novel, index) => {
        const novelData = novel as NovelData;

        return {
          rank: index + 1,
          ncode: novelData.ncode,
          title: novelData.title,
          writer: novelData.writer,
          story: novelData.story,
          point: novelData[pointKey],
          url: `https://ncode.syosetu.com/${novelData.ncode}/`,
        };
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              rankingType: rankingType,
              date: targetDate,
              novels: novels,
            }, undefined, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching ranking: ${error instanceof Error ? error.message : String(error)}`,
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
  console.error('Narou MCP server started');
}

main().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});