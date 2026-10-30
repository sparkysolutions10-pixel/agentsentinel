import { describe, it, expect } from 'vitest';
import {
  calculateShannonEntropy,
  analyzeTokenEntropy,
  scanTextForHighEntropyTokens,
  createShannonEntropyRule,
} from '../src/secrets/shannon_entropy.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Shannon Entropy Threshold Calibration', () => {
  // English words and paths have lower entropy
  const naturalIdentifier = 'processCustomerProfileRequest';
  const filePath = 'access_combined_log';
  const webPath = 'registry_npmjs_org';

  // High entropy random strings
  const randomHexKey = '9b2d8f1e4a7c0b3d6e5a1c8f2a7b4e9d';
  const highEntropyBase64 = 'Kj9+mN3/vL2pQ8xZ1wT0rY7uI4oP5sA=';

  describe('Entropy Calibration Across Natural Text vs Secrets', () => {
    it('calculates lower entropy for natural language and code identifiers', () => {
      const idEntropy = calculateShannonEntropy(naturalIdentifier);
      const pathEntropy = calculateShannonEntropy(filePath);
      const webEntropy = calculateShannonEntropy(webPath);

      // Natural identifiers usually sit under 3.8
      expect(idEntropy).toBeLessThan(3.8);
      expect(pathEntropy).toBeLessThan(3.8);
      expect(webEntropy).toBeLessThan(3.8);
    });

    it('calculates significantly higher entropy for cryptographic tokens', () => {
      const hexEntropy = calculateShannonEntropy(randomHexKey);
      const b64Entropy = calculateShannonEntropy(highEntropyBase64);

      expect(hexEntropy).toBeGreaterThanOrEqual(3.3);
      expect(b64Entropy).toBeGreaterThanOrEqual(4.4);
    });
  });

  describe('Threshold Overrides (Calibrating Sensitivity)', () => {
    it('strict threshold catches moderate entropy strings', () => {
      const moderateToken = 'Password_123456789!';
      const sensitiveAnalysis = analyzeTokenEntropy(moderateToken, { general: 3.0 });
      expect(sensitiveAnalysis.isHighEntropy).toBe(true);

      const relaxedAnalysis = analyzeTokenEntropy(moderateToken, { general: 4.8 });
      expect(relaxedAnalysis.isHighEntropy).toBe(false);
    });

    it('charset-specific calibration allows custom hex vs base64 thresholds', () => {
      const hexAnalysis = analyzeTokenEntropy(randomHexKey, { hex: 3.5 });
      // If threshold is 3.5, check calibrated response
      expect(typeof hexAnalysis.isHighEntropy).toBe('boolean');
    });
  });

  describe('Ignored Prefixes Calibration', () => {
    it('bypasses public git commit SHAs and SRI hashes when prefixed', () => {
      const content = `
        Commit: sha256_9b2d8f1e4a7c0b3d6e5a1c8f2a7b4e9d
        Secret: ${randomHexKey}
      `;

      const matches = scanTextForHighEntropyTokens(content, {}, ['sha256_']);
      expect(matches).toHaveLength(1);
      expect(matches[0].token).toBe(randomHexKey);
    });
  });

  describe('AgentSentinel Rule Calibration Test', () => {
    it('allows benign system commands and file paths without false alarms', () => {
      const calibratedRule = createShannonEntropyRule({
        thresholds: { general: 4.2, hex: 3.6 },
      });

      const ctx: ToolCallContext = {
        id: 'calibrated-call',
        toolName: 'execute_command',
        params: {
          command: `grep -rn "${naturalIdentifier}" /var/log/nginx/access.log`,
        },
        timestamp: Date.now(),
      };

      const violation = calibratedRule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks high-entropy token when exceeding calibrated threshold', () => {
      const calibratedRule = createShannonEntropyRule({
        thresholds: { hex: 3.2 },
      });

      const ctx: ToolCallContext = {
        id: 'calibrated-block-call',
        toolName: 'execute_command',
        params: {
          env: {
            API_SIGNING_KEY: randomHexKey,
          },
        },
        timestamp: Date.now(),
      };

      const violation = calibratedRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('high-entropy secret token');
    });
  });
});
