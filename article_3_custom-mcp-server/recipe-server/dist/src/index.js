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
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...cached.data,
                                fromCache: true,
                            }, undefined, 2),
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
            throw new Error(`HTTP error: ${String(response.status)}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        const recipes = [];
        const processedUrls = new Set(); // 重複を避けるため
        // レシピ情報の抽出
        $('ul.recipe_list li').each((_, element) => {
            const $item = $(element);
            const $links = $item.find('a[href*="/recipe/"]');
            if ($links.length >= 2) {
                // 画像リンクとテキストリンクのペアを処理
                const href = $links.first().attr('href');
                if (href && !href.startsWith('/recipe/index') && !processedUrls.has(href)) {
                    processedUrls.add(href);
                    // 画像リンクを探す
                    const $imageLink = $links.filter((_, el) => $(el).find('img').length > 0).first();
                    const $textLink = $links.filter((_, el) => $(el).find('img').length === 0).first();
                    const title = $textLink.text().trim();
                    const imageUrl = $imageLink.find('img').attr('src');
                    const imageAlt = $imageLink.find('img').attr('alt');
                    // recipeIdを抽出（例: /recipe/ma-bo-hakusai/ → ma-bo-hakusai）
                    const recipeIdMatch = /\/recipe\/([^/]+)\//.exec(href);
                    const recipeId = recipeIdMatch?.[1];
                    if (title && recipeId) {
                        recipes.push({
                            title,
                            description: imageAlt?.replace('の写真', '') ?? '',
                            url: `https://www.sirogohan.com${href}`,
                            imageUrl: imageUrl ? `https://www.sirogohan.com${imageUrl}` : undefined,
                            recipeId,
                        });
                    }
                }
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
                    text: JSON.stringify(result, undefined, 2),
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
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...cached.data,
                                fromCache: true,
                            }, undefined, 2),
                        },
                    ],
                };
            }
        }
        const recipeUrl = `https://www.sirogohan.com/recipe/${recipeId}/`;
        const response = await fetch(recipeUrl);
        if (!response.ok) {
            throw new Error(`HTTP error: ${String(response.status)}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        // レシピ詳細の抽出
        const title = $('h1').first().text().trim() || '';
        const description = $('.recipe-description').text().trim() || '';
        // 材料セクションから分量を抽出
        const materialTitle = $('section.material h2').text();
        const servingsMatch = /\(([^)]+)\)/.exec(materialTitle);
        const servings = servingsMatch?.[1] ?? '';
        // 調理時間は材料リストから抽出することが多い
        let cookingTime = '';
        $('section.material li').each((_, element) => {
            const text = $(element).text();
            if (text.includes('分')) {
                const timeMatch = /(\d+分)/.exec(text);
                if (timeMatch) {
                    cookingTime = timeMatch[1];
                    return false;
                }
            }
        });
        // 材料リストの抽出
        const ingredients = [];
        $('section.material ul li').each((_, element) => {
            const text = $(element).text().trim();
            // 調理時間などの行を除外
            if (text && !text.includes('調理時間')) {
                ingredients.push(text);
            }
        });
        // 作り方の抽出
        const steps = [];
        $('section.howto').each((_, section) => {
            // 各手順のテキストを探す
            $(section).find('p, div').each((_, element) => {
                const $elem = $(element);
                const text = $elem.text().trim();
                // 手順番号や画像説明を除外
                if (text &&
                    !$elem.hasClass('howto-num') &&
                    !$elem.hasClass('step-number') &&
                    text.length > 10) {
                    // 親要素が手順を含む要素の場合
                    const parentClass = $elem.parent().attr('class') ?? '';
                    if (parentClass.includes('howto') || parentClass.includes('step')) {
                        steps.push(text);
                    }
                }
            });
        });
        // ポイントやコツの抽出
        let tips = '';
        // レシピのポイントセクションを探す
        const $pointSection = $('section.point, div.recipe-point, div.tips');
        if ($pointSection.length > 0) {
            tips = $pointSection.text().trim();
        }
        else {
            // 補足情報を探す
            $('p').each((_, element) => {
                const text = $(element).text();
                if (text.includes('ポイント') || text.includes('コツ')) {
                    tips = text.trim();
                    return false;
                }
            });
        }
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
                    text: JSON.stringify(result, undefined, 2),
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
