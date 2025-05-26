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
const cheerio = __importStar(require("cheerio"));
// 実際の検索ロジックをテスト
async function testActualSearch() {
    console.log('Testing actual search function...\n');
    const keyword = '豚肉';
    const encodedKeyword = encodeURIComponent(keyword);
    const searchUrl = `https://www.sirogohan.com/recipe/index/keyword:${encodedKeyword}`;
    console.log(`Searching for: ${keyword}`);
    console.log(`URL: ${searchUrl}\n`);
    const response = await fetch(searchUrl);
    if (!response.ok) {
        throw new Error(`HTTP error: ${String(response.status)}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const recipes = [];
    const processedUrls = new Set();
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
                const recipeIdMatch = href.match(/\/recipe\/([^\/]+)\//);
                const recipeId = recipeIdMatch?.[1];
                if (title && recipeId) {
                    recipes.push({
                        title,
                        description: imageAlt?.replace('の写真', '') || '',
                        url: `https://www.sirogohan.com${href}`,
                        imageUrl: imageUrl ? `https://www.sirogohan.com${imageUrl}` : undefined,
                        recipeId,
                    });
                }
            }
        }
    });
    console.log(`Found ${recipes.length} recipes\n`);
    // 最初の5件を表示
    console.log('First 5 recipes:');
    recipes.slice(0, 5).forEach((recipe, index) => {
        console.log(`\n${index + 1}. ${recipe.title}`);
        console.log(`   ID: ${recipe.recipeId}`);
        console.log(`   URL: ${recipe.url}`);
        console.log(`   Image: ${recipe.imageUrl ? 'Yes' : 'No'}`);
    });
}
testActualSearch().catch(console.error);
