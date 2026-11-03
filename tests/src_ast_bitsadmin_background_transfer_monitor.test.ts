import { describe, it, expect } from 'vitest';
import { BitsadminBackgroundTransferMonitor } from '../src/ast/bitsadmin_background_transfer_monitor.js';

describe('BitsadminBackgroundTransferMonitor Invariant Suite (#1892)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = BitsadminBackgroundTransferMonitor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_BITSADMIN_BACKGROUND_TRANSFER_MONITOR');
    expect(BitsadminBackgroundTransferMonitor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = BitsadminBackgroundTransferMonitor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(BitsadminBackgroundTransferMonitor.validate('git status && npm run test')).toBe(true);
  });
});
