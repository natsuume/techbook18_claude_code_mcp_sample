"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 検索と詳細取得を組み合わせたテスト
const child_process_1 = require("child_process");
async function testCombinedUsage() {
    console.log('Testing combined search and detail retrieval...\n');
    const testProcess = (0, child_process_1.spawn)('node', ['-e', `
    const cheerio = require('cheerio');

    async function searchRecipes(keyword) {
      const encodedKeyword = encodeURIComponent(keyword);
      const searchUrl = 'https://www.sirogohan.com/recipe/index/keyword:' + encodedKeyword;

      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error('HTTP error: ' + response.status);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const recipes = [];
      const processedUrls = new Set();

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
            const recipeIdMatch = href.match(/\\/recipe\\/([^\\/]+)\\//);
            const recipeId = recipeIdMatch?.[1];

            if (title && recipeId) {
              recipes.push({
                title,
                recipeId,
                url: 'https://www.sirogohan.com' + href
              });
            }
          }
        }
      });

      return recipes;
    }

    async function getRecipeDetails(recipeId) {
      const recipeUrl = 'https://www.sirogohan.com/recipe/' + recipeId + '/';
      const response = await fetch(recipeUrl);
      
      if (!response.ok) {
        throw new Error('HTTP error: ' + response.status);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $('h1').first().text().trim() || '';
      const description = $('.recipe-description').text().trim() || '';
      
      const materialTitle = $('section.material h2').text();
      const servingsMatch = materialTitle.match(/\\(([^)]+)\\)/);
      const servings = servingsMatch?.[1] || '';

      const ingredients = [];
      $('section.material ul li').each((_, element) => {
        const text = $(element).text().trim();
        if (text && !text.includes('調理時間')) {
          ingredients.push(text);
        }
      });

      const steps = [];
      $('section.howto').find('p').each((_, element) => {
        const text = $(element).text().trim();
        if (text.length > 20) {
          steps.push(text);
        }
      });

      return { title, description, servings, ingredients, steps };
    }

    async function runTest() {
      try {
        console.log('Step 1: Searching for recipes with "豚肉 大根"...');
        const recipes = await searchRecipes('豚肉 大根');
        console.log('Found', recipes.length, 'recipes\\n');

        if (recipes.length > 0) {
          // 大根を含むレシピを優先
          const daikonRecipe = recipes.find(r => r.title.includes('大根')) || recipes[0];
          
          console.log('Step 2: Selected recipe:', daikonRecipe.title);
          console.log('Recipe ID:', daikonRecipe.recipeId, '\\n');

          console.log('Step 3: Getting recipe details...');
          const details = await getRecipeDetails(daikonRecipe.recipeId);

          console.log('\\n=== レシピ詳細 ===');
          console.log('料理名:', details.title);
          console.log('分量:', details.servings);
          console.log('\\n説明:', details.description);
          console.log('\\n材料:');
          details.ingredients.forEach((ing, i) => {
            console.log('  ' + (i + 1) + '.', ing);
          });
          console.log('\\n作り方:');
          details.steps.forEach((step, i) => {
            console.log('  ' + (i + 1) + '.', step.substring(0, 60) + '...');
          });
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
testCombinedUsage().catch(console.error);
