import { describe, it, expect } from 'vitest';
import {
  validatePolicyConfig,
  compileDeclarativeRule,
  SentinelEngine,
  Verdict
} from '../src/index.js';

describe('Declarative Policy Schema & Compilation (Issue #8)', () => {
  it('validates a valid declarative policy JSON configuration', () => {
    const raw = {
      version: '1.0',
      rules: [
        {
          id: 'block-destructive-rm',
          name: 'Block Destructive Deletions',
          category: 'shell',
          priority: 100,
          match: {
            tools: ['bash:*', 'shell:run'],
            patterns: ['rm -rf', 'shred']
          },
          action: {
            verdict: 'BLOCK',
            reason: 'Destructive deletion blocked',
            severity: 'critical'
          }
        }
      ]
    };

    const validated = validatePolicyConfig(raw);
    expect(validated.version).toBe('1.0');
    expect(validated.rules.length).toBe(1);
    expect(validated.rules[0].id).toBe('block-destructive-rm');
    expect(validated.rules[0].action.verdict).toBe(Verdict.BLOCK);
  });

  it('compiles declarative rules into executable SentinelRule and evaluates correctly in SentinelEngine', async () => {
    const engine = new SentinelEngine();

    const policy = {
      version: '1.0',
      rules: [
        {
          id: 'redact-api-keys',
          name: 'Redact API Keys',
          category: 'secrets',
          priority: 80,
          match: {
            tools: ['*'],
            patterns: ['sk-live-']
          },
          action: {
            verdict: 'REDACT',
            reason: 'Production API key detected',
            redactKeys: ['apiKey']
          }
        },
        {
          id: 'block-raw-disk',
          name: 'Block Disk Formatting',
          category: 'shell',
          priority: 95,
          match: {
            tools: ['bash:*'],
            patterns: ['mkfs', 'dd if=/dev/zero']
          },
          action: {
            verdict: 'BLOCK',
            reason: 'Raw disk wiping is prohibited'
          }
        }
      ]
    };

    engine.loadPolicy(policy);
    expect(engine.getRegisteredRules().length).toBe(2);

    // Test matching blocking rule
    const blockRes = await engine.evaluate({
      id: 'p-test-1',
      toolName: 'bash:exec',
      params: { command: 'mkfs.ext4 /dev/sda1' },
      timestamp: Date.now()
    });
    expect(blockRes.verdict).toBe(Verdict.BLOCK);
    expect(blockRes.allowed).toBe(false);

    // Test matching redaction rule
    const redactRes = await engine.evaluate({
      id: 'p-test-2',
      toolName: 'http:post',
      params: { apiKey: 'sk-live-secret999' },
      timestamp: Date.now()
    });
    expect(redactRes.verdict).toBe(Verdict.REDACT);
    expect(redactRes.redactedParams?.apiKey).toBe('[REDACTED]');
  });
});
