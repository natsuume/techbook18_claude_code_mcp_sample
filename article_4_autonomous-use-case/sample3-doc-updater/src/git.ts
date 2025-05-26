import { exec } from '@actions/exec';
import * as path from 'path';

export async function commitDocumentationChanges(prTitle: string, prNumber: string): Promise<void> {
  // メインリポジトリの変更をコミット
  await exec('git', ['add', 'CHANGELOG.md']);
  const hasChanges = await exec('git', ['diff', '--cached', '--quiet'], { ignoreReturnCode: true });
  
  if (hasChanges !== 0) {
    await exec('git', ['config', 'user.name', 'Claude Documentation Bot']);
    await exec('git', ['config', 'user.email', 'claude-docs@example.com']);
    await exec('git', ['commit', '-m', `📚 Update documentation for PR #${prNumber}\n\n${prTitle}`]);
    await exec('git', ['push']);
  }
  
  // Wikiの変更をコミット
  const wikiPath = path.join(process.cwd(), 'wiki');
  process.chdir(wikiPath);
  
  await exec('git', ['add', '-A']);
  const hasWikiChanges = await exec('git', ['diff', '--cached', '--quiet'], { ignoreReturnCode: true });
  
  if (hasWikiChanges !== 0) {
    await exec('git', ['config', 'user.name', 'Claude Documentation Bot']);
    await exec('git', ['config', 'user.email', 'claude-docs@example.com']);
    await exec('git', ['commit', '-m', `Update wiki for PR #${prNumber}: ${prTitle}`]);
    await exec('git', ['push']);
  }
}