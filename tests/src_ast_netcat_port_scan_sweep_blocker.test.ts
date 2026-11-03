import { describe, it, expect } from 'vitest';
import { NetcatPortScanSweepBlocker } from '../src/ast/netcat_port_scan_sweep_blocker.js';

describe('NetcatPortScanSweepBlocker Invariant Suite (#1869)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = NetcatPortScanSweepBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NETCAT_PORT_SCAN_SWEEP_BLOCKER');
    expect(NetcatPortScanSweepBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = NetcatPortScanSweepBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(NetcatPortScanSweepBlocker.validate('git status && npm run test')).toBe(true);
  });
});
