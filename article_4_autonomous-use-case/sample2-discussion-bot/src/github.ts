import { graphql } from '@octokit/graphql';
import { DiscussionContent } from './types';

export async function getDiscussionContent(
  graphqlWithAuth: typeof graphql,
  discussionId: string
): Promise<DiscussionContent> {
  const query = `
    query($id: ID!) {
      node(id: $id) {
        ... on Discussion {
          title
          body
          author {
            login
          }
          category {
            name
          }
          comments(last: 10) {
            nodes {
              author {
                login
              }
              body
              createdAt
            }
          }
        }
      }
    }
  `;
  
  const result = await graphqlWithAuth(query, { id: discussionId });
  const discussion = (result as any).node;
  
  return {
    title: discussion.title,
    body: discussion.body,
    author: discussion.author.login,
    category: discussion.category.name,
    comments: discussion.comments.nodes,
  };
}

export async function postDiscussionReply(
  graphqlWithAuth: typeof graphql,
  discussionId: string,
  reply: string
): Promise<void> {
  const mutation = `
    mutation($discussionId: ID!, $body: String!) {
      addDiscussionComment(input: {
        discussionId: $discussionId,
        body: $body
      }) {
        comment {
          id
        }
      }
    }
  `;
  
  await graphqlWithAuth(mutation, {
    discussionId,
    body: reply
  });
}