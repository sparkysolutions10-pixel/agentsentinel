import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  McpToolCallInterceptor,
  createMcpInterceptor,
  MCP_ERROR_CODES,
  McpJsonRpcRequest,
} from '../src/mcp/interceptor.js';
import { SentinelEngine } from '../src/index.js';
import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../src/types.js';

describe('MCP Tool Call Interceptor Middleware (#107)', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine();
  });

  it('throws when initialized without a SentinelEngine instance', () => {
    expect(() => new McpToolCallInterceptor({} as any)).toThrow(
      '[McpToolCallInterceptor] A valid SentinelEngine instance must be provided.'
    );
  });

  it('allows safe tool executions and passes parameters through', async () => {
    const interceptor = createMcpInterceptor(engine);

    const decision = await interceptor.interceptToolCall('read_weather', {
      city: 'San Francisco',
    });

    expect(decision.allowed).toBe(true);
    expect(decision.verdict).toBe(Verdict.ALLOW);
    expect(decision.sanitizedArgs).toEqual({ city: 'San Francisco' });
    expect(decision.violations).toHaveLength(0);
  });

  it('blocks tool calls violating Sentinel rules and returns structured errorResult', async () => {
    const blockRule: SentinelRule = {
      id: 'block-dangerous-exec',
      name: 'Block Dangerous Exec',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: (ctx: ToolCallContext): RuleViolation | null => {
        if (ctx.params?.command?.includes('rm -rf /')) {
          return {
            ruleId: 'block-dangerous-exec',
            ruleName: 'Block Dangerous Exec',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Destructive root deletion is strictly prohibited.',
          };
        }
        return null;
      },
    };

    engine.registry.register(blockRule);
    const interceptor = createMcpInterceptor(engine);

    const decision = await interceptor.interceptToolCall('execute_command', {
      command: 'rm -rf /',
    });

    expect(decision.allowed).toBe(false);
    expect(decision.verdict).toBe(Verdict.BLOCK);
    expect(decision.violations).toHaveLength(1);
    expect(decision.errorResult?.isError).toBe(true);
    expect(decision.errorResult?.content[0].text).toContain('Destructive root deletion is strictly prohibited.');
  });

  it('enforces denyTools list even without registered rules', async () => {
    const interceptor = createMcpInterceptor(engine, {
      denyTools: ['admin_wipe_database'],
    });

    const decision = await interceptor.interceptToolCall('admin_wipe_database', { force: true });
    expect(decision.allowed).toBe(false);
    expect(decision.verdict).toBe(Verdict.BLOCK);
    expect(decision.violations[0].reason).toContain('admin_wipe_database');
  });

  it('bypasses engine evaluation for allowTools list', async () => {
    const evaluateSpy = vi.spyOn(engine, 'evaluate');
    const interceptor = createMcpInterceptor(engine, {
      allowTools: ['safe_ping'],
    });

    const decision = await interceptor.interceptToolCall('safe_ping', { host: '127.0.0.1' });
    expect(decision.allowed).toBe(true);
    expect(evaluateSpy).not.toHaveBeenCalled();
  });

  it('wraps tool handler and executes it when allowed', async () => {
    const interceptor = createMcpInterceptor(engine);
    const rawHandler = vi.fn().mockResolvedValue({ status: 'success', data: [1, 2, 3] });

    const wrapped = interceptor.wrapToolHandler('fetch_metrics', rawHandler);
    const result = await wrapped({ interval: '5m' });

    expect(rawHandler).toHaveBeenCalledWith({ interval: '5m' });
    expect(result).toEqual({ status: 'success', data: [1, 2, 3] });
  });

  it('wraps tool handler and blocks execution in tool_result_error mode', async () => {
    const denyRule: SentinelRule = {
      id: 'deny-all',
      name: 'Deny All',
      category: 'custom',
      priority: 50,
      enabled: true,
      evaluate: () => ({
        ruleId: 'deny-all',
        ruleName: 'Deny All',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: 'All actions blocked by policy.',
      }),
    };
    engine.registry.register(denyRule);

    const interceptor = createMcpInterceptor(engine, { errorMode: 'tool_result_error' });
    const rawHandler = vi.fn();

    const wrapped = interceptor.wrapToolHandler('any_tool', rawHandler);
    const result = await wrapped({ key: 'val' });

    expect(rawHandler).not.toHaveBeenCalled();
    expect((result as any).isError).toBe(true);
    expect((result as any).content[0].text).toContain('All actions blocked by policy.');
  });

  it('wraps tool handler and throws RPC error in jsonrpc_error mode', async () => {
    const denyRule: SentinelRule = {
      id: 'deny-all',
      name: 'Deny All',
      category: 'custom',
      priority: 50,
      enabled: true,
      evaluate: () => ({
        ruleId: 'deny-all',
        ruleName: 'Deny All',
        severity: 'critical',
        verdict: Verdict.BLOCK,
        reason: 'Action forbidden.',
      }),
    };
    engine.registry.register(denyRule);

    const interceptor = createMcpInterceptor(engine, { errorMode: 'jsonrpc_error' });
    const rawHandler = vi.fn();

    const wrapped = interceptor.wrapToolHandler('forbidden_tool', rawHandler);

    await expect(wrapped({})).rejects.toThrow('Action forbidden.');
    expect(rawHandler).not.toHaveBeenCalled();
  });

  it('handles JSON-RPC tools/call requests through handleJsonRpc', async () => {
    const blockRule: SentinelRule = {
      id: 'block-leak',
      name: 'Block Leak',
      category: 'secrets',
      priority: 90,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.query?.includes('SECRET_PASSWORD')) {
          return {
            ruleId: 'block-leak',
            ruleName: 'Block Leak',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Password query rejected.',
          };
        }
        return null;
      },
    };
    engine.registry.register(blockRule);

    const interceptor = createMcpInterceptor(engine, { errorMode: 'jsonrpc_error' });
    const nextHandler = vi.fn().mockResolvedValue({ result: 'pass' });

    // 1. Blocked Request
    const blockedReq: McpJsonRpcRequest = {
      jsonrpc: '2.0',
      id: 101,
      method: 'tools/call',
      params: {
        name: 'search_database',
        arguments: { query: 'SELECT * FROM users WHERE pass = SECRET_PASSWORD' },
      },
    };

    const blockedResp = await interceptor.handleJsonRpc(blockedReq, nextHandler);
    expect(nextHandler).not.toHaveBeenCalled();
    expect(blockedResp.jsonrpc).toBe('2.0');
    expect(blockedResp.id).toBe(101);
    expect(blockedResp.error.code).toBe(MCP_ERROR_CODES.POLICY_VIOLATION);
    expect(blockedResp.error.message).toContain('Password query rejected.');

    // 2. Allowed Request
    const allowedReq: McpJsonRpcRequest = {
      jsonrpc: '2.0',
      id: 102,
      method: 'tools/call',
      params: {
        name: 'search_database',
        arguments: { query: 'SELECT * FROM items WHERE price < 100' },
      },
    };

    await interceptor.handleJsonRpc(allowedReq, nextHandler);
    expect(nextHandler).toHaveBeenCalledWith(allowedReq);

    // 3. Non-tool method pass through
    const pingReq: McpJsonRpcRequest = {
      jsonrpc: '2.0',
      id: 103,
      method: 'ping',
    };

    await interceptor.handleJsonRpc(pingReq, nextHandler);
    expect(nextHandler).toHaveBeenCalledWith(pingReq);
  });
});
