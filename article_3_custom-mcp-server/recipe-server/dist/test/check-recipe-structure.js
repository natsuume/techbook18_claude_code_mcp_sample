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
async function checkRecipeStructure() {
    console.log('Checking recipe list structure...\n');
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
        console.log('\n=== Looking for recipe list containers ===\n');
        // ulやolタグを探す
        const listSelectors = ['ul', 'ol', 'div.list', 'section'];
        for (const selector of listSelectors) {
            const lists = $(selector);
            lists.each((i, elem) => {
                const $list = $(elem);
                const recipeLinks = $list.find('a[href*="/recipe/"]');
                if (recipeLinks.length > 5) { // 5個以上のレシピリンクがある場合
                    const className = $list.attr('class');
                    const id = $list.attr('id');
                    console.log(`\nFound potential recipe list:`);
                    console.log(`  Tag: ${selector}`);
                    console.log(`  Class: ${className}`);
                    console.log(`  ID: ${id}`);
                    console.log(`  Recipe links: ${recipeLinks.length}`);
                    // 最初のレシピアイテムの構造を見る
                    const firstItem = $list.children().first();
                    console.log(`  First item tag: ${firstItem.prop('tagName')}`);
                    console.log(`  First item class: ${firstItem.attr('class')}`);
                    // レシピ情報の抽出パターンを分析
                    const firstRecipeLink = recipeLinks.first();
                    const href = firstRecipeLink.attr('href');
                    if (href && href !== '/recipe/') {
                        console.log(`\n  Analyzing recipe structure for: ${href}`);
                        // 同じhrefを持つリンクを探す（画像とテキストのペア）
                        const sameHrefLinks = $list.find(`a[href="${href}"]`);
                        console.log(`  Links with same href: ${sameHrefLinks.length}`);
                        sameHrefLinks.each((j, link) => {
                            const $link = $(link);
                            const hasImage = $link.find('img').length > 0;
                            const text = $link.text().trim();
                            const imgAlt = $link.find('img').attr('alt');
                            console.log(`    Link ${j + 1}: ${hasImage ? 'Image' : 'Text'} - "${hasImage ? imgAlt : text}"`);
                        });
                    }
                    return false; // 最初の有望なリストで止める
                }
            });
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}
checkRecipeStructure();
