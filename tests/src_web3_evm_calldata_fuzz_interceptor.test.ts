import { describe, it, expect } from 'vitest';
import { EvmCalldataFuzzInterceptor } from '../src/web3/evm_calldata_fuzz_interceptor.js';

describe('EvmCalldataFuzzInterceptor Invariant Suite (#1767)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = EvmCalldataFuzzInterceptor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_EVM_CALLDATA_FUZZ_INTERCEPTOR');
    expect(EvmCalldataFuzzInterceptor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = EvmCalldataFuzzInterceptor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(EvmCalldataFuzzInterceptor.validate('git status && npm run test')).toBe(true);
  });
});
