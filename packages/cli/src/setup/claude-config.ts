/**
 * Claude Code configuration setup
 *
 * Deploys .claude/ directory and CLAUDE.md to new project
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Octokit } from '@octokit/rest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ClaudeConfigOptions {
  projectPath: string;
  projectName: string;
}

/**
 * Deploy Claude Code configuration to project
 *
 * This includes:
 * - .claude/ directory with agents, commands, MCP servers
 * - CLAUDE.md context file
 */
export async function deployClaudeConfig(options: ClaudeConfigOptions): Promise<void> {
  const { projectPath, projectName } = options;

  // Source: templates in CLI package
  const templatesDir = path.join(__dirname, '../../templates');
  const claudeTemplateDir = path.join(templatesDir, 'claude-code');
  const claudeMdTemplate = path.join(templatesDir, 'CLAUDE.md.template');

  // Destination: project directory
  const claudeDestDir = path.join(projectPath, '.claude');
  const claudeMdDest = path.join(projectPath, 'CLAUDE.md');

  // 1. Copy .claude directory
  if (fs.existsSync(claudeTemplateDir)) {
    await copyDirectoryRecursive(claudeTemplateDir, claudeDestDir);
  } else {
    throw new Error(`Claude template directory not found: ${claudeTemplateDir}`);
  }

  // 2. Generate CLAUDE.md from template
  if (fs.existsSync(claudeMdTemplate)) {
    const templateContent = fs.readFileSync(claudeMdTemplate, 'utf-8');
    const renderedContent = templateContent.replace(/{{PROJECT_NAME}}/g, projectName);

    // Atomic write
    const tempPath = `${claudeMdDest}.tmp`;
    fs.writeFileSync(tempPath, renderedContent, { encoding: 'utf-8', mode: 0o644 });
    fs.renameSync(tempPath, claudeMdDest);
  } else {
    throw new Error(`CLAUDE.md template not found: ${claudeMdTemplate}`);
  }
}

/**
 * Recursively copy directory with atomic operations
 */
async function copyDirectoryRecursive(src: string, dest: string): Promise<void> {
  // Create destination directory
  try {
    fs.mkdirSync(dest, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      // Copy file atomically
      try {
        const tempPath = `${destPath}.tmp`;
        fs.copyFileSync(srcPath, tempPath);
        fs.renameSync(tempPath, destPath);
      } catch (error: any) {
        // Skip if file exists
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }
    }
  }
}

/**
 * Check if Claude Code is available
 */
export function isClaudeCodeAvailable(): boolean {
  // Check if running in Claude Code environment
  // Claude Code sets specific environment variables
  return process.env.CLAUDE_CODE === 'true' || process.env.ANTHROPIC_CLI === 'true';
}

/**
 * Deploy Claude Code configuration directly to GitHub repository
 *
 * This commits .claude/ and CLAUDE.md directly to the repository
 * before local cloning, ensuring they are always present
 */
