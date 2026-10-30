import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  wrapLangChainTool,
  protectLangChainTools,
  SentinelStructuredTool,
  LangChainPolicyException,
  LangChainToolLike,
} from '../src/sdk/langchain_adapter.js';
import { SentinelEngine } from '../src/index.js';
import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../src/types.js';

describe('LangChain StructuredTool Interceptor Adapter (#113)', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine();
  });

  it('throws an error if options does not provide a valid SentinelEngine', () => {
    const dummyTool: LangChainToolLike = {
      name: 'test',
      description: 'test',
    };
    expect(() => wrapLangChainTool(dummyTool, {} as any)).toThrow(
      '[wrapLangChainTool] A valid SentinelEngine instance is required in options.'
    );
  });

  it('allows safe tool invocations through invoke(), call(), and _call()', async () => {
    const mockInternalCall = vi.fn().mockResolvedValue('weather is 72F and sunny');
    const tool: LangChainToolLike = {
      name: 'get_weather',
      description: 'Fetches weather for location',
      _call: mockInternalCall,
      invoke: async (input) => mockInternalCall(input),
      call: async (input) => mockInternalCall(input),
    };

    const protectedTool = wrapLangChainTool(tool, { engine });

    const resInvoke = await protectedTool.invoke!({ location: 'Miami' });
    const resCall = await protectedTool.call!({ location: 'Orlando' });
    const resInternal = await protectedTool._call!({ location: 'Tampa' });

    expect(resInvoke).toBe('weather is 72F and sunny');
    expect(resCall).toBe('weather is 72F and sunny');
    expect(resInternal).toBe('weather is 72F and sunny');
    expect(mockInternalCall).toHaveBeenCalledTimes(3);
  });

  it('throws LangChainPolicyException when violation occurs', async () => {
    const blockRule: SentinelRule = {
      id: 'block-env-dump',
      name: 'Block Environment Dump',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.command?.includes('printenv') || ctx.params?.input?.includes('printenv')) {
          return {
            ruleId: 'block-env-dump',
            ruleName: 'Block Environment Dump',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Dumping environment variables is forbidden.',
          };
        }
        return null;
      },
    };
    engine.registry.register(blockRule);

    const rawSpy = vi.fn();
    const tool: LangChainToolLike = {
      name: 'bash_shell',
      description: 'Executes bash command',
      invoke: rawSpy,
    };

    const protectedTool = wrapLangChainTool(tool, { engine });

    await expect(protectedTool.invoke!('printenv')).rejects.toThrow(LangChainPolicyException);
    await expect(protectedTool.invoke!({ command: 'printenv | grep SECRET' })).rejects.toThrow(
      'Dumping environment variables is forbidden.'
    );
    expect(rawSpy).not.toHaveBeenCalled();
  });

  it('returns error message directly without throwing when returnDirectOnError is true', async () => {
    const blockRule: SentinelRule = {
      id: 'block-all',
      name: 'Block All',
      category: 'custom',
      priority: 10,
      enabled: true,
      evaluate: () => ({
        ruleId: 'block-all',
        ruleName: 'Block All',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: 'Maintenance mode.',
      }),
    };
    engine.registry.register(blockRule);

    const rawSpy = vi.fn();
    const tool: LangChainToolLike = {
      name: 'calculator',
      description: 'Performs arithmetic',
      invoke: rawSpy,
    };

    const protectedTool = wrapLangChainTool(tool, { engine, returnDirectOnError: true });
    const result = await protectedTool.invoke!({ expr: '1 + 1' });

    expect(rawSpy).not.toHaveBeenCalled();
    expect(typeof result).toBe('string');
    expect(result).toContain('Maintenance mode.');
  });

  it('passes sanitized / redacted parameters when rule yields Verdict.REDACT', async () => {
    const redactRule: SentinelRule = {
      id: 'redact-pan',
      name: 'Redact Card PAN',
      category: 'secrets',
      priority: 900,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.pan) {
          return {
            ruleId: 'redact-pan',
            ruleName: 'Redact Card PAN',
            severity: 'critical',
            verdict: Verdict.REDACT,
            reason: 'Card PAN masked.',
            redactedParams: { ...ctx.params, pan: '4111-XXXX-XXXX-1111' },
          };
        }
        return null;
      },
    };
    engine.registry.register(redactRule);

    const rawCall = vi.fn().mockResolvedValue({ status: 'charged' });
    const tool: LangChainToolLike = {
      name: 'process_payment',
      description: 'Processes credit card payment',
      invoke: rawCall,
    };

    const protectedTool = wrapLangChainTool(tool, { engine });
    await protectedTool.invoke!({ pan: '4111-2222-3333-1111', amount: 50 });

    expect(rawCall).toHaveBeenCalledWith({ pan: '4111-XXXX-XXXX-1111', amount: 50 }, undefined);
  });

  it('protectLangChainTools wraps an array of tools', async () => {
    const tools = [
      { name: 't1', description: 'desc1', invoke: vi.fn().mockResolvedValue('r1') },
      { name: 't2', description: 'desc2', invoke: vi.fn().mockResolvedValue('r2') },
    ];

    const protectedTools = protectLangChainTools(tools, { engine });
    expect(protectedTools).toHaveLength(2);

    const r1 = await protectedTools[0].invoke!({});
    const r2 = await protectedTools[1].invoke!({});
    expect(r1).toBe('r1');
    expect(r2).toBe('r2');
  });

  it('creates functional SentinelStructuredTool instance inheriting protection', async () => {
    const blockRule: SentinelRule = {
      id: 'block-empty-name',
      name: 'Block Empty Name',
      category: 'custom',
      priority: 10,
      enabled: true,
      evaluate: (ctx) => {
        if (!ctx.params?.username) {
          return {
            ruleId: 'block-empty-name',
            ruleName: 'Block Empty Name',
            severity: 'medium',
            verdict: Verdict.BLOCK,
            reason: 'Username cannot be blank.',
          };
        }
        return null;
      },
    };
    engine.registry.register(blockRule);

    const tool = new SentinelStructuredTool(
      'greet_user',
      'Greets a registered user',
      async ({ username }: { username: string }) => `Hello, ${username}!`,
      { engine }
    );

    expect(tool.name).toBe('greet_user');
    expect(tool.description).toBe('Greets a registered user');

    // Safe execution
    const validGreet = await tool.invoke({ username: 'Alice' });
    expect(validGreet).toBe('Hello, Alice!');

    // Blocked execution
    await expect(tool.invoke({ username: '' })).rejects.toThrow('Username cannot be blank.');
  });
});
