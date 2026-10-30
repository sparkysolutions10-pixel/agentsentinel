import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  McpToolCallInterceptor,
  createMcpInterceptor,
  MCP_ERROR_CODES,
  McpJsonRpcRequest,
} from '../src/mcp/interceptor.js';
import { SentinelEngine } from '../src/index.js';
import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../src/types.js';

describe('MCP Middleware Prohibited Tool Executions & Blocking (#108)', () => {
  let engine: SentinelEngine;

  beforeEach(() => {
    engine = new SentinelEngine();
  });

  it('blocks destructive shell commands dispatched through MCP tools/call', async () => {
    const destructiveRule: SentinelRule = {
      id: 'destructive-rm-guard',
      name: 'Block Destructive rm',
      category: 'shell',
      priority: 1000,
      enabled: true,
      evaluate: (ctx) => {
        const cmd = String(ctx.params?.command || '');
        if (cmd.includes('rm -rf /') || cmd.includes(':(){ :|:& };:')) {
          return {
            ruleId: 'destructive-rm-guard',
            ruleName: 'Block Destructive rm',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Fork bomb or recursive root deletion detected in MCP payload.',
          };
        }
        return null;
      },
    };
    engine.registry.register(destructiveRule);

    const interceptor = createMcpInterceptor(engine, { errorMode: 'jsonrpc_error' });
    const executedTools: string[] = [];

    const serverHandler = async (req: McpJsonRpcRequest) => {
      executedTools.push(req.params?.name || '');
      return { jsonrpc: '2.0', id: req.id, result: { success: true } };
    };

    // Attack 1: Fork bomb
    const attack1: McpJsonRpcRequest = {
      jsonrpc: '2.0',
      id: 'attack-1',
      method: 'tools/call',
      params: {
        name: 'bash_exec',
        arguments: { command: ':(){ :|:& };:' },
      },
    };

    const resp1 = await interceptor.handleJsonRpc(attack1, serverHandler);
    expect(executedTools).toHaveLength(0);
    expect(resp1.error).toBeDefined();
    expect(resp1.error.code).toBe(MCP_ERROR_CODES.POLICY_VIOLATION);
    expect(resp1.error.data.violations[0].ruleId).toBe('destructive-rm-guard');

    // Attack 2: Root wipe
    const attack2: McpJsonRpcRequest = {
      jsonrpc: '2.0',
      id: 'attack-2',
      method: 'tools/call',
      params: {
        name: 'bash_exec',
        arguments: { command: 'rm -rf / --no-preserve-root' },
      },
    };

    const resp2 = await interceptor.handleJsonRpc(attack2, serverHandler);
    expect(executedTools).toHaveLength(0);
    expect(resp2.error).toBeDefined();

    // Safe command
    const safeReq: McpJsonRpcRequest = {
      jsonrpc: '2.0',
      id: 'safe-1',
      method: 'tools/call',
      params: {
        name: 'bash_exec',
        arguments: { command: 'echo hello world' },
      },
    };

    const respSafe = await interceptor.handleJsonRpc(safeReq, serverHandler);
    expect(executedTools).toEqual(['bash_exec']);
    expect(respSafe.result.success).toBe(true);
  });

  it('redacts sensitive parameters when rules return Verdict.REDACT', async () => {
    const redactRule: SentinelRule = {
      id: 'redact-api-key',
      name: 'Redact API Key',
      category: 'secrets',
      priority: 950,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.apiKey && typeof ctx.params.apiKey === 'string') {
          return {
            ruleId: 'redact-api-key',
            ruleName: 'Redact API Key',
            severity: 'high',
            verdict: Verdict.REDACT,
            reason: 'Secret API key masked.',
            redactedParams: {
              ...ctx.params,
              apiKey: '[REDACTED_API_KEY]',
            },
          };
        }
        return null;
      },
    };
    engine.registry.register(redactRule);

    const interceptor = createMcpInterceptor(engine);
    let capturedArgs: any = null;

    const handler = interceptor.wrapToolHandler('connect_gateway', async (args) => {
      capturedArgs = args;
      return { connected: true };
    });

    const dummyKey = 'secret_live_' + '1234567890abcdef';
    const result = await handler({
      gatewayUrl: 'https://gateway.example.com',
      apiKey: dummyKey,
    });

    expect(result).toEqual({ connected: true });
    expect(capturedArgs.gatewayUrl).toBe('https://gateway.example.com');
    expect(capturedArgs.apiKey).toBe('[REDACTED_API_KEY]');
    expect(capturedArgs.apiKey).not.toContain(dummyKey);
  });

  it('triggers onIntercept hook with context, latency, and audit metadata', async () => {
    const interceptSpy = vi.fn();
    const interceptor = createMcpInterceptor(engine, {
      onIntercept: interceptSpy,
      agentId: 'autonomous-worker-42',
    });

    await interceptor.interceptToolCall('calculate_sum', { a: 10, b: 20 });

    expect(interceptSpy).toHaveBeenCalledTimes(1);
    const [ctx, res] = interceptSpy.mock.calls[0];

    expect(ctx.toolName).toBe('calculate_sum');
    expect(ctx.agentId).toBe('autonomous-worker-42');
    expect(ctx.params).toEqual({ a: 10, b: 20 });
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
    expect(typeof res.latencyMs).toBe('number');
  });

  it('resists prototype pollution payloads without bypassing security', async () => {
    const blockPrototypeRule: SentinelRule = {
      id: 'guard-obj-props',
      name: 'Guard Object Props',
      category: 'custom',
      priority: 500,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.target === 'restricted_target') {
          return {
            ruleId: 'guard-obj-props',
            ruleName: 'Guard Object Props',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Restricted target accessed.',
          };
        }
        return null;
      },
    };
    engine.registry.register(blockPrototypeRule);

    const interceptor = createMcpInterceptor(engine);

    // Payload attempting to set __proto__
    const dirtyPayload = JSON.parse('{"__proto__":{"isAdmin":true},"target":"restricted_target"}');

    const decision = await interceptor.interceptToolCall('access_resource', dirtyPayload);
    expect(decision.allowed).toBe(false);
    expect(decision.verdict).toBe(Verdict.BLOCK);
    expect(decision.violations[0].reason).toContain('Restricted target accessed');
  });

  it('formats custom blocked message prefix correctly', async () => {
    const blockRule: SentinelRule = {
      id: 'always-block',
      name: 'Always Block',
      category: 'fs',
      priority: 100,
      enabled: true,
      evaluate: () => ({
        ruleId: 'always-block',
        ruleName: 'Always Block',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: 'Filesystem lockdown in effect.',
      }),
    };
    engine.registry.register(blockRule);

    const interceptor = createMcpInterceptor(engine, {
      blockedMessagePrefix: '🛡️ [CUSTOM SENTINEL WALL] -> ',
    });

    const res = await interceptor.interceptToolCall('read_file', { path: '/tmp/test' });
    expect(res.allowed).toBe(false);
    expect(res.errorResult?.content[0].text).toBe(
      '🛡️ [CUSTOM SENTINEL WALL] -> Filesystem lockdown in effect.'
    );
  });
});
