import * as core from '@actions/core';
import * as github from '@actions/github';
import { graphql } from '@octokit/graphql';
import { getDiscussionContent, postDiscussionReply } from './github';
import { buildContext, processWithClaude } from './claude';
import { createPullRequest } from './pullRequest';

async function run(): Promise<void> {
  try {
    const apiKey = core.getInput('anthropic_api_key');
    const githubToken = core.getInput('github_token');
    const discussionId = core.getInput('discussion_id');
    const isComment = core.getInput('is_comment') === 'true';
    
    const octokit = github.getOctokit(githubToken);
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${githubToken}`,
      },
    });
    
    // Discussion内容を取得
    const discussion = await getDiscussionContent(graphqlWithAuth, discussionId);
    
    // 最新のメッセージを取得
    const latestMessage = isComment && discussion.comments.length > 0
      ? discussion.comments[discussion.comments.length - 1].body
      : discussion.body;
    
    // Claude Codeへの指示を生成
    const context = buildContext(discussion);
    const response = await processWithClaude(apiKey, context, latestMessage);
    
    // 回答をDiscussionに投稿
    await postDiscussionReply(graphqlWithAuth, discussionId, response.reply);
    
    // コード生成やPR作成が必要な場合は実行
    if (response.shouldCreatePR) {
      await createPullRequest(octokit, discussion.title, response.code, discussionId);
    }
    
    core.info('Successfully processed discussion');
    
  } catch (error) {
    core.setFailed(`Action failed: ${(error as Error).message}`);
  }
}

run();