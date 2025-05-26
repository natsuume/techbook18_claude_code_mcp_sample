import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';

async function run(): Promise<void> {
  try {
    const apiKey = core.getInput('anthropic_api_key');
    const testLogs = core.getInput('test_logs');
    const branchName = core.getInput('branch_name');
    
    // エラーログから失敗したテストファイルを抽出
    const failedTests = extractFailedTests(testLogs);
    
    if (failedTests.length === 0) {
      core.info('No specific test failures found to fix');
      return;
    }
    
    // Claude Codeに修正を依頼
    const systemPrompt = `You are a test fixing assistant. 
    Analyze the test failures and fix the code to make the tests pass.
    Focus on fixing the actual implementation, not changing the tests themselves.
    Provide clear explanations for your fixes.`;
    
    const userPrompt = `The following tests are failing:
    
${testLogs}

Please analyze the failures and fix the code to make these tests pass:
${failedTests.join('\n')}`;
    
    // Claude Code実行
    await exec('claude', [
      '--api-key', apiKey,
      '--max-tokens', '100000',
      '--system-prompt', systemPrompt,
      '--message', userPrompt
    ]);
    
    // 変更をコミット
    await exec('git', ['config', 'user.name', 'Claude Code Bot']);
    await exec('git', ['config', 'user.email', 'claude-bot@example.com']);
    await exec('git', ['add', '-A']);
    await exec('git', ['commit', '-m', '🤖 Fix failing tests\n\nAutomatically fixed by Claude Code']);
    await exec('git', ['push', 'origin', branchName]);
    
    core.info('Successfully fixed tests and pushed changes');
    
  } catch (error) {
    core.setFailed(`Action failed: ${(error as Error).message}`);
  }
}

function extractFailedTests(logs: string): string[] {
  const failedTests: string[] = [];
  const testPatterns = [
    /FAIL\s+(.+\.test\.[jt]s)/g,
    /✕\s+(.+\.spec\.[jt]s)/g,
    /Error in (.+\.test\.[jt]s)/g
  ];
  
  for (const pattern of testPatterns) {
    const matches = logs.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && !failedTests.includes(match[1])) {
        failedTests.push(match[1]);
      }
    }
  }
  
  return failedTests;
}

run();