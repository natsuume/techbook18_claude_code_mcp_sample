import * as core from '@actions/core';
import * as github from '@actions/github';
import { getChangeDetails, analyzeChangesWithClaude } from './analysis';
import { updateDocumentation } from './documentation';
import { commitDocumentationChanges } from './git';

async function run(): Promise<void> {
  try {
    const apiKey = core.getInput('anthropic_api_key');
    const githubToken = core.getInput('github_token');
    const prNumber = core.getInput('pr_number');
    const prTitle = core.getInput('pr_title');
    const prBody = core.getInput('pr_body');
    
    const octokit = github.getOctokit(githubToken);
    
    // PRの変更ファイルを取得
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: parseInt(prNumber)
    });
    
    // 変更内容を取得
    const changeDetails = await getChangeDetails(files);
    
    // Claude Codeで変更を分析
    const analysis = await analyzeChangesWithClaude(
      apiKey,
      prTitle,
      prBody,
      changeDetails
    );
    
    // ドキュメントを更新
    await updateDocumentation(analysis);
    
    // 更新内容をコミット
    await commitDocumentationChanges(prTitle, prNumber);
    
    core.info('Documentation updated successfully');
    
  } catch (error) {
    core.setFailed(`Action failed: ${(error as Error).message}`);
  }
}

run();