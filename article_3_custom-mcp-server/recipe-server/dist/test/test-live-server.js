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
// 実際のサーバーを起動して検索をテストする
const child_process_1 = require("child_process");
const readline = __importStar(require("readline"));
async function testLiveServer() {
    console.log('Starting recipe MCP server for live test...\n');
    // サーバーを起動
    const server = (0, child_process_1.spawn)('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    // サーバーからのエラー出力を表示
    server.stderr.on('data', (data) => {
        console.error(`Server: ${data.toString()}`);
    });
    // サーバーからの標準出力を処理
    server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Server response:', output);
    });
    // エラーハンドリング
    server.on('error', (error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
    // サーバーが終了した場合
    server.on('close', (code) => {
        console.log(`Server exited with code ${code}`);
        rl.close();
        process.exit(code || 0);
    });
    // サーバーが起動するまで少し待つ
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('\nSending test search request...\n');
    // テスト用のMCPリクエストを送信
    const searchRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
            name: 'search_recipes',
            arguments: {
                keyword: '豚肉',
                useCache: false
            }
        },
        id: 1
    };
    server.stdin.write(JSON.stringify(searchRequest) + '\n');
    // レスポンスを待つ
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('\nSending recipe details request...\n');
    // レシピ詳細のテスト
    const detailsRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
            name: 'get_recipe_details',
            arguments: {
                recipeId: 'tonjiru',
                useCache: false
            }
        },
        id: 2
    };
    server.stdin.write(JSON.stringify(detailsRequest) + '\n');
    // レスポンスを待つ
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('\nTest completed. Press Ctrl+C to exit.');
    // 入力待機
    rl.on('SIGINT', () => {
        console.log('\nShutting down server...');
        server.kill();
        rl.close();
        process.exit(0);
    });
}
testLiveServer().catch(console.error);
