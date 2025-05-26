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
// レシピ詳細ページの詳細な構造分析
const cheerio = __importStar(require("cheerio"));
async function testRecipeDetailsDeep() {
    console.log('Deep analysis of recipe details page...\n');
    const recipeId = 'tonjiru';
    const recipeUrl = `https://www.sirogohan.com/recipe/${recipeId}/`;
    console.log(`Fetching recipe: ${recipeId}`);
    console.log(`URL: ${recipeUrl}\n`);
    const response = await fetch(recipeUrl);
    if (!response.ok) {
        throw new Error(`HTTP error: ${String(response.status)}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    console.log('=== Looking for content sections ===\n');
    // セクションを探す
    const sections = $('section, div.section, div[class*="content"]');
    sections.each((i, elem) => {
        const $section = $(elem);
        const className = $section.attr('class');
        const id = $section.attr('id');
        const heading = $section.find('h2, h3').first().text().trim();
        if (heading || className?.includes('recipe') || id?.includes('recipe')) {
            console.log(`Section ${i + 1}:`);
            console.log(`  Class: ${className}`);
            console.log(`  ID: ${id}`);
            console.log(`  Heading: ${heading}`);
            // リストを探す
            const lists = $section.find('ul, ol');
            if (lists.length > 0) {
                console.log(`  Lists found: ${lists.length}`);
                lists.each((j, list) => {
                    const items = $(list).find('li');
                    console.log(`    List ${j + 1}: ${items.length} items`);
                    if (items.length > 0) {
                        console.log(`      First item: ${items.first().text().trim().substring(0, 50)}...`);
                    }
                });
            }
        }
    });
    console.log('\n=== Looking for recipe data by text patterns ===\n');
    // 材料っぽいテキストを探す
    $('*').each((_, elem) => {
        const text = $(elem).text().trim();
        if (text && (text.includes('材料') || text.includes('分量')) && text.length < 50) {
            const $elem = $(elem);
            console.log(`Found "材料" in: ${$elem.prop('tagName')}.${$elem.attr('class')}`);
            // 次の要素を確認
            const $next = $elem.next();
            if ($next.length > 0) {
                console.log(`  Next element: ${$next.prop('tagName')}`);
                if ($next.is('ul, ol')) {
                    const items = $next.find('li');
                    console.log(`  Found list with ${items.length} items`);
                    items.slice(0, 3).each((i, item) => {
                        console.log(`    ${i + 1}. ${$(item).text().trim()}`);
                    });
                }
            }
            // 親要素の中のリストを確認
            const $parent = $elem.parent();
            const $lists = $parent.find('ul, ol');
            if ($lists.length > 0) {
                console.log(`  Found list in parent:`);
                const items = $lists.first().find('li');
                items.slice(0, 3).each((i, item) => {
                    console.log(`    ${i + 1}. ${$(item).text().trim()}`);
                });
            }
            return false; // 最初の材料セクションで止める
        }
    });
    console.log('\n=== Table structures ===\n');
    // テーブル構造を探す
    const tables = $('table');
    if (tables.length > 0) {
        console.log(`Found ${tables.length} tables`);
        tables.each((i, table) => {
            const $table = $(table);
            const rows = $table.find('tr');
            console.log(`Table ${i + 1}: ${rows.length} rows`);
            rows.slice(0, 3).each((j, row) => {
                const cells = $(row).find('td, th');
                const cellTexts = cells.map((_, cell) => $(cell).text().trim()).get();
                console.log(`  Row ${j + 1}: ${cellTexts.join(' | ')}`);
            });
        });
    }
}
testRecipeDetailsDeep().catch(console.error);
