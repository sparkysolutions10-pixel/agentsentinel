import { describe, it, expect } from 'vitest';
import {
  calculateShannonEntropy,
  redactSecret,
  scanStringForSecrets,
  scanContextForSecrets,
  highEntropySecretGuardRule,
} from '../src/secrets/entropy_matcher.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('High-Entropy Secret Pattern Matcher (Issue #81)', () => {
  describe('calculateShannonEntropy', () => {
    it('returns 0 for identical repeating characters', () => {
      expect(calculateShannonEntropy('aaaaaaaaaaaa')).toBe(0);
    });

    it('returns higher entropy for diverse random character sets', () => {
      const low = calculateShannonEntropy('abababababab');
      const highHex = calculateShannonEntropy('4f2a9c1e7b8d0f3a6c5e1d8b2a7c4e9f');
      const highB64 = calculateShannonEntropy('Kj9+mN3/vL2pQ8xZ1wT0rY7uI4oP5sA=');

      expect(highHex).toBeGreaterThan(low);
      expect(highHex).toBeGreaterThan(3.4);
      expect(highB64).toBeGreaterThan(4.2);
    });
  });

  describe('redactSecret', () => {
    it('redacts long secret while preserving prefix and suffix', () => {
      expect(redactSecret('9f8e7d6c5b4a3210fedcba9876543210')).toBe('9f8***210');
    });

    it('masks short strings completely', () => {
      expect(redactSecret('secret')).toBe('********');
    });
  });

  describe('scanStringForSecrets detection', () => {
    it('detects high-entropy Bearer authorization tokens', () => {
      const text = 'Authorization: Bearer 4f2a9c1e7b8d0f3a6c5e1d8b2a7c4e9f';
      const matches = scanStringForSecrets(text);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].secretType).toBe('Bearer Token');
      expect(matches[0].redactedText).toBe('4f2***e9f');
    });

    it('detects secret key-value assignments', () => {
      const text = 'api_key = "a9f8b7c6d5e4f3a2b1c0d9e8f7a6b5c4"';
      const matches = scanStringForSecrets(text);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].secretType).toBe('Secret Assignment');
    });

    it('detects standalone 32-character hex API keys', () => {
      const text = 'curl -H "X-API-Key: 8f3c2a1e0d9b8a7c6e5f4d3b2a1c0e9f" https://api.service.com';
      const matches = scanStringForSecrets(text);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some((m) => m.matchedText.includes('8f3c2a1e0d9b8a7c6e5f4d3b2a1c0e9f'))).toBe(true);
    });

    it('ignores normal English prose and natural text without false positives', () => {
      const text = 'The quick brown fox jumps over the lazy dog. Today we are launching version 2.0 of our software.';
      const matches = scanStringForSecrets(text);
      expect(matches).toHaveLength(0);
    });
  });

  describe('scanContextForSecrets recursive parameter inspection', () => {
    it('detects secrets deeply nested in parameter objects', () => {
      const ctx: ToolCallContext = {
        toolName: 'http_request',
        params: {
          config: {
            auth: {
              token: 'Bearer a8f7e6d5c4b3a291807f6e5d4c3b2a19',
            },
          },
        },
      };
      const matches = scanContextForSecrets(ctx);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].location).toBe('config.auth.token');
    });

    it('detects secrets inside array parameters', () => {
      const ctx: ToolCallContext = {
        toolName: 'bash_exec',
        params: {
          args: ['--header', 'api_key="e9f8d7c6b5a43210fedcba9876543210"'],
        },
      };
      const matches = scanContextForSecrets(ctx);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].location).toBe('args[1]');
    });
  });

  describe('highEntropySecretGuardRule enforcement', () => {
    it('blocks tool calls with critical severity when secret is present', () => {
      const ctx: ToolCallContext = {
        toolName: 'api_fetch',
        params: {
          apiKey: 'api_key="f8e7d6c5b4a39281706f5e4d3c2b1a09"',
        },
      };
      const violation = highEntropySecretGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('secrets-detect-high-entropy');
      expect(violation?.reason).toContain('Potential credential leakage intercepted');
    });

    it('allows benign tool calls without secret tokens', () => {
      const ctx: ToolCallContext = {
        toolName: 'api_fetch',
        params: {
          endpoint: '/api/v1/users',
          limit: 25,
          search: 'alice smith',
        },
      };
      expect(highEntropySecretGuardRule.evaluate(ctx)).toBeNull();
    });
  });
});
