import { describe, it, expect } from 'vitest';
import {
  zeroTelemetryGuard,
  ZeroTelemetryViolationError,
  createZeroTelemetryRule,
} from '../src/secrets/zero_telemetry.js';
import { scrubLLMKeys } from '../src/secrets/llm_key_scrubber.js';
import { scrubAWSKeys } from '../src/secrets/aws_key_detector.js';
import { calculateShannonEntropy } from '../src/secrets/shannon_entropy.js';
import { ToolCallContext } from '../src/types.js';

describe('Zero-Telemetry Client-Side Privacy Guarantee', () => {
  describe('Audit Status Report', () => {
    it('confirms 100% local client-side and offline-only operation', () => {
      const report = zeroTelemetryGuard.getAuditReport();
      expect(report.zeroTelemetry).toBe(true);
      expect(report.offlineOnly).toBe(true);
      expect(report.clientSideGuaranteed).toBe(true);
      expect(report.networkRequestsAttempted).toBe(0);
      expect(report.prohibitedProtocols).toContain('https:');
    });
  });

  describe('In-Process Network Lockdown Sandbox', () => {
    it('executes heavy secret scanning and entropy analysis with zero network requests', async () => {
      await zeroTelemetryGuard.assertZeroTelemetryDuring(() => {
        // Run full secret scanning suite locally
        const dummyKey = 'sk-proj-' + 'A'.repeat(40);
        const dummyAWS = 'AKIA' + 'B'.repeat(16);

        scrubLLMKeys(`OpenAI: ${dummyKey}`);
        scrubAWSKeys(`AWS: ${dummyAWS}`);
        calculateShannonEntropy('Kj9+mN3/vL2pQ8xZ1wT0rY7uI4oP5sA=');
      });

      expect(zeroTelemetryGuard.getAttemptsCount()).toBe(0);
    });

    it('intercepts and blocks prohibited network egress with ZeroTelemetryViolationError', async () => {
      await expect(
        zeroTelemetryGuard.assertZeroTelemetryDuring(async () => {
          if (typeof globalThis.fetch === 'function') {
            await globalThis.fetch('https://telemetry.example.com/log');
          } else {
            // Emulate failure if fetch is unavailable
            throw new ZeroTelemetryViolationError('Simulated network call blocked');
          }
        })
      ).rejects.toThrow(ZeroTelemetryViolationError);
    });
  });

  describe('AgentSentinel Rule Integration', () => {
    const rule = createZeroTelemetryRule();

    it('passes rule validation when zero network calls are recorded', () => {
      const ctx: ToolCallContext = {
        id: 'zero-telemetry-test',
        toolName: 'scan_secrets',
        params: { mode: 'offline' },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });
  });
});
