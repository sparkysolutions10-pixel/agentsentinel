import { describe, it, expect } from 'vitest';
import { SentinelEngine, SentinelRule, Verdict, ToolCallContext } from '../src/index.js';

describe('SentinelEngine Latency Overhead Benchmark (Issue #11)', () => {
  it('guarantees average rule inspection latency is strictly under 2ms across 1,000 synthetic calls', async () => {
    const engine = new SentinelEngine();

    // Register 10 realistic security inspection rules
    const rules: SentinelRule[] = [
      {
        id: 'bench-shell-rm',
        name: 'RM Blocker',
        category: 'shell',
        priority: 100,
        enabled: true,
        evaluate: (ctx) => {
          if (ctx.params.cmd?.includes('rm -rf')) {
            return { ruleId: 'bench-shell-rm', ruleName: 'RM Blocker', severity: 'critical', verdict: Verdict.BLOCK, reason: 'Denied' };
          }
          return null;
        }
      },
      {
        id: 'bench-sql-injection',
        name: 'SQLi Blocker',
        category: 'sql',
        priority: 90,
        enabled: true,
        evaluate: (ctx) => {
          if (ctx.params.query?.toLowerCase().includes('union select')) {
            return { ruleId: 'bench-sql-injection', ruleName: 'SQLi Blocker', severity: 'critical', verdict: Verdict.BLOCK, reason: 'SQLi' };
          }
          return null;
        }
      },
      {
        id: 'bench-secrets-token',
        name: 'Token Redactor',
        category: 'secrets',
        priority: 80,
        enabled: true,
        evaluate: (ctx) => {
          if (ctx.params.apiKey?.startsWith('sk-')) {
            return {
              ruleId: 'bench-secrets-token',
              ruleName: 'Token Redactor',
              severity: 'high',
              verdict: Verdict.REDACT,
              reason: 'Scrubbed',
              redactedParams: { ...ctx.params, apiKey: '[REDACTED]' }
            };
          }
          return null;
        }
      },
      {
        id: 'bench-fs-shadow',
        name: 'Shadow File Blocker',
        category: 'fs',
        priority: 75,
        enabled: true,
        evaluate: (ctx) => {
          if (ctx.params.path?.includes('/etc/shadow')) {
            return { ruleId: 'bench-fs-shadow', ruleName: 'Shadow File Blocker', severity: 'critical', verdict: Verdict.BLOCK, reason: 'Shadow denied' };
          }
          return null;
        }
      },
      {
        id: 'bench-network-ssrf',
        name: 'SSRF Metadata Blocker',
        category: 'network',
        priority: 70,
        enabled: true,
        evaluate: (ctx) => {
          if (ctx.params.url?.includes('169.254.169.254')) {
            return { ruleId: 'bench-network-ssrf', ruleName: 'SSRF Metadata Blocker', severity: 'critical', verdict: Verdict.BLOCK, reason: 'SSRF blocked' };
          }
          return null;
        }
      }
    ];

    engine.registerRules(rules);

    const callCount = 1_000;
    const latencies: number[] = [];

    // Warm-up run
    for (let i = 0; i < 50; i++) {
      await engine.evaluate({
        id: `warmup-${i}`,
        toolName: 'read_file',
        params: { path: '/tmp/test.log' },
        timestamp: Date.now()
      });
    }

    // Benchmark 1,000 synthetic calls
    for (let i = 0; i < callCount; i++) {
      const res = await engine.evaluate({
        id: `bench-call-${i}`,
        toolName: i % 2 === 0 ? 'fs:read' : 'network:fetch',
        params: {
          path: `/data/file_${i}.json`,
          url: `https://api.example.com/v1/resource/${i}`
        },
        timestamp: Date.now()
      });
      latencies.push(res.latencyMs);
    }

    const totalLatency = latencies.reduce((acc, curr) => acc + curr, 0);
    const avgLatency = totalLatency / callCount;

    latencies.sort((a, b) => a - b);
    const p95Latency = latencies[Math.floor(callCount * 0.95)];
    const p99Latency = latencies[Math.floor(callCount * 0.99)];

    // Performance assertions: strict sub-2ms bounds
    expect(avgLatency).toBeLessThan(2.0); // Sub-2ms average
    expect(p95Latency).toBeLessThan(2.0); // Sub-2ms p95
    expect(p99Latency).toBeLessThan(5.0); // Sub-5ms p99 worst-case
    expect(latencies.length).toBe(1_000);
  });
});
