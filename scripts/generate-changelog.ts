#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CommitInfo {
  hash: string;
  type: string;
  scope: string;
  message: string;
  pr?: string;
  breaking?: boolean;
}

interface ChangelogEntry {
  version: string;
  date: string;
  sections: {
    breaking: string[];
    feat: string[];
    fix: string[];
    perf: string[];
    refactor: string[];
    docs: string[];
  };
}

const COMMIT_PATTERN = /^(feat|fix|docs|style|refactor|perf|test|chore)(?:\(([\w-]+)\))?: (.+)$/;
const BREAKING_PATTERN = /BREAKING CHANGE:/i;
const PR_PATTERN = /\(#(\d+)\)$/;

function getLatestTag(): string {
  try {
    return execSync('git describe --tags --abbrev=0').toString().trim();
  } catch {
    return '';
  }
}

function getCommitsSinceTag(tag: string): string[] {
  const command = tag
    ? `git log ${tag}..HEAD --pretty=format:"%H|%s"`
    : 'git log --pretty=format:"%H|%s"';
  
  return execSync(command)
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);
}

function parseCommit(commitLine: string): CommitInfo | null {
  const [hash, message] = commitLine.split('|');
  const match = message.match(COMMIT_PATTERN);
  
  if (!match) return null;
  
  const [, type, scope, commitMessage] = match;
  const prMatch = commitMessage.match(PR_PATTERN);
  const breaking = BREAKING_PATTERN.test(commitMessage);
  
  return {
    hash,
    type,
    scope: scope || '',
    message: commitMessage.replace(PR_PATTERN, '').trim(),
    pr: prMatch ? prMatch[1] : undefined,
    breaking
  };
}

function formatChangelogEntry(commit: CommitInfo): string {
  let entry = commit.message;
  
  if (commit.scope) {
    entry = `**${commit.scope}:** ${entry}`;
  }
  
  if (commit.pr) {
    entry += ` (#${commit.pr})`;
  }
  
  if (commit.breaking) {
    entry = `💥 ${entry}`;
  }
  
  return entry;
}

function generateChangelog(version: string): ChangelogEntry {
  const latestTag = getLatestTag();
  const commits = getCommitsSinceTag(latestTag);
  
  const entry: ChangelogEntry = {
    version,
    date: new Date().toISOString().split('T')[0],
    sections: {
      breaking: [],
      feat: [],
      fix: [],
      perf: [],
      refactor: [],
      docs: []
    }
  };
  
  commits.forEach(commitLine => {
    const commit = parseCommit(commitLine);
    if (!commit) return;
    
    const formattedEntry = formatChangelogEntry(commit);
    
    if (commit.breaking) {
      entry.sections.breaking.push(formattedEntry);
    }
    
    switch (commit.type) {
      case 'feat':
        entry.sections.feat.push(formattedEntry);
        break;
      case 'fix':
        entry.sections.fix.push(formattedEntry);
        break;
      case 'perf':
        entry.sections.perf.push(formattedEntry);
        break;
      case 'refactor':
        entry.sections.refactor.push(formattedEntry);
        break;
      case 'docs':
        entry.sections.docs.push(formattedEntry);
        break;
    }
  });
  
  return entry;
}

function formatChangelogMarkdown(entry: ChangelogEntry): string {
  let markdown = `# ${entry.version} (${entry.date})\n\n`;
  
  if (entry.sections.breaking.length) {
    markdown += '## ⚠ Breaking Changes\n\n';
    entry.sections.breaking.forEach(item => {
      markdown += `- ${item}\n`;
    });
    markdown += '\n';
  }
  
  if (entry.sections.feat.length) {
    markdown += '## ✨ Features\n\n';
    entry.sections.feat.forEach(item => {
      markdown += `- ${item}\n`;
    });
    markdown += '\n';
  }
  
  if (entry.sections.fix.length) {
    markdown += '## 🐛 Bug Fixes\n\n';
    entry.sections.fix.forEach(item => {
      markdown += `- ${item}\n`;
    });
    markdown += '\n';
  }
  
  if (entry.sections.perf.length) {
    markdown += '## ⚡ Performance Improvements\n\n';
    entry.sections.perf.forEach(item => {
      markdown += `- ${item}\n`;
    });
    markdown += '\n';
  }
  
  if (entry.sections.refactor.length) {
    markdown += '## ♻️ Code Refactoring\n\n';
    entry.sections.refactor.forEach(item => {
      markdown += `- ${item}\n`;
    });
    markdown += '\n';
  }
  
  if (entry.sections.docs.length) {
    markdown += '## 📝 Documentation\n\n';
    entry.sections.docs.forEach(item => {
      markdown += `- ${item}\n`;
    });
    markdown += '\n';
  }
  
  return markdown;
}

function updateChangelog(newContent: string) {
  const changelogPath = join(process.cwd(), 'CHANGELOG.md');
  let existingContent = '';
  
  if (existsSync(changelogPath)) {
    existingContent = readFileSync(changelogPath, 'utf-8');
  }
  
  const updatedContent = existingContent
    ? `${newContent}\n${existingContent}`
    : newContent;
  
  writeFileSync(changelogPath, updatedContent);
}

// Main execution
function main() {
  const version = process.argv[2];
  if (!version) {
    console.error('Please provide a version number');
    process.exit(1);
  }
  
  try {
    const entry = generateChangelog(version);
    const markdown = formatChangelogMarkdown(entry);
    updateChangelog(markdown);
    console.log(`Changelog updated for version ${version}`);
  } catch (error) {
    console.error('Failed to generate changelog:', error);
    process.exit(1);
  }
}

main();
