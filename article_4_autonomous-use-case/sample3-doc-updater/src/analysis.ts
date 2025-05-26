import { exec } from '@actions/exec';
import { ChangeAnalysis } from './types';

export async function getChangeDetails(files: any[]): Promise<string> {
  let details = 'Changed files:\n\n';
  
  for (const file of files) {
    details += `File: ${file.filename}\n`;
    details += `Status: ${file.status}\n`;
    details += `Additions: ${file.additions}, Deletions: ${file.deletions}\n`;
    
    if (file.patch) {
      details += `Patch:\n${file.patch}\n`;
    }
    details += '\n---\n\n';
  }
  
  return details;
}

export async function analyzeChangesWithClaude(
  apiKey: string,
  prTitle: string,
  prBody: string,
  changeDetails: string
): Promise<ChangeAnalysis> {
  const systemPrompt = `You are a documentation assistant that analyzes code changes and determines necessary documentation updates.
  Identify:
  1. API changes (new endpoints, modified parameters, removed functionality)
  2. Configuration changes (new options, changed defaults)
  3. New features that need documentation
  4. Breaking changes that require migration guides
  
  Return your analysis in a structured JSON format with this exact structure:
  {
    "apiChanges": [{
      "file": "string",
      "type": "added" | "modified" | "removed",
      "description": "string"
    }],
    "configChanges": [{
      "file": "string",
      "parameter": "string",
      "oldValue": "string (optional)",
      "newValue": "string (optional)"
    }],
    "featureChanges": [{
      "name": "string",
      "description": "string",
      "usage": "string"
    }],
    "breakingChanges": ["string"]
  }`;
  
  const userPrompt = `PR Title: ${prTitle}
PR Description: ${prBody}

Code Changes:
${changeDetails}

Please analyze these changes and determine what documentation updates are needed. Return the result in the specified JSON format wrapped in \`\`\`json code blocks.`;

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
  
  // JSON形式で結果を解析
  const jsonMatch = claudeOutput.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  
  // フォールバック
  return {
    apiChanges: [],
    configChanges: [],
    featureChanges: [],
    breakingChanges: []
  };
}