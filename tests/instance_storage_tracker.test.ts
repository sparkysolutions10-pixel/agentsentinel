import { describe, it, expect } from 'vitest';
import { createInstanceStorageTrackerRule } from '../src/web3/instance_storage_tracker.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('InstanceStorageLifecycleTracker', () => {
  const rule = createInstanceStorageTrackerRule({ minLedgersBeforeExpiry: 1000 });

  it('allows contract call when remaining lifetime is healthy', () => {
    const context: ToolCallContext = {
      id: 'tx_healthy_contract',
      toolName: 'soroban_invoke',
      params: { currentLedger: 50000, liveUntilLedger: 60000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks call when contract is near archival', () => {
    const context: ToolCallContext = {
      id: 'tx_near_archival',
      toolName: 'soroban_invoke',
      params: { currentLedger: 50000, liveUntilLedger: 50500 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('EXPIRATION_IMMINENT:500<1000');
  });
});
