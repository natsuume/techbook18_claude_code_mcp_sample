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
async function checkDetailedSearchStructure() {
    console.log('Checking detailed Shirogohan.com search structure...\n');
    try {
        const keyword = '豚肉';
        const encodedKeyword = encodeURIComponent(keyword);
        const searchUrl = `https://www.sirogohan.com/recipe/index/keyword:${encodedKeyword}`;
        console.log(`Fetching: ${searchUrl}`);
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        console.log('\n=== Searching for recipe results ===\n');
        // 検索結果のコンテンツエリアを探す
        const searchResultSelectors = [
            '.recipe-search-result',
            '#recipe-search-result',
            '.search-result',
            '#search-result',
            '.result-list',
            '#result',
            'section.result',
            'div[class*="result"]'
        ];
        for (const selector of searchResultSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                console.log(`✓ Found search result area with selector: ${selector}`);
                console.log(`  Content preview: ${element.html()?.substring(0, 300)}...`);
            }
        }
        // レシピリンクを詳しく調査
        console.log('\n=== Recipe links analysis ===\n');
        const recipeLinks = $('a[href*="/recipe/"]');
        console.log(`Total recipe links found: ${recipeLinks.length}`);
        // 最初の10個のリンクを詳しく見る
        recipeLinks.slice(0, 10).each((i, elem) => {
            const $link = $(elem);
            const href = $link.attr('href');
            const text = $link.text().trim();
            const imgSrc = $link.find('img').attr('src');
            const parentClass = $link.parent().attr('class');
            console.log(`\nLink ${i + 1}:`);
            console.log(`  href: ${href}`);
            console.log(`  text: ${text}`);
            console.log(`  image: ${imgSrc}`);
            console.log(`  parent class: ${parentClass}`);
        });
        // 画像付きのレシピリンクを探す
        console.log('\n=== Recipe links with images ===\n');
        const recipeWithImages = $('a[href*="/recipe/"]').filter((i, elem) => {
            return $(elem).find('img').length > 0;
        });
        console.log(`Found ${recipeWithImages.length} recipe links with images`);
        recipeWithImages.slice(0, 5).each((i, elem) => {
            const $link = $(elem);
            const href = $link.attr('href');
            const imgSrc = $link.find('img').attr('src');
            const imgAlt = $link.find('img').attr('alt');
            console.log(`\nRecipe ${i + 1}:`);
            console.log(`  href: ${href}`);
            console.log(`  image: ${imgSrc}`);
            console.log(`  alt text: ${imgAlt}`);
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
}
checkDetailedSearchStructure();
