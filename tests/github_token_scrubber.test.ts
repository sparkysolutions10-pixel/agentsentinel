import { describe, it, expect } from 'vitest';
import {
  detectGitHubTokens,
  scrubGitHubTokens,
  maskGitHubToken,
  createGitHubTokenScrubberRule,
  redactGitHubTokensInParams,
} from '../src/secrets/github_token_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('GitHub Token Scrubber', () => {
  const sampleClassicPAT = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const sampleFineGrainedPAT = 'github_pat_11ABCD123_' + '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.slice(0, 71);

  describe('detectGitHubTokens', () => {
    it('detects classic personal access token (ghp_)', () => {
      const text = `const token = "${sampleClassicPAT}";`;
      const matches = detectGitHubTokens(text);
      expect(matches).toHaveLength(1);
      expect(matches[0].tokenType).toBe('ClassicPAT');
      expect(matches[0].rawToken).toBe(sampleClassicPAT);
      expect(matches[0].prefix).toBe('ghp');
    });

    it('detects fine-grained personal access token (github_pat_)', () => {
      const text = `Authorization: Bearer ${sampleFineGrainedPAT}`;
      const matches = detectGitHubTokens(text);
      expect(matches).toHaveLength(1);
      expect(matches[0].tokenType).toBe('FineGrainedPAT');
      expect(matches[0].rawToken).toBe(sampleFineGrainedPAT);
    });

    it('detects OAuth access token (gho_)', () => {
      const oAuthToken = 'gho_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const matches = detectGitHubTokens(`GH_OAUTH_TOKEN=${oAuthToken}`);
      expect(matches).toHaveLength(1);
      expect(matches[0].tokenType).toBe('OAuthToken');
      expect(matches[0].prefix).toBe('gho');
    });

    it('detects user-to-server (ghu_) and server-to-server (ghs_) tokens', () => {
      const uToken = 'ghu_111122223333444455556666777788889999';
      const sToken = 'ghs_AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHIIII';
      const matches = detectGitHubTokens(`Tokens: ${uToken} and ${sToken}`);
      expect(matches).toHaveLength(2);
      expect(matches[0].tokenType).toBe('UserToServerToken');
      expect(matches[1].tokenType).toBe('ServerToServerToken');
    });

    it('detects tokens embedded in git clone remote URLs', () => {
      const url = `git clone https://${sampleClassicPAT}@github.com/myorg/myrepo.git`;
      const matches = detectGitHubTokens(url);
      expect(matches).toHaveLength(1);
      expect(matches[0].tokenType).toBe('ClassicPAT');
      expect(matches[0].rawToken).toBe(sampleClassicPAT);
    });
  });

  describe('maskGitHubToken', () => {
    it('masks classic PAT keeping prefix and last 4 chars', () => {
      const masked = maskGitHubToken(sampleClassicPAT);
      expect(masked).toBe('ghp_***6789');
    });

    it('masks fine-grained PAT keeping github_pat_ prefix and last 4 chars', () => {
      const masked = maskGitHubToken(sampleFineGrainedPAT);
      expect(masked.startsWith('github_pat_***')).toBe(true);
    });
  });

  describe('scrubGitHubTokens', () => {
    it('scrubs classic token from string', () => {
      const input = `export GITHUB_TOKEN="${sampleClassicPAT}"`;
      const result = scrubGitHubTokens(input);
      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).not.toContain(sampleClassicPAT);
      expect(result.scrubbedText).toContain('ghp_***6789');
    });

    it('supports custom replacement token', () => {
      const input = `git remote set-url origin https://${sampleClassicPAT}@github.com/repo.git`;
      const result = scrubGitHubTokens(input, { replacement: '[REDACTED_GH_TOKEN]' });
      expect(result.scrubbedText).toBe('git remote set-url origin https://[REDACTED_GH_TOKEN]@github.com/repo.git');
    });
  });

  describe('createGitHubTokenScrubberRule', () => {
    const rule = createGitHubTokenScrubberRule();

    it('allows clean tool contexts without tokens', () => {
      const ctx: ToolCallContext = {
        id: 'gh-clean',
        toolName: 'git_status',
        params: { branch: 'main' },
        timestamp: Date.now(),
      };
      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks tool calls with leaked GitHub token in params', () => {
      const ctx: ToolCallContext = {
        id: 'gh-leak',
        toolName: 'execute_command',
        params: {
          cmd: `git push https://${sampleClassicPAT}@github.com/org/repo.git main`,
        },
        timestamp: Date.now(),
      };
      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('Disallowed GitHub token leaked');
    });

    it('redacts tokens when configured in redact mode', () => {
      const redactRule = createGitHubTokenScrubberRule({ mode: 'redact' });
      const ctx: ToolCallContext = {
        id: 'gh-redact',
        toolName: 'write_file',
        params: {
          content: `const pat = "${sampleClassicPAT}";`,
        },
        timestamp: Date.now(),
      };
      const violation = redactRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.content).not.toContain(sampleClassicPAT);
      expect(violation?.redactedParams?.content).toContain('[REDACTED_GITHUB_TOKEN]');
    });
  });
});
