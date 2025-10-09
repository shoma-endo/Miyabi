/**
 * Comprehensive unit tests for claude-config.ts
 *
 * Test Coverage:
 * - deployClaudeConfig: 8 test cases
 * - copyDirectoryRecursive: 6 test cases
 * - isClaudeCodeAvailable: 4 test cases
 * - deployClaudeConfigToGitHub: 10 test cases
 * - collectDirectoryFiles: 6 test cases
 * - verifyClaudeConfig: 7 test cases
 *
 * Total: 41 test cases
 * Target: 80%+ coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  deployClaudeConfig,
  isClaudeCodeAvailable,
  deployClaudeConfigToGitHub,
  verifyClaudeConfig,
  type ClaudeConfigOptions,
} from '../claude-config.js';
import * as fs from 'fs';
import * as path from 'path';
import { Octokit } from '@octokit/rest';

// Mock modules
vi.mock('fs');
vi.mock('path');
vi.mock('url', () => ({
  fileURLToPath: vi.fn((url: string) => '/mock/path/to/file.js'),
}));

// Mock Octokit
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(),
}));

describe('claude-config', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default path mocks
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(path.dirname).mockReturnValue('/mock/path/to');
    vi.mocked(path.posix.join).mockImplementation((...args) => args.join('/'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('deployClaudeConfig', () => {
    const mockOptions: ClaudeConfigOptions = {
      projectPath: '/test/project',
      projectName: 'test-project',
    };

    it('should deploy .claude directory and CLAUDE.md successfully', async () => {
      // Mock file system
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Project: {{PROJECT_NAME}}');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await deployClaudeConfig(mockOptions);

      // Verify .claude directory was copied
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it('should replace {{PROJECT_NAME}} in CLAUDE.md template', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Project: {{PROJECT_NAME}}, Name: {{PROJECT_NAME}}');
      vi.mocked(fs.writeFileSync).mockImplementation((path, content) => {
        expect(content).toBe('Project: test-project, Name: test-project');
      });
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await deployClaudeConfig(mockOptions);

      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should use atomic write (temp file + rename) for CLAUDE.md', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Template content');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await deployClaudeConfig(mockOptions);

      // Verify atomic write pattern
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.tmp'),
        expect.any(String),
        expect.objectContaining({ encoding: 'utf-8', mode: 0o644 })
      );
      expect(fs.renameSync).toHaveBeenCalled();
    });

    it('should throw error if claude template directory not found', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        // Only CLAUDE.md template exists, not .claude directory
        return path.toString().includes('CLAUDE.md.template');
      });

      await expect(deployClaudeConfig(mockOptions)).rejects.toThrow(
        'Claude template directory not found'
      );
    });

    it('should throw error if CLAUDE.md template not found', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        // Only .claude directory exists, not CLAUDE.md template
        return path.toString().includes('claude-code');
      });
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await expect(deployClaudeConfig(mockOptions)).rejects.toThrow(
        'CLAUDE.md template not found'
      );
    });

    it('should handle complex directory structures', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Template');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

      // Mock nested directory structure
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce([
          { name: 'agents', isDirectory: () => true } as fs.Dirent,
          { name: 'commands', isDirectory: () => true } as fs.Dirent,
        ])
        .mockReturnValueOnce([
          { name: 'agent1.md', isDirectory: () => false } as fs.Dirent,
        ])
        .mockReturnValueOnce([
          { name: 'cmd1.md', isDirectory: () => false } as fs.Dirent,
        ]);

      vi.mocked(fs.copyFileSync).mockReturnValue(undefined);

      await deployClaudeConfig(mockOptions);

      // Should handle nested directories
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.copyFileSync).toHaveBeenCalled();
    });

    it('should set correct file permissions (0o644) for CLAUDE.md', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Content');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await deployClaudeConfig(mockOptions);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ mode: 0o644 })
      );
    });

    it('should handle empty project name correctly', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Project: {{PROJECT_NAME}}');
      vi.mocked(fs.writeFileSync).mockImplementation((path, content) => {
        expect(content).toBe('Project: ');
      });
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await deployClaudeConfig({ projectPath: '/test', projectName: '' });

      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('copyDirectoryRecursive', () => {
    // Note: This is a private function, tested indirectly through deployClaudeConfig

    it('should copy files recursively', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Template');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.copyFileSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.txt', isDirectory: () => false } as fs.Dirent,
      ]);

      await deployClaudeConfig({
        projectPath: '/test',
        projectName: 'test',
      });

      expect(fs.copyFileSync).toHaveBeenCalled();
    });

    it('should create destination directory with recursive option', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Template');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await deployClaudeConfig({
        projectPath: '/test',
        projectName: 'test',
      });

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ recursive: true })
      );
    });

    it('should handle EEXIST error when directory exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Template');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const eexistError = new Error('Directory exists') as NodeJS.ErrnoException;
      eexistError.code = 'EEXIST';
      vi.mocked(fs.mkdirSync).mockImplementationOnce(() => {
        throw eexistError;
      });

      // Should not throw
      await expect(
        deployClaudeConfig({
          projectPath: '/test',
          projectName: 'test',
        })
      ).resolves.not.toThrow();
    });

    it('should use atomic file operations (temp + rename)', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Template');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.copyFileSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.txt', isDirectory: () => false } as fs.Dirent,
      ]);

      await deployClaudeConfig({
        projectPath: '/test',
        projectName: 'test',
      });

      // Verify atomic pattern: copy to temp, then rename
      expect(fs.copyFileSync).toHaveBeenCalled();
      expect(fs.renameSync).toHaveBeenCalled();
    });

    it('should skip files if EEXIST error occurs during copy', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Template');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.renameSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.txt', isDirectory: () => false } as fs.Dirent,
      ]);

      const eexistError = new Error('File exists') as NodeJS.ErrnoException;
      eexistError.code = 'EEXIST';
      vi.mocked(fs.copyFileSync).mockImplementationOnce(() => {
        throw eexistError;
      });

      // Should not throw, should skip the file
      await expect(
        deployClaudeConfig({
          projectPath: '/test',
          projectName: 'test',
        })
      ).resolves.not.toThrow();
    });

    it('should throw non-EEXIST errors', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Template');
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const eaccessError = new Error('Permission denied') as NodeJS.ErrnoException;
      eaccessError.code = 'EACCES';
      vi.mocked(fs.mkdirSync).mockImplementationOnce(() => {
        throw eaccessError;
      });

      await expect(
        deployClaudeConfig({
          projectPath: '/test',
          projectName: 'test',
        })
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('isClaudeCodeAvailable', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return true when CLAUDE_CODE is "true"', () => {
      process.env.CLAUDE_CODE = 'true';
      expect(isClaudeCodeAvailable()).toBe(true);
    });

    it('should return true when ANTHROPIC_CLI is "true"', () => {
      delete process.env.CLAUDE_CODE;
      process.env.ANTHROPIC_CLI = 'true';
      expect(isClaudeCodeAvailable()).toBe(true);
    });

    it('should return false when both environment variables are not set', () => {
      delete process.env.CLAUDE_CODE;
      delete process.env.ANTHROPIC_CLI;
      expect(isClaudeCodeAvailable()).toBe(false);
    });

    it('should return false when environment variables are set to non-"true" values', () => {
      process.env.CLAUDE_CODE = 'false';
      process.env.ANTHROPIC_CLI = '1';
      expect(isClaudeCodeAvailable()).toBe(false);
    });
  });

  describe('deployClaudeConfigToGitHub', () => {
    let mockOctokit: any;

    beforeEach(() => {
      mockOctokit = {
        git: {
          getRef: vi.fn(),
          getCommit: vi.fn(),
          createBlob: vi.fn(),
          createTree: vi.fn(),
          createCommit: vi.fn(),
          updateRef: vi.fn(),
        },
      };

      vi.mocked(Octokit).mockReturnValue(mockOctokit);

      // Setup default successful responses
      mockOctokit.git.getRef.mockResolvedValue({
        data: { object: { sha: 'ref-sha-123' } },
      });
      mockOctokit.git.getCommit.mockResolvedValue({
        data: { tree: { sha: 'tree-sha-456' } },
      });
      mockOctokit.git.createBlob.mockResolvedValue({
        data: { sha: 'blob-sha-789' },
      });
      mockOctokit.git.createTree.mockResolvedValue({
        data: { sha: 'new-tree-sha-abc' },
      });
      mockOctokit.git.createCommit.mockResolvedValue({
        data: { sha: 'commit-sha-def' },
      });
      mockOctokit.git.updateRef.mockResolvedValue({
        data: { object: { sha: 'commit-sha-def' } },
      });

      // Mock console.log to avoid noise
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should commit .claude/ and CLAUDE.md to GitHub repository', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Template content');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.md', isDirectory: () => false } as fs.Dirent,
      ]);

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      expect(mockOctokit.git.getRef).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        ref: 'heads/main',
      });
      expect(mockOctokit.git.createCommit).toHaveBeenCalled();
      expect(mockOctokit.git.updateRef).toHaveBeenCalled();
    });

    it('should create blobs for all files in base64 encoding', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('File content');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.md', isDirectory: () => false } as fs.Dirent,
      ]);

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      expect(mockOctokit.git.createBlob).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        content: expect.any(String),
        encoding: 'base64',
      });
    });

    it('should use commit message with "chore:" prefix and Miyabi attribution', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Content');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.md', isDirectory: () => false } as fs.Dirent,
      ]);

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      expect(mockOctokit.git.createCommit).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        message: expect.stringContaining('chore: Initialize Claude Code configuration'),
        tree: expect.any(String),
        parents: [expect.any(String)],
      });

      const commitCall = mockOctokit.git.createCommit.mock.calls[0][0];
      expect(commitCall.message).toContain('🌸 Generated by Miyabi');
    });

    it('should throw error if .claude/ template directory not found', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(
        deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token')
      ).rejects.toThrow('Claude template directory not found');
    });

    it('should throw error if CLAUDE.md template not found', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        return path.toString().includes('claude-code');
      });
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.md', isDirectory: () => false } as fs.Dirent,
      ]);

      await expect(
        deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token')
      ).rejects.toThrow('CLAUDE.md template not found');
    });

    it('should throw error if no files found in .claude/ directory', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await expect(
        deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token')
      ).rejects.toThrow('No files found in .claude/ template directory');
    });

    it('should collect files recursively from subdirectories', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Content');

      // Mock nested directory structure
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce([
          { name: 'agents', isDirectory: () => true } as fs.Dirent,
        ])
        .mockReturnValueOnce([
          { name: 'agent1.md', isDirectory: () => false } as fs.Dirent,
        ]);

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      // Should create blobs for nested files
      expect(mockOctokit.git.createBlob).toHaveBeenCalledTimes(2); // 1 from .claude/agents + 1 CLAUDE.md
    });

    it('should use POSIX path separator for GitHub paths', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Content');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.md', isDirectory: () => false } as fs.Dirent,
      ]);

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      // path.posix.join should be used for GitHub paths
      expect(path.posix.join).toHaveBeenCalled();
    });

    it('should log collected files count for debugging', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Content');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file1.md', isDirectory: () => false } as fs.Dirent,
        { name: 'file2.md', isDirectory: () => false } as fs.Dirent,
      ]);

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Collected 2 files from .claude/')
      );
    });

    it('should create tree with correct blob mode (100644)', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Content');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.md', isDirectory: () => false } as fs.Dirent,
      ]);

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      expect(mockOctokit.git.createTree).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        base_tree: 'tree-sha-456',
        tree: expect.arrayContaining([
          expect.objectContaining({
            mode: '100644',
            type: 'blob',
          }),
        ]),
      });
    });
  });

  describe('collectDirectoryFiles', () => {
    // Note: This is a private function, tested indirectly through deployClaudeConfigToGitHub

    it('should collect all files from directory', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Content');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file1.md', isDirectory: () => false } as fs.Dirent,
        { name: 'file2.md', isDirectory: () => false } as fs.Dirent,
      ]);

      const mockOctokit = {
        git: {
          getRef: vi.fn().mockResolvedValue({ data: { object: { sha: 'ref-sha' } } }),
          getCommit: vi.fn().mockResolvedValue({ data: { tree: { sha: 'tree-sha' } } }),
          createBlob: vi.fn().mockResolvedValue({ data: { sha: 'blob-sha' } }),
          createTree: vi.fn().mockResolvedValue({ data: { sha: 'new-tree-sha' } }),
          createCommit: vi.fn().mockResolvedValue({ data: { sha: 'commit-sha' } }),
          updateRef: vi.fn().mockResolvedValue({ data: {} }),
        },
      };
      vi.mocked(Octokit).mockReturnValue(mockOctokit);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      // Should have called readFileSync for each file
      expect(fs.readFileSync).toHaveBeenCalledTimes(3); // 2 files + 1 CLAUDE.md template
    });

    it('should return file paths relative to basePrefix', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Content');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.md', isDirectory: () => false } as fs.Dirent,
      ]);

      const mockOctokit = {
        git: {
          getRef: vi.fn().mockResolvedValue({ data: { object: { sha: 'ref-sha' } } }),
          getCommit: vi.fn().mockResolvedValue({ data: { tree: { sha: 'tree-sha' } } }),
          createBlob: vi.fn().mockResolvedValue({ data: { sha: 'blob-sha' } }),
          createTree: vi.fn().mockResolvedValue({ data: { sha: 'new-tree-sha' } }),
          createCommit: vi.fn().mockResolvedValue({ data: { sha: 'commit-sha' } }),
          updateRef: vi.fn().mockResolvedValue({ data: {} }),
        },
      };
      vi.mocked(Octokit).mockReturnValue(mockOctokit);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      // Verify path.posix.join was used for relative paths
      expect(path.posix.join).toHaveBeenCalledWith('.claude', 'file.md');
    });

    it('should recursively collect files from subdirectories', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Content');

      // Mock nested structure: .claude/agents/agent.md
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce([
          { name: 'agents', isDirectory: () => true } as fs.Dirent,
        ])
        .mockReturnValueOnce([
          { name: 'agent.md', isDirectory: () => false } as fs.Dirent,
        ]);

      const mockOctokit = {
        git: {
          getRef: vi.fn().mockResolvedValue({ data: { object: { sha: 'ref-sha' } } }),
          getCommit: vi.fn().mockResolvedValue({ data: { tree: { sha: 'tree-sha' } } }),
          createBlob: vi.fn().mockResolvedValue({ data: { sha: 'blob-sha' } }),
          createTree: vi.fn().mockResolvedValue({ data: { sha: 'new-tree-sha' } }),
          createCommit: vi.fn().mockResolvedValue({ data: { sha: 'commit-sha' } }),
          updateRef: vi.fn().mockResolvedValue({ data: {} }),
        },
      };
      vi.mocked(Octokit).mockReturnValue(mockOctokit);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      // Should collect nested files
      expect(fs.readdirSync).toHaveBeenCalledTimes(2);
    });

    it('should read file content as UTF-8', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('UTF-8 content: 日本語');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.md', isDirectory: () => false } as fs.Dirent,
      ]);

      const mockOctokit = {
        git: {
          getRef: vi.fn().mockResolvedValue({ data: { object: { sha: 'ref-sha' } } }),
          getCommit: vi.fn().mockResolvedValue({ data: { tree: { sha: 'tree-sha' } } }),
          createBlob: vi.fn().mockResolvedValue({ data: { sha: 'blob-sha' } }),
          createTree: vi.fn().mockResolvedValue({ data: { sha: 'new-tree-sha' } }),
          createCommit: vi.fn().mockResolvedValue({ data: { sha: 'commit-sha' } }),
          updateRef: vi.fn().mockResolvedValue({ data: {} }),
        },
      };
      vi.mocked(Octokit).mockReturnValue(mockOctokit);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(String), 'utf-8');
    });

    it('should return array with path and content for each file', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('File content');
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'file.md', isDirectory: () => false } as fs.Dirent,
      ]);

      const mockOctokit = {
        git: {
          getRef: vi.fn().mockResolvedValue({ data: { object: { sha: 'ref-sha' } } }),
          getCommit: vi.fn().mockResolvedValue({ data: { tree: { sha: 'tree-sha' } } }),
          createBlob: vi.fn().mockResolvedValue({ data: { sha: 'blob-sha' } }),
          createTree: vi.fn().mockResolvedValue({ data: { sha: 'new-tree-sha' } }),
          createCommit: vi.fn().mockResolvedValue({ data: { sha: 'commit-sha' } }),
          updateRef: vi.fn().mockResolvedValue({ data: {} }),
        },
      };
      vi.mocked(Octokit).mockReturnValue(mockOctokit);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      await deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token');

      // Verify createBlob was called with file content
      expect(mockOctokit.git.createBlob).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        content: expect.any(String),
        encoding: 'base64',
      });
    });

    it('should handle empty directories', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('CLAUDE.md content');
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      await expect(
        deployClaudeConfigToGitHub('owner', 'repo', 'test-project', 'token')
      ).rejects.toThrow('No files found in .claude/ template directory');
    });
  });

  describe('verifyClaudeConfig', () => {
    it('should return true when both .claude/ and CLAUDE.md exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['agent1.md', 'agent2.md']) // agents directory
        .mockReturnValueOnce(['cmd1.md']); // commands directory

      const result = await verifyClaudeConfig('/test/project');

      expect(result).toEqual({
        claudeDirExists: true,
        claudeMdExists: true,
        agentsCount: 2,
        commandsCount: 1,
      });
    });

    it('should return false when .claude/ does not exist', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        return path.toString().includes('CLAUDE.md');
      });

      const result = await verifyClaudeConfig('/test/project');

      expect(result.claudeDirExists).toBe(false);
      expect(result.claudeMdExists).toBe(true);
      expect(result.agentsCount).toBe(0);
      expect(result.commandsCount).toBe(0);
    });

    it('should return false when CLAUDE.md does not exist', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        return path.toString().includes('.claude');
      });
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const result = await verifyClaudeConfig('/test/project');

      expect(result.claudeDirExists).toBe(true);
      expect(result.claudeMdExists).toBe(false);
    });

    it('should count only .md files in agents directory', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce([
          'agent1.md',
          'agent2.md',
          'README.txt',
          '.DS_Store',
        ] as any)
        .mockReturnValueOnce(['cmd1.md'] as any);

      const result = await verifyClaudeConfig('/test/project');

      expect(result.agentsCount).toBe(2); // Only .md files
    });

    it('should count only .md files in commands directory', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['agent1.md'] as any)
        .mockReturnValueOnce([
          'cmd1.md',
          'cmd2.md',
          'cmd3.md',
          'README.txt',
        ] as any);

      const result = await verifyClaudeConfig('/test/project');

      expect(result.commandsCount).toBe(3); // Only .md files
    });

    it('should return 0 counts when subdirectories do not exist', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        // .claude exists but not subdirectories
        return (
          path.toString().includes('.claude') &&
          !path.toString().includes('agents') &&
          !path.toString().includes('commands')
        );
      });

      const result = await verifyClaudeConfig('/test/project');

      expect(result.claudeDirExists).toBe(true);
      expect(result.agentsCount).toBe(0);
      expect(result.commandsCount).toBe(0);
    });

    it('should handle empty agents and commands directories', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const result = await verifyClaudeConfig('/test/project');

      expect(result.agentsCount).toBe(0);
      expect(result.commandsCount).toBe(0);
    });
  });
});
