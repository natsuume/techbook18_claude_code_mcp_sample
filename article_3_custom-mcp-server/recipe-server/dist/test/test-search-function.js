"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 検索機能を直接実行してテスト
const child_process_1 = require("child_process");
async function testSearchFunction() {
    console.log('Testing recipe search function directly...\n');
    const testProcess = (0, child_process_1.spawn)('node', ['-e', `
    const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
    const { z } = require('zod');
    const cheerio = require('cheerio');

    async function runTest() {
      const keyword = '豚肉';
      const encodedKeyword = encodeURIComponent(keyword);
      const searchUrl = 'https://www.sirogohan.com/recipe/index/keyword:' + encodedKeyword;

      console.log('Searching for:', keyword);
      console.log('URL:', searchUrl);

      try {
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
          throw new Error('HTTP error: ' + response.status);
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
            const href = $links.first().attr('href');

            if (href && !href.startsWith('/recipe/index') && !processedUrls.has(href)) {
              processedUrls.add(href);

              const $imageLink = $links.filter((_, el) => $(el).find('img').length > 0).first();
              const $textLink = $links.filter((_, el) => $(el).find('img').length === 0).first();

              const title = $textLink.text().trim();
              const imageUrl = $imageLink.find('img').attr('src');
              const recipeIdMatch = href.match(/\\/recipe\\/([^\\/]+)\\//);
              const recipeId = recipeIdMatch?.[1];

              if (title && recipeId) {
                recipes.push({
                  title,
                  recipeId,
                  url: 'https://www.sirogohan.com' + href,
                  hasImage: !!imageUrl
                });
              }
            }
          }
        });

        console.log('\\nFound', recipes.length, 'recipes');
        console.log('\\nFirst 5 recipes:');
        recipes.slice(0, 5).forEach((recipe, i) => {
          console.log((i + 1) + '.', recipe.title);
          console.log('   ID:', recipe.recipeId);
          console.log('   Image:', recipe.hasImage ? 'Yes' : 'No');
        });

      } catch (error) {
        console.error('Error:', error.message);
      }
    }

    runTest();
  `]);
    testProcess.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    testProcess.stderr.on('data', (data) => {
        console.error(data.toString());
    });
    testProcess.on('close', (code) => {
        console.log(`\nTest process exited with code ${code}`);
    });
}
testSearchFunction().catch(console.error);
