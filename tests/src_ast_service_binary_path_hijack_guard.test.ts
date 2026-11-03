import { describe, it, expect } from 'vitest';
import { ServiceBinaryPathHijackGuard } from '../src/ast/service_binary_path_hijack_guard.js';

describe('ServiceBinaryPathHijackGuard Invariant Suite (#1900)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ServiceBinaryPathHijackGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SERVICE_BINARY_PATH_HIJACK_GUARD');
    expect(ServiceBinaryPathHijackGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ServiceBinaryPathHijackGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ServiceBinaryPathHijackGuard.validate('git status && npm run test')).toBe(true);
  });
});
