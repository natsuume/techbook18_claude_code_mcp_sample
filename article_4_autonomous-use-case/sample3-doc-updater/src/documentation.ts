import * as fs from 'fs/promises';
import * as path from 'path';
import { ChangeAnalysis, ApiChange, ConfigChange, FeatureChange } from './types';

export async function updateDocumentation(analysis: ChangeAnalysis): Promise<void> {
  // API変更をドキュメントに反映
  if (analysis.apiChanges.length > 0) {
    await updateApiDocumentation(analysis.apiChanges);
  }
  
  // 設定変更をドキュメントに反映
  if (analysis.configChanges.length > 0) {
    await updateConfigDocumentation(analysis.configChanges);
  }
  
  // 新機能をドキュメントに追加
  if (analysis.featureChanges.length > 0) {
    await updateFeatureDocumentation(analysis.featureChanges);
  }
  
  // Breaking changesをCHANGELOGに追加
  if (analysis.breakingChanges.length > 0) {
    await updateChangelog(analysis.breakingChanges);
  }
}

async function updateApiDocumentation(apiChanges: ApiChange[]): Promise<void> {
  const apiDocPath = path.join('wiki', 'API-Reference.md');
  let content = '';
  
  try {
    content = await fs.readFile(apiDocPath, 'utf-8');
  } catch {
    content = '# API Reference\n\n';
  }
  
  // API変更を追加
  let updates = '\n\n## Recent Updates\n\n';
  for (const change of apiChanges) {
    updates += `- **${change.type}**: ${change.description} (${change.file})\n`;
  }
  
  // 既存のRecent Updatesセクションがあれば置換、なければ追加
  if (content.includes('## Recent Updates')) {
    content = content.replace(/## Recent Updates[\s\S]*?(?=##|$)/, updates + '\n');
  } else {
    content += updates;
  }
  
  await fs.writeFile(apiDocPath, content);
}

async function updateConfigDocumentation(configChanges: ConfigChange[]): Promise<void> {
  const configDocPath = path.join('wiki', 'Configuration.md');
  let content = '';
  
  try {
    content = await fs.readFile(configDocPath, 'utf-8');
  } catch {
    content = '# Configuration\n\n';
  }
  
  // 設定変更を反映
  for (const change of configChanges) {
    const paramSection = `### ${change.parameter}`;
    if (content.includes(paramSection)) {
      // 既存のパラメータを更新
      const sectionRegex = new RegExp(`${paramSection}[\\s\\S]*?(?=###|$)`);
      const newSection = `${paramSection}\n\nFile: \`${change.file}\`\n`;
      
      if (change.oldValue && change.newValue) {
        content = content.replace(sectionRegex, 
          newSection + `Default value changed from \`${change.oldValue}\` to \`${change.newValue}\`\n\n`);
      }
    } else {
      // 新しいパラメータを追加
      content += `\n${paramSection}\n\nFile: \`${change.file}\`\n`;
      if (change.newValue) {
        content += `Default: \`${change.newValue}\`\n`;
      }
    }
  }
  
  await fs.writeFile(configDocPath, content);
}

async function updateFeatureDocumentation(featureChanges: FeatureChange[]): Promise<void> {
  const featuresDocPath = path.join('wiki', 'Features.md');
  let content = '';
  
  try {
    content = await fs.readFile(featuresDocPath, 'utf-8');
  } catch {
    content = '# Features\n\n';
  }
  
  // 新機能を追加
  for (const feature of featureChanges) {
    content += `\n## ${feature.name}\n\n`;
    content += `${feature.description}\n\n`;
    content += `### Usage\n\n\`\`\`\n${feature.usage}\n\`\`\`\n`;
  }
  
  await fs.writeFile(featuresDocPath, content);
}

async function updateChangelog(breakingChanges: string[]): Promise<void> {
  const changelogPath = 'CHANGELOG.md';
  let content = '';
  
  try {
    content = await fs.readFile(changelogPath, 'utf-8');
  } catch {
    content = '# Changelog\n\n';
  }
  
  // Breaking changesを追加
  const date = new Date().toISOString().split('T')[0];
  let entry = `\n## [Unreleased] - ${date}\n\n### Breaking Changes\n\n`;
  
  for (const change of breakingChanges) {
    entry += `- ${change}\n`;
  }
  
  // Changelogの先頭に追加
  const headerEnd = content.indexOf('\n## ');
  if (headerEnd > -1) {
    content = content.substring(0, headerEnd) + entry + content.substring(headerEnd);
  } else {
    content += entry;
  }
  
  await fs.writeFile(changelogPath, content);
}