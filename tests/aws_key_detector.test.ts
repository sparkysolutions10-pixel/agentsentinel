import { describe, it, expect } from 'vitest';
import {
  detectAWSKeys,
  scrubAWSKeys,
  maskAWSAccessKey,
  maskAWSSecretKey,
  createAWSKeyDetectorRule,
  scanContextForAWSKeys,
} from '../src/secrets/aws_key_detector.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('AWS Key Detector', () => {
  describe('detectAWSKeys', () => {
    it('detects standard AKIA access keys', () => {
      const text = 'export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE';
      const matches = detectAWSKeys(text);
      expect(matches).toHaveLength(1);
      expect(matches[0].keyType).toBe('AccessKeyId');
      expect(matches[0].rawKey).toBe('AKIAIOSFODNN7EXAMPLE');
      expect(matches[0].prefix).toBe('AKIA');
    });

    it('detects temporary ASIA session access keys', () => {
      const text = 'Running AWS command with credentials: ASIAIOSFODNN7EXAMPLE';
      const matches = detectAWSKeys(text);
      expect(matches).toHaveLength(1);
      expect(matches[0].keyType).toBe('AccessKeyId');
      expect(matches[0].prefix).toBe('ASIA');
    });

    it('detects other valid prefixes (ABIA, ACCA, APKA, AGPA, AIDA, AROA, AIPA)', () => {
      const text = 'Keys: ABIA1234567890ABCDEF and AROA9876543210FEDCBA';
      const matches = detectAWSKeys(text);
      expect(matches).toHaveLength(2);
      expect(matches[0].prefix).toBe('ABIA');
      expect(matches[1].prefix).toBe('AROA');
    });

    it('does not trigger on random 20-character strings without AWS prefix', () => {
      const text = 'Here is a token: XYZW1234567890ABCDEF';
      const matches = detectAWSKeys(text);
      expect(matches).toHaveLength(0);
    });

    it('detects AWS Secret Access Keys in assignments', () => {
      const text = 'aws_secret_access_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"';
      const matches = detectAWSKeys(text);
      expect(matches.some((m) => m.keyType === 'SecretAccessKey')).toBe(true);
      const secretMatch = matches.find((m) => m.keyType === 'SecretAccessKey');
      expect(secretMatch?.rawKey).toBe('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
    });

    it('detects AWS STS Session Tokens', () => {
      const sampleToken = 'AQoDYXdzEJr1kABCDEF0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.padEnd(100, 'A');
      const text = `aws_session_token: "${sampleToken}"`;
      const matches = detectAWSKeys(text);
      expect(matches.some((m) => m.keyType === 'SessionToken')).toBe(true);
    });
  });

  describe('masking utilities', () => {
    it('masks Access Key keeping prefix and 4-char suffix', () => {
      const masked = maskAWSAccessKey('AKIAIOSFODNN7EXAMPLE');
      expect(masked).toBe('AKIA***MPLE');
    });

    it('masks Secret Key properly', () => {
      const masked = maskAWSSecretKey('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
      expect(masked).toBe('aws_sec_***EKEY');
    });
  });

  describe('scrubAWSKeys', () => {
    it('scrubs credentials from a config string', () => {
      const input = 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\naws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
      const result = scrubAWSKeys(input);
      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(result.scrubbedText).toContain('AKIA***MPLE');
    });

    it('supports custom replacement token', () => {
      const input = 'Key is AKIAIOSFODNN7EXAMPLE';
      const result = scrubAWSKeys(input, { replacement: '[REDACTED_AWS]' });
      expect(result.scrubbedText).toBe('Key is [REDACTED_AWS]');
    });
  });

  describe('createAWSKeyDetectorRule', () => {
    const rule = createAWSKeyDetectorRule();

    it('passes when no AWS keys are present in context', () => {
      const ctx: ToolCallContext = {
        id: 'call-1',
        toolName: 'read_file',
        params: { path: '/tmp/test.txt' },
        timestamp: Date.now(),
      };
      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks tool calls containing AWS Access Keys in nested parameters', () => {
      const ctx: ToolCallContext = {
        id: 'call-2',
        toolName: 'execute_command',
        params: {
          command: 'aws s3 ls',
          env: {
            AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
          },
        },
        timestamp: Date.now(),
      };
      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('Disallowed AWS credential leaked');
    });

    it('redacts tool call parameters when mode is set to redact', () => {
      const redactRule = createAWSKeyDetectorRule({ mode: 'redact' });
      const ctx: ToolCallContext = {
        id: 'call-3',
        toolName: 'write_file',
        params: {
          content: 'AccessKey: AKIAIOSFODNN7EXAMPLE in script',
        },
        timestamp: Date.now(),
      };
      const violation = redactRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.content).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(violation?.redactedParams?.content).toContain('[REDACTED_AWS_CREDENTIAL]');
    });
  });
});
