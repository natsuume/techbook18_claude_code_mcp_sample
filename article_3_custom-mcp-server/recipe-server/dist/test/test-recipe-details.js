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
// レシピ詳細取得のテスト
const cheerio = __importStar(require("cheerio"));
async function testRecipeDetails() {
    console.log('Testing recipe details extraction...\n');
    const recipeId = 'tonjiru'; // 豚汁
    const recipeUrl = `https://www.sirogohan.com/recipe/${recipeId}/`;
    console.log(`Fetching recipe: ${recipeId}`);
    console.log(`URL: ${recipeUrl}\n`);
    const response = await fetch(recipeUrl);
    if (!response.ok) {
        throw new Error(`HTTP error: ${String(response.status)}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    console.log('=== Analyzing recipe page structure ===\n');
    // タイトル
    const titleSelectors = ['h1.recipe-name', 'h1', '.recipe-title', 'h2.recipe-name'];
    let title = '';
    for (const selector of titleSelectors) {
        const found = $(selector).text().trim();
        if (found) {
            console.log(`✓ Title found with ${selector}: "${found}"`);
            title = found;
            break;
        }
    }
    // 説明
    const descSelectors = ['.recipe-summary', '.recipe-description', '.summary', 'p.lead'];
    let description = '';
    for (const selector of descSelectors) {
        const found = $(selector).text().trim();
        if (found) {
            console.log(`✓ Description found with ${selector}: "${found.substring(0, 50)}..."`);
            description = found;
            break;
        }
    }
    // 分量
    const servingSelectors = ['.recipe-servings', '.servings', '.recipe-yield', 'span[class*="serving"]'];
    let servings = '';
    for (const selector of servingSelectors) {
        const found = $(selector).text().trim();
        if (found) {
            console.log(`✓ Servings found with ${selector}: "${found}"`);
            servings = found;
            break;
        }
    }
    // 調理時間
    const timeSelectors = ['.recipe-time', '.cooking-time', '.time', 'span[class*="time"]'];
    let cookingTime = '';
    for (const selector of timeSelectors) {
        const found = $(selector).text().trim();
        if (found && found.includes('分')) {
            console.log(`✓ Cooking time found with ${selector}: "${found}"`);
            cookingTime = found;
            break;
        }
    }
    // 材料
    console.log('\n=== Ingredients ===');
    const ingredientSelectors = ['.ingredient-list li', '.ingredients li', 'ul.ingredients li', '.recipe-ingredients li'];
    let ingredients = [];
    for (const selector of ingredientSelectors) {
        const items = $(selector);
        if (items.length > 0) {
            console.log(`✓ Found ${items.length} ingredients with ${selector}`);
            items.each((_, el) => {
                const text = $(el).text().trim();
                if (text)
                    ingredients.push(text);
            });
            // 最初の3つを表示
            ingredients.slice(0, 3).forEach(ing => console.log(`  - ${ing}`));
            if (ingredients.length > 3)
                console.log(`  ... and ${ingredients.length - 3} more`);
            break;
        }
    }
    // 作り方
    console.log('\n=== Instructions ===');
    const stepSelectors = ['.howto-list li', '.instructions li', '.steps li', '.recipe-steps li', '.procedure li'];
    let steps = [];
    for (const selector of stepSelectors) {
        const items = $(selector);
        if (items.length > 0) {
            console.log(`✓ Found ${items.length} steps with ${selector}`);
            items.each((_, el) => {
                const text = $(el).text().trim();
                if (text)
                    steps.push(text);
            });
            // 最初の2つを表示
            steps.slice(0, 2).forEach((step, i) => console.log(`  ${i + 1}. ${step.substring(0, 50)}...`));
            if (steps.length > 2)
                console.log(`  ... and ${steps.length - 2} more steps`);
            break;
        }
    }
    // ポイント・コツ
    console.log('\n=== Tips ===');
    const tipSelectors = ['.recipe-tips', '.tips', '.point', '.recipe-point', '.cooking-tips'];
    let tips = '';
    for (const selector of tipSelectors) {
        const found = $(selector).text().trim();
        if (found) {
            console.log(`✓ Tips found with ${selector}: "${found.substring(0, 50)}..."`);
            tips = found;
            break;
        }
    }
}
testRecipeDetails().catch(console.error);
