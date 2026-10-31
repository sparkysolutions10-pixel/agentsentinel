import { describe, it, expect } from 'vitest';
import { createSorobanUpgradeWatcherRule } from '../src/web3/soroban_upgrade_watcher.js';
import { Verdict } from '../src/types.js';

describe('SorobanUpgradeWatcherRule', () => {
  it('allows contract upgrade by authorized admin', () => {
    const rule = createSorobanUpgradeWatcherRule({ allowedUpgradeAdmin: 'GADMIN123' });
    const violation = rule.evaluate({
      toolName: 'soroban_upgrade_contract',
      params: { method: 'update_current_contract_wasm', caller: 'GADMIN123' }
    });
    expect(violation).toBeNull();
  });

  it('blocks contract upgrade by unauthorized caller', () => {
    const rule = createSorobanUpgradeWatcherRule({ allowedUpgradeAdmin: 'GADMIN123' });
    const violation = rule.evaluate({
      toolName: 'soroban_upgrade_contract',
      params: { method: 'update_current_contract_wasm', caller: 'GATTACKER456' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('UNAUTHORIZED_UPGRADE_ADMIN');
  });

  it('blocks all upgrades when blockAllUpgrades is true', () => {
    const rule = createSorobanUpgradeWatcherRule({ blockAllUpgrades: true });
    const violation = rule.evaluate({
      toolName: 'soroban_upgrade_contract',
      params: { method: 'update_current_contract_wasm' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('CONTRACT_UPGRADE_FORBIDDEN');
  });
});
