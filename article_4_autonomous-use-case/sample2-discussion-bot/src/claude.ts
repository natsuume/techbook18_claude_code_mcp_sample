import { exec } from '@actions/exec';
import { DiscussionContent, ClaudeResponse } from './types';

export function buildContext(discussion: DiscussionContent): string {
  let context = `Discussion Title: ${discussion.title}\n`;
  context += `Category: ${discussion.category}\n`;
  context += `Author: ${discussion.author}\n\n`;
  context += `Initial Question:\n${discussion.body}\n\n`;
  
  if (discussion.comments.length > 0) {
    context += 'Previous Conversation:\n';
    discussion.comments.forEach((comment) => {
      context += `\n[${comment.author} at ${comment.createdAt}]:\n${comment.body}\n`;
    });
  }
  
  return context;
}

export async function processWithClaude(
  apiKey: string,
  context: string,
  latestMessage: string
): Promise<ClaudeResponse> {
  const systemPrompt = `You are a helpful coding assistant participating in GitHub Discussions.
  Analyze the conversation context and provide helpful, accurate responses.
  If the user requests code implementation or fixes, generate appropriate code.
  Determine if a pull request should be created based on the request.
  If a PR should be created, include [CREATE_PR] in your response.`;
  
  const userPrompt = `Context of the discussion:
${context}

Latest message to respond to:
${latestMessage}

Please provide a helpful response and indicate if code should be generated.`;

  // Claude Code実行して応答を取得
  let claudeOutput = '';
  await exec('claude', [
    '--api-key', apiKey,
    '--max-tokens', '50000',
    '--system-prompt', systemPrompt,
    '--message', userPrompt
  ], {
    listeners: {
      stdout: (data: Buffer) => {
        claudeOutput += data.toString();
      }
    }
  });
  
  // 応答を解析
  const shouldCreatePR = claudeOutput.includes('[CREATE_PR]');
  const codeMatch = claudeOutput.match(/```[\s\S]*?```/g);
  const code = codeMatch ? codeMatch.join('\n\n') : undefined;
  
  return {
    reply: claudeOutput.replace(/\[CREATE_PR\]/g, ''),
    shouldCreatePR,
    code
  };
}