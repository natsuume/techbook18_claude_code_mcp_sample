export interface DiscussionContent {
  title: string;
  body: string;
  author: string;
  category: string;
  comments: Array<{
    author: string;
    body: string;
    createdAt: string;
  }>;
}

export interface ClaudeResponse {
  reply: string;
  shouldCreatePR: boolean;
  code?: string;
}