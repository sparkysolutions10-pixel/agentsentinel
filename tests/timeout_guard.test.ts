import { describe, it, expect } from 'vitest';
import {
  enforceCommandTimeout,
  timeoutEnforcementRule,
  createTimeoutEnforcementRule,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_MAX_TIMEOUT_MS,
} from '../src/shell/timeout.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Command Execution Timeout Enforcement Guard', () => {
  describe('enforceCommandTimeout Parameter Sanitation', () => {
    it('auto-injects default timeout when missing in lenient mode', () => {
      const params = { command: 'ls -la' };
      const { result, updatedParams } = enforceCommandTimeout(params);

      expect(result.actionTaken).toBe('injected');
      expect(result.hasValidTimeout).toBe(true);
      expect(updatedParams.timeout).toBe(DEFAULT_TIMEOUT_MS);
      expect(result.reason).toContain('Missing execution timeout auto-injected');
    });

    it('blocks missing timeout when strictBlocking is enabled', () => {
      const params = { command: 'sleep 100' };
      const { result } = enforceCommandTimeout(params, { strictBlocking: true });

      expect(result.hasValidTimeout).toBe(false);
      expect(result.actionTaken).toBe('missing_blocked');
      expect(result.reason).toContain('Missing required execution timeout');
    });

    it('recognizes diverse timeout field names (timeoutMs, WaitMsBeforeAsync, maxTime)', () => {
      const cases = [
        { params: { command: 'ping', timeoutMs: 5000 }, expected: 5000 },
        { params: { command: 'ping', WaitMsBeforeAsync: 8000 }, expected: 8000 },
        { params: { command: 'ping', maxTime: 12000 }, expected: 12000 },
      ];

      for (const item of cases) {
        const { result } = enforceCommandTimeout(item.params);
        expect(result.actionTaken).toBe('valid');
        expect(result.detectedTimeoutMs).toBe(item.expected);
      }
    });

    it('caps oversized timeout exceeding maxAllowedTimeoutMs', () => {
      const params = { command: 'long-run', timeout: 9999999 };
      const { result, updatedParams } = enforceCommandTimeout(params, {
        maxAllowedTimeoutMs: 60000,
      });

      expect(result.actionTaken).toBe('capped');
      expect(updatedParams.timeout).toBe(60000);
      expect(result.cappedTimeoutMs).toBe(60000);
    });

    it('sanitizes invalid non-numeric or non-positive timeouts', () => {
      const params = { command: 'test', timeout: -50 };
      const { result, updatedParams } = enforceCommandTimeout(params);

      expect(result.actionTaken).toBe('injected');
      expect(updatedParams.timeout).toBe(DEFAULT_TIMEOUT_MS);
    });
  });

  describe('SentinelRule Integration', () => {
    it('timeoutEnforcementRule returns REDACT verdict to auto-populate missing timeout', () => {
      const violation = timeoutEnforcementRule.evaluate({
        id: 'call-timeout-1',
        toolName: 'bash',
        params: { command: 'git status' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.timeout).toBe(DEFAULT_TIMEOUT_MS);
    });

    it('strict rule blocks execution call when timeout is missing', () => {
      const strictRule = createTimeoutEnforcementRule({ strictBlocking: true });
      const violation = strictRule.evaluate({
        id: 'call-timeout-strict',
        toolName: 'bash',
        params: { command: 'while true; do echo 1; done' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('high');
    });

    it('permits calls that already include valid bounded timeouts', () => {
      const violation = timeoutEnforcementRule.evaluate({
        id: 'call-timeout-valid',
        toolName: 'bash',
        params: { command: 'npm test', timeout: 15000 },
        timestamp: Date.now(),
      });

      expect(violation).toBeNull();
    });
  });

  describe('SentinelEngine Pipeline Integration', () => {
    it('engine seamlessly injects timeout into tool context parameters', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(timeoutEnforcementRule);

      const result = await engine.evaluate({
        id: 'engine-timeout-eval',
        toolName: 'bash',
        params: { command: 'ls -la' },
        timestamp: Date.now(),
      });

      expect(result.allowed).toBe(true);
      expect(result.verdict).toBe(Verdict.REDACT);
      expect(result.redactedParams?.timeout).toBe(DEFAULT_TIMEOUT_MS);
    });
  });
});
