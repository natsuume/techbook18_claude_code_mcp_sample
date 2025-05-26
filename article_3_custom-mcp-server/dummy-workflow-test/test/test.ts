import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResult, ListToolsResult } from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// シンプルなテストヘルパー
async function runTests() {
  console.log('🧪 Dummy Workflow Test Server テストを開始します...\n');
  
  let client: Client;
  let transport: StdioClientTransport;
  let testsPassed = 0;
  let testsFailed = 0;

  // セットアップ
  try {
    console.log('📋 セットアップ中...');
    const serverPath = join(__dirname, '..', 'src', 'index.ts');
    transport = new StdioClientTransport({
      command: 'tsx',
      args: [serverPath],
    });
    
    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {}
    });
    
    await client.connect(transport);
    console.log('✅ セットアップ完了\n');
  } catch (error) {
    console.error('❌ セットアップに失敗しました:', error);
    process.exit(1);
  }

  // テスト1: ツール一覧
  try {
    console.log('テスト1: ツール一覧の確認');
    const response = await client.request({
      method: 'tools/list',
      params: {},
    }) as ListToolsResult;

    const tool = response.tools.find(t => t.name === 'dummy_tool');
    if (!tool) throw new Error('dummy_toolが見つかりません');
    if (!tool.description.includes('ワークフロー検証')) {
      throw new Error('説明文が正しくありません');
    }
    
    console.log('✅ テスト1: 成功\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ テスト1: 失敗 -', error);
    testsFailed++;
  }

  // テスト2: 正しい引数での実行
  try {
    console.log('テスト2: dummy_toolの実行（正しい引数）');
    const response = await client.request({
      method: 'tools/call',
      params: {
        name: 'dummy_tool',
        arguments: {
          message: 'テストメッセージ',
        },
      },
    }) as CallToolResult;

    if (response.content.length === 0) {
      throw new Error('レスポンスが空です');
    }
    const text = (response.content[0] as any).text;
    if (!text.includes('ダミーツールが実行されました')) {
      throw new Error('レスポンスメッセージが正しくありません');
    }
    if (!text.includes('テストメッセージ')) {
      throw new Error('引数が正しく処理されていません');
    }
    
    console.log('✅ テスト2: 成功\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ テスト2: 失敗 -', error);
    testsFailed++;
  }

  // テスト3: 不正な引数での実行
  try {
    console.log('テスト3: dummy_toolの実行（不正な引数）');
    let errorOccurred = false;
    try {
      await client.request({
        method: 'tools/call',
        params: {
          name: 'dummy_tool',
          arguments: {},
        },
      });
    } catch (error: any) {
      errorOccurred = true;
      if (!error.message.includes('引数が無効です')) {
        throw new Error('エラーメッセージが正しくありません: ' + error.message);
      }
    }
    
    if (!errorOccurred) {
      throw new Error('エラーが発生するはずですが、発生しませんでした');
    }
    
    console.log('✅ テスト3: 成功\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ テスト3: 失敗 -', error);
    testsFailed++;
  }

  // クリーンアップ
  try {
    await client.close();
    console.log('📋 クリーンアップ完了\n');
  } catch (error) {
    console.error('⚠️  クリーンアップ中にエラーが発生しました:', error);
  }

  // 結果の表示
  console.log('========================================');
  console.log(`テスト結果: ${testsPassed}/${testsPassed + testsFailed} 成功`);
  console.log('========================================');
  
  if (testsFailed > 0) {
    process.exit(1);
  }
}

// テストの実行
runTests().catch((error) => {
  console.error('予期しないエラーが発生しました:', error);
  process.exit(1);
});