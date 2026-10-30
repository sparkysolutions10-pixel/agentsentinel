import { describe, it, expect, vi } from 'vitest';
import {
  ToolLoopRateLimiter,
  createLoopRateLimiterRule,
} from '../src/rules/rate_limiter.js';
import { SentinelEngine } from '../src/index.js';
import { protectVercelTools, VercelAiCoreTool } from '../src/sdk/vercel_ai_adapter.js';
import { createMcpInterceptor } from '../src/mcp/interceptor.js';
import { Verdict } from '../src/types.js';

describe('Loop Rate Limiter Breaks Circular Tool Loops (#127)', () => {
  it('breaks a simulated infinite retry agent loop after 5 consecutive failures', async () => {
    const engine = new SentinelEngine();
    engine.registry.register(createLoopRateLimiterRule({ maxConsecutiveIdenticalCalls: 5 }));

    let loopExecutionCount = 0;
    let loopTerminatedBySentinel = false;

    // Simulated LLM autonomous retry loop
    for (let attempt = 1; attempt <= 20; attempt++) {
      const evalResult = await engine.evaluate({
        id: `turn-${attempt}`,
        toolName: 'read_remote_sensor',
        params: { sensorId: 'temp_node_01' },
        timestamp: Date.now(),
      });

      if (evalResult.verdict === Verdict.BLOCK) {
        loopTerminatedBySentinel = true;
        break;
      }

      loopExecutionCount++;
    }

    expect(loopTerminatedBySentinel).toBe(true);
    expect(loopExecutionCount).toBe(4); // 4 allowed, 5th was blocked!
  });

  it('halts circular tool loop inside protectVercelTools wrapper', async () => {
    const engine = new SentinelEngine();
    engine.registry.register(createLoopRateLimiterRule({ maxConsecutiveIdenticalCalls: 3 }));

    const mockWorker = vi.fn().mockResolvedValue({ status: 'retry' });
    const rawTools: Record<string, VercelAiCoreTool> = {
      pollQueue: {
        execute: mockWorker,
      },
    };

    const guardedTools = protectVercelTools(rawTools, { engine });

    // Invocations 1 and 2 succeed
    await guardedTools.pollQueue.execute!({ queueName: 'dead_letters' });
    await guardedTools.pollQueue.execute!({ queueName: 'dead_letters' });
    expect(mockWorker).toHaveBeenCalledTimes(2);

    // Invocation 3 triggers consecutive limit and throws policy violation
    await expect(
      guardedTools.pollQueue.execute!({ queueName: 'dead_letters' })
    ).rejects.toThrow('Circular tool execution loop detected');

    expect(mockWorker).toHaveBeenCalledTimes(2); // Underlying function was NOT called on 3rd attempt
  });

  it('halts runaway loops dispatched through MCP JSON-RPC tools/call', async () => {
    const engine = new SentinelEngine();
    engine.registry.register(createLoopRateLimiterRule({ maxConsecutiveIdenticalCalls: 4 }));

    const interceptor = createMcpInterceptor(engine, { errorMode: 'tool_result_error' });

    for (let i = 1; i <= 3; i++) {
      const res = await interceptor.interceptToolCall('sync_cluster_nodes', { cluster: 'us-east-1' });
      expect(res.allowed).toBe(true);
    }

    // 4th call is blocked
    const blockedRes = await interceptor.interceptToolCall('sync_cluster_nodes', { cluster: 'us-east-1' });
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.verdict).toBe(Verdict.BLOCK);
    expect(blockedRes.errorResult?.content[0].text).toContain('Circular tool execution loop detected');
  });

  it('allows identical calls again once the sliding window has elapsed', async () => {
    const limiter = new ToolLoopRateLimiter({
      maxCallsPerWindow: 2,
      slidingWindowMs: 100, // 100ms short test window
      maxConsecutiveIdenticalCalls: 10,
    });

    const baseCtx = (ts: number) => ({
      id: `call-${ts}`,
      toolName: 'ping_service',
      params: { host: 'internal.srv' },
      timestamp: ts,
    });

    const t0 = 1_000_000;
    expect(limiter.evaluateContext(baseCtx(t0))).toBeNull();
    expect(limiter.evaluateContext(baseCtx(t0 + 10))).toBeNull();

    // 3rd call at t0 + 20ms within 100ms window -> blocked
    const blocked = limiter.evaluateContext(baseCtx(t0 + 20));
    expect(blocked).not.toBeNull();
    expect(blocked?.verdict).toBe(Verdict.BLOCK);

    // Call at t0 + 150ms (window has elapsed) -> allowed!
    const afterWindow = limiter.evaluateContext(baseCtx(t0 + 150));
    expect(afterWindow).toBeNull();
  });
});
