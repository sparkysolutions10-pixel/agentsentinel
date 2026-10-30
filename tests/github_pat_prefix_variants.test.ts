import { describe, it, expect } from 'vitest';
import {
  detectGitHubTokens,
  scrubGitHubTokens,
  maskGitHubToken,
  createGitHubTokenScrubberRule,
  redactGitHubTokensInParams,
} from '../src/secrets/github_token_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('GitHub PAT Scrubbing Across Standard Prefix Variants', () => {
  const ghp = 'ghp_' + 'A'.repeat(36);
  const gho = 'gho_' + 'B'.repeat(36);
  const ghu = 'ghu_' + 'C'.repeat(36);
  const ghs = 'ghs_' + 'D'.repeat(36);
  const ghr = 'ghr_' + 'E'.repeat(40);
  const fineGrained = 'github_pat_' + 'F'.repeat(82);

  describe('Prefix Variant Detection Matrix', () => {
    it('detects each prefix variant correctly with classification', () => {
      const corpus = [
        `ghp: ${ghp}`,
        `gho: ${gho}`,
        `ghu: ${ghu}`,
        `ghs: ${ghs}`,
        `ghr: ${ghr}`,
        `fine-grained: ${fineGrained}`,
      ].join('\n');

      const matches = detectGitHubTokens(corpus);
      expect(matches).toHaveLength(6);

      const types = matches.map((m) => m.tokenType);
      expect(types).toContain('ClassicPAT');
      expect(types).toContain('OAuthToken');
      expect(types).toContain('UserToServerToken');
      expect(types).toContain('ServerToServerToken');
      expect(types).toContain('RefreshToken');
      expect(types).toContain('FineGrainedPAT');
    });

    it('rejects invalid or non-token prefixes to avoid false positives', () => {
      const corpus = [
        'gh_not_a_valid_token_format',
        'ghpx_1234567890abcdef1234567890abcdef',
        'github_fake_token_12345',
        'gh_token=myrandompassword123',
      ].join('\n');

      const matches = detectGitHubTokens(corpus);
      expect(matches).toHaveLength(0);
    });

    it('rejects truncated tokens that do not meet length criteria', () => {
      const shortGhp = 'ghp_short123';
      const shortFineGrained = 'github_pat_short';
      const matches = detectGitHubTokens(`${shortGhp} and ${shortFineGrained}`);
      expect(matches).toHaveLength(0);
    });
  });

  describe('Masking and Scrubbing Consistency', () => {
    it('masks ghp_, gho_, ghu_, ghs_, ghr_ with prefix and 4 trailing characters', () => {
      expect(maskGitHubToken(ghp)).toBe('ghp_***' + ghp.slice(-4));
      expect(maskGitHubToken(gho)).toBe('gho_***' + gho.slice(-4));
      expect(maskGitHubToken(ghu)).toBe('ghu_***' + ghu.slice(-4));
      expect(maskGitHubToken(ghs)).toBe('ghs_***' + ghs.slice(-4));
      expect(maskGitHubToken(ghr)).toBe('ghr_***' + ghr.slice(-4));
    });

    it('scrubs tokens embedded within GitHub Actions workflow YAML files', () => {
      const workflowYaml = `
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${ghp}
      - name: Deploy
        env:
          RELEASE_TOKEN: ${fineGrained}
`;

      const result = scrubGitHubTokens(workflowYaml, { replacement: '[REDACTED_SECRET]' });
      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).not.toContain(ghp);
      expect(result.scrubbedText).not.toContain(fineGrained);
      expect(result.scrubbedText).toContain('token: [REDACTED_SECRET]');
      expect(result.scrubbedText).toContain('RELEASE_TOKEN: [REDACTED_SECRET]');
    });

    it('scrubs tokens inside HTTP authorization headers', () => {
      const header1 = `Authorization: token ${ghp}`;
      const header2 = `Authorization: Bearer ${fineGrained}`;

      const scrubbed1 = scrubGitHubTokens(header1);
      const scrubbed2 = scrubGitHubTokens(header2);

      expect(scrubbed1.scrubbedText).toBe(`Authorization: token ${maskGitHubToken(ghp)}`);
      expect(scrubbed2.scrubbedText).toBe(`Authorization: Bearer ${maskGitHubToken(fineGrained)}`);
    });
  });

  describe('AgentSentinel Deep Redaction Engine Integration', () => {
    const rule = createGitHubTokenScrubberRule({ mode: 'redact' });

    it('redacts tokens across nested arrays and objects in tool parameters', () => {
      const ctx: ToolCallContext = {
        id: 'nested-gh-call',
        toolName: 'deploy_service',
        params: {
          config: {
            auth: {
              primaryToken: ghp,
              backupToken: gho,
            },
            repos: [
              `https://${ghs}@github.com/org/repo1.git`,
              `https://${fineGrained}@github.com/org/repo2.git`,
            ],
          },
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);

      const redacted = violation?.redactedParams;
      expect(redacted?.config.auth.primaryToken).toBe('[REDACTED_GITHUB_TOKEN]');
      expect(redacted?.config.auth.backupToken).toBe('[REDACTED_GITHUB_TOKEN]');
      expect(redacted?.config.repos[0]).toBe('https://[REDACTED_GITHUB_TOKEN]@github.com/org/repo1.git');
      expect(redacted?.config.repos[1]).toBe('https://[REDACTED_GITHUB_TOKEN]@github.com/org/repo2.git');
    });
  });
});
