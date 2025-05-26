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
async function checkSearchStructure() {
    console.log('Checking Shirogohan.com search structure...\n');
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
        console.log('\n=== Analyzing HTML structure ===\n');
        // いくつかの一般的なセレクタを試す
        const selectors = [
            '.recipe-list-item',
            '.recipe-item',
            '.recipe',
            'article',
            '.content-item',
            'li.recipe',
            'div[class*="recipe"]',
            'a[href*="/recipe/"]'
        ];
        for (const selector of selectors) {
            const count = $(selector).length;
            if (count > 0) {
                console.log(`✓ Found ${count} elements with selector: ${selector}`);
                // 最初の要素の構造を詳しく見る
                const first = $(selector).first();
                console.log(`  HTML sample: ${first.html()?.substring(0, 200)}...`);
                // リンクを探す
                const link = first.find('a').attr('href') || first.attr('href');
                if (link) {
                    console.log(`  Link found: ${link}`);
                }
                // タイトルを探す可能性のあるセレクタ
                const titleSelectors = ['.recipe-title', 'h2', 'h3', '.title', '.name'];
                for (const titleSel of titleSelectors) {
                    const title = first.find(titleSel).text().trim();
                    if (title) {
                        console.log(`  Title found with ${titleSel}: ${title}`);
                        break;
                    }
                }
            }
        }
        // bodyのクラスを確認
        console.log(`\nBody classes: ${$('body').attr('class')}`);
        // メタ情報を確認
        console.log(`\nPage title: ${$('title').text()}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
checkSearchStructure();
