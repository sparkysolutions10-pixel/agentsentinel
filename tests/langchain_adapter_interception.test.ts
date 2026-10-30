import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  wrapLangChainTool,
  protectLangChainTools,
  LangChainPolicyException,
  LangChainToolLike,
} from '../src/sdk/langchain_adapter.js';
import { SentinelEngine } from '../src/index.js';
import { SentinelRule, Verdict } from '../src/types.js';

describe('LangChain Tool Adapter Interception and Error Propagation (#114)', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine();
  });

  it('verifies LangChainPolicyException error properties and prototype chain', async () => {
    const blockRule: SentinelRule = {
      id: 'guard-format-drive',
      name: 'Guard Format Drive',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.command?.includes('mkfs')) {
          return {
            ruleId: 'guard-format-drive',
            ruleName: 'Guard Format Drive',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Formatting drives is prohibited.',
          };
        }
        return null;
      },
    };
    engine.registry.register(blockRule);

    const tool: LangChainToolLike = {
      name: 'disk_utility',
      description: 'Manages disk drives',
      invoke: vi.fn(),
    };

    const protectedTool = wrapLangChainTool(tool, { engine });

    try {
      await protectedTool.invoke!({ command: 'mkfs.ext4 /dev/sda1' });
      expect.unreachable('Should have thrown LangChainPolicyException');
    } catch (err: any) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(LangChainPolicyException);
      expect(err.name).toBe('LangChainPolicyException');
      expect(err.toolName).toBe('disk_utility');
      expect(err.verdict).toBe(Verdict.BLOCK);
      expect(err.ruleId).toBe('guard-format-drive');
      expect(err.violations).toHaveLength(1);
      expect(err.toolCallContext).toBeDefined();
      expect(err.toolCallContext.params.command).toBe('mkfs.ext4 /dev/sda1');
    }
  });

  it('simulates LangChain agent chain with returnDirectOnError allowing LLM recovery', async () => {
    const blockRule: SentinelRule = {
      id: 'sql-write-blocker',
      name: 'SQL Write Blocker',
      category: 'sql',
      priority: 100,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.query?.includes('DELETE FROM')) {
          return {
            ruleId: 'sql-write-blocker',
            ruleName: 'SQL Write Blocker',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: 'Write operations are disabled on read-only replica.',
          };
        }
        return null;
      },
    };
    engine.registry.register(blockRule);

    const sqlTool: LangChainToolLike = {
      name: 'sql_db_query',
      description: 'Executes SQL on database',
      invoke: vi.fn().mockResolvedValue([{ count: 42 }]),
    };

    const protectedTool = wrapLangChainTool(sqlTool, { engine, returnDirectOnError: true });

    // Step 1: LLM runs SELECT (safe)
    const selectRes = await protectedTool.invoke!({ query: 'SELECT count(*) FROM users' });
    expect(selectRes).toEqual([{ count: 42 }]);

    // Step 2: LLM attempts DELETE (blocked)
    const deleteRes = await protectedTool.invoke!({ query: 'DELETE FROM users WHERE active = 0' });
    expect(typeof deleteRes).toBe('string');
    expect(deleteRes).toContain('[AgentSentinel LangChain Policy] Blocked execution of tool "sql_db_query"');
    expect(deleteRes).toContain('Write operations are disabled on read-only replica.');

    // Step 3: LLM reads the error string observation and issues safe alternative
    const fallbackRes = await protectedTool.invoke!({ query: 'SELECT id, active FROM users WHERE active = 0' });
    expect(fallbackRes).toEqual([{ count: 42 }]);
  });

  it('handles JSON string inputs formatted by LLMs', async () => {
    const blockRule: SentinelRule = {
      id: 'block-sensitive-key',
      name: 'Block Sensitive Key',
      category: 'secrets',
      priority: 50,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.token?.includes('FORBIDDEN_KEY')) {
          return {
            ruleId: 'block-sensitive-key',
            ruleName: 'Block Sensitive Key',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: 'Forbidden token detected.',
          };
        }
        return null;
      },
    };
    engine.registry.register(blockRule);

    const tool: LangChainToolLike = {
      name: 'api_requester',
      description: 'Calls API endpoint',
      invoke: vi.fn().mockResolvedValue('success'),
    };

    const protectedTool = wrapLangChainTool(tool, { engine });

    // Stringified JSON payload
    const jsonInput = JSON.stringify({ token: 'FORBIDDEN_KEY_123', url: 'https://example.com' });

    await expect(protectedTool.invoke!(jsonInput)).rejects.toThrow('Forbidden token detected.');
  });

  it('triggers onIntercept callback with latency and audit context', async () => {
    const onInterceptSpy = vi.fn();

    const tool: LangChainToolLike = {
      name: 'lookup_user',
      description: 'Looks up user by id',
      invoke: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
    };

    const protectedTool = wrapLangChainTool(tool, {
      engine,
      agentId: 'langchain-supervisor-01',
      onIntercept: onInterceptSpy,
    });

    await protectedTool.invoke!({ id: 1 });

    expect(onInterceptSpy).toHaveBeenCalledTimes(1);
    const [ctx, evalResult] = onInterceptSpy.mock.calls[0];

    expect(ctx.toolName).toBe('lookup_user');
    expect(ctx.agentId).toBe('langchain-supervisor-01');
    expect(evalResult.allowed).toBe(true);
    expect(typeof evalResult.latencyMs).toBe('number');
  });
});
