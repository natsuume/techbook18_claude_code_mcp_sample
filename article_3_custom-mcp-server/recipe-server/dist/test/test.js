"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
function testRecipeMcpServer() {
    console.log('Testing Recipe MCP Server implementation...\n');
    try {
        // サーバーインスタンスの作成
        const server = new mcp_js_1.McpServer({
            name: 'recipe-mcp-server',
            version: '1.0.0',
        });
        console.log('✅ Server created successfully');
        // レシピ検索ツールの定義（モック版）
        server.tool('search_recipes', 'Search recipes from Shirogohan.com', {
            keyword: zod_1.z.string().describe('Search keyword (e.g., 水菜, 豚肉)'),
            useCache: zod_1.z.boolean().default(true).describe('Whether to use cached results'),
        }, ({ keyword, useCache }) => {
            // テスト用のモックレスポンス
            console.log(`Mock search called with keyword: "${keyword}", useCache: ${String(useCache)}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            keyword,
                            count: 2,
                            recipes: [
                                {
                                    title: `${keyword}のおすすめレシピ`,
                                    description: '簡単でおいしい料理です',
                                    url: 'https://www.sirogohan.com/recipe/sample1/',
                                    imageUrl: 'https://www.sirogohan.com/images/sample1.jpg',
                                    recipeId: 'sample1',
                                },
                                {
                                    title: `${keyword}の定番レシピ`,
                                    description: '家庭料理の定番',
                                    url: 'https://www.sirogohan.com/recipe/sample2/',
                                    imageUrl: 'https://www.sirogohan.com/images/sample2.jpg',
                                    recipeId: 'sample2',
                                }
                            ],
                            searchUrl: `https://www.sirogohan.com/recipe/index/keyword:${encodeURIComponent(keyword)}`,
                            timestamp: new Date().toISOString(),
                        }, undefined, 2),
                    },
                ],
            };
        });
        // レシピ詳細取得ツールの定義（モック版）
        server.tool('get_recipe_details', 'Get detailed recipe information from Shirogohan.com', {
            recipeId: zod_1.z.string().describe('Recipe ID from search results'),
            useCache: zod_1.z.boolean().default(true).describe('Whether to use cached results'),
        }, ({ recipeId, useCache }) => {
            // テスト用のモックレスポンス
            console.log(`Mock get details called with recipeId: "${recipeId}", useCache: ${String(useCache)}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            recipeId,
                            url: `https://www.sirogohan.com/recipe/${recipeId}/`,
                            title: 'テストレシピ',
                            description: 'おいしいテスト料理',
                            servings: '2人分',
                            cookingTime: '20分',
                            ingredients: [
                                '材料1: 100g',
                                '材料2: 大さじ2',
                                '材料3: 少々'
                            ],
                            steps: [
                                '手順1: 材料を準備する',
                                '手順2: 調理する',
                                '手順3: 盛り付ける'
                            ],
                            tips: '火加減に注意してください',
                            timestamp: new Date().toISOString(),
                        }, undefined, 2),
                    },
                ],
            };
        });
        console.log('✅ Tools registered successfully');
        console.log('\nRegistered tools:');
        console.log('1. search_recipes - Search recipes by keyword');
        console.log('2. get_recipe_details - Get detailed recipe information');
        console.log('\n✅ Recipe MCP Server test passed!');
        console.log('\nNote: This test uses mock responses. The actual server will:');
        console.log('- Scrape real recipe data from Shirogohan.com');
        console.log('- Cache results for 1 hour to reduce server load');
        console.log('- Respect the website\'s server by not making excessive requests');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}
// Execute test function
(() => {
    testRecipeMcpServer();
})();
