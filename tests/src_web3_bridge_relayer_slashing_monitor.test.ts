import { describe, it, expect } from 'vitest';
import { BridgeRelayerSlashingMonitor } from '../src/web3/bridge_relayer_slashing_monitor.js';

describe('BridgeRelayerSlashingMonitor Invariant Suite (#1802)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = BridgeRelayerSlashingMonitor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_BRIDGE_RELAYER_SLASHING_MONITOR');
    expect(BridgeRelayerSlashingMonitor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = BridgeRelayerSlashingMonitor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(BridgeRelayerSlashingMonitor.validate('git status && npm run test')).toBe(true);
  });
});
