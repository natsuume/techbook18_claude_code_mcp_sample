"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/recipe-server.ts
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const cheerio = __importStar(require("cheerio"));
const server = new mcp_js_1.McpServer({
    name: 'recipe-mcp-server',
    version: '1.0.0',
});
// キャッシュの実装（簡易版）
const searchCache = new Map();
const CACHE_DURATION = 3600000; // 1時間
// レシピ検索ツール
server.tool('search_recipes', 'Search recipes from Shirogohan.com', {
    keyword: zod_1.z.string().describe('Search keyword (e.g., 水菜, 豚肉)'),
    useCache: zod_1.z.boolean().default(true).describe('Whether to use cached results'),
}, async ({ keyword, useCache }) => {
    try {
        // キャッシュの確認
        const cacheKey = `search:${keyword}`;
        if (useCache && searchCache.has(cacheKey)) {
            const cached = searchCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...cached.data,
                                fromCache: true,
                            }, null, 2),
                        },
                    ],
                };
            }
        }
        // URLエンコードされたキーワードで検索
        const encodedKeyword = encodeURIComponent(keyword);
        const searchUrl = `https://www.sirogohan.com/recipe/index/keyword:${encodedKeyword}`;
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        const recipes = [];
        // レシピ情報の抽出
        $('.recipe-list-item').each((index, element) => {
            const $item = $(element);
            const link = $item.find('a').attr('href');
            const title = $item.find('.recipe-title').text().trim();
            const description = $item.find('.recipe-description').text().trim();
            const imageUrl = $item.find('img').attr('src');
            if (link && title) {
                recipes.push({
                    title,
                    description,
                    url: `https://www.sirogohan.com${link}`,
                    imageUrl: imageUrl ? `https://www.sirogohan.com${imageUrl}` : null,
                    recipeId: link.match(/\/recipe\/(\w+)\//)?.[1] || null,
                });
            }
        });
        const result = {
            keyword,
            count: recipes.length,
            recipes,
            searchUrl,
            timestamp: new Date().toISOString(),
        };
        // キャッシュに保存
        searchCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error searching recipes: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
// レシピ詳細取得ツール
server.tool('get_recipe_details', 'Get detailed recipe information from Shirogohan.com', {
    recipeId: zod_1.z.string().describe('Recipe ID from search results'),
    useCache: zod_1.z.boolean().default(true).describe('Whether to use cached results'),
}, async ({ recipeId, useCache }) => {
    try {
        // キャッシュの確認
        const cacheKey = `recipe:${recipeId}`;
        if (useCache && searchCache.has(cacheKey)) {
            const cached = searchCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...cached.data,
                                fromCache: true,
                            }, null, 2),
                        },
                    ],
                };
            }
        }
        const recipeUrl = `https://www.sirogohan.com/recipe/${recipeId}/`;
        const response = await fetch(recipeUrl);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        // レシピ詳細の抽出
        const title = $('h1.recipe-name').text().trim();
        const description = $('.recipe-summary').text().trim();
        const servings = $('.recipe-servings').text().trim();
        const cookingTime = $('.recipe-time').text().trim();
        // 材料リストの抽出
        const ingredients = [];
        $('.ingredient-list li').each((index, element) => {
            ingredients.push($(element).text().trim());
        });
        // 作り方の抽出
        const steps = [];
        $('.howto-list li').each((index, element) => {
            steps.push($(element).text().trim());
        });
        // ポイントやコツの抽出
        const tips = $('.recipe-tips').text().trim();
        const result = {
            recipeId,
            url: recipeUrl,
            title,
            description,
            servings,
            cookingTime,
            ingredients,
            steps,
            tips,
            timestamp: new Date().toISOString(),
        };
        // キャッシュに保存
        searchCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error fetching recipe details: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('Recipe MCP server started');
}
main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
