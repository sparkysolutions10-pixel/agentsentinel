import { describe, it, expect } from 'vitest';
import { BashReverseTcpSocketInterceptor } from '../src/ast/bash_reverse_tcp_socket_interceptor.js';

describe('BashReverseTcpSocketInterceptor Invariant Suite (#1865)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = BashReverseTcpSocketInterceptor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_BASH_REVERSE_TCP_SOCKET_INTERCEPTOR');
    expect(BashReverseTcpSocketInterceptor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = BashReverseTcpSocketInterceptor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(BashReverseTcpSocketInterceptor.validate('git status && npm run test')).toBe(true);
  });
});
