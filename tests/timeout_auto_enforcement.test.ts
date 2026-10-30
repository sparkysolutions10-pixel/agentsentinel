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

describe('Timeout Missing Injection and Auto-Enforcement (#53)', () => {
  describe('Default Timeout Injection on Missing Values', () => {
    it('injects default 30000ms when params have no timeout attributes', () => {
      const params = { CommandLine: 'whoami' };
      const { result, updatedParams } = enforceCommandTimeout(params);

      expect(result.actionTaken).toBe('injected');
      expect(result.hasValidTimeout).toBe(true);
      expect(result.injectedTimeoutMs).toBe(30000);
      expect(updatedParams.timeout).toBe(30000);
      expect(updatedParams.CommandLine).toBe('whoami');
    });

    it('injects default timeout when timeout field is explicitly null', () => {
      const params = { command: 'uptime', timeout: null };
      const { result, updatedParams } = enforceCommandTimeout(params);

      expect(result.actionTaken).toBe('injected');
      expect(result.hasValidTimeout).toBe(true);
      expect(updatedParams.timeout).toBe(DEFAULT_TIMEOUT_MS);
    });

    it('injects default timeout when timeout field is undefined', () => {
      const params = { command: 'date', timeoutMs: undefined };
      const { result, updatedParams } = enforceCommandTimeout(params);

      expect(result.actionTaken).toBe('injected');
      expect(updatedParams.timeout).toBe(DEFAULT_TIMEOUT_MS);
    });

    it('overwrites NaN string values with safe default timeout', () => {
      const params = { command: 'echo hello', timeout: 'unlimited' };
      const { result, updatedParams } = enforceCommandTimeout(params);

      expect(result.actionTaken).toBe('injected');
      expect(updatedParams.timeout).toBe(DEFAULT_TIMEOUT_MS);
    });

    it('overwrites zero or negative string timeout values', () => {
      const zeroParams = { command: 'test', timeout: '0' };
      const { updatedParams: zeroRes } = enforceCommandTimeout(zeroParams);
      expect(zeroRes.timeout).toBe(DEFAULT_TIMEOUT_MS);

      const negParams = { command: 'test', timeout: -999 };
      const { updatedParams: negRes } = enforceCommandTimeout(negParams);
      expect(negRes.timeout).toBe(DEFAULT_TIMEOUT_MS);
    });
  });

  describe('Custom Safe Ceiling Configuration', () => {
    it('honors custom defaultTimeoutMs when injected', () => {
      const params = { command: 'sleep 5' };
      const { result, updatedParams } = enforceCommandTimeout(params, {
        defaultTimeoutMs: 15000,
      });

      expect(result.actionTaken).toBe('injected');
      expect(result.injectedTimeoutMs).toBe(15000);
      expect(updatedParams.timeout).toBe(15000);
    });

    it('clamps oversized requests down to custom ceiling limit', () => {
      const params = { command: 'tar -czf out.tar.gz /data', timeout: 900000 };
      const { result, updatedParams } = enforceCommandTimeout(params, {
        maxAllowedTimeoutMs: 60000,
      });

      expect(result.actionTaken).toBe('capped');
      expect(result.cappedTimeoutMs).toBe(60000);
      expect(updatedParams.timeout).toBe(60000);
    });
  });

  describe('Rule Evaluation and Engine Redaction Flow', () => {
    it('evaluates shell tool context and returns REDACT verdict containing updated params', () => {
      const violation = timeoutEnforcementRule.evaluate({
        id: 'eval-missing-to',
        toolName: 'run_command',
        params: { CommandLine: 'npm list' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.severity).toBe('low');
      expect(violation?.redactedParams?.timeout).toBe(30000);
      expect(violation?.redactedParams?.CommandLine).toBe('npm list');
    });

    it('does not mutate original context params object directly', () => {
      const originalParams = { command: 'pwd' };
      const violation = timeoutEnforcementRule.evaluate({
        id: 'eval-immutable',
        toolName: 'exec',
        params: originalParams,
        timestamp: Date.now(),
      });

      expect(originalParams).toEqual({ command: 'pwd' });
      expect(violation?.redactedParams?.timeout).toBe(DEFAULT_TIMEOUT_MS);
    });

    it('passes through when valid bounded timeout is explicitly provided', () => {
      const violation = timeoutEnforcementRule.evaluate({
        id: 'eval-valid-to',
        toolName: 'bash',
        params: { command: 'echo 123', timeout: 10000 },
        timestamp: Date.now(),
      });

      expect(violation).toBeNull();
    });

    it('pipeline integration: SentinelEngine passes evaluation with redacted parameters', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(timeoutEnforcementRule);

      const evalRes = await engine.evaluate({
        id: 'engine-auto-injection',
        toolName: 'powershell',
        params: { command: 'Get-Process' },
        timestamp: Date.now(),
      });

      expect(evalRes.allowed).toBe(true);
      expect(evalRes.verdict).toBe(Verdict.REDACT);
      expect(evalRes.redactedParams?.timeout).toBe(30000);
      expect(evalRes.violations.length).toBe(1);
      expect(evalRes.violations[0].ruleId).toBe('enforce-command-timeout');
    });
  });
});
