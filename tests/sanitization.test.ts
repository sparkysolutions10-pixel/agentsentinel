import { describe, it, expect } from 'vitest';
import { parseToolCallContext, sanitizeParams, MAX_PARAM_PAYLOAD_BYTES } from '../src/context.js';

describe('ToolCallContext Parameter Sanitization & Boundaries (Issue #5)', () => {
  it('safely handles circular references without throwing or infinite recursion', () => {
    const circularObj: any = { name: 'safe_prop' };
    circularObj.self = circularObj;

    const sanitized = sanitizeParams(circularObj);
    expect(sanitized.name).toBe('safe_prop');
    expect(sanitized.self).toBe('[CIRCULAR_REFERENCE]');

    // Also verify via parseToolCallContext
    const ctx = parseToolCallContext({
      toolName: 'test:circular',
      params: circularObj
    });
    expect(ctx.params.name).toBe('safe_prop');
    expect(ctx.params.self).toBe('[CIRCULAR_REFERENCE]');
  });

  it('scrubs dangerous null bytes from string values, array items, and object keys', () => {
    const maliciousPayload = {
      'safe_key\0_injected': 'secret_file.txt\0.jpg',
      nested: {
        command: 'rm -rf /\0 --no-preserve-root',
        tags: ['legit\0', 'harmless']
      }
    };

    const ctx = parseToolCallContext({
      toolName: 'fs:read',
      params: maliciousPayload
    });

    expect(ctx.params['safe_key_injected']).toBe('secret_file.txt.jpg');
    expect(ctx.params.nested.command).toBe('rm -rf / --no-preserve-root');
    expect(ctx.params.nested.tags).toEqual(['legit', 'harmless']);
    expect(ctx.params['safe_key\0_injected']).toBeUndefined();
  });

  it('rejects oversized parameter payloads exceeding 5MB boundary with RangeError', () => {
    // Generate string exceeding 5MB
    const oversizedString = 'A'.repeat(5 * 1024 * 1024 + 1024);

    expect(() => {
      parseToolCallContext({
        toolName: 'fs:write_large',
        params: { data: oversizedString }
      });
    }).toThrow(RangeError);
  });

  it('accepts payloads within the 5MB boundary', () => {
    const normalString = 'A'.repeat(100 * 1024); // 100 KB
    const ctx = parseToolCallContext({
      toolName: 'fs:write_normal',
      params: { data: normalString }
    });

    expect(ctx.params.data.length).toBe(100 * 1024);
  });
});
