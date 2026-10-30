import { describe, it, expect, beforeEach } from 'vitest';
import {
  ToolLoopRateLimiter,
  canonicalizeParams,
  createLoopRateLimiterRule,
} from '../src/rules/rate_limiter.js';
import { SentinelEngine } from '../src/index.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Tool Loop & Runaway Execution Rate Limiter Rule (#126)', () => {
  let limiter: ToolLoopRateLimiter;

  beforeEach(() => {
    limiter = new ToolLoopRateLimiter({
      maxConsecutiveIdenticalCalls: 4,
      maxCallsPerWindow: 10,
      slidingWindowMs: 5000,
    });
  });

  it('canonicalizeParams produces deterministic representations regardless of key order', () => {
    const objA = { z: 1, a: 2, m: { y: 'bar', x: 'foo' } };
    const objB = { a: 2, z: 1, m: { x: 'foo', y: 'bar' } };

    expect(canonicalizeParams(objA)).toBe(canonicalizeParams(objB));
  });

  it('detects and blocks consecutive identical tool calls reaching limit', () => {
    const makeCtx = (toolName: string, params: any): ToolCallContext => ({
      id: `ctx-${Math.random()}`,
      toolName,
      params,
      timestamp: Date.now(),
    });

    // Calls 1, 2, 3: Safe
    expect(limiter.evaluateContext(makeCtx('read_file', { path: '/tmp/test.log' }))).toBeNull();
    expect(limiter.evaluateContext(makeCtx('read_file', { path: '/tmp/test.log' }))).toBeNull();
    expect(limiter.evaluateContext(makeCtx('read_file', { path: '/tmp/test.log' }))).toBeNull();

    // Call 4: Reaches maxConsecutive = 4 -> BLOCKS
    const violation = limiter.evaluateContext(makeCtx('read_file', { path: '/tmp/test.log' }));
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.ruleId).toBe('rule-loop-rate-limiter');
    expect(violation?.reason).toContain('called with identical arguments 4 times consecutively');
  });

  it('resets consecutive counter when tool or arguments change', () => {
    const makeCtx = (params: any): ToolCallContext => ({
      id: `ctx-${Math.random()}`,
      toolName: 'api_fetch',
      params,
      timestamp: Date.now(),
    });

    // 3 calls with url: A
    expect(limiter.evaluateContext(makeCtx({ url: 'https://api.a.com' }))).toBeNull();
    expect(limiter.evaluateContext(makeCtx({ url: 'https://api.a.com' }))).toBeNull();
    expect(limiter.evaluateContext(makeCtx({ url: 'https://api.a.com' }))).toBeNull();

    // Call with url: B breaks the sequence!
    expect(limiter.evaluateContext(makeCtx({ url: 'https://api.b.com' }))).toBeNull();

    // Another call with url: A starts counter at 1 again
    expect(limiter.evaluateContext(makeCtx({ url: 'https://api.a.com' }))).toBeNull();
  });

  it('enforces sliding window rate limit across high frequency bursts', () => {
    const now = Date.now();
    const makeBurstCtx = (offsetMs: number): ToolCallContext => ({
      id: `burst-${offsetMs}`,
      toolName: 'web_search',
      params: { query: 'crypto prices' },
      timestamp: now + offsetMs,
    });

    // Send 10 calls (interleaved so consecutive limit is not hit)
    const altCtx = (offsetMs: number): ToolCallContext => ({
      id: `alt-${offsetMs}`,
      toolName: 'alt_tool',
      params: { n: offsetMs },
      timestamp: now + offsetMs,
    });

    for (let i = 0; i < 10; i++) {
      expect(limiter.evaluateContext(makeBurstCtx(i * 10))).toBeNull();
      expect(limiter.evaluateContext(altCtx(i * 10 + 1))).toBeNull();
    }

    // 11th call for web_search exceeds maxCallsPerWindow = 10
    const exceeded = limiter.evaluateContext(makeBurstCtx(200));
    expect(exceeded).not.toBeNull();
    expect(exceeded?.verdict).toBe(Verdict.BLOCK);
    expect(exceeded?.reason).toContain('Execution rate limit exceeded');
  });

  it('ignores tools configured in ignoreTools', () => {
    for (let i = 0; i < 15; i++) {
      const pingCtx: ToolCallContext = {
        id: `ping-${i}`,
        toolName: 'ping',
        params: { host: '127.0.0.1' },
        timestamp: Date.now(),
      };
      expect(limiter.evaluateContext(pingCtx)).toBeNull();
    }
  });

  it('integrates with SentinelEngine via createLoopRateLimiterRule()', async () => {
    const engine = new SentinelEngine();
    engine.registry.register(createLoopRateLimiterRule({ maxConsecutiveIdenticalCalls: 3 }));

    const queryCtx = {
      id: 'q1',
      toolName: 'query_records',
      params: { table: 'audit' },
      timestamp: Date.now(),
    };

    expect((await engine.evaluate(queryCtx)).allowed).toBe(true);
    expect((await engine.evaluate(queryCtx)).allowed).toBe(true);

    const blocked = await engine.evaluate(queryCtx);
    expect(blocked.allowed).toBe(false);
    expect(blocked.verdict).toBe(Verdict.BLOCK);
  });
});
