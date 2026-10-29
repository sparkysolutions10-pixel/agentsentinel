import { describe, it, expect } from 'vitest';
import { parseToolCallContext, inferToolCategory } from '../src/context.js';

describe('ToolCallContext Parser & Normalizer (Issue #4)', () => {
  it('parses a valid tool call object and generates a unique ID if omitted', () => {
    const raw = {
      toolName: 'read_file',
      params: { path: '/home/user/doc.txt' }
    };

    const ctx = parseToolCallContext(raw);
    expect(ctx.toolName).toBe('read_file');
    expect(ctx.id).toBeDefined();
    expect(ctx.id.length).toBeGreaterThan(10);
    expect(ctx.category).toBe('fs');
    expect(ctx.params).toEqual({ path: '/home/user/doc.txt' });
    expect(typeof ctx.timestamp).toBe('number');
  });

  it('accepts alternative name and arguments fields from OpenAI/MCP schemas', () => {
    const raw = {
      id: 'custom-call-123',
      name: 'bash:execute',
      arguments: { command: 'ls -la' },
      agentId: 'agent-007'
    };

    const ctx = parseToolCallContext(raw);
    expect(ctx.id).toBe('custom-call-123');
    expect(ctx.toolName).toBe('bash:execute');
    expect(ctx.category).toBe('shell');
    expect(ctx.params).toEqual({ command: 'ls -la' });
    expect(ctx.agentId).toBe('agent-007');
  });

  it('correctly infers tool categories for diverse tool namespaces', () => {
    expect(inferToolCategory('bash:run')).toBe('shell');
    expect(inferToolCategory('sql:execute_query')).toBe('sql');
    expect(inferToolCategory('fs:read_file')).toBe('fs');
    expect(inferToolCategory('get_auth_token')).toBe('secrets');
    expect(inferToolCategory('http:fetch')).toBe('network');
    expect(inferToolCategory('arbitrary_tool')).toBe('custom');
  });

  it('throws TypeError when raw payload is not an object or missing toolName', () => {
    expect(() => parseToolCallContext(null)).toThrow(TypeError);
    expect(() => parseToolCallContext('invalid')).toThrow(TypeError);
    expect(() => parseToolCallContext({})).toThrow(TypeError);
    expect(() => parseToolCallContext({ toolName: '   ' })).toThrow(TypeError);
  });

  it('produces an immutable frozen context object', () => {
    const ctx = parseToolCallContext({ toolName: 'echo', params: { text: 'hello' } });
    expect(Object.isFrozen(ctx)).toBe(true);
    // Modifying frozen object should fail in strict mode
    expect(() => {
      (ctx as any).toolName = 'tampered';
    }).toThrow();
  });
});
