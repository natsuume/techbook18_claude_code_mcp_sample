"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// レシピ詳細取得機能を直接テスト
const child_process_1 = require("child_process");
async function testDetailsFunction() {
    console.log('Testing recipe details function directly...\n');
    const testProcess = (0, child_process_1.spawn)('node', ['-e', `
    const cheerio = require('cheerio');

    async function runTest() {
      const recipeId = 'tonjiru';
      const recipeUrl = 'https://www.sirogohan.com/recipe/' + recipeId + '/';

      console.log('Fetching recipe:', recipeId);
      console.log('URL:', recipeUrl);

      try {
        const response = await fetch(recipeUrl);
        
        if (!response.ok) {
          throw new Error('HTTP error: ' + response.status);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // レシピ詳細の抽出
        const title = $('h1').first().text().trim() || '';
        const description = $('.recipe-description').text().trim() || '';
        
        // 材料セクションから分量を抽出
        const materialTitle = $('section.material h2').text();
        const servingsMatch = materialTitle.match(/\\(([^)]+)\\)/);
        const servings = servingsMatch?.[1] || '';

        // 材料リストの抽出
        const ingredients = [];
        $('section.material ul li').each((_, element) => {
          const text = $(element).text().trim();
          if (text && !text.includes('調理時間')) {
            ingredients.push(text);
          }
        });

        // 作り方の抽出（簡易版）
        const steps = [];
        $('section.howto').find('p').each((_, element) => {
          const text = $(element).text().trim();
          if (text.length > 20) {
            steps.push(text);
          }
        });

        console.log('\\n=== Recipe Details ===');
        console.log('Title:', title);
        console.log('Servings:', servings);
        console.log('Description:', description.substring(0, 50) + '...');
        console.log('\\nIngredients (' + ingredients.length + ' items):');
        ingredients.slice(0, 5).forEach((ing, i) => {
          console.log('  ' + (i + 1) + '.', ing);
        });
        if (ingredients.length > 5) {
          console.log('  ... and', ingredients.length - 5, 'more');
        }
        console.log('\\nSteps (' + steps.length + ' steps):');
        steps.slice(0, 3).forEach((step, i) => {
          console.log('  ' + (i + 1) + '.', step.substring(0, 50) + '...');
        });
        if (steps.length > 3) {
          console.log('  ... and', steps.length - 3, 'more steps');
        }

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
testDetailsFunction().catch(console.error);
