import { describe, it, expect } from 'vitest';
import {
  scanStringForSecrets,
  scanContextForSecrets,
  highEntropySecretGuardRule,
} from '../src/secrets/entropy_matcher.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Secret Pattern Matcher against Synthetic Test Tokens (Issue #82)', () => {
  describe('High-accuracy detection of synthetic credentials', () => {
    it('detects synthetic JWT / Bearer tokens', () => {
      const syntheticBearer =
        'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const matches = scanStringForSecrets(syntheticBearer);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].secretType).toBe('Bearer Token');
      expect(matches[0].entropy).toBeGreaterThan(3.5);
    });

    it('detects synthetic password assignments with complex symbols', () => {
      const payload = 'database_password = "C0mpl3xP@ssw0rd!#$2026_Secure"';
      const matches = scanStringForSecrets(payload);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].secretType).toBe('Secret Assignment');
    });

    it('detects 64-character SHA-256 HMAC secret keys', () => {
      const hmacKey = '8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b';
      const text = `hmac_secret: "${hmacKey}"`;
      const matches = scanStringForSecrets(text);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some((m) => m.matchedText.includes(hmacKey))).toBe(true);
    });

    it('detects synthetic high-entropy Base64 API tokens', () => {
      const b64Token = 'dGhpcy1pcy1hLXNlY3JldC10b2tlbi13aXRoLWhpZ2gtZW50cm9weS0xMjM0NTY=';
      const matches = scanStringForSecrets(b64Token);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].entropy).toBeGreaterThan(4.0);
    });
  });

  describe('Zero false positives on non-secret standard data', () => {
    it('does not flag standard UUID identifiers', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(scanStringForSecrets(uuid)).toHaveLength(0);
    });

    it('does not flag standard URLs and endpoints', () => {
      const url = 'https://api.github.com/repos/sparkysolutions10-pixel/agentsentinel/issues?state=open';
      expect(scanStringForSecrets(url)).toHaveLength(0);
    });

    it('does not flag CSS hex colors and hex style rules', () => {
      const css = 'background-color: #3b82f6; border-color: #ffffff; color: #1e293b;';
      expect(scanStringForSecrets(css)).toHaveLength(0);
    });

    it('does not flag typical software development logs', () => {
      const log = '[INFO] Server started successfully on port 8080. Connected to Postgres database.';
      expect(scanStringForSecrets(log)).toHaveLength(0);
    });

    it('does not flag package identifiers and semver versions', () => {
      const semver = '@agentsentinel/core@0.1.0-alpha.5+build.2026';
      expect(scanStringForSecrets(semver)).toHaveLength(0);
    });
  });

  describe('Sentinel Rule verification on synthetic secret parameters', () => {
    it('blocks tool calls with synthetic token with critical severity', () => {
      const ctx: ToolCallContext = {
        toolName: 'http_post',
        params: {
          headers: {
            Authorization: 'Bearer 7c9e3d2a1b0f5e8c4d6a7b9e0f1c2d3e4a5b6c7d',
          },
          body: '{"action": "sync"}',
        },
      };

      const violation = highEntropySecretGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('Bearer Token');
    });

    it('allows clean tool calls with standard parameters', () => {
      const ctx: ToolCallContext = {
        toolName: 'http_get',
        params: {
          url: 'https://api.example.com/status',
          requestId: '123e4567-e89b-12d3-a456-426614174000',
        },
      };

      expect(highEntropySecretGuardRule.evaluate(ctx)).toBeNull();
    });
  });
});
