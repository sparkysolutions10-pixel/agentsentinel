import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  wrapVercelExecute,
  protectVercelTool,
  protectVercelTools,
  SentinelPolicyViolationError,
  VercelAiCoreTool,
} from '../src/sdk/vercel_ai_adapter.js';
import { SentinelEngine } from '../src/index.js';
import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../src/types.js';

describe('Vercel AI SDK execute() Wrapper Utility (#111)', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine();
  });

  it('throws an error if initialized without SentinelEngine in options', () => {
    expect(() => wrapVercelExecute('my_tool', async () => {}, {} as any)).toThrow(
      '[wrapVercelExecute] A valid SentinelEngine instance is required in options.'
    );
  });

  it('allows safe tool execution and returns handler output', async () => {
    const rawExecute = vi.fn().mockResolvedValue({ status: 200, message: 'Processed' });
    const guardedExecute = wrapVercelExecute('calculate_tax', rawExecute, { engine });

    const result = await guardedExecute({ amount: 100, state: 'CA' }, { toolCallId: 'call-123' });

    expect(rawExecute).toHaveBeenCalledWith({ amount: 100, state: 'CA' }, { toolCallId: 'call-123' });
    expect(result).toEqual({ status: 200, message: 'Processed' });
  });

  it('throws SentinelPolicyViolationError when policy blocks tool call', async () => {
    const blockRule: SentinelRule = {
      id: 'block-unauthorized-db-drop',
      name: 'Block DB Drop',
      category: 'sql',
      priority: 100,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.query?.includes('DROP TABLE')) {
          return {
            ruleId: 'block-unauthorized-db-drop',
            ruleName: 'Block DB Drop',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Dropping database tables is prohibited.',
          };
        }
        return null;
      },
    };
    engine.registry.register(blockRule);

    const rawExecute = vi.fn();
    const guarded = wrapVercelExecute('sql_query', rawExecute, { engine });

    await expect(guarded({ query: 'DROP TABLE customers' })).rejects.toThrow(SentinelPolicyViolationError);
    await expect(guarded({ query: 'DROP TABLE customers' })).rejects.toThrow(
      'Dropping database tables is prohibited.'
    );
    expect(rawExecute).not.toHaveBeenCalled();
  });

  it('returns structured error object when errorMode is return_error_object', async () => {
    const blockRule: SentinelRule = {
      id: 'block-all',
      name: 'Block All',
      category: 'custom',
      priority: 50,
      enabled: true,
      evaluate: () => ({
        ruleId: 'block-all',
        ruleName: 'Block All',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: 'Execution disabled.',
      }),
    };
    engine.registry.register(blockRule);

    const rawExecute = vi.fn();
    const guarded = wrapVercelExecute('any_action', rawExecute, {
      engine,
      errorMode: 'return_error_object',
    });

    const output = await guarded({ param: 1 });
    expect(rawExecute).not.toHaveBeenCalled();
    expect(output).toMatchObject({
      error: true,
      blocked: true,
      verdict: Verdict.BLOCK,
      toolName: 'any_action',
    });
  });

  it('passes sanitized parameters when rule returns Verdict.REDACT', async () => {
    const redactRule: SentinelRule = {
      id: 'redact-secret-token',
      name: 'Redact Secret Token',
      category: 'secrets',
      priority: 80,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.token?.startsWith('SUPER_SECRET')) {
          return {
            ruleId: 'redact-secret-token',
            ruleName: 'Redact Secret Token',
            severity: 'high',
            verdict: Verdict.REDACT,
            reason: 'Token redacted.',
            redactedParams: { ...ctx.params, token: 'REDACTED_TOKEN' },
          };
        }
        return null;
      },
    };
    engine.registry.register(redactRule);

    const rawExecute = vi.fn().mockResolvedValue('ok');
    const guarded = wrapVercelExecute('call_api', rawExecute, { engine });

    const dummyToken = 'SUPER_SECRET_' + '987654';
    await guarded({ token: dummyToken, endpoint: '/v1/users' });

    expect(rawExecute).toHaveBeenCalledWith(
      { token: 'REDACTED_TOKEN', endpoint: '/v1/users' },
      undefined
    );
  });

  it('protectVercelTool wraps tool preserving parameters and description', async () => {
    const rawTool: VercelAiCoreTool = {
      description: 'Generates user avatar image',
      parameters: { type: 'object', properties: { username: { type: 'string' } } },
      execute: vi.fn().mockResolvedValue({ url: 'https://cdn.example.com/u.png' }),
    };

    const protectedTool = protectVercelTool('generate_avatar', rawTool, { engine });
    expect(protectedTool.description).toBe('Generates user avatar image');
    expect(protectedTool.parameters).toEqual(rawTool.parameters);

    const res = await protectedTool.execute!({ username: 'alice' });
    expect(res).toEqual({ url: 'https://cdn.example.com/u.png' });
  });

  it('protectVercelTools wraps multiple tools in a dictionary and calls onIntercept', async () => {
    const onInterceptSpy = vi.fn();

    const tools = {
      toolA: {
        description: 'Tool A',
        execute: vi.fn().mockResolvedValue('A'),
      },
      toolB: {
        description: 'Tool B',
        execute: vi.fn().mockResolvedValue('B'),
      },
    };

    const guardedTools = protectVercelTools(tools, {
      engine,
      agentId: 'vercel-agent-01',
      onIntercept: onInterceptSpy,
    });

    const resA = await guardedTools.toolA.execute!({});
    const resB = await guardedTools.toolB.execute!({});

    expect(resA).toBe('A');
    expect(resB).toBe('B');
    expect(onInterceptSpy).toHaveBeenCalledTimes(2);
    expect(onInterceptSpy.mock.calls[0][0].agentId).toBe('vercel-agent-01');
  });
});