export async function deployClaudeConfigToGitHub(
  owner: string,
  repo: string,
  projectName: string,
  token: string
): Promise<void> {
  const octokit = new Octokit({ auth: token });

  // Source: templates in CLI package
  const templatesDir = path.join(__dirname, '../../templates');
  const claudeTemplateDir = path.join(templatesDir, 'claude-code');
  const claudeMdTemplate = path.join(templatesDir, 'CLAUDE.md.template');

  // Read and collect all files to commit
  const filesToCommit: { path: string; content: string }[] = [];

  // 1. Collect all .claude/ directory files
  if (fs.existsSync(claudeTemplateDir)) {
    const claudeFiles = await collectDirectoryFiles(claudeTemplateDir, '.claude');
    filesToCommit.push(...claudeFiles);
    console.log(`[Claude Config] Collected ${claudeFiles.length} files from .claude/`);

    if (claudeFiles.length === 0) {
      throw new Error(`No files found in .claude/ template directory: ${claudeTemplateDir}`);
    }

    // Log first few file paths for debugging
    claudeFiles.slice(0, 5).forEach(f => console.log(`  - ${f.path}`));
    if (claudeFiles.length > 5) {
      console.log(`  ... and ${claudeFiles.length - 5} more files`);
    }
  } else {
    throw new Error(`Claude template directory not found: ${claudeTemplateDir}`);
  }

  // 2. Generate CLAUDE.md from template
  if (fs.existsSync(claudeMdTemplate)) {
    const templateContent = fs.readFileSync(claudeMdTemplate, 'utf-8');
    const renderedContent = templateContent.replace(/{{PROJECT_NAME}}/g, projectName);
    filesToCommit.push({
      path: 'CLAUDE.md',
      content: renderedContent,
    });
    console.log(`[Claude Config] Added CLAUDE.md`);
  } else {
    throw new Error(`CLAUDE.md template not found: ${claudeMdTemplate}`);
  }

  // 3. Commit all files to GitHub using Contents API
  // Get the default branch's latest commit SHA
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: 'heads/main',
  });

  const baseCommitSha = refData.object.sha;

  // Get the base tree
  const { data: baseCommit } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: baseCommitSha,
  });

  const baseTreeSha = baseCommit.tree.sha;

  // Create blobs for all files
  const blobs = await Promise.all(
    filesToCommit.map(async (file) => {
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: Buffer.from(file.content, 'utf-8').toString('base64'),
        encoding: 'base64',
      });
      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      };
    })
  );

  // Create new tree
  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: blobs,
  });

  // Create commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'chore: Initialize Claude Code configuration\n\n- Add .claude/ directory with agents and commands\n- Add CLAUDE.md context file for AI assistance\n\n🌸 Generated by Miyabi',
    tree: newTree.sha,
    parents: [baseCommitSha],
  });

  // Update ref to point to new commit
  await octokit.git.updateRef({
    owner,
    repo,
    ref: 'heads/main',
    sha: newCommit.sha,
  });

  console.log(`[Claude Config] Successfully committed ${filesToCommit.length} files to GitHub`);
  console.log(`[Claude Config] Commit SHA: ${newCommit.sha}`);
}

/**
 * Recursively collect all files in a directory for GitHub commit
 */
async function collectDirectoryFiles(
  srcDir: string,
  basePrefix: string
): Promise<{ path: string; content: string }[]> {
  const files: { path: string; content: string }[] = [];

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    // Use POSIX path separator (/) for GitHub
    const relativePath = path.posix.join(basePrefix, entry.name);

    if (entry.isDirectory()) {
      // Recursively collect subdirectory files
      const subFiles = await collectDirectoryFiles(srcPath, relativePath);
      files.push(...subFiles);
    } else {
      // Read file content
      const content = fs.readFileSync(srcPath, 'utf-8');
      files.push({
        path: relativePath,
        content,
      });
    }
  }

  return files;
}

/**
 * Verify Claude Code configuration
 */
export async function verifyClaudeConfig(projectPath: string): Promise<{
  claudeDirExists: boolean;
  claudeMdExists: boolean;
  agentsCount: number;
  commandsCount: number;
}> {
  const claudeDir = path.join(projectPath, '.claude');
  const claudeMd = path.join(projectPath, 'CLAUDE.md');

  const claudeDirExists = fs.existsSync(claudeDir);
  const claudeMdExists = fs.existsSync(claudeMd);

  let agentsCount = 0;
  let commandsCount = 0;

  if (claudeDirExists) {
    const agentsDir = path.join(claudeDir, 'agents');
    const commandsDir = path.join(claudeDir, 'commands');

    if (fs.existsSync(agentsDir)) {
      agentsCount = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length;
    }

    if (fs.existsSync(commandsDir)) {
      commandsCount = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md')).length;
    }
  }

  return {
    claudeDirExists,
    claudeMdExists,
    agentsCount,
    commandsCount,
  };
}
