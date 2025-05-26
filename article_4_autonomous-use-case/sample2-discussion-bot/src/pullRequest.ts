import * as github from '@actions/github';
import { exec } from '@actions/exec';

export async function createPullRequest(
  octokit: ReturnType<typeof github.getOctokit>,
  title: string,
  code: string | undefined,
  discussionId: string
): Promise<void> {
  if (!code) return;
  
  const branchName = `claude-code/${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  
  // 新しいブランチを作成
  const { data: ref } = await octokit.rest.git.getRef({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: 'heads/main'
  });
  
  await octokit.rest.git.createRef({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: `refs/heads/${branchName}`,
    sha: ref.object.sha
  });
  
  // コードをコミット（実際の実装では適切なファイルパスの決定が必要）
  await exec('git', ['checkout', branchName]);
  
  // コードをファイルに書き込む（仮の実装）
  // 実際にはコードの内容から適切なファイルパスを決定する必要があります
  const fs = await import('fs/promises');
  await fs.writeFile('generated-code.ts', code);
  
  await exec('git', ['add', '.']);
  await exec('git', ['commit', '-m', `feat: Implementation for "${title}"`]);
  await exec('git', ['push', 'origin', branchName]);
  
  // プルリクエストを作成
  await octokit.rest.pulls.create({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    title: `[Claude Code] ${title}`,
    body: `This PR was automatically created from a GitHub Discussion.\n\nRelated discussion: #${discussionId}`,
    head: branchName,
    base: 'main'
  });
}