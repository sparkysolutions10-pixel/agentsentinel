import { describe, it, expect } from 'vitest';
import {
  calculateShannonEntropy,
  detectTokenCharacterSet,
  getMaxEntropyForCharset,
  analyzeTokenEntropy,
  scanTextForHighEntropyTokens,
  createShannonEntropyRule,
} from '../src/secrets/shannon_entropy.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Shannon Entropy Calculator and Token Detector', () => {
  const repeatingLowEntropy = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const alternatingLowEntropy = 'ABABABABABABABABABABABABABABABAB';
  const highEntropyHex = 'd41d8cd98f00b204e9800998ecf8427e'; // MD5-like hex
  const highEntropyBase64 = 'cGFzc3dvcmRfZXhhbXBsZV8xMjM0NTY3OA=='; // Base64
  const highEntropyToken = 'Kj8#mN9$vL2!xQ4@zP7&wR1%'; // High ASCII entropy

  describe('calculateShannonEntropy', () => {
    it('computes 0 bits entropy for single-character repetitions', () => {
      const entropy = calculateShannonEntropy(repeatingLowEntropy);
      expect(entropy).toBe(0);
    });

    it('computes 1.0 bit entropy for 50/50 alternating characters', () => {
      const entropy = calculateShannonEntropy(alternatingLowEntropy);
      expect(entropy).toBeCloseTo(1.0, 2);
    });

    it('computes high entropy (>= 3.0) for diverse hex/base64 strings', () => {
      const hexEntropy = calculateShannonEntropy(highEntropyHex);
      const b64Entropy = calculateShannonEntropy(highEntropyBase64);

      expect(hexEntropy).toBeGreaterThanOrEqual(3.0);
      expect(b64Entropy).toBeGreaterThanOrEqual(3.5);
    });
  });

  describe('detectTokenCharacterSet and getMaxEntropyForCharset', () => {
    it('identifies character sets accurately', () => {
      expect(detectTokenCharacterSet(highEntropyHex)).toBe('hex');
      expect(detectTokenCharacterSet('JBSWY3DPEBLW64TMMQ======')).toBe('base32');
      expect(detectTokenCharacterSet(highEntropyBase64)).toBe('base64');
      expect(detectTokenCharacterSet('Admin_Account_Token_01')).toBe('alphanumeric');
    });

    it('returns theoretical maximum entropy per charset', () => {
      expect(getMaxEntropyForCharset('hex')).toBe(4.0);
      expect(getMaxEntropyForCharset('base32')).toBe(5.0);
      expect(getMaxEntropyForCharset('base64')).toBe(6.0);
      expect(getMaxEntropyForCharset('ascii')).toBe(6.57);
    });
  });

  describe('analyzeTokenEntropy', () => {
    it('flags high entropy on random cryptographic tokens', () => {
      const analysis = analyzeTokenEntropy(highEntropyHex);
      expect(analysis.isHighEntropy).toBe(true);
      expect(analysis.normalizedEntropy).toBeGreaterThan(0.7);
    });

    it('does not flag low-entropy words or short tokens', () => {
      const analysis = analyzeTokenEntropy(repeatingLowEntropy);
      expect(analysis.isHighEntropy).toBe(false);
      expect(analysis.normalizedEntropy).toBe(0);
    });
  });

  describe('scanTextForHighEntropyTokens', () => {
    it('finds high-entropy tokens embedded in code or configuration', () => {
      const script = `
        const host = "localhost";
        const port = 8080;
        const secretToken = "${highEntropyHex}";
      `;

      const matches = scanTextForHighEntropyTokens(script);
      expect(matches.length).toBeGreaterThanOrEqual(1);
      expect(matches[0].token).toBe(highEntropyHex);
    });
  });

  describe('createShannonEntropyRule', () => {
    const rule = createShannonEntropyRule();

    it('allows clean tool contexts with regular code and short strings', () => {
      const ctx: ToolCallContext = {
        id: 'clean-call',
        toolName: 'read_config',
        params: { path: '/app/config.json', mode: 'read' },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks tool calls with exposed high-entropy secrets', () => {
      const ctx: ToolCallContext = {
        id: 'entropy-block',
        toolName: 'execute_script',
        params: {
          token: highEntropyHex,
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('high-entropy secret token');
    });

    it('redacts high-entropy secrets when configured in redact mode', () => {
      const redactRule = createShannonEntropyRule({ mode: 'redact' });
      const ctx: ToolCallContext = {
        id: 'entropy-redact',
        toolName: 'write_env',
        params: {
          key: highEntropyHex,
        },
        timestamp: Date.now(),
      };

      const violation = redactRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.key).toBe('[HIGH_ENTROPY_TOKEN_REDACTED]');
    });
  });
});
